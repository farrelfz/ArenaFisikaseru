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
    .addItem("Buat / Reset Sheet Bank Soal & Kunci (25 Soal)", "manualInitQuestionBank")
    .addToUi();
}

function manualInitQuestionBank() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureQuestionBankSheet(ss);
  SpreadsheetApp.getUi().alert("Sheet \"Pertanyaan & Kunci Jawaban\" (25 Soal) berhasil dibuat dan diisi lengkap!");
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
    let tabSwitchStr = "Level 1: Fokus 100% (Fair Play)";
    if (sw === 1) tabSwitchStr = "Level 2: 1x Tab (Toleransi Ringan)";
    else if (sw === 2) tabSwitchStr = "Level 3: 2x Tab (Waspada)";
    else if (sw >= 3 && sw <= 4) tabSwitchStr = "Level 4: " + sw + "x Tab (Peringatan)";
    else if (sw >= 5) tabSwitchStr = "Level 5: " + sw + "x Tab (Pelanggaran Berat)";

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
    qSheet = ss.insertSheet(sheetName, 0); // Tab paling pertama
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
    "Sebuah tangki berbentuk silinder dengan kedalaman 9,4 meter terisi penuh oleh air (ρ = 1.000 kg/m³, g = 10 m/s²). Titik P berada 2,6 meter di bawah permukaan air dan titik Q berada 1,2 meter di atas dasar tangki. Besar tekanan hidrostatis yang dialami pada titik P dan titik Q berturut-turut adalah...",
    "A",
    "P_P = 26.000 Pa dan P_Q = 82.000 Pa",
    "Kedalaman titik P dari permukaan air adalah h_P = 2,6 m, sehingga P_P = ρ·g·h_P = 1.000 × 10 × 2,6 = 26.000 Pa. Kedalaman titik Q dari permukaan air adalah h_Q = 9,4 m − 1,2 m = 8,2 m, sehingga P_Q = ρ·g·h_Q = 1.000 × 10 × 8,2 = 82.000 Pa."
  ],
  [
    2,
    "Q02",
    "Tekanan Hidrostatis",
    "Berdasarkan tangki silinder setinggi 9,4 meter dengan titik P pada kedalaman 2,6 meter di bawah permukaan air dan titik Q berada 1,2 meter di atas dasar tangki, perbandingan tekanan hidrostatis di titik Q terhadap titik P (P_Q : P_P) dalam bentuk paling sederhana adalah...",
    "A",
    "41 : 13",
    "Perbandingan tekanan hidrostatis P_Q : P_P = h_Q : h_P = 8,2 m : 2,6 m = 82 : 26. Jika kedua ruas dibagi 2, diperoleh perbandingan paling sederhana 41 : 13."
  ],
  [
    3,
    "Q03",
    "Tekanan Hidrostatis",
    "Jika tekanan udara luar pada permukaan tangki terbuka tersebut adalah P_atm = 1,0 × 10⁵ Pa (100.000 Pa), maka besar tekanan mutlak (tekanan total) yang bekerja pada titik Q (yang berada 1,2 m di atas dasar tangki) adalah...",
    "A",
    "182.000 Pa",
    "Tekanan mutlak adalah jumlah tekanan atmosfer dan tekanan hidrostatis: P_total(Q) = P_atm + ρ·g·h_Q = 100.000 Pa + 82.000 Pa = 182.000 Pa."
  ],
  [
    4,
    "Q04",
    "Tekanan Hidrostatis",
    "Berdasarkan prinsip fisika pada fluida statis, pernyataan yang paling tepat mengenai hubungan antara posisi titik di dalam zat cair homogen dengan tekanan hidrostatis adalah...",
    "A",
    "Tekanan hidrostatis berbanding lurus dengan kedalaman titik yang diukur vertikal dari permukaan bebas zat cair",
    "Sesuai persamaan P_h = ρ·g·h, variabel h selalu diukur secara vertikal dari permukaan bebas zat cair ke titik pengamatan, sehingga makin dalam posisi titik dari permukaan, makin besar tekanan hidrostatisnya."
  ],
  [
    5,
    "Q05",
    "Prinsip Pascal",
    "Sebuah dongkrak hidrolik digunakan untuk mengangkat beban. Jika luas penampang piston kecil 8,5 cm² dan piston besar 340 cm², serta gaya tekan yang diberikan pada piston kecil sebesar 220 N, maka gaya angkat yang dihasilkan pada piston besar adalah...",
    "A",
    "8.800 N",
    "Berdasarkan Hukum Pascal: F₁ / A₁ = F₂ / A₂ → F₂ = (A₂ / A₁) × F₁ = (340 cm² / 8,5 cm²) × 220 N = 40 × 220 N = 8.800 N."
  ],
  [
    6,
    "Q06",
    "Prinsip Pascal",
    "Pada sistem dongkrak hidrolik dengan luas penampang piston kecil A₁ = 8,5 cm² dan piston besar A₂ = 340 cm², keuntungan mekanis ideal sistem beserta jarak kenaikan piston besar (s₂) ketika piston kecil ditekan turun sejauh s₁ = 16 cm adalah...",
    "A",
    "Keuntungan mekanis = 40 dan piston besar naik 0,4 cm",
    "Keuntungan mekanis KM = A₂ / A₁ = 340 / 8,5 = 40. Karena volume fluida yang berpindah tetap (A₁·s₁ = A₂·s₂), maka s₂ = s₁ / 40 = 16 cm / 40 = 0,4 cm."
  ],
  [
    7,
    "Q07",
    "Prinsip Pascal",
    "Dua silinder hidrolik yang saling terhubung memiliki perbandingan diameter penampang D₁ : D₂ = 1 : 5. Apabila pada piston silinder kecil diberikan gaya tekan sebesar 120 N, maka beban maksimum yang dapat ditahan oleh piston silinder besar adalah...",
    "A",
    "3.000 N",
    "Luas penampang lingkaran sebanding dengan kuadrat diameter (A ∝ D²), sehingga F₂ = (D₂ / D₁)² × F₁ = (5 / 1)² × 120 N = 25 × 120 N = 3.000 N."
  ],
  [
    8,
    "Q08",
    "Hukum Pokok Hidrostatika",
    "Sebuah pipa U mula-mula diisi air (ρ_air = 1.000 kg/m³), kemudian pada kaki kiri dituangkan minyak hingga terbentuk kolom minyak setinggi h₁ = 15 cm. Jika selisih tinggi permukaan air di kaki kanan terhadap bidang batas air-minyak adalah h₂ = 12 cm, maka massa jenis minyak tersebut adalah...",
    "A",
    "800 kg/m³",
    "Pada bidang batas horizontal yang sama berlaku Hukum Pokok Hidrostatika: ρ_minyak · h₁ = ρ_air · h₂ → ρ_minyak × 15 cm = 1.000 × 12 cm → ρ_minyak = 800 kg/m³."
  ],
  [
    9,
    "Q09",
    "Hukum Pokok Hidrostatika",
    "Pipa U berisi cairan raksa di bagian dasar, air (ρ₁ = 1,0 g/cm³) setinggi h₁ = 16 cm di kaki kiri, dan cairan X (ρ₂ = 0,8 g/cm³) di kaki kanan. Agar permukaan raksa pada kedua kaki pipa U tetap sejajar (sama tinggi), maka tinggi kolom cairan X yang harus dituangkan di kaki kanan adalah...",
    "A",
    "20 cm",
    "Karena permukaan raksa pada kedua kaki pipa sama tinggi, tekanan hidrostatis kedua cairan di atas batas raksa harus sama: ρ₁·h₁ = ρ₂·h₂ → 1,0 × 16 cm = 0,8 × h₂ → h₂ = 20 cm."
  ],
  [
    10,
    "Q10",
    "Hukum Archimedes",
    "Sebuah balok logam ditimbang di udara menggunakan neraca pegas menunjukkan berat 80 N. Ketika balok tersebut dicelupkan seluruhnya ke dalam air (ρ_air = 1.000 kg/m³, g = 10 m/s²), neraca pegas menunjukkan angka 60 N. Massa jenis balok logam tersebut adalah...",
    "A",
    "4.000 kg/m³",
    "Gaya apung F_A = W_udara − W_semu = 80 N − 60 N = 20 N. Dari persamaan F_A = ρ_air·g·V diperoleh volume benda V = 20 / (1.000 × 10) = 0,002 m³. Massa benda m = 80 / 10 = 8 kg. Maka ρ_benda = m / V = 8 kg / 0,002 m³ = 4.000 kg/m³."
  ],
  [
    11,
    "Q11",
    "Hukum Archimedes",
    "Sebuah benda padat homogen mengapung di permukaan air (ρ_air = 1.000 kg/m³) dengan 25% bagian volumenya berada di atas permukaan air. Massa jenis benda padat tersebut adalah...",
    "A",
    "750 kg/m³",
    "Jika 25% volume berada di atas permukaan air, maka bagian volume yang tercelup di dalam air adalah V_celup = 75% V = 0,75 V. Pada benda terapung berlaku ρ_benda = (V_celup / V_total) × ρ_air = 0,75 × 1.000 kg/m³ = 750 kg/m³."
  ],
  [
    12,
    "Q12",
    "Hukum Archimedes",
    "Sebuah rakit kayu memiliki volume 2,5 m³ dan massa jenis 600 kg/m³. Jika rakit tersebut terapung di atas air danau (ρ_air = 1.000 kg/m³, g = 10 m/s²), beban tambahan maksimum yang dapat diletakkan di atas rakit tepat sebelum rakit tenggelam seluruhnya adalah...",
    "A",
    "10.000 N",
    "Gaya apung maksimum saat seluruh volume rakit tercelup: F_A(maks) = ρ_air·g·V = 1.000 × 10 × 2,5 = 25.000 N. Berat rakit kosong: W_rakit = ρ_kayu·g·V = 600 × 10 × 2,5 = 15.000 N. Maka beban maksimum tambahan = 25.000 N − 15.000 N = 10.000 N."
  ],
  [
    13,
    "Q13",
    "Hukum Archimedes",
    "Sebuah kubus kayu berada dalam kesetimbangan di antara dua lapisan cairan yang tidak bercampur, yaitu air (ρ_air = 1,0 g/cm³) di bagian bawah dan minyak (ρ_minyak = 0,8 g/cm³) di bagian atas. Jika 60% volume kubus tercelup di dalam air dan 40% sisanya tercelup di dalam minyak, massa jenis kubus kayu tersebut adalah...",
    "A",
    "0,92 g/cm³",
    "Gaya berat kubus diimbangi oleh jumlah gaya apung dari air dan minyak: ρ_benda = (0,60 × ρ_air) + (0,40 × ρ_minyak) = (0,60 × 1,0) + (0,40 × 0,8) = 0,60 + 0,32 = 0,92 g/cm³."
  ],
  [
    14,
    "Q14",
    "Persamaan Kontinuitas",
    "Air mengalir melalui pipa horizontal yang memiliki dua penampang berbeda seperti pada gambar. Pada bagian pertama, luas penampang pipa A₁ = 24 cm² dengan kecepatan aliran v₁ = 1,8 m/s. Pipa kemudian menyempit sehingga luas penampang pada bagian kedua menjadi A₂ = 8 cm². Kecepatan aliran air pada bagian kedua (v₂) adalah...",
    "A",
    "5,4 m/s",
    "Berdasarkan persamaan kontinuitas A₁·v₁ = A₂·v₂ → 24 cm² × 1,8 m/s = 8 cm² × v₂ → v₂ = 3 × 1,8 m/s = 5,4 m/s."
  ],
  [
    15,
    "Q15",
    "Persamaan Kontinuitas",
    "Berdasarkan aliran air pada pipa horizontal dengan luas penampang pertama A₁ = 24 cm² dan kecepatan aliran v₁ = 1,8 m/s, besar debit air (Q) yang mengalir melalui pipa tersebut dalam satuan SI (m³/s) adalah...",
    "A",
    "4,32 × 10⁻³ m³/s",
    "Luas penampang A₁ = 24 cm² = 24 × 10⁻⁴ m². Debit aliran Q = A₁ · v₁ = (24 × 10⁻⁴ m²) × 1,8 m/s = 43,2 × 10⁻⁴ m³/s = 4,32 × 10⁻³ m³/s."
  ],
  [
    16,
    "Q16",
    "Persamaan Kontinuitas",
    "Sebuah pipa silinder mengalirkan air dari bagian berdiameter D₁ = 8 cm dengan kelajuan 2 m/s menuju bagian pipa yang menyempit dengan diameter D₂ = 4 cm. Kelajuan aliran air pada bagian pipa berdiameter 4 cm tersebut adalah...",
    "A",
    "8 m/s",
    "Persamaan kontinuitas untuk penampang lingkaran: v₂ = (D₁ / D₂)² × v₁ = (8 cm / 4 cm)² × 2 m/s = 4 × 2 m/s = 8 m/s."
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
    "Berdasarkan tangki terbuka dengan permukaan air 5,8 meter dari tanah dan lubang kebocoran pada ketinggian y = 2,3 meter di atas permukaan tanah (g = 10 m/s²), waktu yang diperlukan air untuk mencapai permukaan tanah sejak keluar secara horizontal dari lubang adalah...",
    "A",
    "t = √0,46 sekon (≈ 0,68 sekon)",
    "Gerak vertikal air setelah keluar horizontal dari lubang (v_0y = 0) adalah gerak jatuh bebas dari ketinggian y = 2,3 m: y = ½·g·t² → t = √(2y / g) = √(2 × 2,3 / 10) = √0,46 s ≈ 0,68 s."
  ],
  [
    19,
    "Q19",
    "Persamaan Bernoulli",
    "Berdasarkan hasil perhitungan kecepatan dan tekanan pada pipa horizontal yang menyempit dari 24 cm² menjadi 8 cm², kesimpulan fisis yang benar mengenai hubungan antara luas penampang, kecepatan aliran, dan tekanan statis adalah...",
    "A",
    "Pada penampang yang lebih sempit, kecepatan aliran meningkat sehingga energi kinetik per satuan volume bertambah dan tekanan statis menurun",
    "Sesuai kekekalan energi mekanik fluida (Hukum Bernoulli) pada pipa horizontal, P + ½ρv² = konstan. Ketika penampang menyempit, laju v membesar sehingga tekanan dinamis (½ρv²) naik dan tekanan statis (P) turun dari 250.000 Pa menjadi 237.040 Pa."
  ],
  [
    20,
    "Q20",
    "Teorema Torricelli",
    "Apabila posisi lubang pada tangki yang permukaan airnya berada 5,8 meter di atas tanah dapat diubah-ubah ketinggiannya, maka agar jarak horizontal pancaran air di tanah mencapai nilai maksimum, lubang harus dibuat pada ketinggian...",
    "A",
    "2,9 meter di atas tanah, dengan jarak pancar maksimum 5,8 meter",
    "Persamaan jarak pancar x = 2√(h·y) dengan h + y = H = 5,8 m mencapai nilai maksimum ketika h = y = ½H = 2,9 m di atas tanah, yang menghasilkan jarak pancar maksimum x_maks = H = 5,8 m."
  ],
  [
    21,
    "Q21",
    "Pipa Bertingkat",
    "Pada sistem pipa bertingkat tersebut, diketahui ketinggian titik A adalah h_A = 4,8 m dan titik B adalah h_B = 1,7 m. Jika kecepatan v_A = 2,4 m/s, v_B = 4,8 m/s, dan tekanan air di titik A sebesar P_A = 190.000 Pa (ρ = 1.000 kg/m³, g = 10 m/s²), maka tekanan air pada titik B (P_B) adalah...",
    "A",
    "212.360 Pa",
    "Menggunakan persamaan Bernoulli antara titik A dan B: P_B = P_A + ½ρ(v_A² − v_B²) + ρg(h_A − h_B) = 190.000 + 500×(2,4² − 4,8²) + 1.000×10×(4,8 − 1,7) = 190.000 + 500×(5,76 − 23,04) + 31.000 = 190.000 − 8.640 + 31.000 = 212.360 Pa."
  ],
  [
    22,
    "Q22",
    "Persamaan Bernoulli",
    "Pada pipa horizontal tersebut (A₁ = 24 cm², v₁ = 1,8 m/s, A₂ = 8 cm², v₂ = 5,4 m/s), diketahui tekanan statis air pada bagian pertama adalah P₁ = 250.000 Pa dan massa jenis air ρ = 1.000 kg/m³. Besar tekanan air pada bagian kedua (P₂) berdasarkan persamaan Bernoulli adalah...",
    "A",
    "237.040 Pa",
    "Pada pipa horizontal (h₁ = h₂): P₂ = P₁ + ½·ρ·(v₁² − v₂²) = 250.000 + ½ × 1.000 × (1,8² − 5,4²) = 250.000 + 500 × (3,24 − 29,16) = 250.000 + 500 × (−25,92) = 250.000 − 12.960 = 237.040 Pa."
  ],
  [
    23,
    "Q23",
    "Gaya Angkat Pesawat",
    "Perhatikan penampang sayap pesawat terbang (aerofoil) di atas! Agar sayap pesawat menghasilkan gaya angkat ke atas yang optimal saat bergerak maju di udara, hubungan kelajuan aliran udara dan tekanan statis pada bagian atas dan bawah sayap yang benar adalah...",
    "A",
    "v_atas > v_bawah sehingga P_atas < P_bawah",
    "Bentuk lengkungan sayap membuat garis alir udara di bagian atas lebih rapat sehingga kelajuan udara di atas sayap lebih besar (v_atas > v_bawah). Menurut prinsip Bernoulli, tekanan di atas sayap menjadi lebih kecil (P_atas < P_bawah) sehingga muncul gaya dorong ke atas."
  ],
  [
    24,
    "Q24",
    "Gaya Angkat Pesawat",
    "Sebuah pesawat terbang memiliki luas total kedua sayap A = 60 m². Kelajuan aliran udara di permukaan atas sayap adalah 250 m/s dan di permukaan bawah sayap adalah 200 m/s. Jika massa jenis udara ρ = 1,2 kg/m³, maka besar gaya angkat yang bekerja pada sayap pesawat tersebut adalah...",
    "A",
    "810.000 N (810 kN)",
    "Gaya angkat sayap pesawat dihitung dengan rumus Bernoulli: F_angkat = ½ · ρ · A · (v_atas² − v_bawah²) = ½ × 1,2 × 60 × (250² − 200²) = 36 × (62.500 − 40.000) = 36 × 22.500 = 810.000 N (810 kN)."
  ],
  [
    25,
    "Q25",
    "Pipa Bertingkat",
    "Berdasarkan hasil perhitungan pada sistem pipa bertingkat (P_A = 190.000 Pa, P_B = 212.360 Pa, P_C = 223.360 Pa), mengapa tekanan di titik C lebih besar daripada tekanan di titik A meskipun kecepatan aliran di titik C (4,8 m/s) lebih besar daripada di titik A (2,4 m/s)?",
    "A",
    "Penurunan energi potensial gravitasi per satuan volume akibat beda tinggi (42.000 Pa) jauh lebih besar daripada kenaikan tekanan dinamis akibat penyempitan pipa (8.640 Pa)",
    "Dari titik A ke C terjadi kenaikan tekanan dinamis sebesar ½ρ(v_C² − v_A²) = 8.640 Pa (yang cenderung menurunkan tekanan statis), namun secara bersamaan terjadi penurunan ketinggian Δh = 4,2 m yang menyumbang tambahan tekanan potensial ρgΔh = 42.000 Pa. Selisih bersihnya (+33.360 Pa) membuat P_C > P_A."
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

function doGet() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const allRows = [];
    ss.getSheets().forEach(sh => {
      if (sh.getName() === "Pertanyaan & Kunci Jawaban") return;
      const vals = sh.getDataRange().getValues();
      if (vals.length > 1) {
        for (let i = 1; i < vals.length; i++) {
          allRows.push(vals[i]);
        }
      }
    });
    return ContentService.createTextOutput(JSON.stringify({
      status: "active",
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
