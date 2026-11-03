# Arsitektur Aplikasi

## 1. Gambaran Umum

HydroArena adalah aplikasi web statis tanpa proses build dan tanpa backend. Seluruh logika dieksekusi di peramban; persistensi menggunakan `localStorage` dengan sinkronisasi opsional ke Google Sheets.

```
┌──────────────────────────────────────────────────────────┐
│                        index.html                        │
│         (markup, handler inline, pemuatan modul)         │
└───────────────────────────┬──────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   ┌─────────┐        ┌──────────┐        ┌───────────┐
   │ config  │        │  state   │        │  helpers  │
   │ .js     │◄───────┤  .js     │◄───────┤  .js      │
   └────┬────┘        └────┬─────┘        └───────────┘
        │                  │
        │        ┌─────────┴──────────┬──────────────┐
        │        ▼                    ▼              ▼
        │   ┌─────────┐        ┌────────────┐  ┌──────────────┐
        │   │  exam   │        │leaderboard │  │ teacherAdmin │
        │   │  .js    │        │   .js      │  │    .js       │
        │   └────┬────┘        └─────┬──────┘  └──────┬───────┘
        │        │                   │                │
        │        └───────────┬───────┴────────────────┘
        │                    ▼
        │            ┌───────────────┐
        │            │ spreadsheet.js│
        │            └───────┬───────┘
        │                    │
        ▼                    ▼
   ┌─────────┐        ┌──────────────┐
   │  data/  │        │ Google Sheets│
   │ soal &  │        │  (opsional)  │
   │ diagram │        └──────────────┘
   └─────────┘
```

---

## 2. Tanggung Jawab Modul

| Berkas | Tanggung jawab | Tidak boleh |
|---|---|---|
| `js/config.js` | Konstanta global, kunci penyimpanan, identitas spreadsheet | Menyentuh DOM |
| `js/state.js` | State tunggal + baca/tulis `localStorage` | Mengandung logika tampilan |
| `js/app.js` | Bootstrap, router tampilan, sinkronisasi UI konfigurasi | Mengandung logika penilaian |
| `js/utils/helpers.js` | Format angka/waktu, toast, escape HTML, deteksi IP | Menyimpan state |
| `js/data/questions.js` | Bank soal dan pembahasan | Menyentuh DOM |
| `js/data/diagrams.js` | String SVG diagram teknis | Menyentuh DOM |
| `js/modules/exam.js` | Alur ujian, timer, penilaian, anti-curang, mode review | Mengelola autentikasi guru |
| `js/modules/leaderboard.js` | Pengurutan, tabel klasemen, analisis butir | Menulis state |
| `js/modules/teacherAdmin.js` | Autentikasi PIN, panel admin, rekapitulasi, ekspor | Memulai sesi ujian siswa |
| `js/modules/spreadsheet.js` | Baca (GVIZ/CSV) dan tulis (Apps Script) | Mengubah state selain data nilai |

---

## 3. Alur Data

### 3.1 Siklus Pengerjaan Ujian

```
[Lobi]  isi identitas
   │
   ├─ cek examConfig.isOpen ────────► tertutup? → tolak
   ├─ cek findRecordByIp(ip) ───────► terkunci?  → mode review
   │
   ▼
[Ujian] questions = shuffle(MASTER_QUESTIONS)  ← acak soal + acak opsi
   │
   ├─ timer 5400s ──► habis → finalizeSubmit()
   ├─ visibilitychange ──► tabSwitches++
   │
   ▼
[Hitung] benar, skorDasar, bonusKecepatan, nilaiAkademik
   │
   ▼
[Simpan] state.save() ──► ipLockRegistry[ip] = record
   │
   ├─ opsional: POST ke Apps Script
   │
   ▼
[Review] tampilkan pembahasan (bila examConfig.allowReview)
```

### 3.2 Alur Autentikasi Guru

```
Klik "Login Guru"
   │
   ▼
verifyPin(input) ──► cocok? ──tidak──► tampilkan galat
   │ ya
   ▼
State.isTeacherLoggedIn = true
sessionStorage[TEACHER_SESSION] = '1'
   │
   ▼
updateAuthUI() ──► sembunyikan gerbang, tampilkan panel
   │
   ▼
renderPanel() ──► metrik, tabel, analisis
```

---

## 4. Skema Data

### 4.1 Record Hasil Ujian

```javascript
{
    id: "sman78_XIA_12_1793371577000",
    timestamp: "2026-10-30T12:00:00.000Z",
    ip: "103.119.78.12",
    name: "Ahmad Fauzan",
    className: "XI A",
    absen: 12,
    correctCount: 30,
    academicGrade: 85.7,
    durationSec: 3120,
    baseScore: 30000,
    speedBonus: 6333,
    totalScore: 36333,
    tabSwitches: 0,
    answersJson: "{\"Q01\":{\"isCorrect\":true,...}}"
}
```

### 4.2 Konfigurasi Ujian

```javascript
{
    isOpen: true,       // pendaftaran siswa
    allowReview: true   // akses pembahasan
}
```

### 4.3 Kunci Penyimpanan

| Kunci | Media | Isi |
|---|---|---|
| `hydroarena_78_records_v4_edu` | localStorage | Array record hasil ujian |
| `hydroarena_78_ip_locks_v4_edu` | localStorage | Peta `ip → record` |
| `hydroarena_78_exam_config_v4_edu` | localStorage | Konfigurasi saklar ujian |
| `hydroarena_78_teacher_pin_v4_edu` | localStorage | PIN administrator |
| `hydroarena_78_webhook_url_v4_edu` | localStorage | URL Apps Script |
| `hydroarena_78_device_ip_v4_edu` | localStorage | Fallback IP perangkat |
| `hydroarena_78_teacher_session_v4_edu` | sessionStorage | Penanda sesi guru |

---

## 5. Keputusan Desain

| Keputusan | Alasan |
|---|---|
| Tanpa framework build | Dapat dijalankan langsung dari server statis; mudah dipelihara guru/TIK sekolah |
| Tema terang akademik | Keterbacaan lebih baik pada proyektor kelas dan pencahayaan ruang belajar |
| Palet biru navy | Konsisten dengan identitas institusi pendidikan formal |
| Satu objek state global | Skala aplikasi kecil; menghindari kompleksitas state library |
| Pengacakan ganda | Mengurangi risiko penyalinan jawaban antar siswa |
| Sinkronisasi opsional | Aplikasi tetap berfungsi penuh tanpa koneksi internet |

---

## 6. Batasan yang Diketahui

1. **Tanpa backend** — nilai dapat dimanipulasi melalui DevTools peramban.
2. **Kunci IP berbasis klien** — IP dideteksi melalui layanan eksternal; kegagalan jaringan menghasilkan IP sintetis sebagai fallback.
3. **Penyimpanan lokal** — data hilang bila pengguna membersihkan penyimpanan peramban; Google Sheets berfungsi sebagai cadangan.
4. **Tanpa pengawasan real-time** — guru melihat data setelah siswa mengumpulkan, bukan selama pengerjaan.

---

## 7. Rencana Pengembangan Lanjutan

- [ ] Backend autentikasi dan penyimpanan terpusat (mis. Supabase/Firebase)
- [ ] Monitor peserta langsung (live proctoring)
- [ ] Impor bank soal dari berkas Excel/CSV
- [ ] Analisis daya pembeda dan tingkat kesukaran butir (model Rasch)
- [ ] Dukungan multi-guru dengan pembatasan per rombel
