// Uji logika backend Apps Script VectorArena tanpa Google.
// Meniru SpreadsheetApp/PropertiesService/LockService/ContentService
// secukupnya untuk memverifikasi doPost, doGet, anti-timpa, dan bank soal.
//
// Jalankan dari root repo:  node VectorArena/apps-script/test-code-gs.cjs

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const CODE_PATH = path.join(__dirname, 'Code.gs');

function makeRange(sheet, row, col) {
  return {
    setFontWeight() { return this; },
    setBackground() { return this; },
    setFontColor() { return this; },
    setFontFamily() { return this; },
    setFontSize() { return this; },
    setVerticalAlignment() { return this; },
    setHorizontalAlignment() { return this; },
    setNumberFormat() { return this; },
    setWrap() { return this; },
    sort(spec) { sheet.sort(spec); return this; },
    setValues(values) {
      values.forEach((line, r) => {
        const target = row - 1 + r;
        if (!sheet.data[target]) sheet.data[target] = [];
        line.forEach((value, c) => { sheet.data[target][col - 1 + c] = value; });
      });
      return this;
    }
  };
}

class Sheet {
  constructor(name) { this.name = name; this.data = []; }
  getName() { return this.name; }
  appendRow(values) { this.data.push(values.slice()); }
  clear() { this.data = []; }
  getLastRow() { return this.data.length; }
  getDataRange() {
    const sheet = this;
    return { getValues: () => sheet.data.map((row) => row.slice()) };
  }
  getRange(row, col) { return makeRange(this, row, col); }
  sort(spec) {
    const index = (spec.column || 1) - 1;
    const body = this.data.slice(1).sort((a, b) => {
      const x = Number(a[index]);
      const y = Number(b[index]);
      return isNaN(x) || isNaN(y) ? 0 : (spec.ascending === false ? y - x : x - y);
    });
    this.data = [this.data[0]].concat(body);
  }
  setRowHeight() {}
  setFrozenRows() {}
  setColumnWidth() {}
  autoResizeColumn() {}
}

class Spreadsheet {
  constructor(name) { this.name = name; this.sheets = []; }
  getName() { return this.name; }
  getSheets() { return this.sheets; }
  getSheetByName(name) { return this.sheets.find((sheet) => sheet.getName() === name) || null; }
  insertSheet(name, index) {
    const sheet = new Sheet(name);
    if (index === 0) this.sheets.unshift(sheet);
    else this.sheets.push(sheet);
    return sheet;
  }
}

function buildSandbox(ss) {
  const properties = new Map();
  const sandbox = {
    console: { log() {}, warn() {}, error() {} },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ss,
      openById: () => ss,
      getUi: () => ({ alert() {} })
    },
    PropertiesService: {
      getScriptProperties: () => ({
        setProperty: (key, value) => properties.set(key, String(value)),
        getProperty: (key) => (properties.has(key) ? properties.get(key) : null)
      })
    },
    LockService: {
      getScriptLock: () => ({ tryLock: () => true, releaseLock() {} })
    },
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput: (text) => ({
        setMimeType() { return this; },
        getContent() { return text; }
      })
    },
    Utilities: {
      formatDate: (date) => {
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ` +
          `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
      }
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(CODE_PATH, 'utf8'), sandbox, { filename: 'Code.gs' });
  return sandbox;
}

const ss = new Spreadsheet('Spreadsheet Uji VectorArena');
const gas = buildSandbox(ss);

const post = (payload) => JSON.parse(
  gas.doPost({ postData: { contents: JSON.stringify(payload) } }).getContent()
);
const get = (parameter) => JSON.parse(gas.doGet({ parameter: parameter || {} }).getContent());

let pass = 0;
const failures = [];
function check(name, condition, detail) {
  if (condition) {
    pass += 1;
    return;
  }
  failures.push(`${name}${detail === undefined ? '' : ' :: ' + JSON.stringify(detail)}`);
}

const base = {
  name: 'Muhammad Zaidan Al-Farisi',
  className: 'X A',
  absen: 1,
  totalQuestions: 25,
  correctCount: 25,
  durationSec: 1350,
  baseScore: 75000,
  speedBonus: 18750,
  totalScore: 93750,
  academicGrade: 100,
  tabSwitches: 0,
  ip: '192.168.78.11',
  answersJson: {}
};

// 1. Simpan hasil ujian + pembuatan sheet kelas & bank soal
const first = post(base);
const classSheet = ss.getSheetByName('X A');
const bank = ss.getSheetByName('Pertanyaan & Kunci Jawaban');
check('POST pertama ok', first.status === 'ok', first);
check('sheet kelas dibuat', !!classSheet);
check('header 13 kolom', classSheet && classSheet.data[0].length === 13);
check('baris siswa tersimpan', classSheet && classSheet.data.length === 2);
check('nilai quiz 100', classSheet && classSheet.data[1][3] === 100);
check('KKM TUNTAS', classSheet && classSheet.data[1][4] === 'TUNTAS');
check('durasi 22m 30s', classSheet && classSheet.data[1][9] === '22m 30s');
check('bank soal 25 butir', bank && bank.data.length === 26, bank && bank.data.length);

