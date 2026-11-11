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
    STORAGE_KEYS: { WEBHOOK: WEBHOOK_KEY, PENDING_SYNC: 'vectorarena_pending_sync_v1' },
    CLASSES: ['X A', 'X B', 'X C', 'X D', 'X E', 'X F', 'X G', 'X H', 'X I', 'X J', 'X K'],
    // Retry dikunci ke 1 percobaan (dan tanpa backoff) supaya uji jalur kegagalan
    // tidak menunggu siklus eksponensial produksi yang berlangsung ~2 menit.
    SYNC_RETRY: { MAX_ATTEMPTS: 1, BASE_DELAY_MS: 0, REQUEST_TIMEOUT_MS: 20000 },
    TOTAL_QUESTIONS: 25,
    ACADEMIC_KKM: 75,
    EXAM_DURATION_SECONDS: 1200,
    BASE_POINTS_PER_QUESTION: 1000
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

// Perilaku produksi: config.js membawa URL bawaan, jadi siswa yang membuka
// halaman tanpa menyimpan apa pun tetap ikut menarik status dari server.
// Inilah alasan DEFAULT_WEBHOOK_URL tidak boleh dikosongkan diam-diam.
test('tanpa penyimpanan guru, URL bawaan tetap dipakai untuk menarik status', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();

  let requestedUrl = null;
  env.setFetch((url) => {
    requestedUrl = url;
    return jsonResponse({ status: 'active', examIsOpen: false, allowReview: false });
  });

  await svc.syncExamConfig();

  assert.equal(requestedUrl, FAKE_URL, 'permintaan harus menuju URL bawaan');
  assert.equal(State.examConfig.isOpen, false, 'status server harus terterap di siswa');
  assert.equal(State.examConfig.overrideMode, 'manual_closed');
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

// ---------------------------------------------------------------------------
// sync() — tarik data spreadsheet → website (arah sheet → web)
// ---------------------------------------------------------------------------

// Contoh baris sebagaimana dipetakan rowToRecord_ Code.gs (GET webhook hidup,
// sheet X H, 10 Nov 2026).
const SERVER_RECORDS = [
  {
    absen: 2, name: 'Aline Agung Wiyono', className: 'X H', academicGrade: 92,
    statusKKM: 'TUNTAS', totalScore: 79997, correctCount: 23, wrongCount: 2,
    wrongNumbers: 'VEC-02-011, VEC-05-005', durationLabel: '46m 58s',
    integrity: 'Level 4: CURANG BERAT (4x Tab)', timestamp: '10/11/2026, 07.08.24',
    ip: '112.78.143.90'
  },
  {
    absen: 6, name: 'Dahayu Audrina Ikram', className: 'X H', academicGrade: 96,
    statusKKM: 'TUNTAS', totalScore: 86436, correctCount: 24, wrongCount: 1,
    wrongNumbers: 'Sempurna (0 Salah)', durationLabel: '35m 52s',
    integrity: 'Level 1: JUJUR (0x Tab)', timestamp: '9/11/2026, 20.08.37',
    ip: '180.243.8.208'
  }
];

function serverResponse(records, extra = {}) {
  return jsonResponse({
    status: 'active',
    app: 'VectorArena',
    examIsOpen: true,
    allowReview: false,
    totalSheets: 5,
    totalRecords: records.length,
    records,
    ...extra
  });
}

// Augmentasi State dengan properti klasemen yang dipakai sync() tapi belum
// ada di stub dasar milik installBrowserStubs.
function installLeaderboardState(existingRecords = []) {
  globalThis.State.leaderboardRecords = existingRecords.map((r) => ({
    id: r.id || `local_${r.className?.replace(/\s+/g, '')}_${r.absen}`,
    mode: 'ranked',
    durationSec: r.durationSec || 600,
    ...r
  }));
  globalThis.State.ipLockRegistry = {};
  globalThis.State.sanitizeRecord = (r) => r;
}

test('sync() menarik record X H dari spreadsheet ke klasemen website', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();
  installLeaderboardState([]);

  env.setFetch(() => serverResponse(SERVER_RECORDS));

  const changed = await svc.sync(false);

  assert.equal(changed, true);
  assert.equal(globalThis.State.leaderboardRecords.length, 2);

  const aline = globalThis.State.leaderboardRecords.find((r) => r.name === 'Aline Agung Wiyono');
  assert.ok(aline, 'record Aline harus masuk');
  assert.equal(aline.className, 'X H');
  assert.equal(aline.absen, 2);
  assert.equal(aline.id, 'remote_XH_2');
  assert.equal(aline.ip, '112.78.143.90');

  // Kunci IP harus terisi supaya pembatasan perangkat tetap konsisten.
  assert.ok(globalThis.State.ipLockRegistry['112.78.143.90']);
  assert.ok(globalThis.State.ipLockRegistry['180.243.8.208']);

  // GET tanpa cache: data yang ditarik selalu fresh, bukan dari cache proksi.
  assert.equal(env.calls[0].url, FAKE_URL);
});

