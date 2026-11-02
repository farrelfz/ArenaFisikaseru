// ==========================================================================
// KODE GOOGLE APPS SCRIPT HYDROARENA SMAN 78 JAKARTA (EDISI 25 BUTIR SOAL)
// FITUR UTAMA:
// 1. Sheet Khusus "Pertanyaan & Kunci Jawaban" (25 Soal Fisika Silabus Inti)
// 2. Sheet Kelas Terpisah (1 Kelas 1 Sheet: "XI A", "XI B", dst)
// 3. Kolom "Nilai Quiz" (0-100) & Urutan Tabel Rapi Mudah Dibaca
// 4. Highlight Warna Visual (Hijau Pastel = Tuntas, Merah Muda = Remedial)
// 5. 3 Lapis Validasi Anti-Timpa (Cek Nama, Cek Absen, Cek IP/Device)
// 6. LockService Mutex (Perlindungan Tombol Klik Ganda / Double-Click)
// ==========================================================================

const SPREADSHEET_ID = "1hFypaFplnQggt2Nva6Apt4lPHJ66S3kQTXWoDmDlQSg";

// Menu kustom di Google Spreadsheet saat file dibuka oleh guru
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("HydroArena SMAN 78")
    .addItem("⏰ Jadwal Otomatis (Rabu 06:30 s.d. Jumat 16:00 WIB)", "manualAutoSchedule")
    .addSeparator()
    .addItem("🟢 Paksa Buka Pendaftaran (Manual Override)", "manualOpenExam")
    .addItem("🔴 Paksa Tutup Pendaftaran (Manual Override)", "manualCloseExam")
    .addSeparator()
    .addItem("Buat / Reset Sheet Bank Soal & Kunci (25 Soal)", "manualInitQuestionBank")
    .addToUi();
}

function manualAutoSchedule() {
  PropertiesService.getScriptProperties().setProperty("EXAM_OVERRIDE", "auto");
  SpreadsheetApp.getUi().alert("STATUS: Ujian diatur mengikuti JADWAL OTOMATIS (Rabu 06:30 WIB s.d. Jumat 16:00 WIB)!");
}

function manualOpenExam() {
  PropertiesService.getScriptProperties().setProperty("EXAM_OVERRIDE", "manual_open");
  SpreadsheetApp.getUi().alert("STATUS: Pendaftaran Ujian DIBUKA MANUAL (Override) untuk seluruh siswa!");
}

function manualCloseExam() {
  PropertiesService.getScriptProperties().setProperty("EXAM_OVERRIDE", "manual_closed");
  SpreadsheetApp.getUi().alert("STATUS: Pendaftaran Ujian DITUTUP MANUAL (Override). Akses pengerjaan dikunci.");
}

function manualInitQuestionBank() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureQuestionBankSheet(ss);
  SpreadsheetApp.getUi().alert("Sheet \"Pertanyaan & Kunci Jawaban\" (25 Soal) berhasil dibuat dan diisi lengkap!");
}

// Jadwal Ujian Resmi: Terbuka Rabu 06:30 WIB s.d. Jumat 16:00 WIB
function isWithinExamSchedule() {
  const str = Utilities.formatDate(new Date(), "Asia/Jakarta", "u,HH,mm");
  const parts = str.split(",");
  const day = parseInt(parts[0], 10); // 1 = Sen, 2 = Sel, 3 = Rab, 4 = Kam, 5 = Jum, 6 = Sab, 7 = Min
  const hour = parseInt(parts[1], 10);
  const minute = parseInt(parts[2], 10);
  const totalMins = hour * 60 + minute;

  // 3 = Rabu (>= 06:30 / 390m)
  // 4 = Kamis (sepanjang hari)
  // 5 = Jumat (< 16:00 / 960m)
  if (day === 3) return totalMins >= 390;
  if (day === 4) return true;
  if (day === 5) return totalMins < 960;
  return false;
}

