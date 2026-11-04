// ==========================================================================
// KODE GOOGLE APPS SCRIPT VECTORARENA SMAN 78 JAKARTA (EDISI 25 BUTIR SOAL)
// PORTAL EVALUASI & KOMPETISI SAINS: VEKTOR & KINEMATIKA GERAK VERTIKAL
// KELAS X A s.d. X K (11 ROMBEL) — SMAN 78 JAKARTA
//
// FITUR UTAMA:
// 1. Sheet Khusus "Pertanyaan & Kunci Jawaban" (25 Soal Terkurasi 8 Zona)
// 2. Sheet Kelas Terpisah (1 Kelas 1 Sheet: "X A", "X B", ..., "X K")
// 3. Kolom "Nilai Quiz" (0-100) & Urutan Tabel Rapi Berdasarkan No. Absen
// 4. Highlight Visual Kondisional (Hijau Pastel = Tuntas, Merah Muda = Remedial)
// 5. 3 Lapis Validasi Anti-Timpa (Cek Nama, Cek Absen, Cek IP/Device)
// 6. LockService Mutex (Perlindungan Tombol Klik Ganda / Double-Click)
// 7. Kontrol Status Ujian Manual oleh Guru (Tanpa Batasan Jadwal Otomatis)
// ==========================================================================

// GANTI DENGAN ID GOOGLE SPREADSHEET ANDA JIKA DIGUNAKAN DI LUAR CONTAINER SCRIPT
const SPREADSHEET_ID = ""; // Kosongkan jika script ditempel langsung di Extensions > Apps Script pada sheet target

// Menu kustom di Google Spreadsheet saat file dibuka oleh guru
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("VectorArena SMAN 78")
    .addItem("🟢 Buka Akses Ujian Siswa", "manualOpenExam")
    .addItem("🔴 Tutup Akses Ujian Siswa", "manualCloseExam")
    .addSeparator()
    .addItem("🔓 Buka Kunci Pembahasan Siswa", "manualOpenReview")
    .addItem("🔒 Kunci Pembahasan Siswa", "manualLockReview")
    .addSeparator()
    .addItem("📚 Buat / Reset Sheet Bank Soal & Kunci (25 Soal)", "manualInitQuestionBank")
    .addToUi();
}

function manualOpenExam() {
  PropertiesService.getScriptProperties().setProperty("EXAM_OVERRIDE", "manual_open");
  SpreadsheetApp.getUi().alert("STATUS: Pendaftaran Ujian DIBUKA untuk seluruh siswa Kelas X!");
}

function manualCloseExam() {
  PropertiesService.getScriptProperties().setProperty("EXAM_OVERRIDE", "manual_closed");
  SpreadsheetApp.getUi().alert("STATUS: Pendaftaran Ujian DITUTUP. Akses pengerjaan dikunci.");
}

function manualOpenReview() {
  PropertiesService.getScriptProperties().setProperty("REVIEW_OVERRIDE", "manual_allowed");
  SpreadsheetApp.getUi().alert("STATUS: Kunci jawaban & pembahasan DIBUKA untuk siswa.");
}

function manualLockReview() {
  PropertiesService.getScriptProperties().setProperty("REVIEW_OVERRIDE", "manual_locked");
  SpreadsheetApp.getUi().alert("STATUS: Kunci jawaban & pembahasan DIKUNCI untuk siswa.");
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
      
      const ov = props.getProperty("EXAM_OVERRIDE") || "manual_open";
      let openStatus = (ov !== "manual_closed");

      const revOv = props.getProperty("REVIEW_OVERRIDE") || "manual_allowed";
      let reviewStatus = (revOv !== "manual_locked");

      return ContentService.createTextOutput(JSON.stringify({
        status: "ok",
        message: "Status ujian & pembahasan berhasil diperbarui di server.",
        examIsOpen: openStatus,
        allowReview: reviewStatus
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Aksi Reset/Hapus Seluruh Data Siswa dari Spreadsheet (Keep Header + Bank Soal)
    if (d.action === "clearAllData") {
      const allSheets = ss.getSheets();
      let clearedSheets = 0;
      let clearedRows = 0;
      allSheets.forEach(function(sh) {
        const sName = sh.getName();
        // LINDUNGI sheet Bank Soal & Kunci Jawaban — JANGAN dihapus
        if (sName === "Pertanyaan & Kunci Jawaban") return;
        const lastRow = sh.getLastRow();
        if (lastRow > 1) {
          // Hapus semua baris data siswa (baris 2 s/d terakhir), pertahankan baris header (baris 1)
          sh.deleteRows(2, lastRow - 1);
          clearedSheets++;
          clearedRows += (lastRow - 1);
        }
      });
      return ContentService.createTextOutput(JSON.stringify({
        status: "ok",
        message: "Seluruh data siswa di spreadsheet berhasil dihapus (" + clearedRows + " baris dari " + clearedSheets + " sheet). Bank Soal & Kunci Jawaban tetap utuh.",
        clearedSheets: clearedSheets,
        clearedRows: clearedRows
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Validasi data identitas siswa
    if (!d.name || !d.className || isNaN(parseInt(d.absen, 10))) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Data identitas siswa (Nama, Kelas, No. Absen) tidak valid atau kosong."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 1 KELAS 1 SHEET (Contoh: "X A", "X B", ..., "X K")
    const targetSheetName = (d.className || "X A").trim();
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
    let tabSwitchStr = "Level 1: JUJUR (0x Tab)";
    if (sw === 1) tabSwitchStr = "Level 2: KECURANGAN RINGAN (1x Tab)";
    else if (sw === 2) tabSwitchStr = "Level 3: TERINDIKASI KECURANGAN (2x Tab)";
    else if (sw >= 3 && sw <= 4) tabSwitchStr = "Level 4: CURANG BERAT (" + sw + "x Tab)";
    else if (sw >= 5) tabSwitchStr = "Level 5: CURANG EKSTREM (" + sw + "x Tab)";

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
    "Kedua vektor tidak tegak lurus, sehingga komponen silang harus diperhitungkan melalui aturan kosinus."
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

    // Aksi Reset/Hapus Seluruh Data Siswa via GET parameter (CORS-friendly)
    if (e && e.parameter && e.parameter.action === "clearAllData") {
      const allSheets = ss.getSheets();
      let clearedSheets = 0;
      let clearedRows = 0;
      allSheets.forEach(function(sh) {
        const sName = sh.getName();
        if (sName === "Pertanyaan & Kunci Jawaban") return;
        const lastRow = sh.getLastRow();
        if (lastRow > 1) {
          sh.deleteRows(2, lastRow - 1);
          clearedSheets++;
          clearedRows += (lastRow - 1);
        }
      });
      return ContentService.createTextOutput(JSON.stringify({
        status: "ok",
        message: "Seluruh data siswa di spreadsheet berhasil dihapus.",
        clearedSheets: clearedSheets,
        clearedRows: clearedRows
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const overrideMode = props.getProperty("EXAM_OVERRIDE") || "manual_open";
    let examIsOpen = (overrideMode !== "manual_closed");

    const reviewOverride = props.getProperty("REVIEW_OVERRIDE") || "manual_allowed";
    let allowReview = (reviewOverride !== "manual_locked");

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
