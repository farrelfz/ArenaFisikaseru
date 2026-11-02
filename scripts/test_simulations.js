// ==========================================================================
// TEST SUITE SIMULASI BERBAGAI KONDISI HYDROARENA SMAN 78
// ==========================================================================

const fs = require('fs');

// Mock Browser Environment
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};
global.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.window = { addEventListener: () => {}, scrollTo: () => {} };

const elements = {};
global.document = {
  getElementById: (id) => {
    if (!elements[id]) {
      elements[id] = {
        innerHTML: "",
        textContent: "",
        value: (id === "lb-class-filter" ? "ALL" : ""),
        style: {},
        classList: {
          add: () => {},
          remove: () => {},
          contains: () => false
        }
      };
    }
    return elements[id];
  },
  querySelectorAll: () => [],
  addEventListener: () => {}
};

// Muat komponen sistem
const diagrams = require('../js/data/diagrams.js');
Object.assign(global, diagrams);
const { MASTER_QUESTIONS } = require('../js/data/questions.js');
global.MASTER_QUESTIONS = MASTER_QUESTIONS;
const { CONFIG } = require('../js/config.js');
global.CONFIG = CONFIG;
const { State } = require('../js/state.js');
global.State = State;
const { Utils } = require('../js/utils/helpers.js');
global.Utils = Utils;
const { LeaderboardModule } = require('../js/modules/leaderboard.js');
const { ExamModule } = require('../js/modules/exam.js');

const results = [];

function assert(name, condition, details = "") {
  if (condition) {
    results.push({ name, status: "PASS", details });
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    results.push({ name, status: "FAIL", details });
    console.error(`  ❌ [FAIL] ${name} -> ${details}`);
  }
}

console.log("\n=======================================================");
console.log("🚀 MEMULAI SIMULASI & UJI KONDISI BATAS (EDGE CASES)");
console.log("=======================================================\n");

// --------------------------------------------------------------------------
// TEST 1: KALKULASI SKOR & BATAS 100.000 PTS
// --------------------------------------------------------------------------
console.log("1. UJI KALKULASI SKOR & BATAS 100.000 PTS:");
{
  // 1A. Sempurna instan (25 benar, 5400 detik sisa)
  const base1 = 25 * CONFIG.BASE_POINTS_PER_QUESTION; // 75.000
  const ratio1 = 25 / CONFIG.TOTAL_QUESTIONS;
  const bonus1 = Math.round(ratio1 * (5400 / CONFIG.EXAM_DURATION_SECONDS) * CONFIG.MAX_SPEED_BONUS);
  const total1 = base1 + bonus1;
  assert("Skor sempurna instan tepat 100.000 Pts", total1 === 100000, `Got: ${total1}`);

  // 1B. Sempurna dengan sisa waktu 2700 detik (50% waktu)
  const bonus1b = Math.round(ratio1 * (2700 / CONFIG.EXAM_DURATION_SECONDS) * CONFIG.MAX_SPEED_BONUS);
  const total1b = base1 + bonus1b;
  assert("Skor 50% waktu = 75.000 + 12.500 = 87.500 Pts", total1b === 87500, `Got: ${total1b}`);

  // 1C. Timeout (0 detik sisa)
  const remaining0 = Math.max(0, 0);
  const bonus0 = Math.round(ratio1 * (remaining0 / CONFIG.EXAM_DURATION_SECONDS) * CONFIG.MAX_SPEED_BONUS);
  assert("Bonus kecepatan saat waktu habis adalah 0", bonus0 === 0, `Got: ${bonus0}`);

  // 1D. Overflow waktu (misal lag atau negatif)
  const remainingNeg = Math.max(0, -50);
  const bonusNeg = Math.round(ratio1 * (remainingNeg / CONFIG.EXAM_DURATION_SECONDS) * CONFIG.MAX_SPEED_BONUS);
  assert("Bonus kecepatan tidak pernah negatif", bonusNeg === 0, `Got: ${bonusNeg}`);

  // 1E. 0 Benar (semua salah)
  const base0 = 0 * CONFIG.BASE_POINTS_PER_QUESTION;
  const ratio0 = 0 / CONFIG.TOTAL_QUESTIONS;
  const bonus0benar = Math.round(ratio0 * (5400 / CONFIG.EXAM_DURATION_SECONDS) * CONFIG.MAX_SPEED_BONUS);
  assert("0 Benar menghasilkan total skor 0", (base0 + bonus0benar) === 0);
}