// ==========================================================================
// FUNGSI UTAMA: MENERIMA DATA HASIL UJIAN DARI WEB HYDROARENA
// ==========================================================================
function doPost(e) {
  // 1. Kunci eksekusi untuk mencegah klik ganda (double-click/spamming)
  const lock = LockService.getScriptLock();
  const hasLock = lock.tryLock(20000); // Tunggu antrean maksimal 20 detik

  if (!hasLock) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Server sedang sibuk memproses antrean data. Silakan coba kembali."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
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
      if (typeof d.isOpen === "boolean") {
        props.setProperty("EXAM_IS_OPEN", String(d.isOpen));
      }
      if (typeof d.allowReview === "boolean") {
        props.setProperty("ALLOW_REVIEW", String(d.allowReview));
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "ok",
        message: "Status ujian berhasil diperbarui di server.",
        examIsOpen: props.getProperty("EXAM_IS_OPEN") === "true",
        allowReview: props.getProperty("ALLOW_REVIEW") !== "false"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Validasi data siswa wajib lengkap
    if (!d.name || !d.className || isNaN(parseInt(d.absen, 10))) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Data identitas siswa (Nama, Kelas, No. Absen) tidak valid atau kosong."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 1 KELAS 1 SHEET (Contoh: "XI A", "XI B", dst)
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
    const nomorSalahStr = salahList.length > 0 ? salahList.join(", ") : "Sempurna (0)";

    // Format durasi pengerjaan rapi (Contoh: 35m 10s)
    const durSec = parseInt(d.durationSec, 10) || 0;
    const durasiFormatted = Math.floor(durSec / 60) + "m " + (durSec % 60) + "s";

    // Hitung Nilai Quiz (0 - 100) dan Status KKM (KKM SMAN 78 = 75.0)
    const grade = parseFloat(d.academicGrade) || 0;
    const statusKKM = grade >= 75.0 ? "TUNTAS" : "REMEDIAL";
    const salahCount = 25 - (parseInt(d.correctCount, 10) || 0);
    const sw = parseInt(d.tabSwitches, 10) || 0;
    let tabSwitchStr = "Level 1: Aliran Tunak (0x Tab - Integritas Purna)";
    if (sw === 1) tabSwitchStr = "Level 2: Riak Fluktuasi (1x Tab - Toleransi Ringan)";
    else if (sw === 2) tabSwitchStr = "Level 3: Olakan Vortiks (2x Tab - Waspada)";
    else if (sw >= 3 && sw <= 4) tabSwitchStr = "Level 4: Kavitasi Kritis (" + sw + "x Tab - Peringatan)";
    else if (sw >= 5) tabSwitchStr = "Level 5: Separasi Ekstrem (" + sw + "x Tab - Pelanggaran Berat)";

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

      // Styling Header: Biru Navy Elegan (#1e40af), Font Putih Tebal
      const headerRange = sheet.getRange(1, 1, 1, 13);
      headerRange.setFontWeight("bold")
                 .setBackground("#1e40af")
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
    qSheet = ss.insertSheet(sheetName); // Ditempatkan di tab akhir agar tidak mengganggu pembacaan tab kelas siswa
  }

  if (qSheet.getLastRow() <= 1) {
    qSheet.clear();

    const headers = [
      "No.",
      "Kode Soal",
      "Topik / Materi Fisika",
      "Pertanyaan Soal",
      "Kunci",
      "Teks Jawaban Benar",
      "Pembahasan & Konsep Fisika"
    ];
    qSheet.appendRow(headers);

    const headerRange = qSheet.getRange(1, 1, 1, 7);
    headerRange.setFontWeight("bold")
               .setBackground("#1e3a8a")
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
    "Tekanan Hidrostatis",
    "Sebuah tangki berbentuk silinder dengan kedalaman 9,4 meter terisi penuh oleh air (ρ = 1.000 kg/m<sup>3</sup>, g = 10 m/s<sup>2</sup>). Titik P berada 2,6 meter di bawah permukaan air dan titik Q berada 1,2 meter di atas dasar tangki. Besar tekanan hidrostatis yang dialami pada titik P dan titik Q berturut-turut adalah...",
    "A",
    "P<sub>P</sub> = 26.000 Pa dan P<sub>Q</sub> = 82.000 Pa",
    "Kedalaman titik P dari permukaan air adalah h<sub>P</sub> = 2,6 m, sehingga P<sub>P</sub> = ρ·g·h<sub>P</sub> = 1.000 × 10 × 2,6 = 26.000 Pa. Kedalaman titik Q dari permukaan air adalah h<sub>Q</sub> = 9,4 m − 1,2 m = 8,2 m, sehingga P<sub>Q</sub> = ρ·g·h<sub>Q</sub> = 1.000 × 10 × 8,2 = 82.000 Pa."
  ],
  [
    2,
    "Q02",
    "Tekanan Hidrostatis",
    "Berdasarkan tangki silinder setinggi 9,4 meter dengan titik P pada kedalaman 2,6 meter di bawah permukaan air dan titik Q berada 1,2 meter di atas dasar tangki, perbandingan tekanan hidrostatis di titik Q terhadap titik P (P<sub>Q</sub> : P<sub>P</sub>) dalam bentuk paling sederhana adalah...",
    "A",
    "41 : 13",
    "Perbandingan tekanan hidrostatis P<sub>Q</sub> : P<sub>P</sub> = h<sub>Q</sub> : h<sub>P</sub> = 8,2 m : 2,6 m = 82 : 26. Jika kedua ruas dibagi 2, diperoleh perbandingan paling sederhana 41 : 13."
  ],
  [
    3,
    "Q03",
    "Tekanan Hidrostatis",
    "Jika tekanan udara luar pada permukaan tangki terbuka tersebut adalah P<sub>atm</sub> = 1,0 × 10<sup>5</sup> Pa (100.000 Pa), maka besar tekanan mutlak (tekanan total) yang bekerja pada titik Q (yang berada 1,2 m di atas dasar tangki) adalah...",
    "A",
    "182.000 Pa",
    "Tekanan mutlak adalah jumlah tekanan atmosfer dan tekanan hidrostatis: P<sub>total</sub>(Q) = P<sub>atm</sub> + ρ·g·h<sub>Q</sub> = 100.000 Pa + 82.000 Pa = 182.000 Pa."
  ],
  [
    4,
    "Q04",
    "Tekanan Hidrostatis",
    "Tiga wadah berbeda bentuk diisi air (ρ = 1.000 kg/m<sup>3</sup>, g = 10 m/s<sup>2</sup>) hingga ketinggian yang sama, yaitu 50 cm di atas dasar. Wadah I berupa silinder lebar dengan luas dasar 400 cm<sup>2</sup>, wadah II berupa silinder sempit dengan luas dasar 100 cm<sup>2</sup>, dan wadah III berupa wadah yang melebar ke atas (corong) dengan luas dasar 250 cm<sup>2</sup>. Jika P<sub>I</sub>, P<sub>II</sub>, P<sub>III</sub> adalah tekanan hidrostatis di dasar tiap wadah dan F<sub>I</sub>, F<sub>II</sub>, F<sub>III</sub> adalah gaya hidrostatis total pada dasar tiap wadah, maka pernyataan yang benar adalah...",
    "A",
    "P<sub>I</sub> = P<sub>II</sub> = P<sub>III</sub> = 5.000 Pa, sedangkan F<sub>I</sub> : F<sub>II</sub> : F<sub>III</sub> = 8 : 2 : 5",
    "Tekanan hidrostatis adalah besaran intensif yang hanya bergantung pada kedalaman: P = ρ·g·h = 1.000 × 10 × 0,50 = 5.000 Pa, sama untuk ketiga wadah. Gaya hidrostatis bersifat ekstensif: F = P·A, sehingga F<sub>I</sub> = 5.000 × 0,04 = 200 N; F<sub>II</sub> = 5.000 × 0,01 = 50 N; F<sub>III</sub> = 5.000 × 0,025 = 125 N. Perbandingannya: F<sub>I</sub> : F<sub>II</sub> : F<sub>III</sub> = 200 : 50 : 125 = 8 : 2 : 5 (Paradoks Hidrostatika)."
  ],
  [
    5,
    "Q05",
    "Prinsip Pascal",
    "Sebuah dongkrak hidrolik memiliki piston kecil dengan luas penampang A<sub>1</sub> = 8,5 cm<sup>2</sup> dan piston besar dengan A<sub>2</sub> = 340 cm<sup>2</sup>. Dongkrak tersebut digunakan untuk mengangkat mobil bermassa 800 kg (g = 10 m/s<sup>2</sup>) setinggi 8 cm. Jika efisiensi sistem adalah 80% dan setiap kali penekanan piston kecil turun sejauh 20 cm, maka gaya minimum yang harus diberikan pada setiap penekanan dan jumlah penekanan yang diperlukan berturut-turut adalah...",
    "A",
    "250 N dan 16 kali penekanan",
    "Keuntungan mekanis KM = A<sub>2</sub> / A<sub>1</sub> = 340 / 8,5 = 40. Berat mobil W = m·g = 800 × 10 = 8.000 N, sehingga gaya ideal F<sub>1(ideal)</sub> = 8.000 / 40 = 200 N. Dengan efisiensi 80%: F<sub>1(nyata)</sub> = 200 / 0,80 = 250 N. Jarak tempuh piston kecil: A<sub>1</sub>·s<sub>1</sub> = A<sub>2</sub>·s<sub>2</sub> → s<sub>1</sub> = 40 × 8 cm = 320 cm. Jumlah penekanan: 320 cm / 20 cm = 16 kali penekanan."
  ],
  [
    6,
    "Q06",
    "Prinsip Pascal",
    "Pada sistem dongkrak hidrolik dengan luas penampang piston kecil A<sub>1</sub> = 8,5 cm<sup>2</sup> dan piston besar A<sub>2</sub> = 340 cm<sup>2</sup>, keuntungan mekanis ideal sistem beserta jarak kenaikan piston besar (s<sub>2</sub>) ketika piston kecil ditekan turun sejauh s<sub>1</sub> = 16 cm adalah...",
    "A",
    "Keuntungan mekanis = 40 dan piston besar naik 0,4 cm",
    "Keuntungan mekanis KM = A<sub>2</sub> / A<sub>1</sub> = 340 / 8,5 = 40. Karena volume fluida yang berpindah tetap (A<sub>1</sub>·s<sub>1</sub> = A<sub>2</sub>·s<sub>2</sub>), maka s<sub>2</sub> = s<sub>1</sub> / 40 = 16 cm / 40 = 0,4 cm."
  ],
  [
    7,
    "Q07",
    "Prinsip Pascal",
    "Dua silinder hidrolik yang saling terhubung memiliki perbandingan diameter penampang D<sub>1</sub> : D<sub>2</sub> = 1 : 5. Apabila pada piston silinder kecil diberikan gaya tekan sebesar 120 N, maka beban maksimum yang dapat ditahan oleh piston silinder besar adalah...",
    "A",
    "3.000 N",
    "Luas penampang lingkaran sebanding dengan kuadrat diameter (A ∝ D<sup>2</sup>), sehingga F<sub>2</sub> = (D<sub>2</sub> / D<sub>1</sub>)² × F<sub>1</sub> = (5 / 1)² × 120 N = 25 × 120 N = 3.000 N."
  ],
  [
    8,
    "Q08",
    "Hukum Pokok Hidrostatika",
    "Sebuah pipa U mula-mula diisi air (ρ<sub>air</sub> = 1.000 kg/m<sup>3</sup>), kemudian pada kaki kiri dituangkan minyak hingga terbentuk kolom minyak setinggi h<sub>1</sub> = 15 cm. Jika selisih tinggi permukaan air di kaki kanan terhadap bidang batas air-minyak adalah h<sub>2</sub> = 12 cm, maka massa jenis minyak tersebut adalah...",
    "A",
    "800 kg/m<sup>3</sup>",
    "Pada bidang batas horizontal yang sama berlaku Hukum Pokok Hidrostatika: ρ<sub>minyak</sub> · h<sub>1</sub> = ρ<sub>air</sub> · h<sub>2</sub> → ρ<sub>minyak</sub> × 15 cm = 1.000 × 12 cm → ρ<sub>minyak</sub> = 800 kg/m<sup>3</sup>."
  ],
  [
    9,
    "Q09",
    "Hukum Pokok Hidrostatika",
    "Pipa U berisi cairan raksa di bagian dasar, air (ρ<sub>1</sub> = 1,0 g/cm<sup>3</sup>) setinggi h<sub>1</sub> = 16 cm di kaki kiri, dan cairan X (ρ<sub>2</sub> = 0,8 g/cm<sup>3</sup>) di kaki kanan. Agar permukaan raksa pada kedua kaki pipa U tetap sejajar (sama tinggi), maka tinggi kolom cairan X yang harus dituangkan di kaki kanan adalah...",
    "A",
    "20 cm",
    "Karena permukaan raksa pada kedua kaki pipa sama tinggi, tekanan hidrostatis kedua cairan di atas batas raksa harus sama: ρ<sub>1</sub>·h<sub>1</sub> = ρ<sub>2</sub>·h<sub>2</sub> → 1,0 × 16 cm = 0,8 × h<sub>2</sub> → h<sub>2</sub> = 20 cm."
  ],
  [
    10,
    "Q10",
    "Hukum Archimedes",
    "Sebuah balok logam ditimbang di udara menggunakan neraca pegas menunjukkan berat 80 N. Ketika balok tersebut dicelupkan seluruhnya ke dalam air (ρ<sub>air</sub> = 1.000 kg/m<sup>3</sup>, g = 10 m/s<sup>2</sup>), neraca pegas menunjukkan angka 60 N. Massa jenis balok logam tersebut adalah...",
    "A",
    "4.000 kg/m<sup>3</sup>",
    "Gaya apung F<sub>A</sub> = W<sub>udara</sub> − W<sub>semu</sub> = 80 N − 60 N = 20 N. Dari persamaan F<sub>A</sub> = ρ<sub>air</sub>·g·V diperoleh volume benda V = 20 / (1.000 × 10) = 0,002 m<sup>3</sup>. Massa benda m = 80 / 10 = 8 kg. Maka ρ<sub>benda</sub> = m / V = 8 kg / 0,002 m<sup>3</sup> = 4.000 kg/m<sup>3</sup>."
  ],
  [
    11,
    "Q11",
    "Hukum Archimedes",
    "Sebuah benda padat homogen mengapung di permukaan air (ρ<sub>air</sub> = 1.000 kg/m<sup>3</sup>) dengan 25% bagian volumenya berada di atas permukaan air. Massa jenis benda padat tersebut adalah...",
    "A",
    "750 kg/m<sup>3</sup>",
    "Jika 25% volume berada di atas permukaan air, maka bagian volume yang tercelup di dalam air adalah V<sub>tercelup</sub> = 75% V = 0,75 V. Pada benda terapung berlaku ρ<sub>benda</sub> = (V<sub>tercelup</sub> / V<sub>total</sub>) × ρ<sub>air</sub> = 0,75 × 1.000 kg/m<sup>3</sup> = 750 kg/m<sup>3</sup>."
  ],
  [
    12,
    "Q12",
    "Hukum Archimedes",
    "Sebuah rakit kayu memiliki volume 2,5 m<sup>3</sup> dan massa jenis 600 kg/m<sup>3</sup>. Jika rakit tersebut terapung di atas air danau (ρ<sub>air</sub> = 1.000 kg/m<sup>3</sup>, g = 10 m/s<sup>2</sup>), beban tambahan maksimum yang dapat diletakkan di atas rakit tepat sebelum rakit tenggelam seluruhnya adalah...",
    "A",
    "10.000 N",
    "Gaya apung maksimum saat seluruh volume rakit tercelup: F<sub>A(maks)</sub> = ρ<sub>air</sub>·g·V = 1.000 × 10 × 2,5 = 25.000 N. Berat rakit kosong: W<sub>rakit</sub> = ρ<sub>kayu</sub>·g·V = 600 × 10 × 2,5 = 15.000 N. Maka beban maksimum tambahan = 25.000 N − 15.000 N = 10.000 N."
  ],
  [
    13,
    "Q13",
    "Hukum Archimedes",
    "Sebuah kubus kayu berada dalam kesetimbangan di antara dua lapisan cairan yang tidak bercampur, yaitu air (ρ<sub>air</sub> = 1,0 g/cm<sup>3</sup>) di bagian bawah dan minyak (ρ<sub>minyak</sub> = 0,8 g/cm<sup>3</sup>) di bagian atas. Jika 60% volume kubus tercelup di dalam air dan 40% sisanya tercelup di dalam minyak, massa jenis kubus kayu tersebut adalah...",
    "A",
    "0,92 g/cm<sup>3</sup>",
    "Gaya berat kubus diimbangi oleh jumlah gaya apung dari air dan minyak: ρ<sub>benda</sub> = (0,60 × ρ<sub>air</sub>) + (0,40 × ρ<sub>minyak</sub>) = (0,60 × 1,0) + (0,40 × 0,8) = 0,60 + 0,32 = 0,92 g/cm<sup>3</sup>."
  ],
  [
    14,
    "Q14",
    "Persamaan Kontinuitas",
    "Pipa utama saluran air berpenampang A<sub>0</sub> = 30 cm<sup>2</sup> mengalirkan air dengan kelajuan v<sub>0</sub> = 3 m/s, kemudian bercabang menjadi dua pipa. Cabang A berpenampang 12 cm<sup>2</sup> dengan kelajuan aliran 4 m/s, sedangkan cabang B berpenampang 10 cm<sup>2</sup>. Jika seluruh air dari cabang B dialirkan untuk mengisi tandon berkapasitas 1.260 liter, maka kelajuan aliran di cabang B dan waktu yang diperlukan hingga tandon penuh adalah...",
    "A",
    "v<sub>B</sub> = 4,2 m/s dan tandon penuh dalam 5 menit",
    "Debit pipa utama terbagi ke kedua cabang: Q<sub>0</sub> = Q<sub>A</sub> + Q<sub>B</sub>. Q<sub>0</sub> = 30×10<sup>−4</sup> × 3 = 9×10<sup>−3</sup> m<sup>3</sup>/s = 9 L/s. Q<sub>A</sub> = 12×10<sup>−4</sup> × 4 = 4,8×10<sup>−3</sup> m<sup>3</sup>/s = 4,8 L/s. Maka Q<sub>B</sub> = 9 − 4,8 = 4,2 L/s = 4,2×10<sup>−3</sup> m<sup>3</sup>/s. Kelajuan cabang B: v<sub>B</sub> = Q<sub>B</sub> / A<sub>B</sub> = 4,2×10<sup>−3</sup> / 10×10<sup>−4</sup> = 4,2 m/s. Waktu pengisian tandon: t = Volume / Q<sub>B</sub> = 1.260 L / 4,2 L/s = 300 sekon = 5 menit."
  ],
  [
    15,
    "Q15",
    "Persamaan Kontinuitas",
    "Berdasarkan aliran air pada pipa horizontal dengan luas penampang pertama A<sub>1</sub> = 24 cm<sup>2</sup> dan kecepatan aliran v<sub>1</sub> = 1,8 m/s, besar debit air (Q) yang mengalir melalui pipa tersebut dalam satuan SI (m<sup>3</sup>/s) adalah...",
    "A",
    "4,32 × 10<sup>−3</sup> m<sup>3</sup>/s",
    "Luas penampang A<sub>1</sub> = 24 cm<sup>2</sup> = 24 × 10<sup>−4</sup> m<sup>2</sup>. Debit aliran Q = A<sub>1</sub> · v<sub>1</sub> = (24 × 10<sup>−4</sup> m<sup>2</sup>) × 1,8 m/s = 43,2 × 10<sup>−4</sup> m<sup>3</sup>/s = 4,32 × 10<sup>−3</sup> m<sup>3</sup>/s."
  ],
  [
    16,
    "Q16",
    "Persamaan Kontinuitas",
    "Sebuah pipa silinder mengalirkan air dari bagian berdiameter D<sub>1</sub> = 8 cm dengan kelajuan 2 m/s menuju bagian pipa yang menyempit dengan diameter D<sub>2</sub> = 4 cm. Kelajuan aliran air pada bagian pipa berdiameter 4 cm tersebut adalah...",
    "A",
    "8 m/s",
    "Persamaan kontinuitas untuk penampang lingkaran: v<sub>2</sub> = (D<sub>1</sub> / D<sub>2</sub>)² × v<sub>1</sub> = (8 cm / 4 cm)² × 2 m/s = 4 × 2 m/s = 8 m/s."
  ],
  [
    17,
    "Q17",
    "Teorema Torricelli",
    "Pada tangki terbuka tersebut (permukaan air 5,8 m dari tanah dan lubang berada 2,3 m di atas tanah), jarak horizontal pancaran air (x) dari dinding tangki hingga menyentuh permukaan tanah adalah...",
    "A",
    "x = 2√(8,05) m (≈ 5,67 m)",
    "Jarak horizontal pancaran air: x = v · t = √(2·g·h) · √(2·y / g) = 2√(h · y) = 2√(3,5 × 2,3) = 2√(8,05) m ≈ 5,67 m."
  ],
  [
    18,
    "Q18",
    "Teorema Torricelli",
    "Sebuah tangki penampung air memiliki permukaan air 5,0 meter di atas tanah. Dua lubang semprotan dibuat pada dinding tangki: lubang A pada ketinggian y<sub>A</sub> = 1,8 meter dari tanah dan lubang B pada ketinggian yang berbeda. Pancaran air dari kedua lubang mengenai tanah pada jarak horizontal yang sama dari dinding tangki (g = 10 m/s<sup>2</sup>). Ketinggian letak lubang B dan jarak horizontal pancaran tersebut adalah...",
    "A",
    "y<sub>B</sub> = 3,2 m dan x = 4,8 m",
    "Jarak pancar x = 2√((H − y)·y). Syarat x<sub>A</sub> = x<sub>B</sub> berarti nilai perkalian kedalaman dan ketinggian sama: (H − y<sub>A</sub>)·y<sub>A</sub> = (H − y<sub>B</sub>)·y<sub>B</sub>. Berdasarkan sifat simetri akar persamaan kuadrat, y<sub>A</sub> + y<sub>B</sub> = H = 5,0 m → y<sub>B</sub> = 5,0 − 1,8 = 3,2 m. Jarak jangkauan: x = 2√(3,2 × 1,8) = 2√5,76 = 2 × 2,4 = 4,8 meter."
  ],
  [
    19,
    "Q19",
    "Persamaan Bernoulli",
    "Air mengalir melalui pipa horizontal yang menyempit dari penampang A<sub>1</sub> = 24 cm<sup>2</sup> menuju A<sub>2</sub> = 8 cm<sup>2</sup>. Manometer pada kedua penampang mencatat selisih tekanan statis sebesar 16.000 Pa (ρ<sub>air</sub> = 1.000 kg/m<sup>3</sup>). Kelajuan aliran air pada penampang masuk (v<sub>1</sub>) dan selisih tekanan statis yang terbaca jika debit aliran digandakan menjadi dua kali lipat semula adalah...",
    "A",
    "v<sub>1</sub> = 2 m/s dan selisih tekanan menjadi 64.000 Pa",
    "Persamaan kontinuitas: A<sub>1</sub>v<sub>1</sub> = A<sub>2</sub>v<sub>2</sub> → v<sub>2</sub> = 3v<sub>1</sub>. Persamaan Bernoulli pipa horizontal: ΔP = ½ρ(v<sub>2</sub><sup>2</sup> − v<sub>1</sub><sup>2</sup>) = ½(1.000)(9v<sub>1</sub><sup>2</sup> − v<sub>1</sub><sup>2</sup>) = 4.000v<sub>1</sub><sup>2</sup>. Diketahui ΔP = 16.000 Pa → 4.000v<sub>1</sub><sup>2</sup> = 16.000 → v<sub>1</sub><sup>2</sup> = 4 → v<sub>1</sub> = 2 m/s. Karena ΔP sebanding dengan kuadrat kelajuan (ΔP ∝ v<sup>2</sup> ∝ Q<sup>2</sup>), saat debit digandakan 2×, selisih tekanan meningkat 2<sup>2</sup> = 4× lipat: 4 × 16.000 = 64.000 Pa."
  ],
  [
    20,
    "Q20",
    "Teorema Torricelli",
    "Apabila posisi lubang pada tangki yang permukaan airnya berada 5,8 meter di atas tanah dapat diubah-ubah ketinggiannya, maka agar jarak horizontal pancaran air di tanah mencapai nilai maksimum, lubang harus dibuat pada ketinggian...",
    "A",
    "2,9 meter di atas tanah, dengan jarak pancar maksimum 5,8 meter",
    "Persamaan jarak pancar x = 2√(h·y) dengan h + y = H = 5,8 m mencapai nilai maksimum ketika h = y = ½H = 2,9 m di atas tanah, yang menghasilkan jarak pancar maksimum x<sub>maks</sub> = H = 5,8 m."
  ],
  [
    21,
    "Q21",
    "Pipa Bertingkat",
    "Pada sistem pipa bertingkat tersebut, diketahui ketinggian titik A adalah h<sub>A</sub> = 4,8 m dan titik B adalah h<sub>B</sub> = 1,7 m. Jika kecepatan v<sub>A</sub> = 2,4 m/s, v<sub>B</sub> = 4,8 m/s, dan tekanan air di titik A sebesar P<sub>A</sub> = 190.000 Pa (ρ = 1.000 kg/m<sup>3</sup>, g = 10 m/s<sup>2</sup>), maka tekanan air pada titik B (P<sub>B</sub>) adalah...",
    "A",
    "212.360 Pa",
    "Menggunakan persamaan Bernoulli antara titik A dan B: P<sub>B</sub> = P<sub>A</sub> + ½ρ(v<sub>A</sub><sup>2</sup> − v<sub>B</sub><sup>2</sup>) + ρg(h<sub>A</sub> − h<sub>B</sub>) = 190.000 + 500×(2,4<sup>2</sup> − 4,8<sup>2</sup>) + 1.000×10×(4,8 − 1,7) = 190.000 + 500×(5,76 − 23,04) + 31.000 = 190.000 − 8.640 + 31.000 = 212.360 Pa."
  ],
  [
    22,
    "Q22",
    "Persamaan Bernoulli",
    "Pada pipa horizontal tersebut (A<sub>1</sub> = 24 cm<sup>2</sup>, v<sub>1</sub> = 1,8 m/s, A<sub>2</sub> = 8 cm<sup>2</sup>, v<sub>2</sub> = 5,4 m/s), diketahui tekanan statis air pada bagian pertama adalah P<sub>1</sub> = 250.000 Pa dan massa jenis air ρ = 1.000 kg/m<sup>3</sup>. Besar tekanan air pada bagian kedua (P<sub>2</sub>) berdasarkan persamaan Bernoulli adalah...",
    "A",
    "237.040 Pa",
    "Pada pipa horizontal (h<sub>1</sub> = h<sub>2</sub>): P<sub>2</sub> = P<sub>1</sub> + ½·ρ·(v<sub>1</sub><sup>2</sup> − v<sub>2</sub><sup>2</sup>) = 250.000 + ½ × 1.000 × (1,8<sup>2</sup> − 5,4<sup>2</sup>) = 250.000 + 500 × (3,24 − 29,16) = 250.000 + 500 × (−25,92) = 250.000 − 12.960 = 237.040 Pa."
  ],
  [
    23,
    "Q23",
    "Gaya Angkat Pesawat",
    "Sebuah pesawat terbang bermassa total 54 ton (W = 540.000 N, g = 10 m/s<sup>2</sup>) memiliki luas total kedua sayap A = 40 m<sup>2</sup>. Saat terbang mendatar stabil (gaya angkat sama dengan berat pesawat), kelajuan aliran udara di atas sayap terukur 1,25 kali kelajuan aliran udara di bawah sayap. Jika massa jenis udara luar ρ = 1,2 kg/m<sup>3</sup>, besar kelajuan aliran udara di bawah sayap (v<sub>2</sub>) dan di atas sayap (v<sub>1</sub>) berturut-turut adalah...",
    "A",
    "v<sub>2</sub> = 200 m/s dan v<sub>1</sub> = 250 m/s",
    "Gaya angkat pesawat saat terbang mendatar: F<sub>angkat</sub> = W = 540.000 N. Rumus gaya angkat Bernoulli: F<sub>angkat</sub> = ½ · ρ · A · (v<sub>1</sub><sup>2</sup> − v<sub>2</sub><sup>2</sup>). Substitusi v<sub>1</sub> = 1,25 v<sub>2</sub> → v<sub>1</sub><sup>2</sup> − v<sub>2</sub><sup>2</sup> = (1,5625 − 1)v<sub>2</sub><sup>2</sup> = 0,5625 v<sub>2</sub><sup>2</sup>. Maka: ½ × 1,2 × 40 × 0,5625 v<sub>2</sub><sup>2</sup> = 13,5 v<sub>2</sub><sup>2</sup> = 540.000 → v<sub>2</sub><sup>2</sup> = 40.000 → v<sub>2</sub> = 200 m/s dan v<sub>1</sub> = 1,25 × 200 = 250 m/s."
  ],
  [
    24,
    "Q24",
    "Gaya Angkat Pesawat",
    "Sebuah pesawat terbang memiliki luas total kedua sayap A = 60 m<sup>2</sup>. Kelajuan aliran udara di permukaan atas sayap adalah 250 m/s dan di permukaan bawah sayap adalah 200 m/s. Jika massa jenis udara ρ = 1,2 kg/m<sup>3</sup>, maka besar gaya angkat yang bekerja pada sayap pesawat tersebut adalah...",
    "A",
    "810.000 N (810 kN)",
    "Gaya angkat sayap pesawat dihitung dengan rumus Bernoulli: F<sub>angkat</sub> = ½ · ρ · A · (v<sub>atas</sub><sup>2</sup> − v<sub>bawah</sub><sup>2</sup>) = ½ × 1,2 × 60 × (250<sup>2</sup> − 200<sup>2</sup>) = 36 × (62.500 − 40.000) = 36 × 22.500 = 810.000 N (810 kN)."
  ],
  [
    25,
    "Q25",
    "Pipa Bertingkat",
    "Berdasarkan hasil perhitungan pada sistem pipa bertingkat (P<sub>A</sub> = 190.000 Pa, P<sub>B</sub> = 212.360 Pa, P<sub>C</sub> = 223.360 Pa), mengapa tekanan di titik C lebih besar daripada tekanan di titik A meskipun kecepatan aliran di titik C (4,8 m/s) lebih besar daripada di titik A (2,4 m/s)?",
    "A",
    "Penurunan energi potensial gravitasi per satuan volume akibat beda tinggi (42.000 Pa) jauh lebih besar daripada kenaikan tekanan dinamis akibat penyempitan pipa (8.640 Pa)",
    "Dari titik A ke C terjadi kenaikan tekanan dinamis sebesar ½ρ(v<sub>C</sub><sup>2</sup> − v<sub>A</sub><sup>2</sup>) = 8.640 Pa (yang cenderung menurunkan tekanan statis), namun secara bersamaan terjadi penurunan ketinggian Δh = 4,2 m yang menyumbang tambahan tekanan potensial ρgΔh = 42.000 Pa. Selisih bersihnya (+33.360 Pa) membuat P<sub>C</sub> > P<sub>A</sub>."
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
    qSheet.setColumnWidth(2, 85);
    qSheet.setColumnWidth(3, 160);
    qSheet.setColumnWidth(4, 380);
    qSheet.setColumnWidth(5, 65);
    qSheet.setColumnWidth(6, 260);
    qSheet.setColumnWidth(7, 400);

    for (let r = startRow; r < startRow + numRows; r++) {
      if (r % 2 === 0) {
        qSheet.getRange(r, 1, 1, 4).setBackground("#fafafa");
        qSheet.getRange(r, 6, 1, 2).setBackground("#fafafa");
      }
    }
  }
  return qSheet;
}

function doGet(e) {
  try {
    let ss;
    try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (err) {}
    if (!ss) ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    const props = PropertiesService.getScriptProperties();

    // Terima instruksi kontrol status ujian via GET parameter (bebas kendala CORS peramban)
    if (e && e.parameter && e.parameter.action === "setExamConfig") {
      if (e.parameter.override !== undefined) {
        props.setProperty("EXAM_OVERRIDE", String(e.parameter.override));
      }
      if (e.parameter.isOpen !== undefined) {
        props.setProperty("EXAM_OVERRIDE", e.parameter.isOpen === "true" ? "manual_open" : "manual_closed");
      }
      if (e.parameter.allowReview !== undefined) {
        props.setProperty("ALLOW_REVIEW", String(e.parameter.allowReview));
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

    const allowReview = props.getProperty("ALLOW_REVIEW") !== "false";

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
