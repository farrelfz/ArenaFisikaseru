// ==========================================================================
// KODE GOOGLE APPS SCRIPT VECTORARENA SMAN 78 JAKARTA (EDISI 25 BUTIR SOAL)
// PORTAL EVALUASI & KOMPETISI SAINS: VEKTOR & KINEMATIKA GERAK VERTIKAL
//
// FITUR UTAMA:
// 1. Sheet Khusus "Pertanyaan & Kunci Jawaban" (25 Soal Terkurasi 8 Zona)
// 2. Sheet Kelas Terpisah (1 Kelas 1 Sheet: "XI A", "XI B", ..., "XI F")
// 3. Kolom "Nilai Quiz" (0-100) & Urutan Tabel Rapi Berdasarkan No. Absen
// 4. Highlight Visual Kondisional (Hijau Pastel = Tuntas, Merah Muda = Remedial)
// 5. 3 Lapis Validasi Anti-Timpa (Cek Nama, Cek Absen, Cek IP/Device)
// 6. LockService Mutex (Perlindungan Tombol Klik Ganda / Double-Click)
// 7. Kontrol Status Ujian & Pembahasan Otomatis / Manual Override
// ==========================================================================

// GANTI DENGAN ID GOOGLE SPREADSHEET ANDA JIKA DIGUNAKAN DI LUAR CONTAINER SCRIPT
const SPREADSHEET_ID = ""; // Kosongkan jika script ditempel langsung di Extensions > Apps Script pada sheet target

// Menu kustom di Google Spreadsheet saat file dibuka oleh guru
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("VectorArena SMAN 78")
    .addItem("⏰ Jadwal Otomatis (Senin 07:00 s.d. Sabtu 18:00 WIB)", "manualAutoSchedule")
    .addSeparator()
    .addItem("🟢 Paksa Buka Pendaftaran (Manual Override)", "manualOpenExam")
    .addItem("🔴 Paksa Tutup Pendaftaran (Manual Override)", "manualCloseExam")
    .addSeparator()
    .addItem("🔓 Buka Kunci Pembahasan Siswa (Manual)", "manualOpenReview")
    .addItem("🔒 Kunci Pembahasan Siswa (Manual)", "manualLockReview")
    .addItem("⏰ Pembahasan Otomatis (Buka Saat Ujian Tutup)", "manualAutoReview")
    .addSeparator()
    .addItem("📚 Buat / Reset Sheet Bank Soal & Kunci (25 Soal)", "manualInitQuestionBank")
    .addToUi();
}

function manualAutoSchedule() {
  PropertiesService.getScriptProperties().setProperty("EXAM_OVERRIDE", "auto");
  SpreadsheetApp.getUi().alert("STATUS: Ujian diatur mengikuti JADWAL OTOMATIS (Senin 07:00 WIB s.d. Sabtu 18:00 WIB)!");
}

function manualOpenExam() {
  PropertiesService.getScriptProperties().setProperty("EXAM_OVERRIDE", "manual_open");
  SpreadsheetApp.getUi().alert("STATUS: Pendaftaran Ujian DIBUKA MANUAL (Override) untuk seluruh siswa!");
}

function manualCloseExam() {
  PropertiesService.getScriptProperties().setProperty("EXAM_OVERRIDE", "manual_closed");
  SpreadsheetApp.getUi().alert("STATUS: Pendaftaran Ujian DITUTUP MANUAL (Override). Akses pengerjaan dikunci.");
}

function manualOpenReview() {
  PropertiesService.getScriptProperties().setProperty("REVIEW_OVERRIDE", "manual_allowed");
  SpreadsheetApp.getUi().alert("STATUS: Kunci jawaban & pembahasan DIBUKA MANUAL untuk siswa.");
}

function manualLockReview() {
  PropertiesService.getScriptProperties().setProperty("REVIEW_OVERRIDE", "manual_locked");
  SpreadsheetApp.getUi().alert("STATUS: Kunci jawaban & pembahasan DIKUNCI MANUAL untuk siswa.");
}

