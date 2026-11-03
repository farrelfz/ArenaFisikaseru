/**
 * Vector Arena — local authoritative server.
 *
 * Responsibilities
 *  - Serve the zero-build SPA (index.html, css/, js/).
 *  - Serve the generated question bank with a content hash for cache busting.
 *  - Persist attempts, leaderboard and the teacher question bank as JSON files.
 *  - Provide an authoritative WebSocket racing mode so two clients can never
 *    disagree about who answered first.
 *
 * Security posture
 *  - Answers are never sent to the client during an attempt. The client submits
 *    answers by option index / text, the server grades and scores.
 *  - Grading is idempotent per attempt id so a replayed submit cannot farm points.
 *  - Every request path is resolved and then verified to stay inside the public
 *    root (path-traversal guard).
 *  - Teacher endpoints require a bearer token issued by /api/teacher/login.
 *
 * Run: node server/server.js [--port 8080]
 */

import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from './ws-lite.js';
import { gradeAnswer, scoreAttempt } from './scoring.js';
import { Store } from './store.js';
import { Handler } from './handlers.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');

/* ------------------------------------------------------------------ */
/* Static file serving                                                 */
/* ------------------------------------------------------------------ */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
};

/**
 * Resolve a URL path to a file inside the public root.
 * Returns null when the path escapes the root.
 */
export function safeResolve(rootDir, urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  } catch {
    // Malformed percent-encoding is a rejected request, not a 500.
    return null;
  }
  // Reject NUL bytes outright: they truncate paths in some syscalls.
  if (decoded.includes('\0')) return null;

  // If path contains any parent directory traversal '..', reject immediately
  if (decoded.split('/').includes('..')) return null;

  const normalised = path.posix.normalize(decoded);
  if (normalised === '..' || normalised.startsWith('../') || normalised.includes('/../')) return null;

  const relative = normalised.startsWith('/') ? normalised : '/' + normalised;
  const candidate = path.resolve(rootDir, '.' + relative);
  const rel = path.relative(rootDir, candidate);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return candidate;
}

/**
 * Paths that must never be served as static files even though they sit inside
 * the public root: server source, the physics engine + generators (which
 * together reveal every answer), tests, tooling and the raw answer bank.
 */
const FORBIDDEN_PREFIXES = ['/server/', '/scripts/', '/tests/', '/data/', '/data-store/', '/node_modules/', '/.git/'];
const FORBIDDEN_SUFFIXES = ['.pyc', '.env', '.log'];
const FORBIDDEN_FILES = ['/package.json', '/package-lock.json', '/AGENTS.md', '/README.md'];

export function isForbiddenPath(rootDir, filePath) {
  const rel = '/' + path.relative(rootDir, filePath).split(path.sep).join('/');
  if (FORBIDDEN_PREFIXES.some((p) => rel.startsWith(p))) return true;
  if (FORBIDDEN_FILES.includes(rel)) return true;
  const lower = rel.toLowerCase();
  if (lower.includes('/.env') || FORBIDDEN_SUFFIXES.some((s) => lower.endsWith(s))) return true;
  return false;
}

