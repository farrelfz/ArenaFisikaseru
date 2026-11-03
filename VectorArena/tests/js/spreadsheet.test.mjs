/**
 * Uji modul integrasi webhook sisi klien (js/modules/spreadsheet.js).
 *
 * Modul ini menempel pada global browser (CONFIG, State, localStorage, fetch,
 * document). Berkas ini memasang tiruan minimal lalu memverifikasi perilaku
 * yang paling mudah salah: pemilihan URL, tipe konten yang dikirim, dan
 * pemetaan status server ke konfigurasi lokal.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const WEBHOOK_KEY = 'vectorarena_webhook_url_v1_live';

// --------------------------------------------------------------------------
// Tiruan lingkungan browser
// --------------------------------------------------------------------------

function installBrowserStubs({ defaultUrl = '', storedUrl = undefined } = {}) {
  const store = new Map();
  if (storedUrl !== undefined && storedUrl !== null) store.set(WEBHOOK_KEY, storedUrl);

  const calls = [];

  globalThis.CONFIG = {
    DEFAULT_WEBHOOK_URL: defaultUrl,
    STORAGE_KEYS: { WEBHOOK: WEBHOOK_KEY }
  };

  globalThis.State = {
    examConfig: {
      _isOpen: true,
      overrideMode: 'auto',
      _allowReview: true,
      overrideReviewMode: 'auto',
      get isOpen() {
        if (this.overrideMode === 'manual_open') return true;
        if (this.overrideMode === 'manual_closed') return false;
        return this._isOpen;
      },
      get allowReview() {
        if (this.overrideReviewMode === 'manual_allowed') return true;
        if (this.overrideReviewMode === 'manual_locked') return false;
        return this._allowReview;
      }
    },
    save() {}
  };

  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k)
  };

  globalThis.document = { getElementById: () => null };

  // utils berupa no-op supaya pemberitahuan tidak meledak di luar browser.
  globalThis.Utils = { showToast() {} };

  globalThis.console.warn = () => {};

  return {
    calls,
    store,
    setFetch(handler) {
      globalThis.fetch = async (url, init) => {
        calls.push({ url, init });
        return handler(url, init);
      };
    }
  };
}

function jsonResponse(body, ok = true) {
  return { ok, json: async () => body, text: async () => JSON.stringify(body) };
}

const SOURCE = fs.readFileSync(path.join(ROOT, 'js', 'modules', 'spreadsheet.js'), 'utf8');

/**
 * Muat modul di konteks terisolasi. Berkas sumber memakai pola "global browser"
 * (`const SpreadsheetService = {...}` + ekspor CommonJS opsional), jadi script
 * dijalankan sebagai CommonJS di dalam sandbox vm milik test ini.
 */
function loadService() {
  const sandbox = {
    module: { exports: {} },
    console,
    // Delegasi ke global test supaya penggantian stub (mis. fetch oleh
    // setFetch) tetap terlihat oleh modul setelah dimuat.
    get fetch() { return globalThis.fetch; },
    get CONFIG() { return globalThis.CONFIG; },
    get State() { return globalThis.State; },
    get localStorage() { return globalThis.localStorage; },
    get document() { return globalThis.document; },
    get Utils() { return globalThis.Utils; },
    AbortController: globalThis.AbortController,
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(SOURCE, sandbox, { filename: 'spreadsheet.js' });
  return sandbox.module.exports.SpreadsheetService;
}

const FAKE_URL = 'https://script.google.com/macros/s/AKfycbxxx/exec';

// --------------------------------------------------------------------------

test('URL webhook kosong berarti mode mandiri (bukan siap kirim)', () => {
  installBrowserStubs();
  const svc = loadService();

  assert.equal(svc.getWebhookUrl(), '');
  assert.equal(svc.isConfigured(), false);
});

test('URL dari pengaturan guru menang atas URL bawaan', () => {
  installBrowserStubs({ defaultUrl: FAKE_URL, storedUrl: 'https://contoh.test/exec' });
  const svc = loadService();

  assert.equal(svc.getWebhookUrl(), 'https://contoh.test/exec');
});

test('URL bawaan dipakai bila guru belum menyimpan apa pun', () => {
  installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();

  assert.equal(svc.getWebhookUrl(), FAKE_URL);
  assert.equal(svc.isConfigured(), true);
});

test('kiriman memakai text/plain dan TIDAK memakai mode no-cors', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();

  let seen = null;
  env.setFetch((url, init) => {
    seen = { url, init };
    return jsonResponse({ status: 'ok', grade: 88, statusKKM: 'TUNTAS', row: 3 });
  });

  await svc.pushRecord({ name: 'Uji Siswa', className: 'X A', absen: 1 });

  assert.equal(seen.url, FAKE_URL);
  assert.equal(seen.init.method, 'POST');
  assert.equal(seen.init.headers['Content-Type'], 'text/plain;charset=utf-8');

  // Penjaga penting: mode 'no-cors' membuat respons jadi opaque, sehingga
  // status "skipped"/"error" dari server tidak akan pernah terbaca klien.
  assert.notEqual(seen.init.mode, 'no-cors');
  assert.equal(seen.init.mode, undefined);
});

