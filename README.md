# HydroArena — Portal Evaluasi & Arena Kompetisi Fisika Fluida SMAN 78 Jakarta

<div align="center">

![HydroArena Logo](assets/logo.svg)

### **Arena Evaluasi Pembelajaran Kompetitif Fisika Fluida (Statis & Dinamis)**
**SMAN 78 Jakarta • Kelas XI MIPA / Kurikulum Merdeka**

[![Status](https://img.shields.io/badge/status-production--ready-059669?style=for-the-badge&logo=statuspage&logoColor=white)](#)
[![Kelas](https://img.shields.io/badge/kelas-XI%20A%E2%80%93F-1e40af?style=for-the-badge)](#)
[![Soal](https://img.shields.io/badge/bank_soal-25_butir_terkurasi-0284c7?style=for-the-badge)](#)
[![Waktu](https://img.shields.io/badge/alokasi_waktu-90_menit-d97706?style=for-the-badge&logo=clock)](#)
[![Lisensi](https://img.shields.io/badge/lisensi-MIT-475569?style=for-the-badge)](#lisensi)

</div>

---

## 📌 Ringkasan Eksekutif

**HydroArena** adalah instrumen evaluasi digital berbasis web (*single-page application*) yang dirancang khusus untuk pembelajaran materi **Fisika Fluida (Fluida Statis & Fluida Dinamis)** pada jenjang Kelas XI SMAN 78 Jakarta.

Aplikasi ini menggabungkan:
1. **Bank 25 Butir Soal Terkurasi Silabus Inti** dengan pengacakan ganda (pengacakan nomor butir soal **dan** opsi pilihan jawaban A–E).
2. **Mesin Penilaian Kompetitif Berbasis Ketelitian & Kecepatan** (*Education Esports Gamification*), dilengkapi *Podium Kehormatan 3 Besar*, *Piala Rombel Antar-Kelas*, serta *Tier Fluid Dynamics*.
3. **Mekanisme Perlindungan Anti-Timpa 3 Lapis (*Anti-Overwrite Protection*)** dan *LockService Mutex* di sisi Google Apps Script untuk menjamin integritas nilai rapor/kuis siswa tanpa risiko data tertimpa atau terhapus.
4. **Sinkronisasi Dua Arah (*Realtime Bridge*)** dengan Google Spreadsheet resmi sekolah per kelas rombel belajar (XI A hingga XI F).
5. **Panel Kontrol Guru Terautentikasi** dengan saklar pendaftaran ujian, kunci pembahasan, telemetri fokus tab (*anti-cheat*), dan ekspor data CSV.

---

## 🏛️ Arsitektur Sistem

```
┌───────────────────────────────────────────────────────────────────────────┐
│                       KLIEN SISWA (PERAMBAN WEB)                         │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐  │
│  │  Lobby & Registrasi  │  │   Lembar Ujian 25 Q  │  │ Review & Kunci  │  │
│  │ (Absen, Nama, Kelas) │  │  (Timer & Anti-Curang│  │  (Pembahasan)   │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └─────────────────┘  │
└─────────────┼─────────────────────────┼───────────────────────────────────┘
              │                         │
              ▼                         ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    CENTRAL STATE & INTEGRITY RUNNER                       │
│  - Acak Butir Soal & Pilihan Opsi (Fisher-Yates)                          │
│  - Pemantau Perpindahan Tab (Visibility Change API)                       │
│  - Deteksi IP Klien & Kunci Perangkat (Single-Submission Lock)            │
│  - Kalkulasi Skor: Dasar (Maks 25.000) + Bonus Kecepatan (Maks 6.000)     │
└─────────────────────────────────┬─────────────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────────────┐
│              GOOGLE APPS SCRIPT WEB APP (WEBHOOK ENGINE)                  │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ 1. Mutex LockService (Blokir Double-Click / Race Condition)         │  │
│  │ 2. LAPIS 1: Cek Duplikat Nama Siswa (Case-Insensitive)              │  │
│  │ 3. LAPIS 2: Cek Duplikat Nomor Absen di Rombel Kelas               │  │
│  │ 4. LAPIS 3: Cek Duplikat Alamat IP / Perangkat Gawai                │  │
│  │ 5. Auto-Formatting (Header Navy, Status KKM Hijau/Merah)           │  │
│  │ 6. Auto-Sorting Nomor Absen Ascending & Column Auto-Resize          │  │
│  │ 7. Auto-Generate Sheet "Pertanyaan & Kunci Jawaban" (25 Soal)       │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────┬─────────────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                  GOOGLE SPREADSHEET (DATABASE SEKOLAH)                    │
│  [Pertanyaan & Kunci] │ [XI A] │ [XI B] │ [XI C] │ [XI D] │ [XI E] │ [XI F]│
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Distribusi Silabus 25 Butir Soal Terkurasi

Soal telah dikurasi secara ketat bersama model penalaran fisika agar proporsional, berbobot kognitif tinggi (C2–C5), serta **bebas dari materi di luar silabus inti** (tidak memuat tegangan permukaan, kapilaritas, viskositas, maupun venturimeter/pitot):

| No. | Topik / Materi Silabus | Jml | Sub-Topik & Kompetensi Dasar |
|:---:|:---|:---:|:---|
| **1** | **Tekanan Hidrostatis** | **4 Soal** | Tekanan pada titik P dan Q tangki silinder, perbandingan rasio $P_Q : P_P$, tekanan mutlak atmosfer ($P_{\text{atm}} + P_h$), serta konsep orientasi kedalaman vertikal zat cair homogen. |
| **2** | **Prinsip Pascal & Hidrolik** | **3 Soal** | Gaya angkat piston besar $F_2$ dongkrak hidrolik, keuntungan mekanis ideal (KM) dan jarak pergeseran piston, serta perbandingan kuadrat diameter piston ($d_1 : d_2$). |
| **3** | **Hukum Pokok Hidrostatika** | **2 Soal** | Kesetimbangan bidang batas pipa U air raksa dengan zat cair X, serta perhitungan selisih ketinggian kolom air dan minyak. |
| **4** | **Hukum Archimedes** | **4 Soal** | Penimbangan benda di udara vs tercelup air (neraca pegas), fraksi volume balok terapung, daya apung kapal berongga udara, dan kesetimbangan benda di antara dua lapisan zat cair tak campur. |
| **5** | **Persamaan Kontinuitas** | **3 Soal** | Hubungan kelajuan aliran pipa menyempit ($A_1 v_1 = A_2 v_2$), debit volumetrik aliran fluida ($Q = A \cdot v$), serta rasio kelajuan pipa silinder berdiameter bertingkat. |
| **6** | **Teorema Torricelli** | **4 Soal** | Kelajuan pancaran air keluar dari lubang tangki bocor ($v = \sqrt{2gh_1}$), waktu jatuh partikel fluida ke tanah ($t = \sqrt{2h_2 / g}$), jarak jangkauan horizontal terjauh ($X = 2\sqrt{h_1 h_2}$), dan letak lubang optimal untuk jangkauan maksimum. |
| **7** | **Asas Bernoulli & Pipa Bertingkat**| **3 Soal** | Hubungan kenaikan kelajuan dengan penurunan tekanan statis fluida, perhitungan tekanan statis pipa horizontal, serta analisis neraca energi potensial gravitasi vs energi kinetik pipa bertingkat. |
| **8** | **Gaya Angkat Sayap Pesawat** | **2 Soal** | Prinsip profil sayap aerofoil (aliran atas vs bawah), serta perhitungan gaya angkat aerodinamis total sayap pesawat ($F_{\text{angkat}} = \frac{1}{2}\rho (v_1^2 - v_2^2) A$). |
| | **TOTAL** | **25 Soal** | **Proporsi: 15 Statis (60%) & 10 Dinamis (40%) • Durasi: 90 Menit** |

---

## 🏆 Arena Gamifikasi & Peringkat Siswa

Untuk membangun iklim kompetisi akademik yang positif, HydroArena menerapkan sistem gamifikasi sains:

### 1. Skema Skor Berimbang
* **Skor Dasar**: $\text{Jumlah Benar} \times 1.000$ (Maksimal **25.000 Pts**)
* **Bonus Kecepatan (*Speedrun*)**: Proporsional terhadap rasio akurasi dan sisa waktu pengerjaan:
  $$\text{Bonus} = \left(\frac{\text{Jumlah Benar}}{25}\right) \times \left(\frac{\text{Sisa Waktu Detik}}{5.400}\right) \times 6.000 \quad (\text{Maksimal } \mathbf{6.000\text{ Pts}})$$
* **Total Skor Maksimum**: **$31.000\text{ Pts}$**
* **Nilai Quiz**: $(\text{Benar} / 25) \times 100$ (Standar KKM SMAN 78 = $\mathbf{75.0}$, setara minimal **19 butir benar**).

### 2. Tingkatan Gelar (*Tier Fluida*)
* ⚡ **SUPERSONIK** (Nilai $95 - 100$) — Akurasi hampir sempurna dengan pemahaman komprehensif.
* 🔥 **KRITIS** (Nilai $85 - 94$) — Penguasaan tingkat tinggi di atas rata-rata.
* 🌊 **TURBULEN** (Nilai $75 - 84$) — Tuntas Kriteria Ketuntasan Minimal (KKM).
* ⏳ **TRANSISI** (Nilai $60 - 74$) — Mendekati KKM, membutuhkan penguatan konsep.
* 💧 **LAMINER** (Nilai $< 60$) — Rekomendasi program remedial terarah.

### 3. Indikator Integritas (*Fair Play*)
Sistem memantau perpindahan jendela peramban (*tab switching*):
* `0x Pindah Tab` ➔ Lencana bergengsi **`🛡️ Fair Play`** di samping nama siswa pada klasemen.
* `1–2x Pindah Tab` ➔ Peringatan kuning **`⚠️ x Tab`**.
* `≥ 3x Pindah Tab` ➔ Penanda merah **`🚫 x Tab`** tercatat pada rapor spreadsheet guru.

---

## 🛡️ Mekanisme Perlindungan Anti-Timpa (*Anti-Overwrite*)

Data nilai siswa yang telah masuk ke Google Spreadsheet dilindungi oleh 3 lapis validasi ketat:

1. **Cek Nama Lengkap Siswa**: Menolak pengumpulan kedua dengan nama yang sama di kelas tersebut (*case-insensitive*).
2. **Cek Nomor Absen**: Menolak nomor absen yang sudah terdaftar di rombel kelas terkait, mencegah sengketa nomor absen antar-siswa.
3. **Cek Identitas IP / Perangkat**: Membatasi satu gawai/IP jaringan hanya dapat mengumpulkan satu kali ujian.
4. **LockService Mutex**: Mengunci eksekusi selama 20 detik secara atomik, sehingga klik ganda (*double-click*) pada tombol kumpulkan tidak akan pernah menduplikasi atau merusak baris spreadsheet.

---

## 🚀 Panduan Pemasangan & Integrasi Google Apps Script

1. Buat atau buka **Google Spreadsheet** tujuan Anda.
2. Buka menu **Ekstensi (Extensions)** ➔ **Apps Script**.
3. Hapus seluruh isi default `Code.gs`, lalu tempelkan kode dari file `scripts/google_apps_script.js`.
4. Sesuaikan konstanta `SPREADSHEET_ID` di baris atas script dengan ID Spreadsheet Anda.
5. Klik **Simpan (Save)** 💾.
6. Jalankan fungsi `manualInitQuestionBank` sekali dari editor untuk membuat sheet **"Pertanyaan & Kunci Jawaban"** otomatis.
7. Klik **Terapkan (Deploy)** ➔ **Kelola Penerapan (Manage Deployments)**:
   - Pilih jenis: **Aplikasi Web (Web App)**.
   - *Execute as*: **Me (Saya)**.
   - *Who has access*: **Anyone (Siapa saja)**.
   - Klik **Deploy**, lalu salin **URL Aplikasi Web** yang berakhiran `/exec`.
8. Buka HydroArena di browser, masuk ke **Login Guru** (PIN Default: `GURU78`) ➔ Tab **Integrasi & Sandi** ➔ tempelkan URL tersebut ke kolom Webhook URL ➔ Klik **Simpan URL Webhook**.

---

## 💻 Menjalankan Aplikasi Secara Mandiri

HydroArena dibangun murni (*vanilla*) tanpa dependensi build kompleks. Anda dapat langsung menjalankannya menggunakan server statis apa pun:

```bash
# Opsi 1: Menggunakan Python 3 bawaan
python3 -m http.server 8080

# Opsi 2: Menggunakan Node.js http-server / serve
npx serve .

# Opsi 3: Menggunakan ekstensi VS Code "Live Server"
# Klik kanan pada index.html -> "Open with Live Server"
```

Buka peramban pada alamat `http://localhost:8080`.

---

## ♿ Standar Aksesibilitas (WCAG 2.2 Level AA)

* **Kontras Warna**: Semua teks dan badge telah memenuhi rasio kontras minimum 4.5:1 untuk teks normal dan 3:1 untuk elemen grafis.
* **Navigasi Papan Tik (Keyboard Accessible)**: Palet nomor soal, opsi jawaban (A–E), dan tombol navigasi dapat dioperasikan penuh menggunakan tombol `Tab`, `Space`, dan `Enter`.
* **Desain Responsif**: Tampilan optimal pada ponsel pintar (360px), tablet, layar laptop, proyektor kelas, hingga monitor ultra-lebar.
* **Reduksi Gerakan**: Menghormati preferensi pengguna `prefers-reduced-motion` untuk kenyamanan mata.

---

## 📄 Lisensi & Hak Cipta

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

Dikembangkan untuk mendukung kemajuan pembelajaran sains dan digitalisasi asesmen di **SMAN 78 Jakarta**.
Contoh materi soal, diagram vektor SVG, dan kunci jawaban disusun sesuai kurikulum Fisika SMA Kelas XI.
