// ==========================================================================
// VECTORARENA — GOOGLE APPS SCRIPT BACKEND (SMAN 78 JAKARTA)
// Portal Evaluasi Kompetitif: Vektor & Kinematika Gerak Vertikal
// Kelas X A s.d. X K (11 rombel) — 25 butir soal
//
// CARA PAKAI SINGKAT
//   1. Buka spreadsheet tujuan > Extensions > Apps Script
//   2. Hapus isi Code.gs, tempel seluruh file ini, simpan
//   3. Deploy > New deployment > Web app
//        Execute as  : Me
//        Who has access : Anyone
//   4. Salin URL yang berakhiran /exec -> tempel di panel guru VectorArena
//
// KONTRAK DATA
//   POST  { ...record }                  -> simpan 1 hasil ujian
//   POST  { action: 'setExamConfig', isOpen?: bool, allowReview?: bool,
//           override?: 'auto'|'manual_open'|'manual_closed',
//           overrideReview?: 'auto'|'manual_allowed'|'manual_locked' }
//   POST  { action: 'ping' }             -> uji koneksi dari panel guru
//   GET   ?action=ping                   -> status + jumlah data
//   GET   (tanpa parameter)              -> { status, app, examIsOpen,
//                                            allowReview, totalSheets,
//                                            totalRecords, rows, records }
//
// CATATAN PENTING
//   - Script ini boleh berdiri sendiri (tempel di spreadsheet) atau
//     standalone (isi SPREADSHEET_ID di bawah).
//   - Kiriman dari browser sebaiknya memakai Content-Type: text/plain
//     agar tidak memicu preflight CORS yang ditolak Apps Script.
//   - Validasi anti-timpa: NAMA dan NOMOR ABSEN bersifat memblokir.
//     IP TIDAK memblokir secara default (lihat BLOCK_ON_DUPLICATE_IP),
//     karena seluruh siswa di satu sekolah bisa keluar lewat satu IP NAT.
// ==========================================================================

// --------------------------------------------------------------------------
// KONFIGURASI
// --------------------------------------------------------------------------

// Kosongkan bila script ini ditempel langsung di spreadsheet target
// (Extensions > Apps Script). Isi dengan ID spreadsheet bila script standalone.
const SPREADSHEET_ID = '';

const KKM = 75.0;
const TOTAL_QUESTIONS_DEFAULT = 25;
const BASE_POINTS_PER_QUESTION = 3000;

// Daftar kelas resmi. Kelas di luar daftar ditolak agar tidak membuat sheet sampah.
const CLASSES = ['X A', 'X B', 'X C', 'X D', 'X E', 'X F', 'X G', 'X H', 'X I', 'X J', 'X K'];

const CLASS_SHEET_HEADERS = [
  'No. Absen',
  'Nama Lengkap Siswa',
  'Kelas',
  'Nilai Quiz',
  'Status KKM',
  'Total Skor',
  'Benar',
  'Salah',
  'Nomor Soal Salah',
  'Waktu Pengerjaan',
  'Integritas (Fokus Tab)',
  'Waktu Pengumpulan',
  'Identitas_Perangkat'
];

const QUESTION_SHEET_NAME = 'Pertanyaan & Kunci Jawaban';

// Blokir pengiriman bila IP sudah pernah dipakai di kelas yang sama?
// Default false: satu sekolah biasanya berbagi satu IP publik (NAT), sehingga
// pemblokiran IP akan menolak hampir semua siswa setelah yang pertama.
// Nama + nomor absen tetap memblokir pengiriman ganda.
const BLOCK_ON_DUPLICATE_IP = false;

const TIMEZONE = 'Asia/Jakarta';

// --------------------------------------------------------------------------
// MENU SPREADSHEET
// --------------------------------------------------------------------------

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('VectorArena SMAN 78')
    .addItem('🟢 Buka Akses Ujian Siswa', 'manualOpenExam')
    .addItem('🔴 Tutup Akses Ujian Siswa', 'manualCloseExam')
    .addSeparator()
    .addItem('🔓 Buka Kunci Pembahasan', 'manualOpenReview')
    .addItem('🔒 Kunci Pembahasan', 'manualLockReview')
    .addSeparator()
    .addItem('📚 Buat / Reset Sheet Bank Soal (25 Soal)', 'manualInitQuestionBank')
    .addItem('🔌 Uji Koneksi Backend', 'manualPing')
    .addToUi();
}

function manualOpenExam() {
  PropertiesService.getScriptProperties().setProperty('EXAM_OVERRIDE', 'manual_open');
  SpreadsheetApp.getUi().alert('STATUS: Akses ujian DIBUKA untuk seluruh siswa Kelas X.');
}

