# Backend Google Apps Script — VectorArena

`Code.gs` adalah penerima webhook **VectorArena** (Vektor & Kinematika, Kelas X,
25 butir, KKM 75). Berkas ini berdiri sendiri: tidak butuh library, tidak butuh
`clasp`, dan tidak memakai apa pun dari HydroArena.

> **Pisahkan dari HydroArena.** Gunakan **spreadsheet baru** dan **deployment
> baru**. Jangan menempelkan `Code.gs` ini ke spreadsheet/webhook HydroArena —
> struktur kelas (X A–X K vs XI), jumlah soal (25 vs 25), dan sheet bank soal
> berbeda, sehingga data dua arena akan tercampur.

## Deploy (sekali saja, ±2 menit)

1. Buat spreadsheet baru, beri nama misalnya `VectorArena — Nilai X`.
2. Di spreadsheet: **Extensions → Apps Script**.
3. Hapus isi `Code.gs` bawaan, tempel **seluruh** isi `Code.gs` dari folder ini,
   lalu **Save** (Ctrl/Cmd+S).
4. **Deploy → New deployment → pilih Web app**.
   - Description: `VectorArena v1`
   - **Execute as: Me**
   - **Who has access: Anyone** ← harus `Anyone`, bukan "Anyone with Google account",
     supaya siswa tanpa login Google tetap bisa mengirim nilai.
5. **Deploy**, lalu **Authorize access** (pilih akun pemilik spreadsheet →
   Advanced → Go to project → Allow).
6. Salin **Web app URL** yang berakhiran **`/exec`**.

Uji cepat: buka URL `/exec?action=ping` di browser. Harus muncul JSON seperti

```json
{"status":"active","app":"VectorArena","spreadsheet":"VectorArena — Nilai X",
 "examIsOpen":true,"allowReview":true,"totalSheets":1,"totalRecords":0,
 "rows":[],"records":[],"message":"Backend VectorArena merespons."}
```

Kalau yang muncul halaman login Google atau HTML, ulangi langkah 4 dan pilih
**Anyone**.

## Yang dibuat otomatis

| Sheet | Isi |
|---|---|
| `X A` … `X K` | Satu sheet per kelas, dibuat saat siswa pertama kelas itu mengirim |
| `Pertanyaan & Kunci Jawaban` | 25 soal + kunci + pembahasan (dibuat saat kiriman pertama) |

Kolom sheet kelas (13):

`No. Absen | Nama Lengkap Siswa | Kelas | Nilai Quiz | Status KKM | Total Skor | Benar | Salah | Nomor Soal Salah | Waktu Pengerjaan | Integritas (Fokus Tab) | Waktu Pengumpulan | Identitas_Perangkat`

Baris otomatis diurutkan berdasarkan nomor absen, dengan warna hijau untuk
TUNTAS dan merah untuk REMEDIAL.

## Kontrak data

### Kirim hasil ujian (POST)

```json
{
  "name": "Muhammad Zaidan Al-Farisi",
  "className": "X A",
  "absen": 1,
  "totalQuestions": 25,
  "correctCount": 25,
  "academicGrade": 100,
  "durationSec": 1350,
  "baseScore": 75000,
  "speedBonus": 18750,
  "totalScore": 93750,
  "tier": "Relativistik",
  "statusKKM": "TUNTAS",
  "tabSwitches": 0,
  "ip": "192.168.78.11",
  "timestamp": "03/11/2026 09.15.00",
  "answersJson": { "Q01": { "isCorrect": true }, "Q02": { "isCorrect": false } }
}
```

`answersJson` boleh berupa objek, string JSON, atau array nomor soal salah
(`["Q02","Q03"]`). Respons:

```json
{"status":"ok","app":"VectorArena","message":"Hasil ujian tersimpan.",
 "sheet":"X A","row":7,"grade":100,"statusKKM":"TUNTAS","totalScore":93750}
```

Nilai balik `status`:

| status | arti |
|---|---|
| `ok` | tersimpan |
| `skipped` | nama atau nomor absen sudah ada (tidak ditimpa) |
| `error` | payload/kelas tidak valid, atau spreadsheet tidak terhubung |

### Kontrol ujian & pembahasan (POST)

```json
{"action":"setExamConfig","isOpen":false,"allowReview":false}
```

Boleh juga memakai `override` (`auto` / `manual_open` / `manual_closed`) dan
`overrideReview` (`auto` / `manual_allowed` / `manual_locked`).

### Uji koneksi (POST)

