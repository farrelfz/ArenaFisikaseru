# Matriks Peran dan Hak Akses

Dokumen ini menetapkan batas kewenangan setiap peran dalam sistem HydroArena. Perubahan pada matriks ini harus disertai pembaruan pada `js/modules/exam.js` dan `js/modules/teacherAdmin.js`.

---

## 1. Definisi Peran

| Peran | Identitas | Cakupan |
|---|---|---|
| **Siswa** | Nama lengkap + kelas (XI A–XI F) + nomor absen (1–40), diverifikasi terhadap kunci IP perangkat | Hanya data dirinya sendiri dan klasemen publik |
| **Guru / Administrator Utama** | Kode akses (PIN) rahasia, sesi tersimpan pada `sessionStorage` | Seluruh data evaluasi, konfigurasi sesi, dan rekapitulasi |

Tidak ada peran ketiga. Guru bersifat tunggal (*single-admin*), bukan multi-tingkat.

---

## 2. Matriks Kewenangan

### 2.1 Akses Ujian

| Tindakan | Siswa | Guru |
|---|:---:|:---:|
| Membuka portal evaluasi | ✅ | ✅ |
| Melihat spesifikasi ujian (jumlah soal, durasi, bobot) | ✅ | ✅ |
| Melihat cakupan materi | ✅ | ✅ |
| Memulai sesi ujian baru | ✅ | ⛔ |
| Meninjau lembar ujian yang sedang berjalan | ✅ | ⛔ |
| Melihat klasemen publik | ✅ | ✅ |

### 2.2 Pengerjaan Soal

| Tindakan | Siswa | Guru |
|---|:---:|:---:|
| Membaca teks soal dan diagram | ✅ | ✅ |
| Memilih opsi jawaban | ✅ | ⛔ |
| Mengubah jawaban sebelum submit | ✅ | ⛔ |
| Menandai butir sebagai ragu-ragu | ✅ | ⛔ |
| Berpindah antar butir soal | ✅ | ⛔ |
| Mengumpulkan lembar jawaban | ✅ | ⛔ |
| Memperpanjang waktu pengerjaan | ⛔ | ⛔ |

### 2.3 Hasil dan Pembahasan

| Tindakan | Siswa | Guru |
|---|:---:|:---:|
| Melihat nilai akademik pribadi | ✅ | ✅ |
| Melihat rincian skor dasar dan bonus kecepatan | ✅ | ✅ |
| Melihat pembahasan butir soal | ⚠️ bergantung saklar guru | ✅ |
| Melihat nilai siswa lain secara individual | ⛔ | ✅ |
| Mengubah nilai siswa | ⛔ | ⛔ |
| Menghapus rekaman siswa | ⛔ | ✅ |

> ⚠️ Pembahasan hanya terbuka bagi siswa bila saklar **Kunci Jawaban & Pembahasan** berada pada posisi *Diizinkan*.

### 2.4 Kontrol Sesi

| Tindakan | Siswa | Guru |
|---|:---:|:---:|
| Membuka pendaftaran ujian | ⛔ | ✅ |
| Menutup pendaftaran ujian | ⛔ | ✅ |
| Membuka/mengunci pembahasan | ⛔ | ✅ |
| Membuka kunci IP siswa tertentu | ⛔ | ✅ |
| Membuka kunci IP perangkat sendiri | ⛔ | ✅ |
| Mereset seluruh data lokal | ⛔ | ✅ |

### 2.5 Data dan Pelaporan

| Tindakan | Siswa | Guru |
|---|:---:|:---:|
| Melihat rekapitulasi per kelas (XI A–XI F) | ⛔ | ✅ |
| Melihat analisis butir soal tersulit | ⛔ | ✅ |
| Melihat jumlah pelanggaran fokus per siswa | ⛔ | ✅ |
| Mengekspor rekapitulasi CSV | ⛔ | ✅ |
| Mengonfigurasi URL Apps Script | ⛔ | ✅ |

### 2.6 Keamanan

| Tindakan | Siswa | Guru |
|---|:---:|:---:|
| Mengganti kode akses administrator | ⛔ | ✅ |
| Melihat PIN dalam bentuk teks biasa | ⛔ | ⚠️ hanya saat mengisi form |
| Membuka panel administrator tanpa PIN | ⛔ | ⛔ |

---

## 3. Aturan Integritas Akademik

1. **Satu perangkat, satu percobaan.** Alamat IP dikunci setelah pengumpulan. Pengulangan hanya dapat dibuka oleh guru.
2. **Pemantauan fokus.** Setiap perpindahan tab atau jendela selama ujian dicatat dan dilaporkan pada panel guru.
3. **Pengacakan ganda.** Urutan butir soal dan urutan opsi jawaban diacak per sesi untuk mengurangi potensi penyalinan.
4. **Pengumpulan otomatis.** Saat waktu habis, lembar jawaban dikumpulkan tanpa intervensi siswa.

---

## 4. Model Keamanan

Aplikasi ini berjalan sepenuhnya di sisi klien tanpa backend. Konsekuensi yang harus dipahami penyelenggara:

| Aspek | Kondisi |
|---|---|
| PIN guru | Disimpan di `localStorage` peramban, bukan di server |
| Sesi guru | Disimpan di `sessionStorage`; berakhir saat tab ditutup |
| Data nilai | Disimpan di `localStorage` dan opsional dikirim ke Google Sheets |
| Ketahanan manipulasi | **Terbatas** — pengguna teknis dapat memodifikasi `localStorage` melalui DevTools |

**Rekomendasi:** gunakan aplikasi ini sebagai instrumen evaluasi formatif di ruang kelas dengan pengawasan langsung. Untuk penilaian sumatif berskala besar atau berisiko tinggi, tambahkan backend autentikasi dan penyimpanan terpusat.