test('sync() memetakan payload webhook LAMA (rows, tanpa records) ke record server', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();
  installLeaderboardState([]);

  // Backend Apps Script PRA-redeploy hidup mengembalikan `rows` (array sel
  // mentah, 13 kolom per CLASS_SHEET_HEADERS) TANPA kunci `records`.
  const ROWS = [
    [2, 'Aline Agung Wiyono', 'X H', 92, 'TUNTAS', 79997, 23, 2, 'VEC-02-011, VEC-05-005', '46m 58s', 'Level 4: CURANG BERAT (4x Tab)', '10/11/2026, 07.08.24', '112.78.143.90'],
    [6, 'Dahayu Audrina Ikram', 'X H', 96, 'TUNTAS', 86436, 24, 1, 'Sempurna (0 Salah)', '35m 52s', 'Level 1: JUJUR (0x Tab)', '9/11/2026, 20.08.37', '180.243.8.208']
  ];

  env.setFetch(() => jsonResponse({
    status: 'active', app: 'VectorArena', subject: 'Fisika Vektor & Kinematika',
    examIsOpen: true, allowReview: false, totalSheets: 5, totalRecords: 29,
    rows: ROWS
  }));

  const changed = await svc.sync(false);

  assert.equal(changed, true);
  assert.equal(globalThis.State.leaderboardRecords.length, 2);

  const aline = globalThis.State.leaderboardRecords.find((r) => r.name === 'Aline Agung Wiyono');
  assert.ok(aline, 'record Aline harus masuk dari rows mentah');
  assert.equal(aline.className, 'X H');
  assert.equal(aline.absen, 2);
  assert.equal(aline.academicGrade, 92);
  assert.equal(aline.statusKKM, 'TUNTAS');
  assert.equal(aline.wrongNumbers, 'VEC-02-011, VEC-05-005');
  assert.equal(aline.ip, '112.78.143.90');
  assert.ok(globalThis.State.ipLockRegistry['112.78.143.90']);
});

test('sync() tidak menduplikasi siswa yang identitasnya sudah ada di klasemen', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();
  installLeaderboardState([
    { id: 'local_1', name: 'Aline Agung Wiyono', className: 'X H', absen: 2, answersJson: '{"VEC-02-011":{"isCorrect":false}}' }
  ]);

  env.setFetch(() => serverResponse(SERVER_RECORDS));

  const changed = await svc.sync(false);

  // Dahayu baru → ditambahkan; Aline identik → versi LOKAL dipertahankan
  // (memuat answersJson detail jawaban yang tidak ada di snapshot server).
  assert.equal(changed, true);
  assert.equal(globalThis.State.leaderboardRecords.length, 2);
  const kept = globalThis.State.leaderboardRecords.find((r) => r.name === 'Aline Agung Wiyono');
  assert.equal(kept.id, 'local_1');
  assert.equal(kept.answersJson, '{"VEC-02-011":{"isCorrect":false}}');
});

test('sync() menolak baris uji/sampah dan kelas non-resmi', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();
  installLeaderboardState([]);

  env.setFetch(() => serverResponse([
    { absen: 1, name: 'Tester', className: 'X H', timestamp: '', ip: '1.1.1.1' },
    { absen: 2, name: 'Peserta', className: 'X H', timestamp: '', ip: '1.1.1.2' },
    { absen: 3, name: 'Q01', className: 'X H', timestamp: '', ip: '1.1.1.3' },
    { absen: 4, name: '#NUM!', className: 'X H', timestamp: '', ip: '1.1.1.4' },
    { absen: 5, name: 'Siswa Lain Sekolah', className: 'X Z', timestamp: '', ip: '1.1.1.5' },
    { absen: 0, name: 'Absen Nol', className: 'X H', timestamp: '', ip: '1.1.1.6' },
    ...SERVER_RECORDS
  ]));

  const changed = await svc.sync(false);

  assert.equal(changed, true);
  assert.equal(globalThis.State.leaderboardRecords.length, 2);
  assert.ok(globalThis.State.leaderboardRecords.every((r) => CONFIG.CLASSES.includes(r.className)));
});

test('sync() menerapkan status ujian dan memberi toast saat guru membuka ujian', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();
  installLeaderboardState([]);

  // Ujian lokal masih tertutup; server melaporkan DIBUKA.
  globalThis.State.examConfig._isOpen = false;
  globalThis.State.examConfig.overrideMode = 'manual_closed';

  const toasts = [];
  globalThis.Utils = { showToast: (msg, important) => toasts.push({ msg, important }) };

  env.setFetch(() => serverResponse([], { examIsOpen: true }));

  const changed = await svc.sync(true);

  assert.equal(changed, true);
  assert.equal(globalThis.State.examConfig.isOpen, true);
  assert.equal(globalThis.State.examConfig.overrideMode, 'manual_open');
  assert.ok(toasts.some((t) => /RESMI DIBUKA/.test(t.msg)), JSON.stringify(toasts));
});