async function readJsonBody(req, limitBytes = 512 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limitBytes) {
      const err = new Error('Payload too large');
      err.statusCode = 413;
      throw err;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const err = new Error('Invalid JSON body');
    err.statusCode = 400;
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* App factory (exported so tests can start it on an ephemeral port)   */
/* ------------------------------------------------------------------ */
export async function createApp({ dataDir = path.join(ROOT, 'data'), publicDir = ROOT, teacherPin, clock = () => Date.now() } = {}) {
  const store = new Store(dataDir);
  await store.load();

  const handler = new Handler({
    store,
    readJsonBody,
    clock,
    teacherPin: teacherPin || process.env.VECTOR_ARENA_TEACHER_PIN || 'GURUX78',
  });

  const routes = new Map();
  handler.register(routes);

  const rooms = new Map(); // roomId -> { clients:Set, state }

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'DENY');

    try {
      const key = `${req.method} ${url.pathname}`;
      // Route entries are [pattern, fn]; normalise to { key, fn } so both the
      // exact hit and the parameterised match share one code path.
      const direct = routes.has(key) ? { key, fn: routes.get(key)[1] } : null;
      const route =
        direct ||
        [...routes.entries()]
          .map(([k, v]) => ({ key: k, fn: v[1] }))
          .find(({ key: k }) => {
            const [m, pattern] = k.split(' ');
            if (m !== req.method || !pattern.includes(':')) return false;
            const pat = new RegExp('^' + pattern.replace(/:[a-zA-Z]+/g, '([^/]+)') + '$');
            return pat.test(url.pathname);
          });

      if (route) {
        const ctx = { req, res, url, params: paramsFor(route.key, url), readJsonBody };
        await route.fn(ctx);
        return;
      }

      // Long-cache static assets that are explicitly versioned (assets/ only).
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'method not allowed' }));
        return;
      }

      let filePath = safeResolve(publicDir, url.pathname === '/' ? '/index.html' : url.pathname);
      if (!filePath) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'invalid path' }));
        return;
      }
      // The public root is the repository root, so source and the answer key
      // physically live under it. Never serve them: the bank is only exposed
      // through /api/bank, which strips every solution field.
      if (isForbiddenPath(publicDir, filePath)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'not found' }));
        return;
      }
      if (!existsSync(filePath) || (await stat(filePath)).isDirectory()) {
        // SPA fallback: unknown non-asset routes render the shell.
        if (!path.extname(url.pathname)) {
          filePath = path.join(publicDir, 'index.html');
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'not found' }));
          return;
        }
      }
      const body = await readFile(filePath);
      const ext = path.extname(filePath);
      const headers = {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': url.pathname.startsWith('/assets/')
          ? 'public, max-age=31536000, immutable'
          : 'no-cache',
      };
      res.writeHead(200, headers);
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch (err) {
      const status = err.statusCode || 500;
      if (status >= 500) console.error('[vector-arena]', err);
      if (!res.headersSent) {
        res.writeHead(status, { 'Content-Type': 'application/json' });
      }
      res.end(JSON.stringify({ error: status >= 500 ? 'internal error' : err.message }));
    }
  });

  const wss = new WebSocketServer(server, '/ws/race', {
    async onMessage(client, msg) {
      try {
        await handler.handleRace(client, msg, rooms);
      } catch (err) {
        client.send({ type: 'error', message: err.message });
      }
    },
    onClose(client) {
      handler.dropRaceClient(client, rooms);
    },
  });

  return { server, wss, store, handler, close: () => wss.close() };
}

function paramsFor(key, url) {
  const pattern = key.split(' ')[1];
  const names = [...pattern.matchAll(/:([a-zA-Z]+)/g)].map((m) => m[1]);
  const re = new RegExp('^' + pattern.replace(/:[a-zA-Z]+/g, '([^/]+)') + '$');
  const m = re.exec(url.pathname);
  if (!m) return {};
  return Object.fromEntries(names.map((n, i) => [n, decodeURIComponent(m[i + 1])]));
}

/* ------------------------------------------------------------------ */
/* CLI entry                                                           */
/* ------------------------------------------------------------------ */
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(HERE, 'server.js')) {
  const portArg = process.argv.indexOf('--port');
  const port = portArg > -1 ? Number(process.argv[portArg + 1]) : Number(process.env.PORT || 8080);
  const app = await createApp();
  app.server.listen(port, '127.0.0.1', () => {
    console.log(`Vector Arena running at http://127.0.0.1:${port}`);
  });
  const shutdown = () => {
    app.close();
    app.server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

export { readJsonBody, createHash, randomUUID, timingSafeEqual, writeFile, mkdir, rename };