function manualCloseExam() {
  PropertiesService.getScriptProperties().setProperty('EXAM_OVERRIDE', 'manual_closed');
  SpreadsheetApp.getUi().alert('STATUS: Akses ujian DITUTUP.');
}

function manualOpenReview() {
  PropertiesService.getScriptProperties().setProperty('REVIEW_OVERRIDE', 'manual_allowed');
  SpreadsheetApp.getUi().alert('STATUS: Kunci jawaban & pembahasan DIBUKA.');
}

function manualLockReview() {
  PropertiesService.getScriptProperties().setProperty('REVIEW_OVERRIDE', 'manual_locked');
  SpreadsheetApp.getUi().alert('STATUS: Kunci jawaban & pembahasan DIKUNCI.');
}

function manualInitQuestionBank() {
  const ss = getSpreadsheet_();
  if (!ss) {
    SpreadsheetApp.getUi().alert('Error: spreadsheet tidak ditemukan. Pasang script ini pada spreadsheet target atau isi SPREADSHEET_ID.');
    return;
  }
  ensureQuestionBankSheet(ss, true);
  SpreadsheetApp.getUi().alert('Sheet "Pertanyaan & Kunci Jawaban" berhasil dibuat ulang (25 soal).');
}

function manualPing() {
  const ss = getSpreadsheet_();
  if (!ss) {
    SpreadsheetApp.getUi().alert('Error: spreadsheet tidak ditemukan.');
    return;
  }
  const props = PropertiesService.getScriptProperties();
  SpreadsheetApp.getUi().alert(
    'Backend VectorArena aktif.\n\n' +
    'Spreadsheet : ' + ss.getName() + '\n' +
    'Jumlah sheet: ' + ss.getSheets().length + '\n' +
    'Ujian       : ' + (props.getProperty('EXAM_OVERRIDE') || 'manual_open') + '\n' +
    'Pembahasan  : ' + (props.getProperty('REVIEW_OVERRIDE') || 'manual_allowed')
  );
}

// --------------------------------------------------------------------------
// HELPER
// --------------------------------------------------------------------------