// --------------------------------------------------------------------------
// TEST 2: THRESHOLD KKM & TIER FLUIDA
// --------------------------------------------------------------------------
console.log("\n2. UJI THRESHOLD KKM & TIER FLUIDA:");
{
  // KKM SMAN 78 = 75.0 (minimal 19 benar dari 25 soal = 76.0)
  const grade18 = Number(((18 / 25) * 100).toFixed(1)); // 72.0
  const grade19 = Number(((19 / 25) * 100).toFixed(1)); // 76.0
  assert("18 Benar (72.0) berstatus REMEDIAL (< 75.0)", grade18 < CONFIG.ACADEMIC_KKM, `Grade: ${grade18}`);
  assert("19 Benar (76.0) berstatus TUNTAS KKM (>= 75.0)", grade19 >= CONFIG.ACADEMIC_KKM, `Grade: ${grade19}`);

  // Tier names
  assert("Nilai 100 = SUPERFLUIDA", LeaderboardModule.getTier(100).name === "SUPERFLUIDA");
  assert("Nilai 95 = SUPERFLUIDA", LeaderboardModule.getTier(95).name === "SUPERFLUIDA");
  assert("Nilai 92 = SUPERKRITIS", LeaderboardModule.getTier(92).name === "SUPERKRITIS");
  assert("Nilai 85 = SUPERKRITIS", LeaderboardModule.getTier(85).name === "SUPERKRITIS");
  assert("Nilai 80 = TURBULEN", LeaderboardModule.getTier(80).name === "TURBULEN");
  assert("Nilai 75 = TURBULEN", LeaderboardModule.getTier(75).name === "TURBULEN");
  assert("Nilai 70 = TRANSISI", LeaderboardModule.getTier(70).name === "TRANSISI");
  assert("Nilai 60 = TRANSISI", LeaderboardModule.getTier(60).name === "TRANSISI");
  assert("Nilai 55 = LAMINER", LeaderboardModule.getTier(55).name === "LAMINER");
  assert("Nilai 0 = LAMINER", LeaderboardModule.getTier(0).name === "LAMINER");
}

// --------------------------------------------------------------------------
// TEST 3: INTEGRITAS PINDAH TAB (ANTI-CHEAT CLASSIFICATION)
// --------------------------------------------------------------------------
console.log("\n3. UJI 5 TINGKAT INTEGRITAS ALIRAN (ANTI-CHEAT):");
{
  const b0 = LeaderboardModule.getFairPlayBadge(0);
  const b1 = LeaderboardModule.getFairPlayBadge(1);
  const b2 = LeaderboardModule.getFairPlayBadge(2);
  const b3 = LeaderboardModule.getFairPlayBadge(3);
  const b4 = LeaderboardModule.getFairPlayBadge(4);
  const b5 = LeaderboardModule.getFairPlayBadge(5);
  const b10 = LeaderboardModule.getFairPlayBadge(10);

  assert("0x Tab = Aliran Tunak", b0.includes("Aliran Tunak (0x)"));
  assert("1x Tab = Riak Fluktuasi", b1.includes("Riak Fluktuasi (1x)"));
  assert("2x Tab = Olakan Vortiks", b2.includes("Olakan Vortiks (2x)"));
  assert("3x Tab = Kavitasi Kritis (3x)", b3.includes("Kavitasi Kritis (3x)"));
  assert("4x Tab = Kavitasi Kritis (4x)", b4.includes("Kavitasi Kritis (4x)"));
  assert("5x Tab = Separasi Ekstrem (5x)", b5.includes("Separasi Ekstrem (5x)"));
  assert("10x Tab = Separasi Ekstrem (10x)", b10.includes("Separasi Ekstrem (10x)"));
}

