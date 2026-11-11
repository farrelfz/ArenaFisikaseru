// ==========================================================================
// VECTORARENA - DATA RESMI 25 BUTIR SOAL TERKURASI (C1 - C4) — SEIMBANG 4 TOPIK
// Vektor(7) + GLB(6) + GLBB(6) + Kinematika Vertikal(6)
// ==========================================================================

const CURATED_25_QUESTIONS = [
  {
    "no": 1,
    "id": "VEC-01-001",
    "zoneId": 1,
    "zoneName": "Vector Fundamentals",
    "difficulty": 1,
    "bloom": "C2 (Pemahaman)",
    "question": "Kelompok besaran berikut yang seluruhnya merupakan besaran vektor adalah …",
    "options": [
      "energi, gaya, dan jarak",
      "usaha, daya, dan momentum",
      "kecepatan, gaya, dan perpindahan",
      "massa, waktu, dan suhu",
      "jarak, kelajuan, dan percepatan"
    ],
    "correctKey": "C",
    "correctAnswer": "kecepatan, gaya, dan perpindahan",
    "explanation": "Besaran vektor memiliki besar sekaligus arah. Kecepatan, gaya, dan perpindahan memenuhi keduanya. Jarak, kelajuan, massa, waktu, suhu, usaha, energi, dan daya adalah besaran skalar (hanya besar).",
    "diagram": null
  },
  {
    "no": 2,
    "id": "VEC-01-002",
    "zoneId": 1,
    "zoneName": "Vector Fundamentals",
    "difficulty": 1,
    "bloom": "C2 (Pemahaman)",
    "question": "Perhatikan besaran berikut: (1) berat, (2) massa, (3) kuat arus listrik, (4) impuls, (5) tekanan. Besaran yang tergolong vektor adalah …",
    "options": [
      "(2), (3), dan (5)",
      "(1), (3), dan (4)",
      "(1), (2), dan (4)",
      "(1) dan (4)",
      "(4) dan (5)"
    ],
    "correctKey": "D",
    "correctAnswer": "(1) dan (4)",
    "explanation": "Berat adalah gaya gravitasi (vektor), impuls adalah perubahan momentum (vektor). Massa adalah skalar. Kuat arus listrik dan tekanan diperlakukan sebagai skalar dalam kurikulum fisika SMA.",
    "diagram": null
  },
  {
    "no": 3,
    "id": "VEC-02-001",
    "zoneId": 2,
    "zoneName": "Vector Representation",
    "difficulty": 1,
    "bloom": "C2 (Pemahaman)",
    "question": "Pada sistem koordinat Kartesius, titik yang berada di kuadran II memiliki …",
    "options": [
      "x positif dan y positif",
      "x negatif dan y positif",
      "x positif dan y negatif",
      "x nol dan y positif",
      "x negatif dan y negatif"
    ],
    "correctKey": "B",
    "correctAnswer": "x negatif dan y positif",
    "explanation": "Kuadran I (+,+), II (−,+), III (−,−), IV (+,−). Kuadran II berarti x < 0 dan y > 0.",
    "diagram": null
  },
  {
    "no": 4,
    "id": "VEC-03-004",
    "zoneId": 3,
    "zoneName": "Vector Operations",
    "difficulty": 1,
    "bloom": "C2 (Pemahaman)",
    "question": "Pengurangan vektor A − B ekuivalen dengan …",
    "options": [
      "A + (−B)",
      "−(A + B)",
      "−A + B",
      "B − A",
      "A + B"
    ],
    "correctKey": "A",
    "correctAnswer": "A + (−B)",
    "explanation": "Mengurangi B sama dengan menambahkan vektor negatif B, yaitu vektor B yang dibalik arahnya.",
    "diagram": null
  },
  {
    "no": 5,
    "id": "VEC-03-007",
    "zoneId": 3,
    "zoneName": "Vector Operations",
    "difficulty": 2,
    "bloom": "C3 (Aplikasi)",
    "question": "Dua vektor A = 6i + 0j dan B = 0i + 8j (satuan SI). Besar resultan A + B adalah …",
    "options": [
      "2",
      "10",
      "48",
      "14"
    ],
    "correctKey": "B",
    "correctAnswer": "10",
    "explanation": "Resultan diperoleh dengan menjumlahkan komponen sejenis, lalu menghitung besarnya.",
    "diagram": null
  },
  {
    "no": 6,
    "id": "VEC-04-001",
    "zoneId": 4,
    "zoneName": "Geometrical Vector Methods",
    "difficulty": 1,
    "bloom": "C2 (Pemahaman)",
    "question": "Pada metode segitiga, resultan dua vektor diperoleh dengan cara …",
    "options": [
      "menggambar kedua vektor dari titik pangkal yang sama lalu menarik diagonal",
      "menjumlahkan panjang kedua panah tanpa memperhatikan arah",
      "menyambung ujung vektor pertama ke pangkal vektor kedua, lalu menarik vektor dari pangkal pertama ke ujung kedua",
      "memutar vektor pertama sebesar 90°",
      "membalik arah vektor kedua lalu menyambungkannya"
    ],
    "correctKey": "C",
    "correctAnswer": "menyambung ujung vektor pertama ke pangkal vektor kedua, lalu menarik vektor dari pangkal pertama ke ujung kedua",
    "explanation": "Metode segitiga menyambung vektor secara ujung-ke-pangkal; resultan menghubungkan titik awal ke titik akhir.",
    "diagram": null
  },
  {
    "no": 7,
    "id": "VEC-05-002",
    "zoneId": 5,
    "zoneName": "Vector Components",
    "difficulty": 1,
    "bloom": "C2 (Pemahaman)",
    "question": "Komponen vertikal (sumbu Y) dari vektor A yang membentuk sudut θ terhadap sumbu X positif adalah …",
    "options": [
      "A / cos θ",
      "A sin θ",
      "A / sin θ",
      "A cos θ",
      "A tan θ"
    ],
    "correctKey": "B",
    "correctAnswer": "A sin θ",
    "explanation": "Proyeksi pada sumbu Y berhadapan dengan sudut θ, sehingga digunakan sinus: Ay = A sin θ.",
    "diagram": null
  },
  {
    "no": 8,
    "id": "VEC-09-001",
    "zoneId": 9,
    "zoneName": "GLB — Gerak Lurus Beraturan",
    "difficulty": 1,
    "bloom": "C1 (Pengetahuan)",
    "question": "Sebuah mobil bergerak lurus dengan kecepatan konstan 20 m/s. Jarak yang ditempuh mobil selama 10 sekon adalah…",
    "options": [
      "100 m",
      "150 m",
      "200 m",
      "250 m",
      "400 m"
    ],
    "correctKey": "C",
    "correctAnswer": "200 m",
    "explanation": "Jarak dihitung dengan rumus s = v · t. Dengan v = 20 m/s dan t = 10 s, diperoleh s = 20 × 10 = 200 m. Jadi mobil menempuh jarak 200 meter.",
    "diagram": null
  },
  {
    "no": 9,
    "id": "VEC-09-007",
    "zoneId": 9,
    "zoneName": "GLB — Gerak Lurus Beraturan",
    "difficulty": 2,
    "bloom": "C2 (Pemahaman)",
    "question": "Pada grafik jarak terhadap waktu (s–t), gerak lurus beraturan digambarkan oleh…",
    "options": [
      "garis lurus dengan kemiringan tetap",
      "garis mendatar sejajar sumbu waktu",
      "kurva melengkung ke atas",
      "parabola terbuka ke atas",
      "garis zig-zag"
    ],
    "correctKey": "A",
    "correctAnswer": "garis lurus dengan kemiringan tetap",
    "explanation": "Pada GLB, jarak bertambah secara merata terhadap waktu sehingga grafik s–t berupa garis lurus. Kemiringan garis yang tetap menunjukkan kecepatan konstan. Garis mendatar justru menunjukkan benda diam.",
    "diagram": null
  },
  {
    "no": 10,
    "id": "VEC-09-008",
    "zoneId": 9,
    "zoneName": "GLB — Gerak Lurus Beraturan",
    "difficulty": 2,
    "bloom": "C2 (Pemahaman)",
    "question": "Pada grafik kecepatan terhadap waktu (v–t), gerak lurus beraturan digambarkan oleh…",
    "options": [
      "garis mendatar sejajar sumbu waktu",
      "garis lurus menanjak",
      "garis lurus menurun",
      "parabola terbuka ke atas",
      "kurva melengkung ke bawah"
    ],
    "correctKey": "A",
    "correctAnswer": "garis mendatar sejajar sumbu waktu",
    "explanation": "Pada GLB, kecepatan benda tetap sehingga pada grafik v–t nilai kecepatan tidak berubah terhadap waktu. Hal ini digambarkan oleh garis mendatar yang sejajar sumbu waktu. Ketinggian garis menyatakan besar kecepatan konstan tersebut.",
    "diagram": null
  },
  {
    "no": 11,
    "id": "VEC-09-014",
    "zoneId": 9,
    "zoneName": "GLB — Gerak Lurus Beraturan",
    "difficulty": 3,
    "bloom": "C3 (Aplikasi)",
    "question": "Sebuah mobil menempuh 36 km dalam 0,5 jam, kemudian melanjutkan 54 km dalam 1,5 jam. Kelajuan rata-rata mobil untuk seluruh perjalanan adalah…",
    "options": [
      "40 km/jam",
      "45 km/jam",
      "50 km/jam",
      "54 km/jam",
      "60 km/jam"
    ],
    "correctKey": "B",
    "correctAnswer": "45 km/jam",
    "explanation": "Total jarak = 36 + 54 = 90 km dan total waktu = 0,5 + 1,5 = 2 jam. Kelajuan rata-rata adalah 90/2 = 45 km/jam. Jadi kelajuan rata-rata mobil adalah 45 km/jam.",
    "diagram": null
  },
  {
    "no": 12,
    "id": "VEC-09-015",
    "zoneId": 9,
    "zoneName": "GLB — Gerak Lurus Beraturan",
    "difficulty": 3,
    "bloom": "C3 (Aplikasi)",
    "question": "Sebuah benda bergerak lurus beraturan menempuh 250 m dalam 20 sekon. Kelajuan benda tersebut dalam satuan km/jam adalah…",
    "options": [
      "12,5 km/jam",
      "25 km/jam",
      "45 km/jam",
      "50 km/jam",
      "90 km/jam"
    ],
    "correctKey": "C",
    "correctAnswer": "45 km/jam",
    "explanation": "Kelajuan dalam m/s adalah v = 250/20 = 12,5 m/s. Untuk mengubah ke km/jam, kalikan 3,6 sehingga 12,5 × 3,6 = 45 km/jam. Jadi kelajuan benda adalah 45 km/jam.",
    "diagram": null
  },
  {
    "no": 13,
    "id": "VEC-09-021",
    "zoneId": 9,
    "zoneName": "GLB — Gerak Lurus Beraturan",
    "difficulty": 4,
    "bloom": "C4 (Analisis)",
    "question": "Sebuah mobil menempuh perjalanan dari A ke B dengan kelajuan 40 km/jam, lalu kembali dari B ke A dengan kelajuan 60 km/jam melalui lintasan yang sama. Kelajuan rata-rata seluruh perjalanan adalah…",
    "options": [
      "45 km/jam",
      "48 km/jam",
      "50 km/jam",
      "52 km/jam",
      "55 km/jam"
    ],
    "correctKey": "B",
    "correctAnswer": "48 km/jam",
    "explanation": "Untuk lintasan pulang-pergi yang sama, kelajuan rata-rata dihitung sebagai 2/(1/40 + 1/60) = 2/(3/120 + 2/120) = 2/(5/120) = 2 × 120/5 = 48 km/jam. Jadi kelajuan rata-rata mobil adalah 48 km/jam.",
    "diagram": null
  },
  {
    "no": 14,
    "id": "VEC-10-001",
    "zoneId": 10,
    "zoneName": "GLBB — Gerak Lurus Berubah Beraturan",
    "difficulty": 1,
    "bloom": "C1 (Pengetahuan)",
    "question": "Sebuah mobil melaju lurus dan kecepatannya bertambah dari 10 m/s menjadi 30 m/s dalam waktu 4 sekon. Besar percepatan mobil tersebut adalah …",
    "options": [
      "2 m/s²",
      "3 m/s²",
      "4 m/s²",
      "5 m/s²",
      "10 m/s²"
    ],
    "correctKey": "D",
    "correctAnswer": "5 m/s²",
    "explanation": "Percepatan dihitung dari perubahan kecepatan dibagi selang waktu, a = (30 − 10) / 4 = 20 / 4 = 5 m/s².",
    "diagram": null
  },
  {
    "no": 15,
    "id": "VEC-10-007",
    "zoneId": 10,
    "zoneName": "GLBB — Gerak Lurus Berubah Beraturan",
    "difficulty": 2,
    "bloom": "C2 (Pemahaman)",
    "question": "Sebuah mobil melaju 25 m/s lalu direm dengan perlambatan tetap 5 m/s². Kecepatan mobil setelah 3 sekon pengereman adalah …",
    "options": [
      "5 m/s",
      "10 m/s",
      "15 m/s",
      "20 m/s",
      "25 m/s"
    ],
    "correctKey": "B",
    "correctAnswer": "10 m/s",
    "explanation": "Perlambatan berarti a = −5 m/s², sehingga v = 25 − 5 × 3 = 25 − 15 = 10 m/s.",
    "diagram": null
  },
  {
    "no": 16,
    "id": "VEC-10-008",
    "zoneId": 10,
    "zoneName": "GLBB — Gerak Lurus Berubah Beraturan",
    "difficulty": 2,
    "bloom": "C2 (Pemahaman)",
    "question": "Sebuah benda bergerak lurus berubah beraturan dengan kecepatan awal 6 m/s dan percepatan 2 m/s². Setelah menempuh 16 m, kecepatannya menjadi …",
    "options": [
      "8 m/s",
      "10 m/s",
      "12 m/s",
      "14 m/s",
      "16 m/s"
    ],
    "correctKey": "B",
    "correctAnswer": "10 m/s",
    "explanation": "v² = 6² + 2 × 2 × 16 = 36 + 64 = 100, sehingga v = √100 = 10 m/s.",
    "diagram": null
  },
  {
    "no": 17,
    "id": "VEC-10-014",
    "zoneId": 10,
    "zoneName": "GLBB — Gerak Lurus Berubah Beraturan",
    "difficulty": 3,
    "bloom": "C3 (Aplikasi)",
    "question": "Sebuah mobil dipercepat 3 m/s² pada lintasan lurus sejauh 50 m hingga mencapai 20 m/s. Kecepatan awal mobil tersebut adalah …",
    "options": [
      "5 m/s",
      "10 m/s",
      "15 m/s",
      "20 m/s",
      "25 m/s"
    ],
    "correctKey": "B",
    "correctAnswer": "10 m/s",
    "explanation": "v₀² = v² − 2·a·s = 20² − 2 × 3 × 50 = 400 − 300 = 100, sehingga v₀ = 10 m/s.",
    "diagram": null
  },
  {
    "no": 18,
    "id": "VEC-10-015",
    "zoneId": 10,
    "zoneName": "GLBB — Gerak Lurus Berubah Beraturan",
    "difficulty": 3,
    "bloom": "C3 (Aplikasi)",
    "question": "Sebuah benda dari keadaan diam dipercepat 2 m/s². Jarak yang ditempuh benda tepat pada detik kelima (selang t = 4 s sampai t = 5 s) adalah …",
    "options": [
      "5 m",
      "7 m",
      "9 m",
      "11 m",
      "15 m"
    ],
    "correctKey": "C",
    "correctAnswer": "9 m",
    "explanation": "s(5) = ½ × 2 × 25 = 25 m dan s(4) = ½ × 2 × 16 = 16 m, sehingga jarak pada detik kelima = 25 − 16 = 9 m.",
    "diagram": null
  },
  {
    "no": 19,
    "id": "VEC-10-021",
    "zoneId": 10,
    "zoneName": "GLBB — Gerak Lurus Berubah Beraturan",
    "difficulty": 4,
    "bloom": "C4 (Analisis)",
    "question": "Sebuah benda bergerak lurus dengan kecepatan awal 8 m/s dan percepatan 2 m/s². Jarak yang ditempuh tepat pada detik keenam (selang t = 5 s sampai t = 6 s) adalah …",
    "options": [
      "15 m",
      "17 m",
      "19 m",
      "21 m",
      "23 m"
    ],
    "correctKey": "C",
    "correctAnswer": "19 m",
    "explanation": "s(6) = 8 × 6 + ½ × 2 × 36 = 84 m dan s(5) = 8 × 5 + ½ × 2 × 25 = 65 m, sehingga jarak detik keenam = 19 m.",
    "diagram": null
  },
  {
    "no": 20,
    "id": "VEC-06-005",
    "zoneId": 6,
    "zoneName": "GVA — Gerak Vertikal ke Atas",
    "difficulty": 2,
    "bloom": "C3 (Aplikasi)",
    "question": "Pernyataan yang benar tentang massa benda pada GVA (ideal) adalah …",
    "options": [
      "benda lebih ringan memiliki percepatan lebih besar",
      "benda lebih berat mencapai ketinggian lebih besar",
      "massa memperbesar percepatan gravitasi",
      "massa tidak memengaruhi waktu tempuh maupun ketinggian maksimum",
      "massa menentukan arah gerak benda"
    ],
    "correctKey": "D",
    "correctAnswer": "massa tidak memengaruhi waktu tempuh maupun ketinggian maksimum",
    "explanation": "Semua benda mengalami percepatan gravitasi sama besarnya sehingga gerak ideal tidak bergantung massa.",
    "diagram": null
  },
  {
    "no": 21,
    "id": "VEC-06-009",
    "zoneId": 6,
    "zoneName": "GVA — Gerak Vertikal ke Atas",
    "difficulty": 2,
    "bloom": "C3 (Aplikasi)",
    "question": "Sebuah bola dilempar vertikal ke atas dengan kecepatan awal 20 m/s dari permukaan tanah (g = 10 m/s², hambatan udara diabaikan). Waktu yang diperlukan untuk mencapai titik tertinggi adalah … sekon.",
    "options": [
      "4",
      "5",
      "2",
      "200"
    ],
    "correctKey": "C",
    "correctAnswer": "2",
    "explanation": "Di titik tertinggi v = 0, sehingga 0 = v₀ − gt dan t = v₀/g.",
    "diagram": {
      "type": "gva",
      "params": {
        "v0": 20,
        "y0": 0,
        "g": 10
      }
    }
  },
  {
    "no": 22,
    "id": "VEC-07-002",
    "zoneId": 7,
    "zoneName": "GVB — Gerak Vertikal ke Bawah",
    "difficulty": 1,
    "bloom": "C2 (Pemahaman)",
    "question": "Pada GVB, kelajuan benda …",
    "options": [
      "bertambah lalu berkurang",
      "berkurang karena melawan gravitasi",
      "berkurang setelah mencapai titik terendah",
      "bertambah karena percepatan gravitasi searah dengan gerak",
      "tetap karena tidak ada gaya"
    ],
    "correctKey": "D",
    "correctAnswer": "bertambah karena percepatan gravitasi searah dengan gerak",
    "explanation": "Arah gerak dan arah percepatan sama-sama ke bawah, sehingga kelajuan bertambah.",
    "diagram": null
  },
  {
    "no": 23,
    "id": "VEC-07-009",
    "zoneId": 7,
    "zoneName": "GVB — Gerak Vertikal ke Bawah",
    "difficulty": 2,
    "bloom": "C3 (Aplikasi)",
    "question": "Benda dilempar vertikal ke bawah dengan kecepatan  awal 5 m/s dari ketinggian 20 m (g = 10 m/s²). Kecepatan benda saat tiba di tanah adalah … m/s.",
    "options": [
      "5",
      "205",
      "20,616",
      "200"
    ],
    "correctKey": "C",
    "correctAnswer": "20,616",
    "explanation": "Gunakan vₜ² = v₀² + 2gh. Perhatikan bahwa v₀ tidak boleh diabaikan.",
    "diagram": {
      "type": "gvb",
      "params": {
        "v0": 5,
        "h": 20,
        "g": 10
      }
    }
  },
  {
    "no": 24,
    "id": "VEC-08-002",
    "zoneId": 8,
    "zoneName": "GJB — Gerak Jatuh Bebas",
    "difficulty": 1,
    "bloom": "C2 (Pemahaman)",
    "question": "Pada GJB ideal, besaran yang memengaruhi waktu jatuh adalah …",
    "options": [
      "volume benda dan suhu udara",
      "massa dan berat benda",
      "ketinggian dan percepatan gravitasi",
      "kecepatan awal dan massa",
      "bentuk dan warna benda"
    ],
    "correctKey": "C",
    "correctAnswer": "ketinggian dan percepatan gravitasi",
    "explanation": "t = √(2h/g) hanya bergantung pada h dan g. Massa tidak berpengaruh pada GJB ideal.",
    "diagram": null
  },
  {
    "no": 25,
    "id": "VEC-08-009",
    "zoneId": 8,
    "zoneName": "GJB — Gerak Jatuh Bebas",
    "difficulty": 1,
    "bloom": "C2 (Pemahaman)",
    "question": "Benda dijatuhkan tanpa kecepatan awal dari ketinggian 5 m (g = 10 m/s²). Waktu benda menyentuh tanah adalah … sekon.",
    "options": [
      "1",
      "2",
      "0,707",
      "0,316"
    ],
    "correctKey": "A",
    "correctAnswer": "1",
    "explanation": "GJB mulai dari v₀ = 0 sehingga h = ½gt². Dengan h = 5 m diperoleh t = √(2h/g) = √(1) ≈ 1 s.",
    "diagram": {
      "type": "gjb",
      "params": {
        "h": 5,
        "g": 10
      }
    }
  }
];

if (typeof module !== "undefined" && module.exports) {
    module.exports = { CURATED_25_QUESTIONS };
}