// 2. Anti-timpa nama & absen
check('nama ganda ditolak', post({ ...base, absen: 2 }).status === 'skipped');
check('absen ganda ditolak', post({ ...base, name: 'Siswa Lain' }).status === 'skipped');
check('tidak ada baris tambahan', classSheet.data.length === 2);

// 3. IP sama (satu NAT sekolah) harus tetap boleh
check('IP sama tetap diterima', post({ ...base, name: 'Siswa Kedua', absen: 2 }).status === 'ok');
check('terurut per absen', classSheet.data[1][0] === 1 && classSheet.data[2][0] === 2);

// 4. Remedial + daftar soal salah + integritas
post({
  ...base,
  name: 'Siswa Remedial',
  absen: 3,
  correctCount: 10,
  academicGrade: 40,
  totalScore: 30000,
  tabSwitches: 3,
  ip: '10.0.0.5',
  answersJson: JSON.stringify({ Q02: { isCorrect: false }, Q03: { isCorrect: false } })
});
const remedial = classSheet.data.find((row) => row[1] === 'Siswa Remedial');
check('KKM REMEDIAL', remedial && remedial[4] === 'REMEDIAL');
check('jumlah salah 15', remedial && remedial[7] === 15);
check('nomor salah Q02, Q03', remedial && remedial[8] === 'Q02, Q03');
check('integritas level 4', remedial && String(remedial[10]).includes('Level 4'));

// 5. Validasi
check('kelas asing ditolak', post({ ...base, name: 'Nyasar', absen: 9, className: 'XI IPA 1' }).status === 'error');
check('nama kosong ditolak', post({ ...base, name: '' }).status === 'error');
check('JSON rusak ditolak', JSON.parse(
  gas.doPost({ postData: { contents: '{bukan json' } }).getContent()
).status === 'error');

// 6. Kontrol ujian + GET rekap
check('tutup ujian', post({ action: 'setExamConfig', isOpen: false, allowReview: false }).examIsOpen === false);
let state = get({});
check('GET melaporkan ujian tertutup', state.examIsOpen === false);
check('GET rows 3', state.rows.length === 3, state.rows.length);
check('bank soal tidak ikut', state.totalRecords === 3);
check('record memuat kontrak lengkap', ['absen', 'name', 'className', 'academicGrade', 'statusKKM',
  'totalScore', 'correctCount', 'wrongCount', 'wrongNumbers', 'durationLabel', 'integrity', 'timestamp', 'ip']
  .every((key) => key in state.records[0]));
state = get({ action: 'setExamConfig', isOpen: 'true', allowReview: 'true' });
check('buka ujian via GET', state.examIsOpen === true && state.allowReview === true);
check('ping GET', get({ action: 'ping' }).spreadsheet === 'Spreadsheet Uji VectorArena');
check('ping POST', post({ action: 'ping' }).status === 'ok');

// 6b. Nilai tidak bisa diinflasi dari klien
const inflated = post({ ...base, name: 'Siswa Klaim', absen: 5, correctCount: 5, academicGrade: 100, totalScore: 99999 });
check('nilai dihitung dari correctCount', inflated.grade === 20, inflated);
check('KKM ditentukan server', inflated.statusKKM === 'REMEDIAL', inflated);

// 6c. Nomor soal salah dari bank soal kurasi berformat VEC-ZZ-NNN
// (kunci answersJson dari js/data/curated_25.js) — harus muncul di kolom 9,
// bukan "Sempurna (0 Salah)".
post({
  ...base,
  name: 'Siswa Vektor Salah',
  absen: 6,
  correctCount: 23,
  academicGrade: 92,
  totalScore: 89329,
  tabSwitches: 2,
  ip: '10.0.0.6',
  answersJson: JSON.stringify({
    'VEC-02-011': { isCorrect: false },
    'VEC-05-005': { isCorrect: false }
  })
});
const vectorSalah = classSheet.data.find((row) => row[1] === 'Siswa Vektor Salah');
check('jumlah salah 2', vectorSalah && vectorSalah[7] === 2, vectorSalah && vectorSalah[8]);
check('nomor salah VEC tampil', vectorSalah && vectorSalah[8] === 'VEC-02-011, VEC-05-005', vectorSalah && vectorSalah[8]);

// 7. Reset bank soal idempoten
gas.manualInitQuestionBank();
check('reset bank soal tidak menduplikasi', bank.data.length === 26, bank.data.length);
check('soal pertama VEC-01-001', bank.data[1][1] === 'VEC-01-001');
check('soal terakhir VEC-08-031', bank.data[25][1] === 'VEC-08-031');

// 8. Tema kosmetik gagal tidak membatalkan nilai
classSheet.getRange = (row, col) => {
  const range = makeRange(classSheet, row, col);
  range.sort = () => { throw new Error('simulasi sort gagal'); };
  return range;
};
check('sort gagal tidak membatalkan', post({ ...base, name: 'Siswa Sort Gagal', absen: 4 }).status === 'ok');
check('baris tetap masuk', !!classSheet.data.find((row) => row[1] === 'Siswa Sort Gagal'));

if (failures.length > 0) {
  console.error(`GAGAL ${failures.length} dari ${pass + failures.length} pemeriksaan:`);
  failures.forEach((item) => console.error(' - ' + item));
  process.exit(1);
}

console.log(`Code.gs: ${pass} pemeriksaan lulus.`);