/**
 * Vector Arena — JSON-file persistence.
 *
 * One process owns the files, so writes are serialised through a promise
 * chain and every write is atomic (tmp file + rename) to survive a crash mid
 * write. Nothing here trusts its input: callers validate before calling.
 */

import { readFile, writeFile, mkdir, rename, readdir } from 'node:fs/promises';
import path from 'node:path';

const FILES = {
  attempts: 'attempts.json',
  leaderboard: 'leaderboard.json',
  bank: 'questions.json',
  teacherBank: 'teacher-bank.json',
  auditLog: 'audit-log.json',
  settings: 'settings.json',
  schema: 'schema-version.json',
};

export const SCHEMA_VERSION = 1;

export class Store {
  constructor(dataDir) {
    this.dir = dataDir;
    this._queue = Promise.resolve();
    this.data = {
      attempts: {},
      leaderboard: [],
      teacherBank: [],
      auditLog: [],
      settings: { examOpen: true, examDurationSeconds: 900, attemptsPerStudent: 3 },
      schema: { version: SCHEMA_VERSION },
    };
    this._bank = null;
    this._bankHash = null;
  }

  async load() {
    await mkdir(this.dir, { recursive: true });
    for (const [key, file] of Object.entries(FILES)) {
      const full = path.join(this.dir, file);
      try {
        const raw = await readFile(full, 'utf8');
        const parsed = JSON.parse(raw);
        if (key === 'bank') {
          this._bank = parsed;
        } else {
          this.data[key] = parsed;
        }
      } catch (err) {
        if (err.code !== 'ENOENT') {
          // A corrupt file must not silently become an empty dataset: move it
          // aside so an operator can inspect it, then start fresh.
          await rename(full, `${full}.corrupt-${Date.now()}`).catch(() => {});
          console.warn(`[store] ${file} unreadable (${err.message}); moved aside`);
        }
      }
    }
    if (!this.data.schema || this.data.schema.version !== SCHEMA_VERSION) {
      this.data.schema = { version: SCHEMA_VERSION };
      await this.persist('schema');
    }
    return this;
  }

  get bank() {
    return this._bank;
  }

  setBank(bank) {
    this._bank = bank;
  }

  /** Serialise a write to one logical file. */
  persist(key) {
    const file = FILES[key];
    if (!file) return Promise.reject(new Error(`unknown store key ${key}`));
    const payload = key === 'bank' ? this._bank : this.data[key];
    const target = path.join(this.dir, file);
    const tmp = `${target}.${process.pid}.tmp`;
    const run = async () => {
      await mkdir(this.dir, { recursive: true });
      await writeFile(tmp, JSON.stringify(payload, null, 1), 'utf8');
      await rename(tmp, target);
    };
    this._queue = this._queue.then(run, run);
    return this._queue;
  }

  async flush() {
    await this._queue;
  }

  /** Append an audit entry (bounded so the file cannot grow without limit). */
  audit(entry) {
    this.data.auditLog.push({ ...entry, at: new Date().toISOString() });
    if (this.data.auditLog.length > 5000) {
      this.data.auditLog.splice(0, this.data.auditLog.length - 5000);
    }
    return this.persist('auditLog');
  }

  async listFiles() {
    return readdir(this.dir);
  }
}
