/**
 * Minimal RFC 6455 WebSocket server — no third-party dependency.
 *
 * Supports exactly what Vector Arena needs: text frames, fragmentation,
 * ping/pong, close handshake, and the `permessage-deflate`-free path. Keeping
 * it in-repo means the app installs with `npm ci --omit=optional` and nothing
 * else, so it can be run offline in a school lab.
 */

import { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const MAX_FRAME = 1 << 20; // 1 MiB per frame — our messages are small
const MAX_MESSAGE = 4 << 20;

const OP = { CONT: 0x0, TEXT: 0x1, BIN: 0x2, CLOSE: 0x8, PING: 0x9, PONG: 0xa };

export class WsClient extends EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
    this.alive = true;
    this.closed = false;
    this._buffer = Buffer.alloc(0);
    this._fragments = [];
    this._fragmentOp = null;
    this._fragmentBytes = 0;
  }

  send(payload) {
    if (this.closed || this.socket.destroyed) return false;
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
    try {
      return this._writeFrame(OP.TEXT, Buffer.from(text, 'utf8'));
    } catch {
      this.terminate();
      return false;
    }
  }

  ping() {
    if (this.closed || this.socket.destroyed) return false;
    try {
      return this._writeFrame(OP.PING, Buffer.alloc(0));
    } catch {
      this.terminate();
      return false;
    }
  }

  close(code = 1000, reason = '') {
    if (this.closed) return;
    const payload = Buffer.alloc(2 + Buffer.byteLength(reason));
    payload.writeUInt16BE(code, 0);
    payload.write(reason, 2);
    try {
      this._writeFrame(OP.CLOSE, payload);
    } catch {
      /* ignore */
    }
    this.closed = true;
    this.socket.end();
    this.emit('close');
  }

  terminate() {
    if (this.closed) return;
    this.closed = true;
    this.socket.destroy();
    this.emit('close');
  }

  _writeFrame(opcode, payload) {
    const len = payload.length;
    let header;
    if (len < 126) {
      header = Buffer.alloc(2);
      header[1] = len;
    } else if (len < 65536) {
      header = Buffer.alloc(4);
      header[1] = 126;
      header.writeUInt16BE(len, 2);
    } else {
      header = Buffer.alloc(10);
      header[1] = 127;
      header.writeBigUInt64BE(BigInt(len), 2);
    }
    header[0] = 0x80 | opcode;
    this.socket.write(Buffer.concat([header, payload]));
    return true;
  }

  _push(chunk) {
    this._buffer = Buffer.concat([this._buffer, chunk]);
    while (this._buffer.length >= 2) {
      const b0 = this._buffer[0];
      const b1 = this._buffer[1];
      const fin = (b0 & 0x80) !== 0;
      const opcode = b0 & 0x0f;
      const masked = (b1 & 0x80) !== 0;
      let len = b1 & 0x7f;
      let offset = 2;

      if (len === 126) {
        if (this._buffer.length < 4) return;
        len = this._buffer.readUInt16BE(2);
        offset = 4;
      } else if (len === 127) {
        if (this._buffer.length < 10) return;
        const big = this._buffer.readBigUInt64BE(2);
        if (big > BigInt(MAX_MESSAGE)) return this.close(1009, 'message too big');
        len = Number(big);
        offset = 10;
      }
      if (len > MAX_FRAME) return this.close(1009, 'frame too big');
      // RFC 6455 §5.1: client frames MUST be masked.
      if (!masked) return this.close(1002, 'unmasked client frame');

      if (this._buffer.length < offset + 4 + len) return;
      const mask = this._buffer.subarray(offset, offset + 4);
      offset += 4;
      const data = Buffer.from(this._buffer.subarray(offset, offset + len));
      for (let i = 0; i < data.length; i += 1) data[i] ^= mask[i & 3];
      this._buffer = this._buffer.subarray(offset + len);

      this._handleFrame(fin, opcode, data);
    }
  }

  _handleFrame(fin, opcode, data) {
    if (opcode === OP.CLOSE) {
      this.close(1000);
      return;
    }
    if (opcode === OP.PING) {
      try {
        this._writeFrame(OP.PONG, data);
      } catch {
        this.terminate();
      }
      return;
    }
    if (opcode === OP.PONG) {
      this.alive = true;
      return;
    }
    if (opcode === OP.CONT) {
      if (!this._fragmentOp) return this.close(1002, 'unexpected continuation');
      this._fragments.push(data);
      this._fragmentBytes += data.length;
      if (this._fragmentBytes > MAX_MESSAGE) return this.close(1009, 'message too big');
      if (fin) {
        const full = Buffer.concat(this._fragments);
        const op = this._fragmentOp;
        this._fragments = [];
        this._fragmentOp = null;
        this._fragmentBytes = 0;
        this._deliver(op, full);
      }
      return;
    }
    if (opcode === OP.TEXT || opcode === OP.BIN) {
      if (!fin) {
        this._fragmentOp = opcode;
        this._fragments = [data];
        this._fragmentBytes = data.length;
        return;
      }
      this._deliver(opcode, data);
      return;
    }
    this.close(1002, 'unknown opcode');
  }

  _deliver(opcode, data) {
    if (opcode !== OP.TEXT) return;
    let parsed;
    try {
      parsed = JSON.parse(data.toString('utf8'));
    } catch {
      this.send({ type: 'error', message: 'invalid JSON' });
      return;
    }
    this.emit('message', parsed);
  }
}

export class WebSocketServer {
  constructor(server, pathname, handlers) {
    this.clients = new Set();
    this.handlers = handlers || {};
    this.pathname = pathname;

    server.on('upgrade', (req, socket) => {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname !== this.pathname) {
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        socket.destroy();
        return;
      }
      const key = req.headers['sec-websocket-key'];
      if (!key || req.headers.upgrade?.toLowerCase() !== 'websocket') {
        socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
        socket.destroy();
        return;
      }
      const accept = createHash('sha1').update(key + GUID).digest('base64');
      socket.write(
        'HTTP/1.1 101 Switching Protocols\r\n' +
          'Upgrade: websocket\r\n' +
          'Connection: Upgrade\r\n' +
          `Sec-WebSocket-Accept: ${accept}\r\n\r\n`,
      );
      socket.setNoDelay(true);

      const client = new WsClient(socket);
      this.clients.add(client);
      client.on('message', (msg) => this.handlers.onMessage?.(client, msg));
      socket.on('data', (chunk) => {
        try {
          client._push(chunk);
        } catch {
          client.terminate();
        }
      });
      const done = () => {
        this.clients.delete(client);
        client.closed = true;
        this.handlers.onClose?.(client);
      };
      socket.on('close', done);
      socket.on('error', () => {
        client.terminate();
        done();
      });
      this.handlers.onOpen?.(client);
    });

    // Heartbeat: drop dead peers so a room's "who is connected" stays truthful.
    this._timer = setInterval(() => {
      for (const client of this.clients) {
        if (!client.alive) {
          client.terminate();
          this.clients.delete(client);
          this.handlers.onClose?.(client);
          continue;
        }
        client.alive = false;
        client.ping();
      }
    }, 30000);
    if (this._timer.unref) this._timer.unref();
  }

  broadcast(filter, payload) {
    for (const client of this.clients) {
      if (!filter || filter(client)) client.send(payload);
    }
  }

  close() {
    clearInterval(this._timer);
    for (const client of this.clients) client.close(1001, 'server shutting down');
    this.clients.clear();
  }
}