function getSpreadsheet_() {
  let ss = null;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (err) { ss = null; }
  if (!ss && SPREADSHEET_ID) ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss || null;
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function error_(message) {
  return json_({ status: 'error', app: 'VectorArena', message: message });
}

function fmtDate_(date) {
  try {
    return Utilities.formatDate(date, TIMEZONE, 'dd/MM/yyyy HH:mm:ss');
  } catch (err) {
    return date.toISOString();
  }
}

function durationLabel_(seconds) {
  const s = Math.max(0, parseInt(seconds, 10) || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return h + 'j ' + m + 'm ' + (s % 60) + 's';
  return m + 'm ' + (s % 60) + 's';
}

function integrityLabel_(switches) {
  const n = Math.max(0, parseInt(switches, 10) || 0);
  if (n === 0) return 'Level 1: Fokus Penuh (0x Tab)';
  if (n === 1) return 'Level 2: Fluktuasi (1x Tab)';
  if (n === 2) return 'Level 3: Waspada (2x Tab)';
  if (n <= 4) return 'Level 4: Peringatan (' + n + 'x Tab)';
  return 'Level 5: Pelanggaran Berat (' + n + 'x Tab)';
}

// Terima answersJson sebagai string JSON, objek, atau array nomor salah.
function parseAnswers_(value) {
  let parsed = value;
  if (typeof value === 'string') {
    try { parsed = JSON.parse(value); } catch (err) { parsed = null; }
  }
  if (!parsed || typeof parsed !== 'object') return { detail: {}, wrong: [] };

  if (Array.isArray(parsed)) {
    return { detail: {}, wrong: parsed.map(function (v) { return String(v); }) };
  }

  const wrong = [];
  Object.keys(parsed).forEach(function (key) {
    const item = parsed[key];
    if (item && typeof item === 'object' && item.isCorrect === false) {
      wrong.push(key);
    }
  });
  return { detail: parsed, wrong: wrong };
}

function normalizeWrongNumbers_(wrong) {
  const seen = {};
  const out = [];
  (wrong || []).forEach(function (raw) {
    let id = String(raw).trim().toUpperCase();
    if (/^\d+$/.test(id)) id = 'Q' + (id.length < 2 ? '0' + id : id);
    if (!/^Q\d{1,2}$/.test(id) || seen[id]) return;
    seen[id] = true;
    out.push(id);
  });
  out.sort();
  return out;
}

function rowToRecord_(row) {
  return {
    absen: parseInt(row[0], 10),
    name: String(row[1] || '').trim(),
    className: String(row[2] || '').trim(),
    academicGrade: Number(row[3]) || 0,
    statusKKM: String(row[4] || '').trim(),
    totalScore: parseInt(row[5], 10) || 0,
    correctCount: parseInt(row[6], 10) || 0,
    wrongCount: parseInt(row[7], 10) || 0,
    wrongNumbers: String(row[8] || '').trim(),
    durationLabel: String(row[9] || '').trim(),
    integrity: String(row[10] || '').trim(),
    timestamp: String(row[11] || '').trim(),
    ip: String(row[12] || '').trim()
  };
}

function looksLikeStudentRow_(row) {
  const absen = parseInt(row[0], 10);
  const name = String(row[1] || '').trim();
  return !isNaN(absen) && absen >= 1 && name.length >= 2 &&
    name.indexOf('#NUM!') === -1 &&
    !/tester|penguji/i.test(name);
}

// --------------------------------------------------------------------------
// POST — SIMPAN HASIL UJIAN / KONTROL UJIAN
// --------------------------------------------------------------------------

function doPost(e) {
  const lock = LockService.getScriptLock();
  const hasLock = lock.tryLock(20000);

  if (!hasLock) {
    return error_('Server sedang sibuk memproses antrean. Coba lagi dalam beberapa detik.');
  }

  try {
    const ss = getSpreadsheet_();
    if (!ss) {
      return error_('Spreadsheet tidak terhubung. Pasang script pada spreadsheet target atau isi SPREADSHEET_ID.');
    }

    let d = {};
    if (e && e.postData && e.postData.contents) {
      try {
        d = JSON.parse(e.postData.contents);
      } catch (err) {
        return error_('Payload bukan JSON yang valid.');
      }
    } else {
      return error_('Tidak ada data payload yang diterima.');
    }

    // ---- Aksi: uji koneksi ----
    if (d.action === 'ping') {
      return json_({
        status: 'ok',
        app: 'VectorArena',
        message: 'Backend VectorArena merespons.',
        spreadsheet: ss.getName(),
        totalSheets: ss.getSheets().length,
        examIsOpen: isExamOpen_(),
        allowReview: isReviewAllowed_()
      });
    }

    // ---- Aksi: kontrol status ujian / pembahasan ----
    if (d.action === 'setExamConfig') {
      const props = PropertiesService.getScriptProperties();
      if (d.override !== undefined) {
        props.setProperty('EXAM_OVERRIDE', String(d.override));
      }
      if (typeof d.isOpen === 'boolean') {
        props.setProperty('EXAM_OVERRIDE', d.isOpen ? 'manual_open' : 'manual_closed');
      }
      if (d.overrideReview !== undefined) {
        props.setProperty('REVIEW_OVERRIDE', String(d.overrideReview));
      }
      if (typeof d.allowReview === 'boolean') {
        props.setProperty('REVIEW_OVERRIDE', d.allowReview ? 'manual_allowed' : 'manual_locked');
      }
      return json_({
        status: 'ok',
        message: 'Status ujian & pembahasan diperbarui di server.',
        examIsOpen: isExamOpen_(),
        allowReview: isReviewAllowed_()
      });
    }

    // ---- Aksi: simpan hasil ujian ----
    if (!d.name || !d.className || isNaN(parseInt(d.absen, 10))) {
      return error_('Identitas siswa (nama, kelas, nomor absen) tidak valid.');
    }

    const targetSheetName = String(d.className).trim().toUpperCase().replace(/\s+/g, ' ');
    if (CLASSES.indexOf(targetSheetName) === -1) {
      return error_('Kelas "' + d.className + '" tidak dikenali. Kelas resmi: ' + CLASSES.join(', ') + '.');
    }

    // Bank soal bersifat pelengkap: kegagalan membuatnya tidak boleh
    // menggagalkan penyimpanan nilai siswa.
    try { ensureQuestionBankSheet(ss); } catch (err) { console.warn('Bank soal dilewati: ' + err); }

    const totalQ = Math.max(1, parseInt(d.totalQuestions, 10) || TOTAL_QUESTIONS_DEFAULT);
    const rawCorrect = parseInt(d.correctCount, 10);
    const hasCorrectCount = !isNaN(rawCorrect);
    let correctCount = hasCorrectCount ? rawCorrect : 0;
    correctCount = Math.min(totalQ, Math.max(0, correctCount));

    // Nilai dihitung di server dari jumlah benar, bukan dipercaya mentah dari
    // klien. academicGrade hanya dipakai bila correctCount memang tidak dikirim.
    const parsedGrade = parseFloat(d.academicGrade);
    const grade = hasCorrectCount
      ? Number(((correctCount / totalQ) * 100).toFixed(1))
      : (isNaN(parsedGrade) ? 0 : Number(parsedGrade.toFixed(1)));

    const statusKKM = grade >= KKM ? 'TUNTAS' : 'REMEDIAL';
    const wrongCount = Math.max(0, totalQ - correctCount);

    const answers = parseAnswers_(d.answersJson);
    const wrongNumbers = normalizeWrongNumbers_(
      Array.isArray(d.wrongNumbers) ? d.wrongNumbers : answers.wrong
    );
    const wrongNumbersLabel = wrongNumbers.length > 0
      ? wrongNumbers.join(', ')
      : 'Sempurna (0 Salah)';

    let totalScore = parseInt(d.totalScore, 10);
    if (isNaN(totalScore)) totalScore = correctCount * BASE_POINTS_PER_QUESTION;

    const absen = parseInt(d.absen, 10);
    const name = String(d.name).trim().replace(/\s+/g, ' ');
    const ip = String(d.ip || '').trim();

    let sheet = ss.getSheetByName(targetSheetName);
    if (!sheet) {
      sheet = ss.insertSheet(targetSheetName);
      sheet.appendRow(CLASS_SHEET_HEADERS);
      const headerRange = sheet.getRange(1, 1, 1, CLASS_SHEET_HEADERS.length);
      headerRange
        .setFontWeight('bold')
        .setBackground('#312e81')
        .setFontColor('#ffffff')
        .setFontFamily('Arial')
        .setFontSize(10)
        .setVerticalAlignment('middle');
      sheet.setRowHeight(1, 35);
      sheet.setFrozenRows(1);
    }

    // ---- Anti-timpa: nama & nomor absen memblokir, IP tidak (lihat konfigurasi) ----
    const values = sheet.getDataRange().getValues();
    const nameKey = name.toLowerCase();
    let duplicateReason = '';

    for (let i = 1; i < values.length; i++) {
      const rowName = String(values[i][1] || '').trim().toLowerCase();
      const rowAbsen = parseInt(values[i][0], 10);
      const rowIp = String(values[i][12] || '').trim().toLowerCase();

      if (rowName && rowName === nameKey) {
        duplicateReason = 'Nama "' + name + '" sudah terdaftar di baris ' + (i + 1) + '.';
        break;
      }
      if (!isNaN(rowAbsen) && rowAbsen === absen) {
        duplicateReason = 'Nomor absen #' + absen + ' sudah terisi oleh ' + values[i][1] + '.';
        break;
      }
      if (BLOCK_ON_DUPLICATE_IP && ip && rowIp && rowIp === ip.toLowerCase() && ip.indexOf('0.0.0.0') === -1) {
        duplicateReason = 'Perangkat dengan IP ' + ip + ' sudah pernah mengumpulkan atas nama ' + values[i][1] + '.';
        break;
      }
    }

    if (duplicateReason) {
      return json_({
        status: 'skipped',
        app: 'VectorArena',
        message: duplicateReason,
        sheet: targetSheetName
      });
    }

    sheet.appendRow([
      absen,
      name,
      targetSheetName,
      grade,
      statusKKM,
      totalScore,
      correctCount,
      wrongCount,
      wrongNumbersLabel,
      durationLabel_(d.durationSec),
      integrityLabel_(d.tabSwitches),
      fmtDate_(new Date()),
      ip
    ]);

    const lastRow = sheet.getLastRow();

    // Baris sudah tersimpan di atas. Semua penataan visual di bawah ini
    // bersifat kosmetik: bila gagal, nilai siswa tetap dianggap masuk.
    try {
      if (lastRow > 1) {
        sheet.getRange(lastRow, 1).setHorizontalAlignment('center');
        sheet.getRange(lastRow, 2).setHorizontalAlignment('left').setFontWeight('bold');
        sheet.getRange(lastRow, 3).setHorizontalAlignment('center');
        sheet.getRange(lastRow, 4).setHorizontalAlignment('center').setFontWeight('bold').setNumberFormat('0.0');
        sheet.getRange(lastRow, 5).setHorizontalAlignment('center').setFontWeight('bold');
        sheet.getRange(lastRow, 6).setHorizontalAlignment('right').setNumberFormat('#,##0');
        sheet.getRange(lastRow, 7, 1, 2).setHorizontalAlignment('center');
        sheet.getRange(lastRow, 9).setHorizontalAlignment('left');
        sheet.getRange(lastRow, 10, 1, 4).setHorizontalAlignment('center');

        const kkmCell = sheet.getRange(lastRow, 5);
        const quizCell = sheet.getRange(lastRow, 4);
        if (statusKKM === 'TUNTAS') {
          kkmCell.setBackground('#dcfce7').setFontColor('#15803d').setFontWeight('bold');
          quizCell.setBackground('#f0fdf4');
        } else {
          kkmCell.setBackground('#fee2e2').setFontColor('#b91c1c').setFontWeight('bold');
          quizCell.setBackground('#fef2f2');
        }
        sheet.setRowHeight(lastRow, 28);
      }

      if (lastRow > 2) {
        sheet.getRange(2, 1, lastRow - 1, CLASS_SHEET_HEADERS.length).sort({ column: 1, ascending: true });
      }

      for (let c = 1; c <= CLASS_SHEET_HEADERS.length; c++) {
        sheet.autoResizeColumn(c);
      }
    } catch (formatErr) {
      console.warn('Penataan sheet dilewati: ' + formatErr);
    }

    return json_({
      status: 'ok',
      app: 'VectorArena',
      message: 'Hasil ujian tersimpan.',
      sheet: targetSheetName,
      row: lastRow,
      grade: grade,
      statusKKM: statusKKM,
      totalScore: totalScore
    });

  } catch (error) {
    return error_(error && error.toString ? error.toString() : String(error));
  } finally {
    lock.releaseLock();
  }
}

// --------------------------------------------------------------------------
// GET — SINKRONISASI STATUS & REKAP
// --------------------------------------------------------------------------

function isExamOpen_() {
  const props = PropertiesService.getScriptProperties();
  return (props.getProperty('EXAM_OVERRIDE') || 'manual_open') !== 'manual_closed';
}

function isReviewAllowed_() {
  const props = PropertiesService.getScriptProperties();
  return (props.getProperty('REVIEW_OVERRIDE') || 'manual_allowed') !== 'manual_locked';
}

function doGet(e) {
  try {
    const ss = getSpreadsheet_();
    if (!ss) return error_('Spreadsheet tidak terhubung.');

    // Kontrol via GET dipertahankan agar guru bisa menembak URL langsung
    // dari browser tanpa masalah preflight CORS.
    if (e && e.parameter && e.parameter.action === 'setExamConfig') {
      const props = PropertiesService.getScriptProperties();
      if (e.parameter.override !== undefined) {
        props.setProperty('EXAM_OVERRIDE', String(e.parameter.override));
      }
      if (e.parameter.isOpen !== undefined) {
        props.setProperty('EXAM_OVERRIDE', e.parameter.isOpen === 'true' ? 'manual_open' : 'manual_closed');
      }
      if (e.parameter.overrideReview !== undefined) {
        props.setProperty('REVIEW_OVERRIDE', String(e.parameter.overrideReview));
      }
      if (e.parameter.allowReview !== undefined) {
        props.setProperty('REVIEW_OVERRIDE', e.parameter.allowReview === 'true' ? 'manual_allowed' : 'manual_locked');
      }
    }

    const rows = [];
    const records = [];

    ss.getSheets().forEach(function (sh) {
      if (sh.getName() === QUESTION_SHEET_NAME) return;
      const vals = sh.getDataRange().getValues();
      if (vals.length <= 1) return;

      for (let i = 1; i < vals.length; i++) {
        if (!looksLikeStudentRow_(vals[i])) continue;
        rows.push(vals[i]);
        records.push(rowToRecord_(vals[i]));
      }
    });

    const payload = {
      status: 'active',
      app: 'VectorArena',
      subject: 'Fisika Vektor & Kinematika',
      examIsOpen: isExamOpen_(),
      allowReview: isReviewAllowed_(),
      totalSheets: ss.getSheets().length,
      totalRecords: rows.length,
      rows: rows,
      records: records
    };

    if (e && e.parameter && e.parameter.action === 'ping') {
      payload.spreadsheet = ss.getName();
      payload.message = 'Backend VectorArena merespons.';
    }

    return json_(payload);
  } catch (err) {
    return error_(err && err.toString ? err.toString() : String(err));
  }
}

// --------------------------------------------------------------------------
// SHEET BANK SOAL (25 SOAL TERKURASI)
// --------------------------------------------------------------------------

/**
 * Membuat sheet bank soal bila belum ada.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {boolean} force true = hapus & tulis ulang isi sheet
 */
function ensureQuestionBankSheet(ss, force) {
  let qSheet = ss.getSheetByName(QUESTION_SHEET_NAME);

  if (qSheet && !force) return qSheet;

  if (!qSheet) {
    qSheet = ss.insertSheet(QUESTION_SHEET_NAME, 0);
  } else {
    qSheet.clear();
  }

  qSheet.appendRow([
    'No.',
    'ID Soal',
    'Zona & Topik Silabus',
    'Teks Pertanyaan Fisika',
    'Kunci',
    'Jawaban Benar',
    'Penjelasan & Konsep Fisika'
  ]);

  qSheet.getRange(1, 1, 1, 7)
    .setFontWeight('bold')
    .setBackground('#1e1b4b')
    .setFontColor('#ffffff')
    .setFontFamily('Arial')
    .setFontSize(10)
    .setVerticalAlignment('middle');

  qSheet.setRowHeight(1, 35);
  qSheet.setFrozenRows(1);

  const masterData = [
[
  1,
  "VEC-01-001",
  "Vector Fundamentals [C2 (Pemahaman)]",
  "Kelompok besaran berikut yang seluruhnya merupakan besaran vektor adalah …",
  "C",
  "kecepatan, gaya, dan perpindahan",
  "Besaran vektor memiliki besar sekaligus arah. Kecepatan, gaya, dan perpindahan memenuhi keduanya. Jarak, kelajuan, massa, waktu, suhu, usaha, energi, dan daya adalah besaran skalar (hanya besar)."
],
[
  2,
  "VEC-01-002",
  "Vector Fundamentals [C2 (Pemahaman)]",
  "Perhatikan besaran berikut: (1) berat, (2) massa, (3) kuat arus listrik, (4) impuls, (5) tekanan. Besaran yang tergolong vektor adalah …",
  "D",
  "(1) dan (4)",
  "Berat adalah gaya gravitasi (vektor), impuls adalah perubahan momentum (vektor). Massa adalah skalar. Kuat arus listrik dan tekanan diperlakukan sebagai skalar dalam kurikulum fisika SMA."
],
[
  3,
  "VEC-01-030",
  "Vector Fundamentals [C4 (Analisis)]",
  "Sebuah mobil menempuh perjalanan: 40 km ke timur lalu 30 km ke utara. Perbandingan besar perpindahan terhadap jarak total yang ditempuh adalah …",
  "E",
  "50 : 70 = 5 : 7",
  "Jarak total = 40 + 30 = 70 km. Perpindahan adalah resultan tegak lurus: √(40² + 30²) = 50 km. Jadi perpindahan : jarak = 50 : 70 = 5 : 7."
],
[
  4,
  "VEC-02-001",
  "Vector Representation [C2 (Pemahaman)]",
  "Pada sistem koordinat Kartesius, titik yang berada di kuadran II memiliki …",
  "B",
  "x negatif dan y positif",
  "Kuadran I (+,+), II (−,+), III (−,−), IV (+,−). Kuadran II berarti x < 0 dan y > 0."
],
[
  5,
  "VEC-02-011",
  "Vector Representation [C3 (Aplikasi)]",
  "Vektor posisi sebuah drone adalah r = 3i + 4j meter. Jarak drone dari titik asal adalah …",
  "A",
  "5",
  "Jarak dari titik asal sama dengan besar vektor posisi."
],
[
  6,
  "VEC-02-005",
  "Vector Representation [C2 (Pemahaman)]",
  "Sebuah benda bergerak 4 m ke kiri sepanjang sumbu X. Dalam notasi vektor dengan arah kanan positif, perpindahan benda ditulis …",
  "D",
  "−4i m",
  "Gerak ke kiri berlawanan dengan arah positif sumbu X sehingga komponennya −4 m pada arah i."
],
[
  7,
  "VEC-03-004",
  "Vector Operations [C2 (Pemahaman)]",
  "Pengurangan vektor A − B ekuivalen dengan …",
  "A",
  "A + (−B)",
  "Mengurangi B sama dengan menambahkan vektor negatif B, yaitu vektor B yang dibalik arahnya."
],
[
  8,
  "VEC-03-007",
  "Vector Operations [C3 (Aplikasi)]",
  "Dua vektor A = 6i + 0j dan B = 0i + 8j (satuan SI). Besar resultan A + B adalah …",
  "B",
  "10",
  "Resultan diperoleh dengan menjumlahkan komponen sejenis, lalu menghitung besarnya."
],
[
  9,
  "VEC-03-032",
  "Vector Operations [C3 (Aplikasi)]",
  "Gambar 1 menunjukkan dua vektor dengan hubungan vektor tegak lurus. Besar resultannya adalah … satuan.",
  "B",
  "10",
  "Resultan dihitung dari komponen kedua vektor, sesuai arah masing-masing pada diagram."
],
[
  10,
  "VEC-04-001",
  "Geometrical Vector Methods [C2 (Pemahaman)]",
  "Pada metode segitiga, resultan dua vektor diperoleh dengan cara …",
  "C",
  "menyambung ujung vektor pertama ke pangkal vektor kedua, lalu menarik vektor dari pangkal pertama ke ujung kedua",
  "Metode segitiga menyambung vektor secara ujung-ke-pangkal; resultan menghubungkan titik awal ke titik akhir."
],
[
  11,
  "VEC-04-004",
  "Geometrical Vector Methods [C3 (Aplikasi)]",
  "Rumus aturan kosinus untuk besar resultan dua vektor yang membentuk sudut θ adalah …",
  "C",
  "R = √(A² + B² + 2AB cos θ)",
  "Untuk resultan (bukan selisih), tanda pada suku silang adalah positif: R² = A² + B² + 2AB cos θ."
],
[
  12,
  "VEC-04-006",
  "Geometrical Vector Methods [C4 (Analisis)]",
  "Dua vektor besarnya 3 satuan dan 4 satuan membentuk sudut 90°. Besar resultan kedua vektor adalah … satuan.",
  "C",
  "5",
  "Kedua vektor saling tegak lurus (θ = 90°), sehingga cos 90° = 0 dan resultan dapat dihitung dengan teorema Pythagoras: R = √(A² + B²) = √(3² + 4²) = √25 = 5 satuan."
],
[
  13,
  "VEC-05-002",
  "Vector Components [C2 (Pemahaman)]",
  "Komponen vertikal (sumbu Y) dari vektor A yang membentuk sudut θ terhadap sumbu X positif adalah …",
  "B",
  "A sin θ",
  "Proyeksi pada sumbu Y berhadapan dengan sudut θ, sehingga digunakan sinus: Ay = A sin θ."
],
[
  14,
  "VEC-05-005",
  "Vector Components [C3 (Aplikasi)]",
  "Sebuah vektor gaya besarnya 10 N membentuk sudut 30° terhadap sumbu X positif. Komponen horizontal (sumbu X) vektor tersebut adalah … N.",
  "A",
  "8,66",
  "Gunakan Ax = A cos θ dan Ay = A sin θ. Pada θ = 30°, komponen x = 10 × cos 30°."
],
[
  15,
  "VEC-05-011",
  "Vector Components [C3 (Aplikasi)]",
  "Sebuah vektor gaya besarnya 12 N membentuk sudut 120° terhadap sumbu X positif. Komponen horizontal (sumbu X) vektor tersebut adalah … N.",
  "B",
  "-6",
  "Gunakan Ax = A cos θ dan Ay = A sin θ. Pada θ = 120°, komponen x = 12 × cos 120°."
],
[
  16,
  "VEC-06-005",
  "GVA — Gerak Vertikal ke Atas [C3 (Aplikasi)]",
  "Pernyataan yang benar tentang massa benda pada GVA (ideal) adalah …",
  "D",
  "massa tidak memengaruhi waktu tempuh maupun ketinggian maksimum",
  "Semua benda mengalami percepatan gravitasi sama besarnya sehingga gerak ideal tidak bergantung massa."
],
[
  17,
  "VEC-06-009",
  "GVA — Gerak Vertikal ke Atas [C3 (Aplikasi)]",
  "Sebuah bola dilempar vertikal ke atas dengan kecepatan awal 20 m/s dari permukaan tanah (g = 10 m/s², hambatan udara diabaikan). Waktu yang diperlukan untuk mencapai titik tertinggi adalah … sekon.",
  "C",
  "2",
  "Di titik tertinggi v = 0, sehingga 0 = v₀ − gt dan t = v₀/g."
],
[
  18,
  "VEC-06-059",
  "GVA — Gerak Vertikal ke Atas [C4 (Analisis)]",
  "Grafik kecepatan terhadap waktu untuk sebuah benda GVA berupa garis lurus dengan v = 30 − 10t (m/s). Kecepatan benda pada t = 5 s adalah … m/s.",
  "C",
  "-20",
  "Substitusikan t = 5 s: v = 30 − 10(5) = −20 m/s. Tanda negatif menandakan benda sudah bergerak turun."
],
[
  19,
  "VEC-07-002",
  "GVB — Gerak Vertikal ke Bawah [C2 (Pemahaman)]",
  "Pada GVB, kelajuan benda …",
  "D",
  "bertambah karena percepatan gravitasi searah dengan gerak",
  "Arah gerak dan arah percepatan sama-sama ke bawah, sehingga kelajuan bertambah."
],
[
  20,
  "VEC-07-009",
  "GVB — Gerak Vertikal ke Bawah [C3 (Aplikasi)]",
  "Benda dilempar vertikal ke bawah dengan kecepatan  awal 5 m/s dari ketinggian 20 m (g = 10 m/s²). Kecepatan benda saat tiba di tanah adalah … m/s.",
  "C",
  "20,616",
  "Gunakan vₜ² = v₀² + 2gh. Perhatikan bahwa v₀ tidak boleh diabaikan."
],
[
  21,
  "VEC-07-010",
  "GVB — Gerak Vertikal ke Bawah [C3 (Aplikasi)]",
  "Benda dilempar vertikal ke bawah dengan kecepatan  awal 10 m/s dari ketinggian 15 m (g = 10 m/s²). Kecepatan benda saat tiba di tanah adalah … m/s.",
  "A",
  "20",
  "Gunakan vₜ² = v₀² + 2gh. Perhatikan bahwa v₀ tidak boleh diabaikan."
],
[
  22,
  "VEC-08-002",
  "GJB — Gerak Jatuh Bebas [C2 (Pemahaman)]",
  "Pada GJB ideal, besaran yang memengaruhi waktu jatuh adalah …",
  "C",
  "ketinggian dan percepatan gravitasi",
  "t = √(2h/g) hanya bergantung pada h dan g. Massa tidak berpengaruh pada GJB ideal."
],
[
  23,
  "VEC-08-009",
  "GJB — Gerak Jatuh Bebas [C2 (Pemahaman)]",
  "Benda dijatuhkan tanpa kecepatan awal dari ketinggian 5 m (g = 10 m/s²). Waktu benda menyentuh tanah adalah … sekon.",
  "A",
  "1",
  "GJB mulai dari v₀ = 0 sehingga h = ½gt². Dengan h = 5 m diperoleh t = √(2h/g) = √(1) ≈ 1 s."
],
[
  24,
  "VEC-08-018",
  "GJB — Gerak Jatuh Bebas [C3 (Aplikasi)]",
  "Benda jatuh bebas dari ketinggian 20 m (g = 10 m/s²). Kelajuan benda saat menyentuh tanah adalah … m/s.",
  "A",
  "20",
  "Dengan v₀ = 0, rumus v² = v₀² + 2gh tereduksi menjadi v = √(2gh). Untuk h = 20 m: v = √(400) ≈ 20 m/s."
],
[
  25,
  "VEC-08-031",
  "GJB — Gerak Jatuh Bebas [C4 (Analisis)]",
  "Dua benda dijatuhkan dari ketinggian h dan 4h. Perbandingan waktu jatuh keduanya adalah …",
  "C",
  "1 : 2",
  "t ∝ √h, sehingga t₂/t₁ = √4 = 2."
]
  ];

  const startRow = 2;
  const numRows = masterData.length;

  qSheet.getRange(startRow, 1, numRows, 7).setValues(masterData);

  qSheet.getRange(startRow, 1, numRows, 1).setHorizontalAlignment('center');
  qSheet.getRange(startRow, 2, numRows, 1).setHorizontalAlignment('center').setFontWeight('bold');
  qSheet.getRange(startRow, 3, numRows, 1).setHorizontalAlignment('left');
  qSheet.getRange(startRow, 4, numRows, 1).setHorizontalAlignment('left').setWrap(true);
  qSheet.getRange(startRow, 5, numRows, 1).setHorizontalAlignment('center').setFontWeight('bold').setBackground('#f1f5f9');
  qSheet.getRange(startRow, 6, numRows, 1).setHorizontalAlignment('left').setWrap(true);
  qSheet.getRange(startRow, 7, numRows, 1).setHorizontalAlignment('left').setWrap(true);

  qSheet.setColumnWidth(1, 45);
  qSheet.setColumnWidth(2, 95);
  qSheet.setColumnWidth(3, 180);
  qSheet.setColumnWidth(4, 400);
  qSheet.setColumnWidth(5, 65);
  qSheet.setColumnWidth(6, 260);
  qSheet.setColumnWidth(7, 420);

  for (let r = startRow; r < startRow + numRows; r++) {
    if (r % 2 === 0) {
      qSheet.getRange(r, 1, 1, 4).setBackground('#fafafa');
      qSheet.getRange(r, 6, 1, 2).setBackground('#fafafa');
    }
  }

  return qSheet;
}
