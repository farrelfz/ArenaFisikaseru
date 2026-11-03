# VectorArena — Arena Evaluasi Kompetitif Fisika Vektor & Kinematika

[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Online-22c55e?style=flat&logo=github)](https://farrelfz.github.io/VectorArena/)
[![SMAN 78 Jakarta](https://img.shields.io/badge/SMAN_78_Jakarta-Kurikulum_Merdeka-312e81?style=flat)](https://sman78-jkt.sch.id/)
[![Tests](https://img.shields.io/badge/Tests-72_Passing-success?style=flat)](tests/)

Portal evaluasi dan kompetisi sains fisika terpadu materi **Vektor Analitis** dan **Kinematika Gerak Vertikal (GVA, GVB, GJB, Grafik v-t)** untuk Kelas XI SMAN 78 Jakarta.

## 🎯 Fitur Utama

- **240 Butir Soal Terkurasi & Tervalidasi**: 8 Zona Kurikulum (25/25/35/35/40/30/25/25 butir) diuji secara deterministik dengan mesin fisika Python (`physics_engine.py`).
- **5 Mode Gamifikasi Kompetitif**:
  1. *Sprint Vektor* (10 soal, 20 menit)
  2. *Duel Komponen* (15 soal, 30 menit)
  3. *Ujian Komprehensif / Ranked* (25 soal, 90 menit)
  4. *Gravitasi Bertingkat / Race* (20 soal, 45 menit)
  5. *Ekspedisi 8 Zona / Campaign* (24 soal, 80 menit)
- **Visualisasi Diagram SVG Interaktif**: Diagram vektor kartesius, poligon, segitiga gaya, dan lintasan gerak vertikal rendered secara murni dengan SVG (`js/visualizers/diagrams.js`).
- **Podium 3 Besar & Hall of Fame**: Pemeringkatan dinamis real-time dengan filter per rombel kelas (XI A – XI F) dan pencarian nama.
- **Pakta Integritas & Anti-Cheat**: Deteksi perpindahan tab browser dengan lencana *"🛡️ Fokus Penuh"* bagi peserta yang tidak beralih tab.
- **Panel Administrator Guru Terproteksi PIN**: Kontrol status ujian (buka/tutup), kunci pembahasan, katalog bank soal, dan audit riwayat.
- **Arsitektur Zero-Build Static SPA**: Kompatibel 100% dengan GitHub Pages tanpa build step atau dependensi berat.

## 📐 8 Zona Kurikulum

| Zona | Topik | Jumlah Soal |
|---|---|---|
| **Z1** | Konsep Dasar & Notasi Vektor | 25 Soal |
| **Z2** | Vektor Posisi & Komponen 2D | 25 Soal |
| **Z3** | Penjumlahan Grafis & Jajaran Genjang | 35 Soal |
| **Z4** | Perkalian Titik (Dot) & Silang (Cross) | 35 Soal |
| **Z5** | Gerak Vertikal ke Atas (GVA) | 40 Soal |
| **Z6** | Gerak Vertikal ke Bawah (GVB) | 30 Soal |
| **Z7** | Gerak Jatuh Bebas (GJB) | 25 Soal |
| **Z8** | Analisis Grafik Kecepatan-Waktu (v-t) | 25 Soal |

## 🧪 Pengujian & Verifikasi Kualitas

- **Python Physics Engine**: 54/54 test pass (`tests/test_physics_engine.py`)
- **Node.js Scoring & Server Handlers**: 18/18 test pass (`tests/js/server.test.mjs`)
- **Total Validated Tests**: 72/72 passing

## 🌐 Akses Publik

Aplikasi dapat diakses langsung melalui:
👉 **[https://farrelfz.github.io/VectorArena/](https://farrelfz.github.io/VectorArena/)**

---
*Dibuat untuk evaluasi pembelajaran Fisika Kelas XI SMAN 78 Jakarta.*
