# Hydro Challenge — Venturi & Penyemprot Cairan

Arena latihan kompetitif Fisika Kelas XI (SMAN 78 Jakarta) yang berfokus pada **satu tema sempit**: air mengalir dalam pipa horizontal yang menyempit, tabung venturi, manometer, dan penyemprot cairan (atomizer).

Berbeda dari `HydroArena` yang mencakup seluruh fluida statis–dinamis, `HydroChallenge` hanya memuat **15 butir soal** bertema venturi + atomizer, dengan pembahasan lengkap dan klasemen yang **disimpan lokal di perangkat** (tanpa Google Spreadsheet).

## Format singkat

- **15 butir** pilihan ganda, **20 menit** (sekitar 80 detik per butir)
- Skor puncak **100.000** = akurasi 75.000 + bonus kecepatan 25.000
- **KKM 75,0** (setara 12 dari 15 butir benar)
- Soal berjenjang **Mudah → Sedang → Sulit**; urutan opsi diacak setiap sesi
- Waktu habis → jawaban terkumpul otomatis; sesi bisa dilanjutkan bila peramban tertutup

---

## Cara membuka

| Cara | Langkah |
|---|---|
| Langsung (tanpa server) | Buka `HydroChallenge/index.html` di peramban modern |
| Server lokal | `python3 -m http.server 8099` dari folder repo, lalu buka `http://localhost:8099/HydroChallenge/` |
| Publikasi | Folder statis — cukup di-commit ke repo GitHub Pages seperti arena lain |

Tailwind CSS dan ikon Lucide dimuat **dari folder `vendor/`** (lokal), jadi tata letak tetap benar walau tanpa internet. Google Fonts tetap dicoba lewat jaringan dan otomatis jatuh ke font sistem bila gagal.

> `vendor/tailwind.js` adalah salinan Tailwind Play CDN (MIT) dan `vendor/lucide.min.js` salinan Lucide (ISC) — disimpan lokal agar arena tidak bergantung pada CDN saat jam ujian.

---

## Struktur berkas

```
HydroChallenge/
├── index.html                  # Lobi, ruang pengerjaan, review, klasemen
├── css/style.css               # Tema akademik terang (selaras HydroArena)
├── js/
│   ├── config.js               # Durasi, jumlah soal, bobot skor, kunci localStorage
│   ├── state.js                # State terpusat + persistensi localStorage
│   ├── app.js                  # Bootstrap & router tab
│   ├── data/
│   │   ├── questions.js        # 15 butir soal + pembahasan
│   │   └── diagrams.js         # 5 diagram SVG (pipa, venturi, manometer, atomizer)
│   ├── utils/helpers.js        # Format, shuffle, toast
│   └── modules/
│       ├── exam.js             # Alur pengerjaan, timer, penilaian, review
│       └── leaderboard.js      # Podium, top 10, piala rombel, analisis butir
├── assets/logo.svg             # Logo perisai + nozel venturi
├── vendor/                     # tailwind.js & lucide.min.js (offline-safe)
└── scripts/verify-questions.js # Uji struktur & kunci jawaban
```

---

## Peta materi & tingkat kesulitan

| Topik | Butir | Jumlah |
|---|---|---|
| Persamaan kontinuitas | Q01 | 1 |
| Asas Bernoulli (pipa horizontal menyempit) | Q02, Q03, Q05, Q13 | 4 |
| Kontinuitas + Bernoulli | Q06, Q12 | 2 |
| Tabung venturi & manometer | Q07, Q11, Q14 | 3 |
| Penyemprot cairan (atomizer) | Q04, Q08, Q09, Q10, Q15 | 5 |

Komposisi tingkat: **4 Mudah · 6 Sedang · 5 Sulit/HOTS**. Soal disajikan berjenjang (Mudah → Sedang → Sulit), sedangkan urutan opsi jawaban tetap diacak per sesi.

| Tingkat | Butir |
|---|---|
| Mudah | Q01, Q02, Q03, Q04 |
| Sedang | Q05, Q06, Q07, Q08, Q09, Q10 |
| Sulit / HOTS | Q11, Q12, Q13, Q14, Q15 |

---

## Penilaian

- **Skor dasar** = 5.000 × jumlah jawaban benar (maks 75.000)
- **Bonus kecepatan** = (akurasi × sisa waktu / durasi) × 25.000 (maks 25.000)
- **Total puncak** = 100.000 poin
- **KKM** = 75,0 (setara 12 dari 15 butir benar)
- Tier: EINSTEIN ≥95 · NEWTON 85–94 · MAXWELL 75–84 · GALILEO 60–74 · ARCHIMEDES <60

Klasemen menampilkan **satu baris per siswa** (nama + kelas) memakai skor terbaiknya, sehingga challenge boleh diulang tanpa mengacaukan papan peringkat.

---

## Data & privasi

Seluruh riwayat disimpan di `localStorage` perangkat dengan kunci:

- `hydrochallenge_records_v1` — riwayat pengerjaan
- `hydrochallenge_active_session_v1` — sesi berjalan (untuk pemulihan otomatis)

Tidak ada data yang dikirim ke server. Tombol **Reset Data Lokal** di bagian bawah tabel klasemen menghapus keduanya.

---

## Uji mandiri

```bash
cd HydroChallenge
node scripts/verify-questions.js
```

Skrip memeriksa: 15 butir lengkap, tiap butir punya 5 opsi unik, `correctIndex` valid, pembahasan dan diagram ada, serta **nilai pada opsi kunci cocok dengan hasil hitung** (mis. Q05 harus memuat `204.000 Pa`). Keluaran berakhir dengan `Butir gagal : 0`.