function manualAutoReview() {
  PropertiesService.getScriptProperties().setProperty("REVIEW_OVERRIDE", "auto");
  SpreadsheetApp.getUi().alert("STATUS: Keterbukaan pembahasan diatur OTOMATIS (Terbuka saat sesi ujian berakhir)!");
}

function manualInitQuestionBank() {
  let ss;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) {}
  if (!ss && SPREADSHEET_ID) ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  if (!ss) {
    SpreadsheetApp.getUi().alert("Error: Spreadsheet tidak ditemukan. Pastikan script ini terpasang pada Google Spreadsheet.");
    return;
  }
  ensureQuestionBankSheet(ss);
  SpreadsheetApp.getUi().alert("Sheet \"Pertanyaan & Kunci Jawaban\" (25 Soal) berhasil dibuat dan diisi lengkap!");
}

// Jadwal Ujian Resmi: Terbuka Senin 07:00 WIB s.d. Sabtu 18:00 WIB
function isWithinExamSchedule() {
  const str = Utilities.formatDate(new Date(), "Asia/Jakarta", "u,HH,mm");
  const parts = str.split(",");
  const day = parseInt(parts[0], 10); // 1 = Sen, 2 = Sel, 3 = Rab, 4 = Kam, 5 = Jum, 6 = Sab, 7 = Min
  const hour = parseInt(parts[1], 10);
  const minute = parseInt(parts[2], 10);
  const totalMins = hour * 60 + minute;

  // 1 = Senin (>= 07:00 / 420m)
  // 2-5 = Selasa s.d. Jumat (sepanjang hari)
  // 6 = Sabtu (< 18:00 / 1080m)
  if (day === 1) return totalMins >= 420;
  if (day >= 2 && day <= 5) return true;
  if (day === 6) return totalMins < 1080;
  return false;
}

