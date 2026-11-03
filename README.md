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

## Memperbarui salah satu arena

Karena kedua arena juga masih punya repositori sendiri, ada dua alur:

1. **Ubah lewat repo arena asal**, lalu tarik perubahannya ke sini:

   ```bash
   git fetch ./HydroArena main          # atau remote GitHub-nya
   git subtree pull --prefix=HydroArena ./HydroArena main -m "chore: sinkron HydroArena"
   ```

2. **Ubah langsung di sini** (folder `HydroArena/` atau `VectorArena/`),
   lalu commit seperti biasa. Jika begini, push juga ke repo arena asal
   agar tidak terjadi drift.

## Pemeriksaan cepat

```bash
node --test VectorArena/tests/js/*.mjs   # invarian dataset simulasi
python3 -m pytest HydroArena -q          # bila tersedia
```

## Lisensi

MIT — lihat `HydroArena/LICENSE` dan `VectorArena/LICENSE`.