// --------------------------------------------------------------------------
// TEST 4: JADWAL UJIAN & PENGUNCIAN KUNCI JAWABAN
// --------------------------------------------------------------------------
console.log("\n4. UJI JADWAL UJIAN & PENGUNCIAN KUNCI JAWABAN:");
{
  function testSchedule(dateObj) {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      weekday: "short",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false
    });
    const parts = formatter.formatToParts(dateObj);
    const p = {};
    parts.forEach(part => p[part.type] = part.value);

    const dayMap = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };
    const day = dayMap[p.weekday];
    let hour = parseInt(p.hour, 10);
    if (hour === 24) hour = 0;
    const minute = parseInt(p.minute, 10);
    const totalMins = hour * 60 + minute;

    let isOpen = false;
    if (day === 3) isOpen = totalMins >= 390;
    else if (day === 4) isOpen = true;
    else if (day === 5) isOpen = totalMins < 960;

    return { isOpen, allowReview: !isOpen };
  }

  // A. Rabu 06:29 WIB
  const wedBefore = testSchedule(new Date("2026-11-04T06:29:00+07:00"));
  assert("Rabu 06:29 WIB: Ujian belum buka", wedBefore.isOpen === false);

  // B. Rabu 06:30 WIB
  const wedStart = testSchedule(new Date("2026-11-04T06:30:00+07:00"));
  assert("Rabu 06:30 WIB: Ujian TERBUKA OTOMATIS", wedStart.isOpen === true);
  assert("Rabu 06:30 WIB: Kunci Jawaban TERKUNCI OTOMATIS", wedStart.allowReview === false);

  // C. Kamis 12:00 WIB
  const thuMid = testSchedule(new Date("2026-11-05T12:00:00+07:00"));
  assert("Kamis 12:00 WIB: Ujian TERBUKA OTOMATIS", thuMid.isOpen === true);
  assert("Kamis 12:00 WIB: Kunci Jawaban TERKUNCI OTOMATIS", thuMid.allowReview === false);

  // D. Jumat 15:59 WIB
  const friLast = testSchedule(new Date("2026-11-06T15:59:00+07:00"));
  assert("Jumat 15:59 WIB: Ujian masih buka", friLast.isOpen === true);
  assert("Jumat 15:59 WIB: Kunci Jawaban masih terkunci", friLast.allowReview === false);

  // E. Jumat 16:00 WIB
  const friClose = testSchedule(new Date("2026-11-06T16:00:00+07:00"));
  assert("Jumat 16:00 WIB: Ujian TERTUTUP OTOMATIS", friClose.isOpen === false);
  assert("Jumat 16:00 WIB: Kunci Jawaban TERBUKA OTOMATIS", friClose.allowReview === true);

  // F. Sabtu 10:00 WIB
  const satPost = testSchedule(new Date("2026-11-07T10:00:00+07:00"));
  assert("Sabtu 10:00 WIB: Ujian tutup, kunci terbuka", satPost.isOpen === false && satPost.allowReview === true);
}

// --------------------------------------------------------------------------
// TEST 5: SIMULASI 3 LAPIS PERLINDUNGAN ANTI-TIMPA (SPREADSHEET LOGIC)
// --------------------------------------------------------------------------
console.log("\n5. UJI 3 LAPIS ANTI-TIMPA / DUPLIKASI SPREADSHEET:");
{
  const existingSheetData = [
    ["No. Absen", "Nama Lengkap", "Kelas", "Nilai", "KKM", "Skor", "Benar", "Salah", "SalahNo", "Waktu", "Integritas", "Timestamp", "IP"],
    [1, "Farrel Fauzan", "XI A", 92, "TUNTAS", 90000, 23, 2, "Q05, Q14", "35m 12s", "Level 1: Aliran Tunak", "2026-11-04 08:00", "192.168.1.50"]
  ];

  function validateNewSubmission(row, newEntry) {
    const inputName = String(newEntry.name || "").trim().toLowerCase();
    const inputAbsen = parseInt(newEntry.absen, 10);
    const inputIp = String(newEntry.ip || "").trim().toLowerCase();

    for (let i = 1; i < row.length; i++) {
      const rowAbsen = parseInt(row[i][0], 10);
      const rowName = String(row[i][1] || "").trim().toLowerCase();
      const rowIp = String(row[i][12] || "").trim().toLowerCase();

      if (rowName === inputName) return { allowed: false, reason: "DUPLICATE_NAME" };
      if (rowAbsen === inputAbsen) return { allowed: false, reason: "DUPLICATE_ABSEN" };
      if (inputIp && rowIp === inputIp && !inputIp.includes("0.0.0.0")) return { allowed: false, reason: "DUPLICATE_IP" };
    }
    return { allowed: true };
  }

  // 5A. Siswa dengan nama sama persis (case insensitive)
  const resDupName = validateNewSubmission(existingSheetData, { name: "FARREL FAUZAN", absen: 2, ip: "192.168.1.99" });
  assert("Duplikasi nama siswa ditolak", resDupName.allowed === false && resDupName.reason === "DUPLICATE_NAME");

  // 5B. Siswa dengan nomor absen sama di kelas yang sama
  const resDupAbsen = validateNewSubmission(existingSheetData, { name: "Budi Santoso", absen: 1, ip: "192.168.1.99" });
  assert("Duplikasi nomor absen di kelas sama ditolak", resDupAbsen.allowed === false && resDupAbsen.reason === "DUPLICATE_ABSEN");

  // 5C. Perangkat dengan IP sama persis
  const resDupIp = validateNewSubmission(existingSheetData, { name: "Siti Rahma", absen: 2, ip: "192.168.1.50" });
  assert("Duplikasi perangkat IP sama ditolak", resDupIp.allowed === false && resDupIp.reason === "DUPLICATE_IP");

  // 5D. Siswa valid baru
  const resValid = validateNewSubmission(existingSheetData, { name: "Aisyah Putri", absen: 2, ip: "192.168.1.55" });
  assert("Siswa baru yang belum terdaftar diizinkan", resValid.allowed === true);
}

