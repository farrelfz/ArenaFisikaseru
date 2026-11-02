# HydroArena — Portal Evaluasi & Arena Kompetisi Fisika Fluida SMAN 78 Jakarta

<div align="center">

![HydroArena Logo](assets/logo.svg)

### **Arena Evaluasi Pembelajaran Kompetitif Fisika Fluida (Statis & Dinamis)**
**SMAN 78 Jakarta • Kelas XI MIPA / Kurikulum Merdeka**

[![Live Demo](https://img.shields.io/badge/demo-online_live-059669?style=for-the-badge&logo=githubpages&logoColor=white)](https://farrelfz.github.io/HydroArena/)
[![Repository](https://img.shields.io/badge/github-farrelfz%2FHydroArena-1e40af?style=for-the-badge&logo=github)](https://github.com/farrelfz/HydroArena)
[![Kelas](https://img.shields.io/badge/kelas-XI%20A%E2%80%93F-3b82f6?style=for-the-badge)](#)
[![Soal](https://img.shields.io/badge/bank_soal-25_butir_terkurasi-0284c7?style=for-the-badge)](#)
[![Waktu](https://img.shields.io/badge/alokasi_waktu-90_menit-d97706?style=for-the-badge&logo=clock)](#)
[![Skor Maksimal](https://img.shields.io/badge/skor_puncak-100.000_pts-7c3aed?style=for-the-badge)](#)
[![Lisensi](https://img.shields.io/badge/lisensi-MIT-475569?style=for-the-badge)](#lisensi)

🌐 **Akses Situs Resmi Siswa:** [https://farrelfz.github.io/HydroArena/](https://farrelfz.github.io/HydroArena/)

</div>

---

## 📌 Ringkasan Eksekutif

**HydroArena** adalah platform evaluasi digital interaktif (*single-page application*) yang dibangun khusus untuk mengukur capaian pembelajaran fisika materi **Fluida Statis dan Fluida Dinamis** siswa Kelas XI SMAN 78 Jakarta.

Platform ini mengintegrasikan:
1. **Bank Soal Terkurasi 25 Butir:** Disusun proporsional menurut kurva kesulitan standar SNBT/UTBK (3 Mudah, 16 Sedang, 6 HOTS), dilengkapi 21 diagram teknis SVG beresolusi tinggi tanpa tumpang tindih teks serta tipografi ilmiah standar (`<sub>` dan `<sup>`).
2. **Pengacakan Ganda (*Dual Randomization*):** Nomor butir soal diacak dengan algoritma *Fisher-Yates* dan urutan pilihan opsi jawaban (A–E) diacak per sesi siswa, menjamin integritas evaluasi bebas contek.
3. **Gamifikasi Edukasi Berskala 100.000 Poin:** Memadukan skor dasar akurasi (maks. 75.000 Pts) dan bonus kecepatan *speedrun* (maks. 25.000 Pts), dilengkapi *Podium Kehormatan 3 Besar*, *Piala Rombel Antar-Kelas (XI A–XI F)*, dan *Tier Gelar Fluida*.
4. **Siklus Hidup Ujian Cerdas (*Smart Lifecycle*):**
   - **Sebelum Ujian Dibuka (Buka Otomatis: Rabu 06:30 WIB s.d. Jumat 16:00 WIB):** Menampilkan panel kisi-kisi materi, indikator soal, konstanta standar, dan panduan belajar mandiri siswa.
   - **Saat Ujian Dibuka:** Pendaftaran aktif dan pengerjaan lembar soal berlangsung dengan pemantauan integritas.
   - **Setelah Ujian Ditutup:** Tab ujian otomatis disembunyikan, siswa langsung dialihkan ke Klasemen Akhir Angkatan dengan filter per-rombel.
5. **Perlindungan Data 3 Lapis (*Anti-Overwrite*):** Mencegah duplikasi nama siswa, nomor absen ganda di rombel yang sama, serta spamming gawai/IP via *Google Apps Script Mutex LockService*.
6. **Keamanan & Privasi Maksimal:** Tautan spreadsheet hanya tersedia di Panel Guru (tidak dapat diakses murid), modal konfirmasi tanpa penyebutan IP murid, dan akses Panel Guru tersembunyi aman lewat *3x klik logo* atau parameter `?admin=1`.

---

## 🏛️ Arsitektur Sistem

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          KLIEN SISWA (WEB BROWSER)                           │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌──────────────────┐  │
│  │   Lobby & Kisi-Kisi   │  │   Lembar Ujian (25 Q) │  │  Klasemen & Tier │  │
│  │  (Sebelum Ujian Buka) │  │   (Timer 90m + Anti)  │  │   (Hasil Akhir)  │  │
│  └───────────┬───────────┘  └───────────┬───────────┘  └──────────────────┘  │
└──────────────┼──────────────────────────┼────────────────────────────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                      CENTRAL STATE & INTEGRITY RUNNER                        │
│  - Dual Shuffling (Nomor Butir & Opsi Jawaban A-E via Fisher-Yates)          │
│  - 5 Klasifikasi Fokus Tab (Page Visibility API)                             │
│  - Kunci Perangkat Klien (Single-Submission Lock per Device)                 │
│  - Kalkulasi Skor: Dasar (Maks 75.000) + Bonus Kecepatan (Maks 25.000)        │
│  - Skala Skor Puncak Standar: 100.000 Pts | KKM: 75.0 (Min. 19 Benar)        │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                 GOOGLE APPS SCRIPT WEB APP (WEBHOOK ENGINE)                  │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ 1. Mutex LockService (Blokir Double-Click / Race Condition Concurrency) │  │
│  │ 2. Lapis 1: Cek Duplikat Nama Lengkap Siswa (Case-Insensitive)         │  │
│  │ 3. Lapis 2: Cek Duplikat Nomor Absen di Rombel Kelas Terkait           │  │
│  │ 4. Lapis 3: Cek Duplikat Alamat IP / Perangkat Gawai                   │  │
│  │ 5. Auto-Formatting: Header Navy, Pewarnaan KKM Hijau/Merah             │  │
│  │ 6. Auto-Sorting: Ascending Nomor Absen & Auto-Resize Kolom             │  │
│  │ 7. Penyimpanan Terpisah: 1 Kelas 1 Sheet (XI A - XI F) + Bank Soal     │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    GOOGLE SPREADSHEET (DATABASE SEKOLAH)                     │
│  [XI A] │ [XI B] │ [XI C] │ [XI D] │ [XI E] │ [XI F] │ [Pertanyaan & Kunci]  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Distribusi Silabus 25 Butir Soal Terkurasi

Materi evaluasi murni berakar pada silabus inti fisika fluida SMA Kelas XI (tanpa materi di luar silabus seperti tegangan permukaan, kapilaritas, viskositas, dan tabung pitot). Distribusi butir soal terbagi proporsional: **15 Soal Fluida Statis (60%)** dan **10 Soal Fluida Dinamis (40%)**.

| No | Topik / Pokok Bahasan | Jumlah | Level Kesulitan | Rincian Fokus Kompetensi & Indikator Soal |
|:--:|:---|:---:|:---:|:---|
| **1** | **Tekanan Hidrostatis** | 4 Soal | 1 Mudah<br>2 Sedang<br>1 HOTS | Tekanan pada titik P & Q tangki silinder, perbandingan rasio $P_Q : P_P$, tekanan mutlak atmosfer ($P_{\text{total}} = P_{\text{atm}} + P_h$), serta analisis paradoks hidrostatika 3 wadah berbeda bentuk ($F_I : F_{II} : F_{III} = 8 : 2 : 5$). |
| **2** | **Prinsip Pascal & Hidrolik** | 3 Soal | 1 Sedang<br>2 HOTS | Dongkrak hidrolik nyata dengan efisiensi sistem 80%, pergeseran piston inkompresibel ($A_1 s_1 = A_2 s_2$), keuntungan mekanis ($\text{KM} = A_2/A_1$), dan perbandingan kuadrat diameter piston ($A \propto D^2$). |
| **3** | **Hukum Pokok Hidrostatika** | 2 Soal | 1 Mudah<br>1 Sedang | Kesetimbangan bidang batas horizontal pipa U air dan minyak ($\rho_1 h_1 = \rho_2 h_2$), penentuan selisih tinggi permukaan raksa sejajar. |
| **4** | **Hukum Archimedes** | 4 Soal | 3 Sedang<br>1 HOTS | Komputasi neraca pegas di udara vs air ($W_{\text{udara}} - W_{\text{semu}} \to \rho$), persentase balok terapung ($V_{\text{tercelup}} / V_{\text{total}}$), kapasitas muatan rakit sebelum tenggelam, dan benda terapung di antara dua lapisan zat cair tak campur. |
| **5** | **Persamaan Kontinuitas** | 3 Soal | 1 Mudah<br>1 Sedang<br>1 HOTS | Kelajuan fluida pipa menyempit ($A_1 v_1 = A_2 v_2$), debit volumetrik $Q = A \cdot v$ (satuan $\text{m}^3/\text{s}$), percabangan pipa utama menuju tandon air 1.260 liter ($Q_0 = Q_A + Q_B$), dan rasio kuadrat diameter silinder. |
| **6** | **Teorema Torricelli** | 4 Soal | 2 Sedang<br>2 HOTS | Kelajuan pancaran lubang bocor ($v = \sqrt{2gh}$), waktu jatuh bebas tetesan air, jarak mendatar terjauh ($X = 2\sqrt{h \cdot y}$), simetri letak dua lubang dengan jarak pancaran sama ($y_A + y_B = H$), dan letak lubang optimal jarak maksimum ($h = y = H/2$). |
| **7** | **Asas Bernoulli & Pipa Bertingkat** | 3 Soal | 2 Sedang<br>1 HOTS | Korelasi kenaikan kelajuan terhadap penurunan tekanan statis, pembacaan manometer pipa horizontal ($\Delta P \propto Q^2$), neraca energi Bernoulli 3 suku beda tinggi, dan analisis justifikasi energi potensial vs kinetik. |
| **8** | **Gaya Angkat Sayap Pesawat** | 2 Soal | 2 Sedang | Perhitungan kuantitatif kelajuan aliran udara atas dan bawah sayap pada pesawat 54 ton saat terbang jelajah stabil ($F_{\text{angkat}} = W$), dan gaya angkat total aerofoil ($F = \frac{1}{2}\rho (v_{\text{atas}}^2 - v_{\text{bawah}}^2) A$). |
| | **TOTAL KESELURUHAN** | **25 Soal** | **3 Mudah • 16 Sedang • 6 HOTS** | **Alokasi Waktu: 90 Menit (5.400 detik)** |

---

## 🏆 Skema Penilaian & Gamifikasi Skala 100.000 Poin

Untuk menghadirkan atmosfer kompetisi sains yang sehat dan mudah dipahami, sistem menggunakan skala skor puncak **100.000 Poin**:

$$\begin{aligned}
\textbf{Skor Dasar Akurasi (75\%)} &= \text{Jumlah Benar} \times \mathbf{3.000\text{ Pts}} &&\to \text{Maksimal } \mathbf{75.000\text{ Pts}} \\
\textbf{Bonus Kecepatan (25\%)} &= \left(\frac{\text{Jumlah Benar}}{25}\right) \times \left(\frac{\text{Sisa Waktu Detik}}{5.400}\right) \times \mathbf{25.000\text{ Pts}} &&\to \text{Maksimal } \mathbf{25.000\text{ Pts}} \\
\hline
\textbf{TOTAL SKOR MAKSIMAL} &= \mathbf{75.000} + \mathbf{25.000} &&= \mathbf{100.000\text{ Pts}}
\end{aligned}$$

* **Nilai Quiz Rapor:** $(\text{Jumlah Benar} / 25) \times 100$ (Skala 0–100).
* **Standar KKM SMAN 78:** Nilai $\mathbf{\ge 75.0}$ (Setara minimal **19 butir benar** dari 25 butir soal).

### 🎖️ Tingkatan Gelar (*Tier Fluida*)
Gelar kehormatan disematkan otomatis pada profil hasil dan tabel klasemen:
* ⚡ **SUPERFLUIDA** (Nilai $95 - 100$) — Badge Ungu / Violet Glowing (Regime fluida ideal kuantum tanpa hambatan viskositas $\eta=0$).
* 🌊 **SUPERKRITIS** (Nilai $85 - 94$) — Badge Hijau Zamrud (Regime aliran berenergi kinetik tinggi melampaui cepat rambat gelombang, Bilangan Froude $Fr > 1$).
* 🌀 **TURBULEN** (Nilai $75 - 84$, Lolos KKM) — Badge Biru Laut (Regime pusaran berenergi tinggi dengan Bilangan Reynolds $Re > 4000$).
* ⏳ **TRANSISI** (Nilai $60 - 74$) — Badge Amber / Kuning (Fase kritis peralihan laminer menuju turbulen $2000 \le Re \le 4000$).
* 💧 **LAMINER** (Nilai $< 60$) — Badge Abu-abu (Aliran teratur berlapis lambat dengan hambatan gesekan viskositas dominan $Re < 2000$).

### 🛡️ 5 Klasifikasi Integritas Aliran Pengerjaan (*Fluid Integrity Levels*)
Sistem mencatat perpindahan jendela (*tab switches*) via Page Visibility API:
* **Level 1 (0x Pindah Tab):** `🛡️ Aliran Tunak (0x)` — Integritas Purna (*Steady laminar flow*, fokus 100% tanpa deviasi).
* **Level 2 (1x Pindah Tab):** `💧 Riak Fluktuasi (1x)` — Toleransi Ringan (*Surface ripple*, fluktuasi kecil).
* **Level 3 (2x Pindah Tab):** `🌀 Olakan Vortiks (2x)` — Waspada (*Vortex disturbance*, arus mulai terganggu).
* **Level 4 (3–4x Pindah Tab):** `⚠️ Kavitasi Kritis (3–4x)` — Peringatan Keras (*Cavitation collapse*, instabilitas aliran tinggi).
* **Level 5 (≥5x Pindah Tab):** `⛔ Separasi Ekstrem (≥5x)` — Pelanggaran Berat (*Boundary layer separation*, aliran terputus).

### 🏆 Gamifikasi & Papan Klasemen
* **Podium Kehormatan 3 Besar:** Menampilkan 3 kartu juara berjenjang (🥇 Juara 1 Emas di tengah bermahkota, 🥈 Juara 2 Perak, 🥉 Juara 3 Perunggu).
* **10 Terbaik Satu Angkatan (Top 10 Hall of Fame):** Papan galeri 10 kartu elit peraih skor kompetitif tertinggi lintas seluruh rombel XI A – XI F.
* **Piala Rombel Antar-Kelas:** Peringkat komparatif rata-rata skor dan tingkat kelulusan 6 rombel (XI A – XI F).
* **Daftar Peringkat Lengkap Seluruh Siswa:** Menampilkan seluruh nama murid tanpa batas kuota 10 orang, dilengkapi filter tombol cepat per-kelas dan pencarian instan.

---

## 🔄 Alur Cerdas Sesi Ujian (*Lifecycle Management*)

| Status Sesi | Kondisi Sistem | Tampilan Sisi Murid |
|---|---|---|
| **Sebelum Ujian Buka** | Pendaftaran ditutup & belum ada data pengerjaan | **Panel Kisi-Kisi Soal & Panduan Belajar Mandiri**: 8 kartu materi inti, rumus kunci, tabel konstanta standar fisika, tips sukses ujian, dan tombol pendaftaran terkunci. |
| **Saat Ujian Berlangsung** | Pendaftaran dibuka guru | **Lembar Ujian Aktif**: Formulir nama, kelas, absen, pengacakan 25 soal + opsi A–E, timer hitung mundur 90 menit, navigasi keyboard ([A]–[E], [←]/[→]), palet nomor 5×5, dan penanda ragu-ragu. |
| **Setelah Ujian Selesai** | Pendaftaran ditutup guru & data nilai sudah masuk | **Klasemen Akhir Angkatan**: Tab Ujian otomatis disembunyikan, murid langsung melihat banner hasil final, Podium 3 Besar (👑 Juara 1 Emas, 🥈 Perak, 🥉 Perunggu), Piala Rombel Antar-Kelas, dan filter per-kelas. |

---

## 🔒 Keamanan, Privasi, & Akses Panel Guru

1. **Privasi Siswa Terlindungi:**
   - Tidak ada alamat IP siswa yang ditampilkan pada modal konfirmasi pengumpulan ujian.
   - Tidak ada link Google Spreadsheet publik yang bisa diakses oleh murid.
2. **Akses Tersembunyi Administrator Guru:**
   - Tombol *Login Guru* dan tab *Panel Guru* tidak tampak pada navigasi siswa biasa.
   - **Metode Buka Akses Guru:**
     - **Metode 1 (Easter Egg):** Klik **Logo HydroArena** di sudut kiri atas navbar sebanyak **3 kali berturut-turut**.
     - **Metode 2 (URL Parameter):** Buka URL dengan menambahkan `?admin=1` (misal: `https://farrelfz.github.io/HydroArena/?admin=1`).
   - Masukkan PIN Guru resmi untuk mengelola status ujian, membuka kunci gawai murid yang terkunci, atau mengekspor rekapitulasi nilai.

---

## 🚀 Panduan Deployment & Sinkronisasi Spreadsheet

### 1. Sinkronisasi Google Apps Script
1. Buka Google Spreadsheet rekapitulasi sekolah Anda.
2. Pilih menu **Ekstensi (Extensions)** ➔ **Apps Script**.
3. Salin dan tempel kode dari berkas `scripts/google_apps_script.js`.
4. Sesuaikan konstanta `SPREADSHEET_ID` dengan ID Spreadsheet Anda.
5. Jalankan fungsi `manualInitQuestionBank` sekali dari editor untuk memvalidasi sheet *Pertanyaan & Kunci Jawaban*.
6. Klik **Terapkan (Deploy)** ➔ **Kelola Penerapan (Manage Deployments)** ➔ Pilih tipe *Aplikasi Web (Web App)* ➔ Akses: *Siapa saja (Anyone)* ➔ **Deploy**.
7. Salin URL Web App yang berakhiran `/exec` dan pastikan terpasang di `DEFAULT_WEBHOOK_URL` pada berkas `js/config.js`.

### 2. Hosting di GitHub Pages
Repositori ini dikonfigurasi untuk auto-deploy melalui GitHub Pages:
1. Masuk ke **Settings** ➔ **Pages** pada repositori GitHub.
2. Pilih Source: **Deploy from a branch** ➔ Branch: **`main`** / Folder: **`/ (root)`**.
3. Dalam hitungan detik, portal akan aktif pada: `https://<username>.github.io/<repository>/`.

---

## 📁 Struktur Berkas Repositori

```
HydroArena/
├── index.html                   # Shell antarmuka pengguna (Single-Page Application)
├── css/
│   └── style.css                # Komponen tema akademik, podium esports, tier badge
├── js/
│   ├── config.js                # Konfigurasi terpusat (durasi 90m, skor 100k, webhook, KKM)
│   ├── state.js                 # Central state, sanitasi data lama, dan persistensi storage
│   ├── app.js                   # Main router, bootstrap, siklus buka/tutup ujian
│   ├── data/
│   │   ├── questions.js         # Bank 25 butir soal terkurasi + cadangan (format sub & sup)
│   │   └── diagrams.js          # 21 diagram vektor teknis SVG beresolusi tinggi
│   ├── modules/
│   │   ├── exam.js              # Controller ujian, pengacakan ganda, timer, 5-level anti-cheat
│   │   ├── leaderboard.js       # Klasemen, podium 3 besar, piala rombel, analisis butir
│   │   ├── teacherAdmin.js      # Gerbang PIN guru tersembunyi, kontrol status, ekspor CSV
│   │   └── spreadsheet.js       # Sinkronisasi dua arah Google Sheets API & Webhook
│   └── utils/
│       └── helpers.js           # Formatter angka/waktu, toast notification, deteksi IP
├── assets/
│   └── logo.svg                 # Identitas vektor resmi & favicon HydroArena SMAN 78
├── scripts/
│   ├── google_apps_script.js    # Backend Google Apps Script Web App (Webhook & Mutex Lock)
│   └── simulate_students.js     # Script uji beban simulasi siswa berbasis AI
└── README.md                    # Dokumentasi teknis & operasional resmi
```

---

## ♿ Aksesibilitas & Standar Teknis

* **WCAG 2.2 Level AA:** Seluruh elemen teks dan badge memiliki rasio kontras warna tinggi ($\ge 4,5:1$) yang nyaman dibaca pada layar proyektor kelas maupun layar ponsel.
* **Operasional Papan Tik Penuh:** Seluruh alur ujian dan navigasi soal dapat dioperasikan penuh via keyboard tanpa ketergantungan mouse/touchscreen.
* **Motion Sensitivity:** Mendukung preferensi `prefers-reduced-motion` untuk kenyamanan visual siswa.
* **Vanilla Zero-Dependency:** Dibangun menggunakan HTML5, Tailwind CSS CDN, dan JavaScript murni tanpa bundler kompleks sehingga waktu muat halaman instan (<1 detik).

---

## 📄 Lisensi & Hak Cipta

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

Dikembangkan untuk mendukung kemajuan pembelajaran sains dan digitalisasi asesmen di **SMAN 78 Jakarta**. Materi soal, diagram vektor teknis SVG, dan rubrik penilaian disusun selaras dengan standar capaian pembelajaran Fisika Kurikulum Merdeka.
