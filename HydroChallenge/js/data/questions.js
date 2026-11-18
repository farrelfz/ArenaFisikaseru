// ==========================================================================
// HYDRO CHALLENGE — BANK 15 BUTIR SOAL TERKURASI
// Fokus tunggal: pipa horizontal menyempit (kontinuitas + Bernoulli),
// tabung venturi, manometer, dan penyemprot cairan (atomizer).
// Komposisi tingkat: 4 Mudah • 6 Sedang • 5 Sulit/HOTS
// ==========================================================================

const MASTER_QUESTIONS = [
    {
        id: "Q01",
        num: 1,
        level: "Mudah",
        topic: "Persamaan Kontinuitas",
        diagram: SVG_PIPE_NARROW,
        question: "Air mengalir dalam pipa horizontal yang menyempit. Pada bagian pertama, luas penampang A<sub>1</sub> = 24 cm<sup>2</sup> dan kecepatan aliran v<sub>1</sub> = 2 m/s. Pada bagian kedua, luas penampang A<sub>2</sub> = 8 cm<sup>2</sup>. Kecepatan aliran air pada bagian kedua adalah ....",
        options: ["6 m/s", "4 m/s", "8 m/s", "3 m/s", "1,5 m/s"],
        correctIndex: 0,
        explanation: "Persamaan kontinuitas untuk fluida tak termampatkan: A<sub>1</sub>·v<sub>1</sub> = A<sub>2</sub>·v<sub>2</sub>. Maka v<sub>2</sub> = (A<sub>1</sub>/A<sub>2</sub>)·v<sub>1</sub> = (24/8) × 2 = 3 × 2 = <strong>6 m/s</strong>. Penampang mengecil tiga kali, sehingga kecepatan bertambah tiga kali."
    },
    {
        id: "Q02",
        num: 2,
        level: "Mudah",
        topic: "Asas Bernoulli",
        diagram: SVG_PIPE_NARROW,
        question: "Pada pipa horizontal yang menyempit, air berpindah dari bagian lebar (bagian 1) ke bagian sempit (bagian 2). Pernyataan yang benar mengenai kecepatan aliran dan tekanan statis air adalah ....",
        options: [
            "Kecepatan aliran berkurang dan tekanan statis bertambah",
            "Kecepatan aliran bertambah dan tekanan statis bertambah",
            "Kecepatan aliran bertambah dan tekanan statis berkurang",
            "Kecepatan aliran tetap dan tekanan statis berkurang",
            "Kecepatan aliran berkurang dan tekanan statis tetap"
        ],
        correctIndex: 2,
        explanation: "Karena A<sub>2</sub> &lt; A<sub>1</sub>, persamaan kontinuitas memberi v<sub>2</sub> &gt; v<sub>1</sub> (kecepatan bertambah). Pada pipa horizontal berlaku P + ½ρv<sup>2</sup> = konstan. Jika v bertambah, maka P harus berkurang. Jadi kecepatan bertambah dan tekanan statis berkurang."
    },
    {
        id: "Q03",
        num: 3,
        level: "Mudah",
        topic: "Asas Bernoulli",
        diagram: SVG_PIPE_NARROW,
        question: "Air mengalir pada pipa horizontal dengan A<sub>1</sub> = 24 cm<sup>2</sup>, v<sub>1</sub> = 2 m/s, dan A<sub>2</sub> = 8 cm<sup>2</sup>. Jika massa jenis air 1.000 kg/m<sup>3</sup>, selisih tekanan statis antara bagian pertama dan bagian kedua (P<sub>1</sub> − P<sub>2</sub>) adalah ....",
        options: ["8.000 Pa", "16.000 Pa", "32.000 Pa", "4.000 Pa", "64.000 Pa"],
        correctIndex: 1,
        explanation: "Dari kontinuitas: v<sub>2</sub> = (24/8) × 2 = 6 m/s. Pada pipa horizontal, P<sub>1</sub> − P<sub>2</sub> = ½ρ(v<sub>2</sub><sup>2</sup> − v<sub>1</sub><sup>2</sup>) = ½ × 1.000 × (6<sup>2</sup> − 2<sup>2</sup>) = 500 × (36 − 4) = 500 × 32 = <strong>16.000 Pa</strong>."
    },
    {
        id: "Q04",
        num: 4,
        level: "Mudah",
        topic: "Penyemprot Cairan",
        diagram: SVG_SPRAYER,
        question: "Sebuah alat penyemprot cairan menggunakan aliran udara yang melewati ujung pipa sempit. Pipa kecil lain menghubungkan wadah cairan dengan daerah aliran udara tersebut. Mengapa cairan dapat naik melalui pipa kecil itu?",
        options: [
            "Karena tekanan udara di ujung pipa sempit lebih rendah daripada tekanan atmosfer di permukaan cairan",
            "Karena tekanan udara di ujung pipa sempit lebih tinggi daripada tekanan atmosfer di permukaan cairan",
            "Karena massa jenis udara lebih besar daripada massa jenis cairan",
            "Karena udara mendorong cairan secara langsung dari dasar wadah",
            "Karena suhu udara di ujung sempit turun sehingga cairan mengembun"
        ],
        correctIndex: 0,
        explanation: "Udara yang dipercepat di ujung sempit memiliki tekanan statis lebih rendah (asas Bernoulli). Permukaan cairan di wadah masih berada pada tekanan atmosfer yang lebih tinggi. Selisih tekanan ini mendorong cairan naik melalui pipa kecil menuju daerah bertekanan rendah, lalu cairan terpecah menjadi butiran oleh aliran udara."
    },
    {
        id: "Q05",
        num: 5,
        level: "Sedang",
        topic: "Asas Bernoulli",
        diagram: SVG_PIPE_NARROW,
        question: "Air mengalir dalam pipa horizontal yang menyempit. Pada bagian pertama, A<sub>1</sub> = 24 cm<sup>2</sup>, v<sub>1</sub> = 2 m/s, dan P<sub>1</sub> = 220.000 Pa. Pada bagian kedua, A<sub>2</sub> = 8 cm<sup>2</sup>. Jika ρ<sub>air</sub> = 1.000 kg/m<sup>3</sup>, tekanan pada bagian kedua (P<sub>2</sub>) adalah ....",
        options: ["188.000 Pa", "196.000 Pa", "220.000 Pa", "236.000 Pa", "204.000 Pa"],
        correctIndex: 4,
        explanation: "Kontinuitas: v<sub>2</sub> = (A<sub>1</sub>/A<sub>2</sub>)·v<sub>1</sub> = 3 × 2 = 6 m/s. Bernoulli pada pipa horizontal: P<sub>2</sub> = P<sub>1</sub> − ½ρ(v<sub>2</sub><sup>2</sup> − v<sub>1</sub><sup>2</sup>) = 220.000 − 500 × (36 − 4) = 220.000 − 16.000 = <strong>204.000 Pa</strong>."
    },
    {
        id: "Q06",
        num: 6,
        level: "Sedang",
        topic: "Kontinuitas & Bernoulli",
        diagram: SVG_PIPE_NARROW,
        question: "Air mengalir melalui pipa horizontal dari bagian dengan A<sub>1</sub> = 16 cm<sup>2</sup> ke bagian dengan A<sub>2</sub> = 4 cm<sup>2</sup>. Kecepatan pada bagian pertama v<sub>1</sub> = 2 m/s dan tekanannya P<sub>1</sub> = 180.000 Pa. Jika ρ<sub>air</sub> = 1.000 kg/m<sup>3</sup>, tekanan pada bagian kedua adalah ....",
        options: ["120.000 Pa", "150.000 Pa", "180.000 Pa", "165.000 Pa", "135.000 Pa"],
        correctIndex: 1,
        explanation: "Kontinuitas: v<sub>2</sub> = (16/4) × 2 = 8 m/s. Bernoulli pipa horizontal: P<sub>2</sub> = P<sub>1</sub> − ½ρ(v<sub>2</sub><sup>2</sup> − v<sub>1</sub><sup>2</sup>) = 180.000 − 500 × (64 − 4) = 180.000 − 30.000 = <strong>150.000 Pa</strong>."
    },
    {
        id: "Q07",
        num: 7,
        level: "Sedang",
        topic: "Tabung Venturi",
        diagram: SVG_VENTURI_TUBES,
        question: "Sebuah tabung venturi horizontal dialiri air. Pada bagian lebar, kecepatan air 1 m/s; pada bagian sempit, kecepatan air 2 m/s. Dua pipa vertikal terbuka dipasang pada kedua bagian tersebut. Selisih tinggi permukaan air pada kedua pipa vertikal adalah .... (ρ<sub>air</sub> = 1.000 kg/m<sup>3</sup>, g = 10 m/s<sup>2</sup>)",
        options: ["7,5 cm", "10 cm", "15 cm", "20 cm", "30 cm"],
        correctIndex: 2,
        explanation: "Selisih tekanan: ΔP = ½ρ(v<sub>2</sub><sup>2</sup> − v<sub>1</sub><sup>2</sup>) = 500 × (4 − 1) = 1.500 Pa. Pada pipa vertikal terbuka, selisih tinggi kolom air memenuhi ΔP = ρ·g·h, sehingga h = ΔP/(ρg) = 1.500/(1.000 × 10) = 0,15 m = <strong>15 cm</strong>."
    },
    {
        id: "Q08",
        num: 8,
        level: "Sedang",
        topic: "Penyemprot Cairan",
        diagram: SVG_SPRAYER,
        question: "Sebuah alat penyemprot cairan menggunakan aliran udara yang melewati ujung pipa sempit. Pipa kecil lain menghubungkan wadah cairan dengan daerah aliran udara tersebut. Perhatikan pernyataan berikut.<br><br>(1) Penyempitan saluran dapat meningkatkan kecepatan udara.<br>(2) Peningkatan kecepatan udara dapat menurunkan tekanan statis.<br>(3) Perbedaan tekanan dapat menyebabkan cairan bergerak naik melalui pipa kecil.<br>(4) Jika aliran udara berhenti, cairan tetap naik dengan mekanisme yang sama.<br>(5) Rancangan alat harus mempertimbangkan posisi ujung pipa cairan terhadap daerah bertekanan rendah.<br><br>Pernyataan yang benar adalah ....",
        options: [
            "(1), (2), (3), dan (5)",
            "(1), (2), dan (4)",
            "(1), (3), dan (4)",
            "(2), (3), dan (4)",
            "(1), (2), (3), (4), dan (5)"
        ],
        correctIndex: 0,
        explanation: "Pernyataan (1), (2), (3), dan (5) benar. Penyempitan menaikkan kecepatan udara (kontinuitas), kecepatan tinggi menurunkan tekanan statis (Bernoulli), dan selisih tekanan mengangkat cairan. Pernyataan (4) salah: jika aliran udara berhenti, tidak ada lagi daerah bertekanan rendah, sehingga cairan tidak terangkat dan kembali ke permukaan wadah karena gravitasi."
    },
    {
        id: "Q09",
        num: 9,
        level: "Sedang",
        topic: "Penyemprot Cairan",
        diagram: SVG_SPRAYER,
        question: "Udara mengalir melalui saluran penyemprot dari bagian lebar dengan v<sub>1</sub> = 2 m/s menuju ujung sempit dengan v<sub>2</sub> = 10 m/s. Jika massa jenis udara 1,2 kg/m<sup>3</sup>, penurunan tekanan statis udara antara kedua bagian tersebut adalah ....",
        options: ["28,8 Pa", "48,0 Pa", "57,6 Pa", "115,2 Pa", "72,0 Pa"],
        correctIndex: 2,
        explanation: "Untuk udara yang mengalir horizontal: P<sub>1</sub> − P<sub>2</sub> = ½ρ<sub>udara</sub>(v<sub>2</sub><sup>2</sup> − v<sub>1</sub><sup>2</sup>) = ½ × 1,2 × (10<sup>2</sup> − 2<sup>2</sup>) = 0,6 × (100 − 4) = 0,6 × 96 = <strong>57,6 Pa</strong>."
    },
    {
        id: "Q10",
        num: 10,
        level: "Sedang",
        topic: "Penyemprot Cairan",
        diagram: SVG_SPRAYER,
        question: "Pada sebuah penyemprot, perbedaan tekanan antara permukaan cairan di wadah (tekanan atmosfer) dan daerah bertekanan rendah di ujung pipa sempit adalah 800 Pa. Jika massa jenis cairan 1.000 kg/m<sup>3</sup> dan g = 10 m/s<sup>2</sup>, tinggi cairan yang dapat naik melalui pipa kecil adalah ....",
        options: ["4 cm", "8 cm", "12 cm", "16 cm", "20 cm"],
        correctIndex: 1,
        explanation: "Cairan naik sampai tekanan hidrostatis kolomnya mengimbangi selisih tekanan: ΔP = ρ·g·h. Maka h = ΔP/(ρg) = 800/(1.000 × 10) = 0,08 m = <strong>8 cm</strong>."
    },
    {
        id: "Q11",
        num: 11,
        level: "Sulit",
        topic: "Manometer Venturi",
        diagram: SVG_VENTURI_MANOMETER,
        question: "Sebuah venturi meter horizontal dihubungkan dengan manometer U berisi raksa (ρ<sub>raksa</sub> = 13.600 kg/m<sup>3</sup>). Air mengalir dengan v<sub>1</sub> = 2 m/s pada bagian lebar dan v<sub>2</sub> = 6 m/s pada bagian sempit. Jika ρ<sub>air</sub> = 1.000 kg/m<sup>3</sup> dan g = 10 m/s<sup>2</sup>, selisih tinggi permukaan raksa pada kedua kaki manometer adalah ....",
        options: ["12,7 cm", "6,3 cm", "9,5 cm", "19,0 cm", "25,4 cm"],
        correctIndex: 0,
        explanation: "Selisih tekanan air: ΔP = ½ρ<sub>air</sub>(v<sub>2</sub><sup>2</sup> − v<sub>1</sub><sup>2</sup>) = 500 × (36 − 4) = 16.000 Pa. Pada manometer U berisi raksa, ΔP = (ρ<sub>raksa</sub> − ρ<sub>air</sub>)·g·Δh. Maka Δh = 16.000/((13.600 − 1.000) × 10) = 16.000/126.000 ≈ 0,127 m = <strong>12,7 cm</strong>."
    },
    {
        id: "Q12",
        num: 12,
        level: "Sulit",
        topic: "Kontinuitas & Bernoulli",
        diagram: SVG_PIPE_NARROW,
        question: "Air mengalir melalui pipa horizontal dengan debit 4 L/s. Luas penampang bagian pertama 100 cm<sup>2</sup> dan bagian kedua 20 cm<sup>2</sup>. Jika ρ<sub>air</sub> = 1.000 kg/m<sup>3</sup>, selisih tekanan statis antara bagian pertama dan bagian kedua adalah ....",
        options: ["960 Pa", "1.600 Pa", "3.840 Pa", "4.800 Pa", "1.920 Pa"],
        correctIndex: 4,
        explanation: "Debit Q = 4 L/s = 4 × 10<sup>−3</sup> m<sup>3</sup>/s. Kecepatan: v<sub>1</sub> = Q/A<sub>1</sub> = 4 × 10<sup>−3</sup>/(100 × 10<sup>−4</sup>) = 0,4 m/s dan v<sub>2</sub> = Q/A<sub>2</sub> = 4 × 10<sup>−3</sup>/(20 × 10<sup>−4</sup>) = 2,0 m/s. Maka ΔP = ½ρ(v<sub>2</sub><sup>2</sup> − v<sub>1</sub><sup>2</sup>) = 500 × (4,0 − 0,16) = 500 × 3,84 = <strong>1.920 Pa</strong>."
    },
    {
        id: "Q13",
        num: 13,
        level: "Sulit",
        topic: "Asas Bernoulli",
        diagram: SVG_PIPE_THREE,
        question: "Air mengalir pada pipa horizontal yang mula-mula menyempit lalu melebar kembali. Diketahui A<sub>1</sub> = 24 cm<sup>2</sup>, v<sub>1</sub> = 2 m/s, A<sub>2</sub> = 8 cm<sup>2</sup>, dan A<sub>3</sub> = 24 cm<sup>2</sup>. Jika P<sub>1</sub> = 220.000 Pa dan tidak ada kehilangan energi, tekanan pada bagian ketiga (P<sub>3</sub>) adalah ....",
        options: ["188.000 Pa", "204.000 Pa", "212.000 Pa", "220.000 Pa", "236.000 Pa"],
        correctIndex: 3,
        explanation: "Karena A<sub>3</sub> = A<sub>1</sub>, kontinuitas memberi v<sub>3</sub> = v<sub>1</sub> = 2 m/s. Pada ketinggian yang sama dan tanpa kehilangan energi, Bernoulli memberi P<sub>3</sub> + ½ρv<sub>3</sub><sup>2</sup> = P<sub>1</sub> + ½ρv<sub>1</sub><sup>2</sup>. Karena v<sub>3</sub> = v<sub>1</sub>, maka <strong>P<sub>3</sub> = P<sub>1</sub> = 220.000 Pa</strong>. Tekanan sempat turun di bagian sempit (204.000 Pa), lalu pulih saat pipa melebar kembali."
    },
    {
        id: "Q14",
        num: 14,
        level: "Sulit",
        topic: "Tabung Venturi",
        diagram: SVG_PIPE_NARROW,
        question: "Sebuah venturi meter horizontal memiliki A<sub>1</sub> = 20 cm<sup>2</sup> dan A<sub>2</sub> = 10 cm<sup>2</sup>. Selisih tekanan antara kedua bagian terukur 6.000 Pa. Jika ρ<sub>air</sub> = 1.000 kg/m<sup>3</sup>, kecepatan air pada bagian pertama dan debit aliran adalah ....",
        options: [
            "v<sub>1</sub> = 1 m/s dan Q = 2 L/s",
            "v<sub>1</sub> = 2 m/s dan Q = 4 L/s",
            "v<sub>1</sub> = 3 m/s dan Q = 6 L/s",
            "v<sub>1</sub> = 4 m/s dan Q = 8 L/s",
            "v<sub>1</sub> = 2 m/s dan Q = 2 L/s"
        ],
        correctIndex: 1,
        explanation: "Kontinuitas: A<sub>1</sub>v<sub>1</sub> = A<sub>2</sub>v<sub>2</sub> → 20v<sub>1</sub> = 10v<sub>2</sub> → v<sub>2</sub> = 2v<sub>1</sub>. Bernoulli: ΔP = ½ρ(v<sub>2</sub><sup>2</sup> − v<sub>1</sub><sup>2</sup>) = 500 × (4v<sub>1</sub><sup>2</sup> − v<sub>1</sub><sup>2</sup>) = 1.500v<sub>1</sub><sup>2</sup>. Maka 6.000 = 1.500v<sub>1</sub><sup>2</sup> → v<sub>1</sub><sup>2</sup> = 4 → <strong>v<sub>1</sub> = 2 m/s</strong>. Debit Q = A<sub>1</sub>v<sub>1</sub> = (20 × 10<sup>−4</sup>)(2) = 4 × 10<sup>−3</sup> m<sup>3</sup>/s = <strong>4 L/s</strong>."
    },
    {
        id: "Q15",
        num: 15,
        level: "Sulit",
        topic: "Penyemprot Cairan (HOTS)",
        diagram: SVG_SPRAYER,
        question: "Pada sebuah penyemprot cairan, laju aliran udara di bagian lebar dijaga tetap. Jika luas penampang ujung sempit diperkecil menjadi setengah dari semula, tinggi cairan yang terangkat menjadi ....",
        options: ["tetap seperti semula", "2 kali semula", "4 kali semula", "8 kali semula", "16 kali semula"],
        correctIndex: 2,
        explanation: "Karena debit udara tetap, kontinuitas A·v = konstan. Jika A ujung sempit menjadi ½, maka v<sub>2</sub> menjadi 2 kali. Penurunan tekanan sebanding kuadrat kecepatan: ΔP ∝ v<sub>2</sub><sup>2</sup>, sehingga ΔP menjadi 2<sup>2</sup> = 4 kali. Tinggi cairan sebanding selisih tekanan (h = ΔP/ρg), jadi tinggi cairan menjadi <strong>4 kali semula</strong>."
    }
];

if (typeof module !== 'undefined') {
    module.exports = { MASTER_QUESTIONS };
}