test('sync() gagal jaringan: tidak mengubah State dan hanya mengingatkan', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();
  installLeaderboardState([]);

  let warned = false;
  globalThis.Utils = { showToast: (msg) => { if (/Mode mandiri/.test(msg)) warned = true; } };

  env.setFetch(() => { throw new Error('network down'); });

  const changed = await svc.sync(true);

  assert.equal(changed, false);
  assert.equal(globalThis.State.leaderboardRecords.length, 0);
  assert.ok(warned, 'harus memberi tahu mode mandiri tetap berjalan');
});

// ---------------------------------------------------------------------------
// Anti data-hilang (#4–#6): antrean pending, pengiriman ulang, rekonsiliasi
// ---------------------------------------------------------------------------

const PENDING_KEY = 'vectorarena_pending_sync_v1';

test('pushRecord gagal → record masuk antrean pending (anti data-hilang)', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();

  env.setFetch(() => { throw new Error('offline'); });

  const result = await svc.pushRecord({ name: 'Siswa Offline', className: 'X A', absen: 4, ip: '10.0.0.1' });

  assert.equal(result.status, 'error');
  assert.equal(result.pending, true);
  assert.equal(svc.getPendingCount(), 1);
  assert.equal(env.store.get(PENDING_KEY) !== null, true, 'record harus dipersisten ke localStorage');
  assert.match(env.store.get(PENDING_KEY), /Siswa Offline/);
});

test('pushRecord sukses tidak menyisakan antrean pending', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();

  env.setFetch(() => jsonResponse({ status: 'ok', message: 'tersimpan' }));

  const result = await svc.pushRecord({ name: 'Siswa Online', className: 'X A', absen: 5 });

  assert.equal(result.status, 'ok');
  assert.equal(svc.getPendingCount(), 0);
});

test('flushPendingQueue mengirim ulang record tertahan lalu mengosongkan antrean', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();

  svc.enqueuePending({ name: 'Siswa Tertahan', className: 'X A', absen: 6 });
  assert.equal(svc.getPendingCount(), 1);

  let posts = 0;
  env.setFetch((url, init) => {
    if (init && init.method === 'POST') {
      posts++;
      return jsonResponse({ status: 'ok', message: 'tersimpan' });
    }
    return jsonResponse({ status: 'active', records: [] });
  });

  const res = await svc.flushPendingQueue();

  assert.equal(res.flushed, 1);
  assert.equal(res.remaining, 0);
  assert.equal(posts, 1);
  assert.equal(svc.getPendingCount(), 0);
});

test('_reconcileWithServer menghapus record lokal lama yang tidak ada di server', () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();
  const old = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  installLeaderboardState([
    { name: 'Siswa Hilang', className: 'X H', absen: 7, ip: '9.9.9.9', timestamp: old },
    { name: 'Siswa Ada', className: 'X H', absen: 8, ip: '8.8.8.8', timestamp: old }
  ]);

  const changed = svc._reconcileWithServer([{ name: 'Siswa Ada', className: 'X H', absen: 8 }]);

  assert.equal(changed, true);
  assert.equal(State.leaderboardRecords.length, 1);
  assert.equal(State.leaderboardRecords[0].name, 'Siswa Ada');
});

test('_reconcileWithServer mempertahankan record pending, IP placeholder, & yang masih muda', () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();
  const old = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recent = new Date().toISOString();

  installLeaderboardState([
    { name: 'Baru Saja', className: 'X H', absen: 1, ip: '1.2.3.4', timestamp: recent },
    { name: 'Tanpa IP', className: 'X H', absen: 2, ip: '', timestamp: old },
    { name: 'IP Placeholder', className: 'X H', absen: 3, ip: '0.0.0.0', timestamp: old },
    { name: 'Siswa Hilang', className: 'X H', absen: 4, ip: '9.9.9.9', timestamp: old }
  ]);

  // "Baru Saja" dilindungi sebagai record yang masih tersimpan di antrean pending.
  svc.enqueuePending({ name: 'Baru Saja', className: 'X H', absen: 1 });

  const changed = svc._reconcileWithServer([]);

  assert.equal(changed, true);
  const names = State.leaderboardRecords.map(r => r.name);
  assert.ok(names.includes('Baru Saja'), 'record pending harus bertahan');
  assert.ok(names.includes('Tanpa IP'), 'record tanpa IP (placeholder) harus bertahan');
  assert.ok(names.includes('IP Placeholder'), 'record IP placeholder harus bertahan');
  assert.ok(!names.includes('Siswa Hilang'), 'record lama dengan IP nyata boleh dihapus');
  assert.equal(names.length, 3);
});

test('_verifyRecordPersisted konfirmasi baris berhasil saat webhook GET memuatnya', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();

  env.setFetch(() => serverResponse(SERVER_RECORDS));

  const found = await svc._verifyRecordPersisted({ name: 'Aline Agung Wiyono', className: 'X H', absen: 2 }, 5000);

  assert.equal(found, true);
});

test('_verifyRecordPersisted false saat baris tidak ada di server', async () => {
  const env = installBrowserStubs({ defaultUrl: FAKE_URL });
  const svc = loadService();

  env.setFetch(() => jsonResponse({ status: 'active', records: [] }));

  const found = await svc._verifyRecordPersisted({ name: 'Tidak Ada', className: 'X H', absen: 99 }, 5000);

  assert.equal(found, false);
});