```json
{"action":"ping"}
```

### Rekap (GET)

`GET /exec` mengembalikan `{status, app, examIsOpen, allowReview, totalSheets,
totalRecords, rows, records}`. `rows` adalah array baris mentah (kompatibel
dengan pola HydroArena), `records` adalah objek siap pakai dengan kunci
`absen, name, className, academicGrade, statusKKM, totalScore, correctCount,
wrongCount, wrongNumbers, durationLabel, integrity, timestamp, ip`.

Kontrol lewat GET juga tersedia agar bisa ditembak langsung dari browser:

```
/exec?action=setExamConfig&isOpen=false
/exec?action=setExamConfig&allowReview=false
```

## Catatan teknis

- **Antrean**: `LockService.getScriptLock()` dengan tunggu 20 detik. Bila antrean
  penuh, respons berisi `status: "error"` dengan pesan untuk mencoba lagi —
  klien sebaiknya menampilkan pesan itu apa adanya, bukan mengklaim sukses.
- **Anti-timpa** berjalan **di dalam sheet kelas tujuan** (satu kelas satu sheet),
  sehingga siswa `X A` absen 5 dan `X B` absen 5 tidak saling menolak.
  Yang memblokir: nama kembar dan nomor absen kembar **di kelas yang sama**.
- **IP tidak memblokir** secara default (`BLOCK_ON_DUPLICATE_IP = false`), karena
  seluruh siswa di satu sekolah biasanya keluar lewat satu IP NAT — kalau IP
  dijadikan pemblokir, siswa kedua dan seterusnya satu kelas akan ditolak.
- **Nilai dihitung di server.** `academicGrade` dan `statusKKM` ditentukan dari
  `correctCount` (di-clamp ke `0..totalQuestions`), bukan dipercaya mentah dari
  klien, sehingga nilai tidak bisa dinaikkan dengan mengubah payload. `totalScore`
  tetap dipakai apa adanya karena mengandung bonus kecepatan yang dihitung klien.
- **Kirim dari browser dengan `Content-Type: text/plain;charset=utf-8`** (body
  tetap JSON). Tipe `application/json` memicu preflight CORS yang ditolak Apps
  Script, sedangkan `text/plain` termasuk "simple request" sehingga tidak
  di-preflight dan respons JSON-nya **tetap terbaca**.
- **Jangan pakai `mode: 'no-cors'`.** Dengan mode itu respons menjadi *opaque*:
  klien tidak bisa membaca `status`, `grade`, atau pesan `skipped`, sehingga
  kiriman yang ditolak server akan tetap dilaporkan "berhasil". Pakai mode
  default (`cors`) dengan `Content-Type: text/plain`.
- Baris siswa sudah tersimpan sebelum penataan warna/urutan; jika penataan gagal,
  nilai tetap masuk (respons tetap `ok`).

## Batas yang sudah diketahui

- **Urutan pakai `sort()`**: setiap kiriman mengurut ulang sheet kelas
  berdasarkan nomor absen. Aman untuk kelas (±40 siswa), tapi menambah ~1
  operasi API per kiriman.
- **`autoResizeColumn()` 13x per kiriman**: kosmetik dan bisa menambah waktu
  eksekusi bila sel-sel panjang. Sudah dibungkus `try/catch`, jadi kegagalannya
  tidak membatalkan nilai; hapus baris itu bila kuota waktu eksekusi terasa ketat.
- **Profil beban**: 275 siswa × ~1 kiriman = 275 eksekusi. Itu jauh di bawah
  kuota Apps Script harian (20.000 eksekusi/hari untuk akun konsumen), tetapi
  `LockService` membuat kiriman bersamaan diserialisasi — puncak serentak bisa
  terasa lambat, bukan gagal.
- **Nama ganda dalam satu kelas akan ditolak.** Ini disengaja (anti-timpa), tapi
  bila ada dua siswa bernama identik di kelas yang sama, siswa kedua harus
  diselesaikan manual oleh guru di spreadsheet.

## Uji tanpa Google

```bash
node VectorArena/apps-script/test-code-gs.cjs
```

Skrip itu meniru `SpreadsheetApp`, `PropertiesService`, `LockService`, dan
`ContentService` untuk memverifikasi 35 pemeriksaan: penyimpanan, KKM, durasi,
daftar soal salah, anti-timpa, IP NAT, validasi kelas, kontrol ujian, rekap GET,
perhitungan nilai di server, dan reset bank soal. Jalankan juga di CI.