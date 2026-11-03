# ArenaFisikaSeru

Dua arena evaluasi kompetitif Fisika SMAN 78 Jakarta dalam satu repositori,
terbit sebagai situs statis GitHub Pages.

| Arena | Materi | Rombel | URL |
|---|---|---|---|
| **HydroArena** | Fluida Statis & Dinamis | XI A – XI F | https://farrelfz.github.io/ArenaFisikaseru/HydroArena/ |
| **VectorArena** | Vektor & Kinematika Gerak Vertikal | X A – X K | https://farrelfz.github.io/ArenaFisikaseru/VectorArena/ |

Landing page: https://farrelfz.github.io/ArenaFisikaseru/

## Struktur

```
ArenaFisikaseru/
├── index.html                  # landing page pemilih arena
├── .nojekyll                   # lewati pemrosesan Jekyll di GitHub Pages
├── robots.txt                  # boleh dirayapi + menunjuk sitemap
├── sitemap.xml                 # tiga URL kanonik saja
├── .github/workflows/ci.yml    # CI: sintaks, tes, tautan
├── scripts/check-links.mjs     # pemeriksa referensi aset lokal
├── HydroArena/                 # aplikasi arena 1 (Kelas XI, fluida)
│   ├── index.html
│   ├── css/ js/ assets/ docs/ scripts/
│   └── simulated_10_students.json · simulated_25_students.json
└── VectorArena/                # aplikasi arena 2 (Kelas X, vektor)
    ├── index.html
    ├── css/ js/ assets/ docs/ public/ scripts/ server/ tests/
    ├── data/questions.json     # bank soal (build:bank)
    └── simulated_*.json
```

Setiap arena menyimpan dataset simulasinya sendiri di dalam foldernya —
tidak ada salinan duplikat di root.

Kedua subfolder adalah **salinan utuh** dari repositori asalnya
(`farrelfz/HydroArena`, `farrelfz/VectorArena`), disatukan dengan
`git subtree` sehingga riwayat commit masing-masing arena tetap terbaca
di dalam repositori ini.

## Cara kerja di GitHub Pages

Situs memakai **Deploy from a branch** → `main`, folder `/` (root).
Karena semua path aset di kedua aplikasi bersifat relatif (`css/style.css`,
`js/app.js`, `assets/logo.svg`), keduanya otomatis bekerja di bawah
sub-path `/ArenaFisikaseru/...` tanpa perlu mengubah build apa pun.

Tidak ada proses build: setiap `.html`/`.js`/`.css` disajikan apa adanya.

## Menjalankan lokal

```bash
# dari root repositori, supaya sub-path sama seperti di GitHub Pages
python3 -m http.server 8080
# lalu buka http://localhost:8080/
```

## Satu alamat resmi

Aplikasi hanya hidup di sini:

- https://farrelfz.github.io/ArenaFisikaseru/VectorArena/
- https://farrelfz.github.io/ArenaFisikaseru/HydroArena/

Repo lama (`farrelfz/VectorArena`, `farrelfz/HydroArena`) sekarang **hanya
berisi halaman pengalihan** — `meta refresh` + `location.replace` yang tetap
membawa query (`?admin=1`) dan hash (`#admin`) — sehingga tautan lama tidak
mati, tetapi tidak ada lagi salinan kedua yang bisa tertinggal versinya.

Kedua alamat berada di origin yang sama (`farrelfz.github.io`) dan aplikasi
menyimpan state di `localStorage` dengan kunci tetap
(`hydroarena_78_*_v5_live`, `vectorarena_*_v1_live`). Jadi data nilai, PIN
guru, dan status ujian **otomatis sama** di kedua alamat: pengalihan tidak
menghilangkan data apa pun, dan tidak ada migrasi yang perlu dilakukan.

## Memperbarui salah satu arena

Sumber kebenaran ada di repo ini. Cukup ubah folder `HydroArena/` atau
`VectorArena/`, commit, lalu push ke `main` — GitHub Pages menerbitkan ulang
otomatis.

Jangan memakai `git subtree push` ke repo lama lagi: isinya sudah berupa
halaman pengalihan, jadi dorongan subtree akan mengembalikan salinan aplikasi
kedua dan menghidupkan lagi masalah dua versi.

## Pemeriksaan cepat

```bash
# dari root repositori
node scripts/check-links.mjs        # semua src/href lokal harus resolve
node --check VectorArena/js/app.js  # cek sintaks satu berkas

# dari folder masing-masing arena
cd VectorArena && npm test          # 20 tes invarian dataset simulasi
cd ../HydroArena && npm test        # 50 skenario simulasi
```

Semua perintah di atas juga dijalankan otomatis oleh
`.github/workflows/ci.yml` pada setiap push ke `main` dan setiap pull
request. Workflow itu **tidak** men-deploy apa pun — penerbitan tetap
ditangani GitHub Pages lewat branch `main`.

## Lisensi

MIT — lihat `HydroArena/LICENSE` dan `VectorArena/LICENSE`.