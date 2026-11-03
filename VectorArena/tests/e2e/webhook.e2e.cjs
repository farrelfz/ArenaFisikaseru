/**
 * Uji antarmuka VectorArena di headless Chromium.
 *
 * Fokusnya adalah rantai integrasi Google Spreadsheet: panel webhook guru,
 * sinkronisasi status ujian dari server, dan pengiriman hasil ujian. Server
 * Apps Script ditiru oleh HTTP server lokal supaya pengujian tidak menyentuh
 * akun Google mana pun.
 *
 * Jalankan: node VectorArena/tests/e2e/webhook.e2e.cjs
 * Keluar 0 bila semua pemeriksaan lulus, 1 bila ada yang gagal.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const FAKE_EXEC = '/macros/fake/exec';

// --------------------------------------------------------------------------
// Muat Playwright. Di CI paket dipasang lewat npm; di mesin pengembang bisa
// berasal dari instalasi lain, jadi beberapa lokasi dicoba berurutan.
// --------------------------------------------------------------------------
function loadPlaywright() {
  const candidates = [
    'playwright',
    'playwright-core',
    path.join(os_home(), 'AI-Workspace/Codingan/Pribadi/FisikaSeru/node_modules/playwright-core')
  ];

  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (err) {
      // lanjut ke kandidat berikutnya
    }
  }

  console.error('Playwright tidak ditemukan. Pasang dengan: npm install --no-save playwright');
  process.exit(1);
}

function os_home() {
  return process.env.HOME || require('os').homedir();
}

const { chromium } = loadPlaywright();

// --------------------------------------------------------------------------
// Server statis + tiruan Apps Script
// --------------------------------------------------------------------------

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const received = [];
let examIsOpen = true;
let allowReview = true;

const server = http.createServer((req, res) => {
  if (req.url.startsWith(FAKE_EXEC)) {
    // GET = rekap status, POST = simpan hasil / aksi ping & setExamConfig.
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'active', app: 'VectorArena',
        examIsOpen, allowReview,
        totalSheets: 14, totalRecords: 3, rows: [], records: []
      }));
      return;
    }

    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      let parsed = {};
      try { parsed = JSON.parse(body); } catch (e) { /* body non-JSON diabaikan */ }
      received.push({ contentType: req.headers['content-type'], origin: req.headers.origin, body: parsed });

      if (parsed.action === 'ping') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'ok', app: 'VectorArena',
          spreadsheet: 'VectorArena X SMAN78', totalSheets: 14,
          examIsOpen, allowReview
        }));
        return;
      }

      if (parsed.action === 'setExamConfig') {
        if (typeof parsed.isOpen === 'boolean') examIsOpen = parsed.isOpen;
        if (typeof parsed.allowReview === 'boolean') allowReview = parsed.allowReview;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', examIsOpen, allowReview }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok', app: 'VectorArena', message: 'tersimpan',
        sheet: parsed.className, row: 2, grade: 84, statusKKM: 'TUNTAS', totalScore: 61000
      }));
    });
    return;
  }

  const rel = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(ROOT, rel);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) {
    res.writeHead(404); res.end('not found'); return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

let failures = 0;
function check(name, cond, detail = '') {
  console.log(`${cond ? '  ✔' : '  ✖'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures += 1;
}

(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const execUrl = `${base}${FAKE_EXEC}`;

  const browser = await chromium.launch({
    args: ['--no-sandbox'],
    // Sandbox CI menyediakan Chromium milik Playwright sendiri.
    ...(process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {})
  });

  const page = await browser.newPage();
  // Galat jaringan berbeda dari pengecualian JavaScript; keduanya dipisah
  // supaya server yang sengaja dimatikan tidak menutupi bug nyata.
  const jsErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (e) => jsErrors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  console.log('1) Mode mandiri — webhook kosong');
  await page.goto(`${base}/VectorArena/`, { waitUntil: 'load' });
  await page.waitForTimeout(900);
  check('tanpa galat JS saat boot', jsErrors.length === 0, jsErrors.slice(0, 2).join(' | '));
  const statusText = await page.textContent('#lobby-sheet-status');
  check('indikator lobi menyebut mode mandiri', /Mandiri/i.test(statusText), statusText);
  check('tidak ada permintaan jaringan ke webhook', received.length === 0, `received=${received.length}`);

  console.log('2) Panel guru — menyimpan webhook');
  await page.evaluate(() => { State.isTeacherLoggedIn = true; App.switchView('sheet'); });
  await page.waitForTimeout(300);
  check('daftar bank soal panel guru terisi tanpa galat',
    (await page.evaluate(() => document.querySelectorAll('#admin-bank-list-tbody tr').length)) > 0);
  await page.fill('#input-webhook-url', execUrl);
  await page.click('text=Simpan');
  await page.waitForTimeout(400);
  check('URL tersimpan di localStorage',
    await page.evaluate(() => localStorage.getItem('vectorarena_webhook_url_v1_live')) === execUrl);
  const badge = await page.textContent('#admin-webhook-badge');
  check('lencana panel menandai terpasang', /Terpasang/i.test(badge), badge);

  console.log('3) Uji Koneksi (POST action=ping)');
  await page.click('text=Uji Koneksi');
  await page.waitForTimeout(900);
  const ping = received.find((r) => r.body.action === 'ping');
  check('server menerima ping', !!ping);
  check('Content-Type text/plain (tidak memicu preflight)',
    ping && /^text\/plain/.test(ping.contentType), ping && ping.contentType);
  check('indikator lobi berubah menjadi terhubung',
    /Spreadsheet/i.test(await page.textContent('#lobby-sheet-status')),
    await page.textContent('#lobby-sheet-status'));

  console.log('4) Tarik Status dari server (examIsOpen=false di server)');
  examIsOpen = false;
  allowReview = false;
  await page.click('text=Tarik Status');
  await page.waitForTimeout(900);
  const badgeExam = await page.textContent('#admin-exam-status-badge');
  check('panel guru mengikuti status server', /TERTUTUP/i.test(badgeExam), badgeExam);

  console.log('5) Reload siswa — status tertutup ikut terbawa');
  await page.evaluate(() => App.switchView('exam'));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1200);
  const headerText = await page.textContent('#header-exam-status-text');
  check('pil header menyatakan tertutup', /Ditutup/i.test(headerText), headerText);
  check('banner peringatan tampil',
    await page.evaluate(() => !document.getElementById('exam-closed-banner').classList.contains('hidden')));
  check('tombol mulai dinonaktifkan',
    await page.evaluate(() => document.getElementById('btn-start-exam').disabled === true));
  check('tidak ada galat JS setelah reload', jsErrors.length === 0, jsErrors.slice(0, 2).join(' | '));

  console.log('6) Guru membuka kembali — siswa bisa mulai, hasil terkirim');
  await page.evaluate(() => { State.isTeacherLoggedIn = true; App.switchView('sheet'); });
  await page.waitForTimeout(200);
  await page.click('text=Buka Pendaftaran');
  await page.waitForTimeout(900);
  const setCfg = received.filter((r) => r.body.action === 'setExamConfig').pop();
  check('perubahan status dikirim ke server', !!setCfg && setCfg.body.isOpen === true,
    setCfg ? JSON.stringify(setCfg.body) : 'tidak ada');

  await page.evaluate(() => App.switchView('exam'));
  await page.waitForTimeout(300);
  check('tombol mulai aktif kembali',
    await page.evaluate(() => document.getElementById('btn-start-exam').disabled === false));

  await page.fill('#input-name', 'Siswa Uji Otomatis');
  await page.selectOption('#input-class', 'X A');
  await page.fill('#input-absen', '7');
  await page.click('#btn-start-exam');
  await page.waitForTimeout(1200);

  check('sesi ujian dimulai',
    await page.evaluate(() => !!(State.activeSession && State.activeSession.startTimeMs)));

  // Regresi: dengan difficulty berupa angka, soal harus benar-benar tampil.
  const stem = (await page.textContent('#q-stem-text')).trim();
  check('teks soal benar-benar tampil (bukan placeholder)',
    stem.length > 20 && !/Memuat butir/i.test(stem), stem.slice(0, 60));
  check('lencana kesulitan terisi label yang terbaca',
    /MUDAH|SEDANG|SULIT|TANTANGAN/.test(await page.textContent('#q-difficulty-badge')),
    await page.textContent('#q-difficulty-badge'));

  console.log('7) Selesaikan ujian → POST hasil ke webhook');
  await page.evaluate(async () => {
    State.activeSession.selectedAnswers = { 0: 0, 1: 1, 2: 2 };
    State.activeSession.remainingSeconds = 1200;
    await ExamModule.finalizeSubmit();
  });
  await page.waitForTimeout(1500);

  const record = received.find((r) => !r.body.action);
  check('server menerima data hasil ujian', !!record);
  if (record) {
    check('body berisi identitas siswa',
      record.body.name === 'Siswa Uji Otomatis' && record.body.className === 'X A' && record.body.absen === 7,
      JSON.stringify({ n: record.body.name, c: record.body.className, a: record.body.absen }));
    check('Content-Type text/plain pada kiriman hasil',
      /^text\/plain/.test(record.contentType), record.contentType);
    check('tidak memakai application/json (pemicu preflight)',
      record.contentType !== 'application/json');
  }

  console.log('8) Server mati — nilai lokal tetap utuh');
  await new Promise((r) => server.close(r));
  const storedBefore = await page.evaluate(() => State.leaderboardRecords.length);

  const syncResult = await page.evaluate(async () => {
    let threw = null;
    try { await App.syncWithSpreadsheet(); } catch (e) { threw = String(e); }
    return { threw, statusText: document.getElementById('lobby-sheet-status').textContent };
  });

  check('sinkronisasi gagal tanpa melempar galat', syncResult.threw === null, syncResult.threw || 'tidak melempar');
  check('indikator jatuh ke mode mandiri saat server mati',
    /Mandiri/i.test(syncResult.statusText), syncResult.statusText);

  const storedAfter = await page.evaluate(() => State.leaderboardRecords.length);
  check('catatan lokal tidak hilang saat server mati', storedAfter >= storedBefore,
    `${storedBefore} → ${storedAfter}`);

  check('tidak ada pengecualian JS yang tidak tertangani', jsErrors.length === 0, jsErrors.slice(0, 2).join(' | '));
  check('satu-satunya galat konsol adalah kegagalan jaringan yang disengaja',
    consoleErrors.every((m) => /ERR_CONNECTION_REFUSED|Failed to load resource|Failed to fetch/i.test(m)),
    consoleErrors.slice(0, 2).join(' | '));

  await browser.close();

  if (failures > 0) {
    console.log(`\n${failures} pemeriksaan GAGAL.`);
    process.exit(1);
  }
  console.log('\nSEMUA PEMERIKSAAN LULUS');
})().catch((e) => { console.error(e); process.exit(1); });