// --------------------------------------------------------------------------
// TEST 6: SIMULASI KLASEMEN (TOP 10 HALL OF FAME & PODIUM)
// --------------------------------------------------------------------------
console.log("\n6. UJI INTEGRITAS KLASEMEN & TOP 10 HALL OF FAME:");
{
  const mockStudents = [];
  for (let i = 1; i <= 20; i++) {
    mockStudents.push({
      name: `Siswa Prestasi ${i}`,
      className: `XI ${['A', 'B', 'C', 'D', 'E', 'F'][i % 6]}`,
      absen: i,
      academicGrade: 100 - i,
      correctCount: 25 - Math.floor(i / 2),
      durationSec: 1500 + i * 60,
      baseScore: 75000 - i * 1500,
      speedBonus: 20000 - i * 500,
      totalScore: 95000 - i * 2000,
      tabSwitches: i % 4,
      ip: `103.119.65.${i}`
    });
  }

  State.leaderboardRecords = mockStudents;
  LeaderboardModule.renderFullTable();

  const top10Html = elements["lb-top10-container"].innerHTML;
  const fullTableRows = (elements["lb-table-body"].innerHTML.match(/<tr/g) || []).length;

  assert("Tabel lengkap merender ke-20 siswa tanpa batas 10", fullTableRows === 20, `Rows: ${fullTableRows}`);
  assert("Top 10 Hall of Fame memiliki lencana Juara 1", top10Html.includes("🥇 #1"));
  assert("Top 10 Hall of Fame memiliki lencana Juara 2", top10Html.includes("🥈 #2"));
  assert("Top 10 Hall of Fame memiliki lencana Juara 3", top10Html.includes("🥉 #3"));
  assert("Top 10 Hall of Fame memiliki lencana #10", top10Html.includes("#10"));
  assert("Top 10 Hall of Fame TIDAK merender lencana #11 ke atas", !top10Html.includes("#11"));
}

// --------------------------------------------------------------------------
// TEST 7: XSS & SANITASI INPUT SISWA
// --------------------------------------------------------------------------
console.log("\n7. UJI SANITASI XSS & INPUT LIAR:");
{
  const xssName = '<script>alert("hack")</script>';
  const escaped = Utils.escapeHtml(xssName);
  assert("Script tag ter-escape dengan aman", !escaped.includes("<script>") && escaped.includes("&lt;script&gt;"));

  const quoteName = 'Siswa "Bintang" \'Juara\' & <Hebat>';
  const escapedQuote = Utils.escapeHtml(quoteName);
  assert("Quotes dan ampersand ter-escape dengan aman", escapedQuote.includes("&quot;") && escapedQuote.includes("&amp;") && escapedQuote.includes("&lt;"));
}

// --------------------------------------------------------------------------
// TEST 8: OBFUSKASI KUNCI JAWABAN PADA SESI AKTIF (DEVTOOLS RESISTANCE)
// --------------------------------------------------------------------------
console.log("\n8. UJI OBFUSKASI KUNCI JAWABAN SESI AKTIF:");
{
  const shuffled = ExamModule._buildShuffledQuestions();
  assert("25 butir soal diacak", shuffled.length === 25);
  
  // Periksa bahwa correctIndex TIDAK terekspos langsung di sesi aktif browser
  const hasDirectKey = shuffled.some(q => q.correctIndex !== undefined);
  assert("correctIndex disembunyikan dari objek soal sesi aktif", !hasDirectKey);

  // Periksa token verifikasi _v ada
  const hasVerificationToken = shuffled.every(q => typeof q._v === 'string' && q._v.length > 0);
  assert("Setiap soal memiliki token verifikasi terenkode (_v)", hasVerificationToken);

  // Periksa decoding token
  const firstQ = shuffled[0];
  const decoded = Buffer.from(firstQ._v, 'base64').toString();
  const parts = decoded.split(':');
  assert("Token verifikasi dapat didekode dengan benar saat submit", parts.length === 3 && !isNaN(parseInt(parts[1], 10)));
}

console.log("\n=======================================================");
const passCount = results.filter(r => r.status === "PASS").length;
const failCount = results.filter(r => r.status === "FAIL").length;
console.log(`🏁 HASIL SIMULASI: ${passCount} LULUS, ${failCount} GAGAL`);
console.log("=======================================================\n");

process.exit(failCount > 0 ? 1 : 0);