test('respons "skipped" dari server diteruskan apa adanya ke pemanggil', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();

  env.setFetch(() => jsonResponse({
    status: 'skipped',
    message: 'Nama sudah tercatat di kelas ini.',
    sheet: 'X A',
    row: 12
  }));

  const result = await svc.pushRecord({ name: 'Siswa Ganda', className: 'X A', absen: 2 });

  assert.equal(result.status, 'skipped');
  assert.match(result.message, /sudah tercatat/);
});

test('tanpa webhook, pushRecord mengembalikan status lokal (bukan error)', async () => {
  const env = installBrowserStubs();
  const svc = loadService();

  let fetchCalled = false;
  env.setFetch(() => {
    fetchCalled = true;
    return jsonResponse({});
  });

  const result = await svc.pushRecord({ name: 'Siswa', className: 'X A', absen: 3 });

  assert.equal(result.status, 'local');
  assert.equal(fetchCalled, false, 'tanpa webhook tidak boleh ada permintaan jaringan');
});

test('kegagalan jaringan dilaporkan sebagai error, bukan sukses palsu', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();

  env.setFetch(() => { throw new Error('network down'); });

  const result = await svc.pushRecord({ name: 'Siswa', className: 'X A', absen: 4 });

  assert.equal(result.status, 'error');
  assert.match(result.message, /network down/);
});

test('respons bukan JSON (halaman error deployment) tertangkap sebagai error', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();

  env.setFetch(() => ({
    ok: true,
    json: async () => { throw new Error('bukan json'); },
    text: async () => '<!DOCTYPE html><html>Sign in required</html>'
  }));

  const result = await svc.pushRecord({ name: 'Siswa', className: 'X A', absen: 5 });

  assert.equal(result.status, 'error');
  assert.match(result.message, /bukan JSON|akses deployment/i);
});

test('syncExamConfig memetakan examIsOpen=false ke mode manual_closed', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();

  env.setFetch(() => jsonResponse({
    status: 'active',
    examIsOpen: false,
    allowReview: false,
    totalRecords: 7
  }));

  const changed = await svc.syncExamConfig();

  assert.equal(changed, true);
  assert.equal(State.examConfig.isOpen, false);
  assert.equal(State.examConfig.overrideMode, 'manual_closed');
  assert.equal(State.examConfig.allowReview, false);
  assert.equal(State.examConfig.overrideReviewMode, 'manual_locked');
});

test('syncExamConfig tidak melaporkan perubahan bila status sudah sama', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();

  env.setFetch(() => jsonResponse({ status: 'active', examIsOpen: true, allowReview: true }));

  assert.equal(await svc.syncExamConfig(), false);
});

test('testConnection melaporkan pesan server saat ping berhasil', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();

  env.setFetch(() => jsonResponse({
    status: 'ok',
    spreadsheet: 'VectorArena XI 2026',
    totalSheets: 14
  }));

  const result = await svc.testConnection();

  assert.equal(result.ok, true);
  assert.match(result.message, /VectorArena XI 2026/);
  assert.match(result.message, /14 sheet/);
});

test('setExamConfig mengirim aksi setExamConfig dan menyimpan hasil server', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();

  let body = null;
  env.setFetch((url, init) => {
    body = JSON.parse(init.body);
    return jsonResponse({ status: 'ok', examIsOpen: false, allowReview: true });
  });

  const ok = await svc.setExamConfig({ isOpen: false });

  assert.equal(ok, true);
  assert.equal(body.action, 'setExamConfig');
  assert.equal(body.isOpen, false);
  assert.equal(State.examConfig.isOpen, false);
});

test('hasil tarikan server yang basi tidak menimpa aksi guru yang lebih baru', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();

  // Hanya GET (tarikan status) yang ditahan; POST guru harus langsung selesai.
  let release;
  const gate = new Promise((r) => { release = r; });
  env.setFetch(async (url, init) => {
    const isGet = !init || !init.method || init.method === 'GET';
    if (isGet) {
      await gate;
      return jsonResponse({ status: 'active', examIsOpen: false, allowReview: false });
    }
    return jsonResponse({ status: 'ok', examIsOpen: true, allowReview: true });
  });

  const pending = svc.syncExamConfig();

  // Guru membuka pendaftaran dari perangkat ini selagi permintaan berjalan.
  await svc.setExamConfig({ isOpen: true }, false);

  release();
  await pending;

  assert.equal(State.examConfig.isOpen, true, 'keputusan guru terbaru harus bertahan');
});

test('kiriman yang tidak merespons dibatalkan dengan pesan jelas, bukan menggantung', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();

  // fetch yang tidak pernah selesai sampai AbortController memicu abort.
  env.setFetch((url, init) => new Promise((resolve, reject) => {
    if (init && init.signal) {
      init.signal.addEventListener('abort', () => {
        const err = new Error('aborted');
        err.name = 'AbortError';
        reject(err);
      });
    }
  }));

  const result = await svc.pushRecord({ name: 'Siswa', className: 'X A', absen: 9 }, 20);

  assert.equal(result.status, 'error');
  assert.match(result.message, /tidak merespons|detik/i);
});