// ==========================================================================
// FUNGSI UTAMA: MENERIMA DATA HASIL UJIAN DARI WEB VECTORARENA
// ==========================================================================
function doPost(e) {
  // 1. Kunci eksekusi untuk mencegah klik ganda (double-click/spamming)
  const lock = LockService.getScriptLock();
  const hasLock = lock.tryLock(20000); // Tunggu antrean maksimal 20 detik

  if (!hasLock) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Server sedang sibuk memproses antrean data. Silakan coba beberapa detik lagi."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    let ss;
    try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (err) {}
    if (!ss && SPREADSHEET_ID) ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    if (!ss) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Spreadsheet tidak terhubung. Periksa konfigurasi SPREADSHEET_ID."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Pastikan sheet Bank Soal & Kunci Jawaban selalu tersedia
    ensureQuestionBankSheet(ss);

    // Parse payload data kiriman ujian
    let d = {};
    if (e && e.postData && e.postData.contents) {
      d = JSON.parse(e.postData.contents);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Tidak ada data payload yang diterima."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Aksi Pengaturan Sesi Ujian dari Guru (Buka/Tutup Ujian, Kunci Pembahasan)
    if (d.action === "setExamConfig") {
      const props = PropertiesService.getScriptProperties();
      if (d.override !== undefined) {
        props.setProperty("EXAM_OVERRIDE", String(d.override));
      }
      if (typeof d.isOpen === "boolean") {
        props.setProperty("EXAM_OVERRIDE", d.isOpen ? "manual_open" : "manual_closed");
      }
      if (d.overrideReview !== undefined) {
        props.setProperty("REVIEW_OVERRIDE", String(d.overrideReview));
      }
      if (typeof d.allowReview === "boolean") {
        props.setProperty("REVIEW_OVERRIDE", d.allowReview ? "manual_allowed" : "manual_locked");
      }
      
      const ov = props.getProperty("EXAM_OVERRIDE") || "auto";
      let openStatus = false;
      if (ov === "manual_open") openStatus = true;
      else if (ov === "manual_closed") openStatus = false;
      else openStatus = isWithinExamSchedule();

      const revOv = props.getProperty("REVIEW_OVERRIDE") || "auto";
      let reviewStatus = false;
      if (revOv === "manual_allowed") reviewStatus = true;
      else if (revOv === "manual_locked") reviewStatus = false;
      else reviewStatus = !isWithinExamSchedule();

      return ContentService.createTextOutput(JSON.stringify({
        status: "ok",
        message: "Status ujian & pembahasan berhasil diperbarui di server.",
        examIsOpen: openStatus,
        allowReview: reviewStatus
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Validasi data identitas siswa
    if (!d.name || !d.className || isNaN(parseInt(d.absen, 10))) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Data identitas siswa (Nama, Kelas, No. Absen) tidak valid atau kosong."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 1 KELAS 1 SHEET (Contoh: "XI A", "XI B", ..., "XI F")
    const targetSheetName = (d.className || "XI A").trim();
    let sheet = ss.getSheetByName(targetSheetName);

    // Parse detail jawaban murid
    let detail = {};
    try {
      detail = typeof d.answersJson === "string" ? JSON.parse(d.answersJson) : (d.answersJson || {});
    } catch(err) {
      detail = {};
    }

    // Hitung nomor-nomor soal yang salah dijawab (Q01 s/d Q25)
    const salahList = [];
    for (let i = 1; i <= 25; i++) {
      const qId = "Q" + (i < 10 ? "0" + i : i);
      if (detail[qId] && detail[qId].isCorrect === false) {
        salahList.push(qId);
      }
    }
    const nomorSalahStr = salahList.length > 0 ? salahList.join(", ") : "Sempurna (0 Salah)";

    // Format durasi pengerjaan rapi (Contoh: 35m 10s)
    const durSec = parseInt(d.durationSec, 10) || 0;
    const durasiFormatted = Math.floor(durSec / 60) + "m " + (durSec % 60) + "s";

    // Hitung Nilai Quiz (0 - 100) dan Status KKM (Standar SMAN 78 = 75.0)
    const grade = parseFloat(d.academicGrade) || 0;
    const statusKKM = grade >= 75.0 ? "TUNTAS" : "REMEDIAL";
    const salahCount = 25 - (parseInt(d.correctCount, 10) || 0);
    const sw = parseInt(d.tabSwitches, 10) || 0;
    let tabSwitchStr = "Level 1: Fokus Penuh (0x Tab)";
    if (sw === 1) tabSwitchStr = "Level 2: Fluktuasi (1x Tab)";
    else if (sw === 2) tabSwitchStr = "Level 3: Waspada (2x Tab)";
    else if (sw >= 3 && sw <= 4) tabSwitchStr = "Level 4: Peringatan (" + sw + "x Tab)";
    else if (sw >= 5) tabSwitchStr = "Level 5: Pelanggaran Berat (" + sw + "x Tab)";

    const inputNameClean = String(d.name || "").trim().toLowerCase();
    const inputIpClean = String(d.ip || "").trim().toLowerCase();
    const inputAbsen = parseInt(d.absen, 10);

    // =========================================================================
    // JIKA TAB KELAS BELUM ADA: BUAT BARU DENGAN URUTAN TABEL YANG RAPI
    // =========================================================================
    if (!sheet) {
      sheet = ss.insertSheet(targetSheetName);
      sheet.appendRow([
        "No. Absen",
        "Nama Lengkap Siswa",
        "Kelas",
        "Nilai Quiz",
        "Status KKM",
        "Total Skor",
        "Benar",
        "Salah",
        "Nomor Soal Salah",
        "Waktu Pengerjaan",
        "Integritas (Fokus Tab)",
        "Waktu Pengumpulan",
        "Identitas_Perangkat"
      ]);

      // Styling Header: Indigo 900 Elegan (#312e81), Font Putih Tebal
      const headerRange = sheet.getRange(1, 1, 1, 13);
      headerRange.setFontWeight("bold")
                 .setBackground("#312e81")
                 .setFontColor("#ffffff")
                 .setFontFamily("Arial")
                 .setFontSize(10)
                 .setVerticalAlignment("middle");

      sheet.setRowHeight(1, 35);
      sheet.setFrozenRows(1);
    }

    // =========================================================================
    // 3 LAPIS PERLINDUNGAN ANTI-TIMPA (ANTI-OVERWRITE PROTECTION)
    // =========================================================================
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let alreadyExists = false;
    let existingReason = "";

    for (let i = 1; i < values.length; i++) {
      const rowAbsen = parseInt(values[i][0], 10);
      const rowName = String(values[i][1] || "").trim().toLowerCase();
      const rowIp = String(values[i][12] || "").trim().toLowerCase();

      // LAPIS 1: Cek Nama Siswa (Case-Insensitive)
      if (rowName && rowName === inputNameClean) {
        alreadyExists = true;
        existingReason = "Nama siswa '" + d.name + "' sudah ada di baris " + (i + 1) + " (tidak akan ditimpa)";
        break;
      }

      // LAPIS 2: Cek Nomor Absen di Kelas Ini
      if (rowAbsen === inputAbsen) {
        alreadyExists = true;
        existingReason = "Nomor absen #" + inputAbsen + " sudah terisi oleh " + values[i][1] + " (tidak akan ditimpa)";
        break;
      }

      // LAPIS 3: Cek IP / Perangkat (Mencegah spam pengerjaan ulang)
      if (inputIpClean && rowIp && rowIp === inputIpClean && !inputIpClean.includes("0.0.0.0")) {
        alreadyExists = true;
        existingReason = "Alamat IP '" + d.ip + "' sudah pernah mengumpulkan atas nama " + values[i][1];
        break;
      }
    }

    if (alreadyExists) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "skipped",
        message: existingReason,
        sheet: targetSheetName
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Masukkan baris baru
    sheet.appendRow([
      inputAbsen,
      d.name,
      d.className,
      grade,
      statusKKM,
      parseInt(d.totalScore, 10) || 0,
      parseInt(d.correctCount, 10) || 0,
      salahCount,
      nomorSalahStr,
      durasiFormatted,
      tabSwitchStr,
      new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
      d.ip || ""
    ]);

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(lastRow, 1).setHorizontalAlignment("center");
      sheet.getRange(lastRow, 2).setHorizontalAlignment("left").setFontWeight("bold");
      sheet.getRange(lastRow, 3).setHorizontalAlignment("center");
      sheet.getRange(lastRow, 4).setHorizontalAlignment("center").setFontWeight("bold").setNumberFormat("0.0");
      sheet.getRange(lastRow, 5).setHorizontalAlignment("center").setFontWeight("bold");
      sheet.getRange(lastRow, 6).setHorizontalAlignment("right").setNumberFormat("#,##0");
      sheet.getRange(lastRow, 7, 1, 2).setHorizontalAlignment("center");
      sheet.getRange(lastRow, 9).setHorizontalAlignment("left");
      sheet.getRange(lastRow, 10, 1, 4).setHorizontalAlignment("center");

      // Pewarnaan Status KKM
      const kkmCell = sheet.getRange(lastRow, 5);
      const quizCell = sheet.getRange(lastRow, 4);
      if (statusKKM === "TUNTAS") {
        kkmCell.setBackground("#dcfce7").setFontColor("#15803d").setFontWeight("bold");
        quizCell.setBackground("#f0fdf4");
      } else {
        kkmCell.setBackground("#fee2e2").setFontColor("#b91c1c").setFontWeight("bold");
        quizCell.setBackground("#fef2f2");
      }
      sheet.setRowHeight(lastRow, 28);
    }

    // Urutkan otomatis berdasarkan Nomor Absen (Kolom 1)
    if (lastRow > 2) {
      sheet.getRange(2, 1, lastRow - 1, 13).sort({ column: 1, ascending: true });
    }

    for (let c = 1; c <= 13; c++) {
      sheet.autoResizeColumn(c);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "ok",
      message: "Data ujian berhasil disimpan.",
      sheet: targetSheetName
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// ==========================================================================
// FUNGSI PEMBUAT SHEET "Pertanyaan & Kunci Jawaban" (25 SOAL TERKURASI)
// ==========================================================================
function ensureQuestionBankSheet(ss) {
  const sheetName = "Pertanyaan & Kunci Jawaban";
  let qSheet = ss.getSheetByName(sheetName);

  if (!qSheet) {
    qSheet = ss.insertSheet(sheetName, 0); // Tempatkan di urutan paling kiri

    qSheet.appendRow([
      "No.",
      "ID Soal",
      "Zona & Topik Silabus",
      "Teks Pertanyaan Fisika",
      "Kunci",
      "Jawaban Benar",
      "Penjelasan & Konsep Fisika"
    ]);

    const header = qSheet.getRange(1, 1, 1, 7);
    header.setFontWeight("bold")
          .setBackground("#1e1b4b")
          .setFontColor("#ffffff")
          .setFontFamily("Arial")
          .setFontSize(10)
          .setVerticalAlignment("middle");

    qSheet.setRowHeight(1, 35);
    qSheet.setFrozenRows(1);

    const masterData = [
  [
    1,
    "Q01",
    "Z1: Vector Fundamentals",
    "Kelompok besaran berikut yang seluruhnya merupakan besaran vektor adalah …",
    "C",
    "kecepatan, gaya, dan perpindahan",
    "Besaran vektor memiliki besar sekaligus arah. Kecepatan, gaya, dan perpindahan memenuhi keduanya. Jarak, kelajuan, massa, waktu, suhu, usaha, energi, dan daya adalah besaran skalar (hanya besar)."
  ],
  [
    2,
    "Q02",
    "Z1: Vector Fundamentals",
    "Perhatikan besaran berikut: (1) berat, (2) massa, (3) kuat arus listrik, (4) impuls, (5) tekanan. Besaran yang tergolong vektor adalah …",
    "D",
    "(1) dan (4)",
    "Berat adalah gaya gravitasi (vektor), impuls adalah perubahan momentum (vektor). Massa adalah skalar. Kuat arus listrik dan tekanan diperlakukan sebagai skalar dalam kurikulum fisika SMA."
  ],
  [
    3,
    "Q03",
    "Z1: Vector Fundamentals",
    "Manakah pernyataan yang benar tentang besaran skalar?",
    "B",
    "Besaran skalar hanya memiliki nilai dan tidak memiliki arah",
    "Skalar dicirikan oleh nilai (dan satuan) saja. Nilainya boleh negatif (misalnya suhu), dan penjumlahannya mengikuti aljabar biasa, bukan aturan vektor."
  ],
  [
    4,
    "Q04",
    "Z2: Vector Representation",
    "Pada sistem koordinat Kartesius, titik yang berada di kuadran II memiliki …",
    "B",
    "x negatif dan y positif",
    "Kuadran I (+,+), II (−,+), III (−,−), IV (+,−). Kuadran II berarti x < 0 dan y > 0."
  ],
  [
    5,
    "Q05",
    "Z2: Vector Representation",
    "Vektor posisi menyatakan …",
    "B",
    "letak suatu titik terhadap titik acuan (biasanya titik asal)",
    "Vektor posisi r menghubungkan titik asal O ke posisi titik yang ditinjau."
  ],
  [
    6,
    "Q06",
    "Z2: Vector Representation",
    "Perbedaan utama perpindahan dan jarak adalah …",
    "E",
    "perpindahan adalah vektor, jarak adalah skalar",
    "Perpindahan hanya bergantung pada posisi awal dan akhir (vektor). Jarak mengikuti seluruh lintasan (skalar) dan tidak pernah lebih kecil dari besar perpindahan."
  ],
  [
    7,
    "Q07",
    "Z3: Vector Operations",
    "Sifat komutatif pada penjumlahan vektor dinyatakan oleh …",
    "B",
    "A + B = B + A",
    "Komutatif berarti urutan penjumlahan tidak mengubah resultan. A + (B + C) = (A + B) + C adalah sifat asosiatif."
  ],
  [
    8,
    "Q08",
    "Z3: Vector Operations",
    "Pengurangan vektor A − B ekuivalen dengan …",
    "A",
    "A + (−B)",
    "Mengurangi B sama dengan menambahkan vektor negatif B, yaitu vektor B yang dibalik arahnya."
  ],
  [
    9,
    "Q09",
    "Z3: Vector Operations",
    "Dua vektor A = 3i + 0j dan B = 5i + 0j (satuan SI). Besar resultan A + B adalah …",
    "D",
    "8",
    "Resultan diperoleh dengan menjumlahkan komponen sejenis, lalu menghitung besarnya."
  ],
  [
    10,
    "Q10",
    "Z4: Geometrical Vector Methods",
    "Pada metode segitiga, resultan dua vektor diperoleh dengan cara …",
    "C",
    "menyambung ujung vektor pertama ke pangkal vektor kedua, lalu menarik vektor dari pangkal pertama ke ujung kedua",
    "Metode segitiga menyambung vektor secara ujung-ke-pangkal; resultan menghubungkan titik awal ke titik akhir."
  ],
  [
    11,
    "Q11",
    "Z4: Geometrical Vector Methods",
    "Pada metode jajar genjang, kedua vektor digambar dari titik pangkal yang sama, dan resultan digambarkan sebagai …",
    "D",
    "diagonal jajar genjang dari titik pangkal",
    "Diagonal jajar genjang yang berpangkal di titik awal menyatakan jumlah kedua vektor."
  ],
  [
    12,
    "Q12",
    "Z4: Geometrical Vector Methods",
    "Metode poligon digunakan untuk menentukan resultan …",
    "B",
    "tiga vektor atau lebih dengan menyambung ujung ke pangkal secara berurutan",
    "Poligon adalah generalisasi metode segitiga untuk banyak vektor; resultan menghubungkan titik awal ke titik akhir."
  ],
  [
    13,
    "Q13",
    "Z5: Vector Components",
    "Komponen vertikal (sumbu Y) dari vektor A yang membentuk sudut θ terhadap sumbu X positif adalah …",
    "B",
    "A sin θ",
    "Proyeksi pada sumbu Y berhadapan dengan sudut θ, sehingga digunakan sinus: Ay = A sin θ."
  ],
  [
    14,
    "Q14",
    "Z5: Vector Components",
    "Vektor yang berada di kuadran III memiliki komponen …",
    "B",
    "x negatif dan y negatif",
    "Kuadran III berada di kiri bawah, sehingga kedua komponen bernilai negatif."
  ],
  [
    15,
    "Q15",
    "Z5: Vector Components",
    "Sebuah vektor berarah 150° dari sumbu X positif. Komponen x dan y vektor tersebut berturut-turut …",
    "C",
    "negatif dan positif",
    "150° berada di kuadran II: cos 150° < 0 dan sin 150° > 0."
  ],
  [
    16,
    "Q16",
    "Z6: GVA — Gerak Vertikal ke Atas",
    "Pernyataan yang benar tentang massa benda pada GVA (ideal) adalah …",
    "D",
    "massa tidak memengaruhi waktu tempuh maupun ketinggian maksimum",
    "Semua benda mengalami percepatan gravitasi sama besarnya sehingga gerak ideal tidak bergantung massa."
  ],
  [
    17,
    "Q17",
    "Z6: GVA — Gerak Vertikal ke Atas",
    "Pada t = ½ t_puncak, kecepatan benda GVA yang dilempar dengan v₀ adalah …",
    "E",
    "½ v₀",
    "v = v₀ − gt. Pada t = v₀/(2g) diperoleh v = v₀ − g·v₀/(2g) = v₀/2."
  ],
  [
    18,
    "Q18",
    "Z6: GVA — Gerak Vertikal ke Atas",
    "Sebuah bola dilempar vertikal ke atas dengan kecepatan awal 20 m/s dari permukaan tanah (g = 10 m/s², hambatan udara diabaikan). Waktu yang diperlukan untuk mencapai titik tertinggi adalah … sekon.",
    "C",
    "2",
    "Di titik tertinggi v = 0, sehingga 0 = v₀ − gt dan t = v₀/g."
  ],
  [
    19,
    "Q19",
    "Z7: GVB — Gerak Vertikal ke Bawah",
    "Pada GVB, kelajuan benda …",
    "D",
    "bertambah karena percepatan gravitasi searah dengan gerak",
    "Arah gerak dan arah percepatan sama-sama ke bawah, sehingga kelajuan bertambah."
  ],
  [
    20,
    "Q20",
    "Z7: GVB — Gerak Vertikal ke Bawah",
    "Sebuah batu dilempar ke bawah dengan kecepatan awal 5 m/s dari jendela. Gerak batu termasuk …",
    "A",
    "GVB karena v₀ ≠ 0 dan berarah ke bawah",
    "Klasifikasi bergantung pada ada/tidaknya kecepatan awal saat dilepas."
  ],
  [
    21,
    "Q21",
    "Z7: GVB — Gerak Vertikal ke Bawah",
    "Dibandingkan benda GJB dari ketinggian yang sama, benda GVB memerlukan waktu …",
    "E",
    "lebih singkat karena sudah memiliki kecepatan awal",
    "Dengan v₀ > 0 ke bawah, benda menempuh jarak lebih cepat dibanding mulai dari diam."
  ],
  [
    22,
    "Q22",
    "Z8: GJB — Gerak Jatuh Bebas",
    "Pada GJB ideal, besaran yang memengaruhi waktu jatuh adalah …",
    "C",
    "ketinggian dan percepatan gravitasi",
    "t = √(2h/g) hanya bergantung pada h dan g. Massa tidak berpengaruh pada GJB ideal."
  ],
  [
    23,
    "Q23",
    "Z8: GJB — Gerak Jatuh Bebas",
    "Kelajuan benda pada GJB setelah jatuh selama t adalah …",
    "A",
    "v = gt",
    "Karena v₀ = 0, v = v₀ + gt = gt."
  ],
  [
    24,
    "Q24",
    "Z8: GJB — Gerak Jatuh Bebas",
    "Jarak yang ditempuh benda GJB setelah t sekon adalah …",
    "A",
    "h = ½gt²",
    "Dengan v₀ = 0, persamaan posisi tereduksi menjadi s = ½gt²."
  ],
  [
    25,
    "Q25",
    "Z8: GJB — Gerak Jatuh Bebas",
    "Jika hambatan udara diperhitungkan, pernyataan yang benar tentang benda yang dijatuhkan dari ketinggian h adalah …",
    "C",
    "waktu jatuhnya lebih lama daripada GJB ideal",
    "Hambatan udara melawan gerak sehingga percepatan efektif lebih kecil dari g dan waktu jatuh bertambah."
  ]
];

    const startRow = 2;
    const numRows = masterData.length;
    qSheet.getRange(startRow, 1, numRows, 7).setValues(masterData);

    qSheet.getRange(startRow, 1, numRows, 1).setHorizontalAlignment("center");
    qSheet.getRange(startRow, 2, numRows, 1).setHorizontalAlignment("center").setFontWeight("bold");
    qSheet.getRange(startRow, 3, numRows, 1).setHorizontalAlignment("left");
    qSheet.getRange(startRow, 4, numRows, 1).setHorizontalAlignment("left").setWrap(true);
    qSheet.getRange(startRow, 5, numRows, 1).setHorizontalAlignment("center").setFontWeight("bold").setBackground("#f1f5f9");
    qSheet.getRange(startRow, 6, numRows, 1).setHorizontalAlignment("left").setWrap(true);
    qSheet.getRange(startRow, 7, numRows, 1).setHorizontalAlignment("left").setWrap(true);

    qSheet.setColumnWidth(1, 45);
    qSheet.setColumnWidth(2, 95);
    qSheet.setColumnWidth(3, 180);
    qSheet.setColumnWidth(4, 400);
    qSheet.setColumnWidth(5, 65);
    qSheet.setColumnWidth(6, 260);
    qSheet.setColumnWidth(7, 420);

    for (let r = startRow; r < startRow + numRows; r++) {
      if (r % 2 === 0) {
        qSheet.getRange(r, 1, 1, 4).setBackground("#fafafa");
        qSheet.getRange(r, 6, 1, 2).setBackground("#fafafa");
      }
    }
  }
  return qSheet;
}

// ==========================================================================
// FUNGSI GET: SINKRONISASI STATUS UJIAN & DATA REKAP KE WEB
// ==========================================================================
function doGet(e) {
  try {
    let ss;
    try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (err) {}
    if (!ss && SPREADSHEET_ID) ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (!ss) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Spreadsheet tidak terhubung."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const props = PropertiesService.getScriptProperties();

    // Terima instruksi kontrol status ujian via GET parameter (bebas kendala CORS peramban)
    if (e && e.parameter && e.parameter.action === "setExamConfig") {
      if (e.parameter.override !== undefined) {
        props.setProperty("EXAM_OVERRIDE", String(e.parameter.override));
      }
      if (e.parameter.isOpen !== undefined) {
        props.setProperty("EXAM_OVERRIDE", e.parameter.isOpen === "true" ? "manual_open" : "manual_closed");
      }
      if (e.parameter.overrideReview !== undefined) {
        props.setProperty("REVIEW_OVERRIDE", String(e.parameter.overrideReview));
      }
      if (e.parameter.allowReview !== undefined) {
        props.setProperty("REVIEW_OVERRIDE", e.parameter.allowReview === "true" ? "manual_allowed" : "manual_locked");
      }
    }

    const overrideMode = props.getProperty("EXAM_OVERRIDE") || "auto";
    let examIsOpen = false;
    if (overrideMode === "manual_open") {
      examIsOpen = true;
    } else if (overrideMode === "manual_closed") {
      examIsOpen = false;
    } else {
      examIsOpen = isWithinExamSchedule();
    }

    const reviewOverride = props.getProperty("REVIEW_OVERRIDE") || "auto";
    let allowReview = false;
    if (reviewOverride === "manual_allowed") {
      allowReview = true;
    } else if (reviewOverride === "manual_locked") {
      allowReview = false;
    } else {
      // Otomatis: Kunci jawaban & pembahasan HANYA terbuka saat ujian tertutup (mulai Sabtu 18:00 WIB)
      allowReview = !isWithinExamSchedule();
    }

    const allRows = [];
    ss.getSheets().forEach(sh => {
      if (sh.getName() === "Pertanyaan & Kunci Jawaban") return;
      const vals = sh.getDataRange().getValues();
      if (vals.length > 1) {
        for (let i = 1; i < vals.length; i++) {
          const rowAbsen = parseInt(vals[i][0], 10);
          const rowName = String(vals[i][1] || "").trim();
          const rowClass = String(vals[i][2] || "").trim();
          // Hanya sertakan baris siswa valid (nama ada, kelas ada, absen valid, bukan tester)
          if (!isNaN(rowAbsen) && rowName && rowName.length >= 2 && !rowName.includes("#NUM!") && !/tester|penguji/i.test(rowName)) {
            allRows.push(vals[i]);
          }
        }
      }
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: "active",
      app: "VectorArena",
      subject: "Fisika Vektor & Kinematika",
      examIsOpen: examIsOpen,
      allowReview: allowReview,
      totalSheets: ss.getSheets().length,
      totalRecords: allRows.length,
      rows: allRows
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
