// ==========================================================================
// HYDROARENA SMAN 78 JAKARTA - BANK 25 BUTIR SOAL TERKURASI FLUIDA XI
// STANDAR SILABUS RESMI: FLUIDA STATIS & FLUIDA DINAMIS
// (NON-SILABUS DIELIMINASI: TANPA TEGANGAN PERMUKAAN, KAPILARITAS, VISKOSITAS, VENTURI/PITOT)
// ==========================================================================

const MASTER_QUESTIONS = [
    {
        id: "Q01",
        num: 1,
        topic: "Tekanan Hidrostatis",
        diagram: SVG_TANK_PQ,
        question: "Sebuah tangki berbentuk silinder dengan kedalaman 9,4 meter terisi penuh oleh air (ρ = 1.000 kg/m³, g = 10 m/s²). Titik P berada 2,6 meter di bawah permukaan air dan titik Q berada 1,2 meter di atas dasar tangki. Besar tekanan hidrostatis yang dialami pada titik P dan titik Q berturut-turut adalah...",
        options: ["P_P = 26.000 Pa dan P_Q = 82.000 Pa","P_P = 26.000 Pa dan P_Q = 12.000 Pa","P_P = 68.000 Pa dan P_Q = 82.000 Pa","P_P = 26.000 Pa dan P_Q = 94.000 Pa","P_P = 82.000 Pa dan P_Q = 26.000 Pa"],
        correctIndex: 0,
        explanation: "Kedalaman titik P dari permukaan air adalah h_P = 2,6 m, sehingga P_P = ρ·g·h_P = 1.000 × 10 × 2,6 = 26.000 Pa. Kedalaman titik Q dari permukaan air adalah h_Q = 9,4 m − 1,2 m = 8,2 m, sehingga P_Q = ρ·g·h_Q = 1.000 × 10 × 8,2 = 82.000 Pa."
    },
    {
        id: "Q02",
        num: 2,
        topic: "Tekanan Hidrostatis",
        diagram: SVG_TANK_PQ,
        question: "Berdasarkan tangki silinder setinggi 9,4 meter dengan titik P pada kedalaman 2,6 meter di bawah permukaan air dan titik Q berada 1,2 meter di atas dasar tangki, perbandingan tekanan hidrostatis di titik Q terhadap titik P (P_Q : P_P) dalam bentuk paling sederhana adalah...",
        options: ["41 : 13","13 : 41","47 : 13","41 : 6","6 : 13"],
        correctIndex: 0,
        explanation: "Perbandingan tekanan hidrostatis P_Q : P_P = h_Q : h_P = 8,2 m : 2,6 m = 82 : 26. Jika kedua ruas dibagi 2, diperoleh perbandingan paling sederhana 41 : 13."
    },
    {
        id: "Q03",
        num: 3,
        topic: "Tekanan Hidrostatis",
        diagram: SVG_TANK_PQ,
        question: "Jika tekanan udara luar pada permukaan tangki terbuka tersebut adalah P_atm = 1,0 × 10⁵ Pa (100.000 Pa), maka besar tekanan mutlak (tekanan total) yang bekerja pada titik Q (yang berada 1,2 m di atas dasar tangki) adalah...",
        options: ["182.000 Pa","126.000 Pa","112.000 Pa","194.000 Pa","82.000 Pa"],
        correctIndex: 0,
        explanation: "Tekanan mutlak adalah jumlah tekanan atmosfer dan tekanan hidrostatis: P_total(Q) = P_atm + ρ·g·h_Q = 100.000 Pa + 82.000 Pa = 182.000 Pa."
    },
    {
        id: "Q04",
        num: 4,
        topic: "Tekanan Hidrostatis",
        diagram: null,
        question: "Berdasarkan prinsip fisika pada fluida statis, pernyataan yang paling tepat mengenai hubungan antara posisi titik di dalam zat cair homogen dengan tekanan hidrostatis adalah...",
        options: ["Tekanan hidrostatis berbanding lurus dengan kedalaman titik yang diukur vertikal dari permukaan bebas zat cair","Tekanan hidrostatis berbanding lurus dengan jarak titik yang diukur vertikal dari dasar wadah","Tekanan hidrostatis bergantung pada luas penampang horizontal wadah silinder","Tekanan hidrostatis bernilai maksimum tepat pada permukaan bebas zat cair","Tekanan hidrostatis berbanding terbalik dengan percepatan gravitasi di tempat tersebut"],
        correctIndex: 0,
        explanation: "Sesuai persamaan P_h = ρ·g·h, variabel h selalu diukur secara vertikal dari permukaan bebas zat cair ke titik pengamatan, sehingga makin dalam posisi titik dari permukaan, makin besar tekanan hidrostatisnya."
    },
    {
        id: "Q05",
        num: 5,
        topic: "Prinsip Pascal",
        diagram: SVG_HYDRAULIC_JACK,
        question: "Sebuah dongkrak hidrolik digunakan untuk mengangkat beban. Jika luas penampang piston kecil 8,5 cm² dan piston besar 340 cm², serta gaya tekan yang diberikan pada piston kecil sebesar 220 N, maka gaya angkat yang dihasilkan pada piston besar adalah...",
        options: ["8.800 N","4.400 N","6.600 N","880 N","17.600 N"],
        correctIndex: 0,
        explanation: "Berdasarkan Hukum Pascal: F₁ / A₁ = F₂ / A₂ → F₂ = (A₂ / A₁) × F₁ = (340 cm² / 8,5 cm²) × 220 N = 40 × 220 N = 8.800 N."
    },
    {
        id: "Q06",
        num: 6,
        topic: "Prinsip Pascal",
        diagram: SVG_HYDRAULIC_JACK,
        question: "Pada sistem dongkrak hidrolik dengan luas penampang piston kecil A₁ = 8,5 cm² dan piston besar A₂ = 340 cm², keuntungan mekanis ideal sistem beserta jarak kenaikan piston besar (s₂) ketika piston kecil ditekan turun sejauh s₁ = 16 cm adalah...",
        options: ["Keuntungan mekanis = 40 dan piston besar naik 0,4 cm","Keuntungan mekanis = 40 dan piston besar naik 4,0 cm","Keuntungan mekanis = 20 dan piston besar naik 0,8 cm","Keuntungan mekanis = 80 dan piston besar naik 0,2 cm","Keuntungan mekanis = 40 dan piston besar naik 16 cm"],
        correctIndex: 0,
        explanation: "Keuntungan mekanis KM = A₂ / A₁ = 340 / 8,5 = 40. Karena volume fluida yang berpindah tetap (A₁·s₁ = A₂·s₂), maka s₂ = s₁ / 40 = 16 cm / 40 = 0,4 cm."
    },
    {
        id: "Q07",
        num: 7,
        topic: "Prinsip Pascal",
        diagram: null,
        question: "Dua silinder hidrolik yang saling terhubung memiliki perbandingan diameter penampang D₁ : D₂ = 1 : 5. Apabila pada piston silinder kecil diberikan gaya tekan sebesar 120 N, maka beban maksimum yang dapat ditahan oleh piston silinder besar adalah...",
        options: ["3.000 N","600 N","1.500 N","2.400 N","6.000 N"],
        correctIndex: 0,
        explanation: "Luas penampang lingkaran sebanding dengan kuadrat diameter (A ∝ D²), sehingga F₂ = (D₂ / D₁)² × F₁ = (5 / 1)² × 120 N = 25 × 120 N = 3.000 N."
    },
    {
        id: "Q08",
        num: 8,
        topic: "Hukum Pokok Hidrostatika",
        diagram: SVG_U_TUBE,
        question: "Sebuah pipa U mula-mula diisi air (ρ_air = 1.000 kg/m³), kemudian pada kaki kiri dituangkan minyak hingga terbentuk kolom minyak setinggi h₁ = 15 cm. Jika selisih tinggi permukaan air di kaki kanan terhadap bidang batas air-minyak adalah h₂ = 12 cm, maka massa jenis minyak tersebut adalah...",
        options: ["800 kg/m³","750 kg/m³","850 kg/m³","900 kg/m³","1.250 kg/m³"],
        correctIndex: 0,
        explanation: "Pada bidang batas horizontal yang sama berlaku Hukum Pokok Hidrostatika: ρ_minyak · h₁ = ρ_air · h₂ → ρ_minyak × 15 cm = 1.000 × 12 cm → ρ_minyak = 800 kg/m³."
    },
    {
        id: "Q09",
        num: 9,
        topic: "Hukum Pokok Hidrostatika",
        diagram: SVG_U_TUBE,
        question: "Pipa U berisi cairan raksa di bagian dasar, air (ρ₁ = 1,0 g/cm³) setinggi h₁ = 16 cm di kaki kiri, dan cairan X (ρ₂ = 0,8 g/cm³) di kaki kanan. Agar permukaan raksa pada kedua kaki pipa U tetap sejajar (sama tinggi), maka tinggi kolom cairan X yang harus dituangkan di kaki kanan adalah...",
        options: ["20 cm","16 cm","12,8 cm","24 cm","18 cm"],
        correctIndex: 0,
        explanation: "Karena permukaan raksa pada kedua kaki pipa sama tinggi, tekanan hidrostatis kedua cairan di atas batas raksa harus sama: ρ₁·h₁ = ρ₂·h₂ → 1,0 × 16 cm = 0,8 × h₂ → h₂ = 20 cm."
    },
    {
        id: "Q10",
        num: 10,
        topic: "Hukum Archimedes",
        diagram: null,
        question: "Sebuah balok logam ditimbang di udara menggunakan neraca pegas menunjukkan berat 80 N. Ketika balok tersebut dicelupkan seluruhnya ke dalam air (ρ_air = 1.000 kg/m³, g = 10 m/s²), neraca pegas menunjukkan angka 60 N. Massa jenis balok logam tersebut adalah...",
        options: ["4.000 kg/m³","3.000 kg/m³","2.500 kg/m³","4.800 kg/m³","2.000 kg/m³"],
        correctIndex: 0,
        explanation: "Gaya apung F_A = W_udara − W_semu = 80 N − 60 N = 20 N. Dari persamaan F_A = ρ_air·g·V diperoleh volume benda V = 20 / (1.000 × 10) = 0,002 m³. Massa benda m = 80 / 10 = 8 kg. Maka ρ_benda = m / V = 8 kg / 0,002 m³ = 4.000 kg/m³."
    },
    {
        id: "Q11",
        num: 11,
        topic: "Hukum Archimedes",
        diagram: null,
        question: "Sebuah benda padat homogen mengapung di permukaan air (ρ_air = 1.000 kg/m³) dengan 25% bagian volumenya berada di atas permukaan air. Massa jenis benda padat tersebut adalah...",
        options: ["750 kg/m³","250 kg/m³","800 kg/m³","650 kg/m³","1.250 kg/m³"],
        correctIndex: 0,
        explanation: "Jika 25% volume berada di atas permukaan air, maka bagian volume yang tercelup di dalam air adalah V_celup = 75% V = 0,75 V. Pada benda terapung berlaku ρ_benda = (V_celup / V_total) × ρ_air = 0,75 × 1.000 kg/m³ = 750 kg/m³."
    },
    {
        id: "Q12",
        num: 12,
        topic: "Hukum Archimedes",
        diagram: null,
        question: "Sebuah rakit kayu memiliki volume 2,5 m³ dan massa jenis 600 kg/m³. Jika rakit tersebut terapung di atas air danau (ρ_air = 1.000 kg/m³, g = 10 m/s²), beban tambahan maksimum yang dapat diletakkan di atas rakit tepat sebelum rakit tenggelam seluruhnya adalah...",
        options: ["10.000 N","15.000 N","25.000 N","8.000 N","12.500 N"],
        correctIndex: 0,
        explanation: "Gaya apung maksimum saat seluruh volume rakit tercelup: F_A(maks) = ρ_air·g·V = 1.000 × 10 × 2,5 = 25.000 N. Berat rakit kosong: W_rakit = ρ_kayu·g·V = 600 × 10 × 2,5 = 15.000 N. Maka beban maksimum tambahan = 25.000 N − 15.000 N = 10.000 N."
    },
    {
        id: "Q13",
        num: 13,
        topic: "Hukum Archimedes",
        diagram: null,
        question: "Sebuah kubus kayu berada dalam kesetimbangan di antara dua lapisan cairan yang tidak bercampur, yaitu air (ρ_air = 1,0 g/cm³) di bagian bawah dan minyak (ρ_minyak = 0,8 g/cm³) di bagian atas. Jika 60% volume kubus tercelup di dalam air dan 40% sisanya tercelup di dalam minyak, massa jenis kubus kayu tersebut adalah...",
        options: ["0,92 g/cm³","0,90 g/cm³","0,88 g/cm³","0,84 g/cm³","0,96 g/cm³"],
        correctIndex: 0,
        explanation: "Gaya berat kubus diimbangi oleh jumlah gaya apung dari air dan minyak: ρ_benda = (0,60 × ρ_air) + (0,40 × ρ_minyak) = (0,60 × 1,0) + (0,40 × 0,8) = 0,60 + 0,32 = 0,92 g/cm³."
    },
    {
        id: "Q14",
        num: 14,
        topic: "Persamaan Kontinuitas",
        diagram: SVG_HORIZONTAL_PIPE,
        question: "Air mengalir melalui pipa horizontal yang memiliki dua penampang berbeda seperti pada gambar. Pada bagian pertama, luas penampang pipa A₁ = 24 cm² dengan kecepatan aliran v₁ = 1,8 m/s. Pipa kemudian menyempit sehingga luas penampang pada bagian kedua menjadi A₂ = 8 cm². Kecepatan aliran air pada bagian kedua (v₂) adalah...",
        options: ["5,4 m/s","3,6 m/s","0,6 m/s","7,2 m/s","4,8 m/s"],
        correctIndex: 0,
        explanation: "Berdasarkan persamaan kontinuitas A₁·v₁ = A₂·v₂ → 24 cm² × 1,8 m/s = 8 cm² × v₂ → v₂ = 3 × 1,8 m/s = 5,4 m/s."
    },
    {
        id: "Q15",
        num: 15,
        topic: "Persamaan Kontinuitas",
        diagram: SVG_HORIZONTAL_PIPE,
        question: "Berdasarkan aliran air pada pipa horizontal dengan luas penampang pertama A₁ = 24 cm² dan kecepatan aliran v₁ = 1,8 m/s, besar debit air (Q) yang mengalir melalui pipa tersebut dalam satuan SI (m³/s) adalah...",
        options: ["4,32 × 10⁻³ m³/s","4,32 × 10⁻² m³/s","1,44 × 10⁻³ m³/s","2,16 × 10⁻³ m³/s","4,32 × 10⁻⁴ m³/s"],
        correctIndex: 0,
        explanation: "Luas penampang A₁ = 24 cm² = 24 × 10⁻⁴ m². Debit aliran Q = A₁ · v₁ = (24 × 10⁻⁴ m²) × 1,8 m/s = 43,2 × 10⁻⁴ m³/s = 4,32 × 10⁻³ m³/s."
    },
    {
        id: "Q16",
        num: 16,
        topic: "Persamaan Kontinuitas",
        diagram: null,
        question: "Sebuah pipa silinder mengalirkan air dari bagian berdiameter D₁ = 8 cm dengan kelajuan 2 m/s menuju bagian pipa yang menyempit dengan diameter D₂ = 4 cm. Kelajuan aliran air pada bagian pipa berdiameter 4 cm tersebut adalah...",
        options: ["8 m/s","4 m/s","6 m/s","12 m/s","16 m/s"],
        correctIndex: 0,
        explanation: "Persamaan kontinuitas untuk penampang lingkaran: v₂ = (D₁ / D₂)² × v₁ = (8 cm / 4 cm)² × 2 m/s = 4 × 2 m/s = 8 m/s."
    },
    {
        id: "Q17",
        num: 17,
        topic: "Teorema Torricelli",
        diagram: SVG_TORRICELLI_TANK,
        question: "Pada tangki terbuka tersebut (permukaan air 5,8 m dari tanah dan lubang berada 2,3 m di atas tanah), jarak horizontal pancaran air (x) dari dinding tangki hingga menyentuh permukaan tanah adalah...",
        options: ["x = 2√(8,05) m (≈ 5,67 m)","x = √(8,05) m (≈ 2,84 m)","x = 2√(13,34) m (≈ 7,30 m)","x = 4,60 m","x = 8,05 m"],
        correctIndex: 0,
        explanation: "Jarak horizontal pancaran air: x = v · t = √(2·g·h) · √(2·y / g) = 2√(h · y) = 2√(3,5 × 2,3) = 2√(8,05) m ≈ 5,67 m."
    },
    {
        id: "Q18",
        num: 18,
        topic: "Teorema Torricelli",
        diagram: SVG_TORRICELLI_TANK,
        question: "Berdasarkan tangki terbuka dengan permukaan air 5,8 meter dari tanah dan lubang kebocoran pada ketinggian y = 2,3 meter di atas permukaan tanah (g = 10 m/s²), waktu yang diperlukan air untuk mencapai permukaan tanah sejak keluar secara horizontal dari lubang adalah...",
        options: ["t = √0,46 sekon (≈ 0,68 sekon)","t = √0,70 sekon (≈ 0,84 sekon)","t = 0,46 sekon","t = √1,16 sekon (≈ 1,08 sekon)","t = 0,23 sekon"],
        correctIndex: 0,
        explanation: "Gerak vertikal air setelah keluar horizontal dari lubang (v_0y = 0) adalah gerak jatuh bebas dari ketinggian y = 2,3 m: y = ½·g·t² → t = √(2y / g) = √(2 × 2,3 / 10) = √0,46 s ≈ 0,68 s."
    },
    {
        id: "Q19",
        num: 19,
        topic: "Persamaan Bernoulli",
        diagram: SVG_HORIZONTAL_PIPE,
        question: "Berdasarkan hasil perhitungan kecepatan dan tekanan pada pipa horizontal yang menyempit dari 24 cm² menjadi 8 cm², kesimpulan fisis yang benar mengenai hubungan antara luas penampang, kecepatan aliran, dan tekanan statis adalah...",
        options: ["Pada penampang yang lebih sempit, kecepatan aliran meningkat sehingga energi kinetik per satuan volume bertambah dan tekanan statis menurun","Pada penampang yang lebih sempit, kecepatan aliran meningkat sehingga tekanan statis ikut meningkat secara proporsional","Penyempitan penampang menyebabkan debit aliran berkurang drastis sehingga tekanan statis menurun","Tekanan statis pada kedua penampang tetap sama karena ketinggian pipa tidak berubah","Kecepatan aliran berbanding lurus dengan luas penampang dan berbanding lurus dengan tekanan statis"],
        correctIndex: 0,
        explanation: "Sesuai kekekalan energi mekanik fluida (Hukum Bernoulli) pada pipa horizontal, P + ½ρv² = konstan. Ketika penampang menyempit, laju v membesar sehingga tekanan dinamis (½ρv²) naik dan tekanan statis (P) turun dari 250.000 Pa menjadi 237.040 Pa."
    },
    {
        id: "Q20",
        num: 20,
        topic: "Teorema Torricelli",
        diagram: SVG_TORRICELLI_TANK,
        question: "Apabila posisi lubang pada tangki yang permukaan airnya berada 5,8 meter di atas tanah dapat diubah-ubah ketinggiannya, maka agar jarak horizontal pancaran air di tanah mencapai nilai maksimum, lubang harus dibuat pada ketinggian...",
        options: ["2,9 meter di atas tanah, dengan jarak pancar maksimum 5,8 meter","2,3 meter di atas tanah, dengan jarak pancar maksimum 5,8 meter","1,45 meter di atas tanah, dengan jarak pancar maksimum 2,9 meter","4,0 meter di atas tanah, dengan jarak pancar maksimum 6,4 meter","Tepat di dasar tangki, karena kecepatan pancaran air paling besar"],
        correctIndex: 0,
        explanation: "Persamaan jarak pancar x = 2√(h·y) dengan h + y = H = 5,8 m mencapai nilai maksimum ketika h = y = ½H = 2,9 m di atas tanah, yang menghasilkan jarak pancar maksimum x_maks = H = 5,8 m."
    },
    {
        id: "Q21",
        num: 21,
        topic: "Pipa Bertingkat",
        diagram: SVG_STEPPED_PIPE_ABC,
        question: "Pada sistem pipa bertingkat tersebut, diketahui ketinggian titik A adalah h_A = 4,8 m dan titik B adalah h_B = 1,7 m. Jika kecepatan v_A = 2,4 m/s, v_B = 4,8 m/s, dan tekanan air di titik A sebesar P_A = 190.000 Pa (ρ = 1.000 kg/m³, g = 10 m/s²), maka tekanan air pada titik B (P_B) adalah...",
        options: ["212.360 Pa","221.000 Pa","181.360 Pa","203.720 Pa","229.640 Pa"],
        correctIndex: 0,
        explanation: "Menggunakan persamaan Bernoulli antara titik A dan B: P_B = P_A + ½ρ(v_A² − v_B²) + ρg(h_A − h_B) = 190.000 + 500×(2,4² − 4,8²) + 1.000×10×(4,8 − 1,7) = 190.000 + 500×(5,76 − 23,04) + 31.000 = 190.000 − 8.640 + 31.000 = 212.360 Pa."
    },
    {
        id: "Q22",
        num: 22,
        topic: "Persamaan Bernoulli",
        diagram: SVG_HORIZONTAL_PIPE,
        question: "Pada pipa horizontal tersebut (A₁ = 24 cm², v₁ = 1,8 m/s, A₂ = 8 cm², v₂ = 5,4 m/s), diketahui tekanan statis air pada bagian pertama adalah P₁ = 250.000 Pa dan massa jenis air ρ = 1.000 kg/m³. Besar tekanan air pada bagian kedua (P₂) berdasarkan persamaan Bernoulli adalah...",
        options: ["237.040 Pa","262.960 Pa","235.420 Pa","241.360 Pa","224.080 Pa"],
        correctIndex: 0,
        explanation: "Pada pipa horizontal (h₁ = h₂): P₂ = P₁ + ½·ρ·(v₁² − v₂²) = 250.000 + ½ × 1.000 × (1,8² − 5,4²) = 250.000 + 500 × (3,24 − 29,16) = 250.000 + 500 × (−25,92) = 250.000 − 12.960 = 237.040 Pa."
    },
    {
        id: "Q23",
        num: 23,
        topic: "Gaya Angkat Pesawat",
        diagram: SVG_AIRFOIL,
        question: "Perhatikan penampang sayap pesawat terbang (aerofoil) di atas! Agar sayap pesawat menghasilkan gaya angkat ke atas yang optimal saat bergerak maju di udara, hubungan kelajuan aliran udara dan tekanan statis pada bagian atas dan bawah sayap yang benar adalah...",
        options: ["v_atas > v_bawah sehingga P_atas < P_bawah","v_atas < v_bawah sehingga P_atas > P_bawah","v_atas > v_bawah sehingga P_atas > P_bawah","v_atas = v_bawah sehingga P_atas < P_bawah","v_atas < v_bawah sehingga P_atas < P_bawah"],
        correctIndex: 0,
        explanation: "Bentuk lengkungan sayap membuat garis alir udara di bagian atas lebih rapat sehingga kelajuan udara di atas sayap lebih besar (v_atas > v_bawah). Menurut prinsip Bernoulli, tekanan di atas sayap menjadi lebih kecil (P_atas < P_bawah) sehingga muncul gaya dorong ke atas."
    },
    {
        id: "Q24",
        num: 24,
        topic: "Gaya Angkat Pesawat",
        diagram: SVG_AIRFOIL,
        question: "Sebuah pesawat terbang memiliki luas total kedua sayap A = 60 m². Kelajuan aliran udara di permukaan atas sayap adalah 250 m/s dan di permukaan bawah sayap adalah 200 m/s. Jika massa jenis udara ρ = 1,2 kg/m³, maka besar gaya angkat yang bekerja pada sayap pesawat tersebut adalah...",
        options: ["810.000 N (810 kN)","675.000 N (675 kN)","540.000 N (540 kN)","405.000 N (405 kN)","920.000 N (920 kN)"],
        correctIndex: 0,
        explanation: "Gaya angkat sayap pesawat dihitung dengan rumus Bernoulli: F_angkat = ½ · ρ · A · (v_atas² − v_bawah²) = ½ × 1,2 × 60 × (250² − 200²) = 36 × (62.500 − 40.000) = 36 × 22.500 = 810.000 N (810 kN)."
    },
    {
        id: "Q25",
        num: 25,
        topic: "Pipa Bertingkat",
        diagram: SVG_STEPPED_PIPE_ABC,
        question: "Berdasarkan hasil perhitungan pada sistem pipa bertingkat (P_A = 190.000 Pa, P_B = 212.360 Pa, P_C = 223.360 Pa), mengapa tekanan di titik C lebih besar daripada tekanan di titik A meskipun kecepatan aliran di titik C (4,8 m/s) lebih besar daripada di titik A (2,4 m/s)?",
        options: ["Penurunan energi potensial gravitasi per satuan volume akibat beda tinggi (42.000 Pa) jauh lebih besar daripada kenaikan tekanan dinamis akibat penyempitan pipa (8.640 Pa)","Luas penampang di titik C lebih kecil sehingga gaya tekan fluida menjadi berlipat ganda","Debit aliran air di titik C menjadi dua kali lipat lebih besar dibandingkan debit di titik A","Massa jenis air di titik C meningkat secara signifikan ketika mengalir menuruni pipa","Kecepatan aliran pada pipa menurun selalu berbanding lurus dengan tekanan statisnya"],
        correctIndex: 0,
        explanation: "Dari titik A ke C terjadi kenaikan tekanan dinamis sebesar ½ρ(v_C² − v_A²) = 8.640 Pa (yang cenderung menurunkan tekanan statis), namun secara bersamaan terjadi penurunan ketinggian Δh = 4,2 m yang menyumbang tambahan tekanan potensial ρgΔh = 42.000 Pa. Selisih bersihnya (+33.360 Pa) membuat P_C > P_A."
    },
];

// Bank Soal Cadangan Teruji (10 Butir Cadangan Evaluasi/Pengayaan)
const QUESTIONS_RESERVE = [
    {
        id: "RES_Q07",
        originalNum: 7,
        topic: "Tekanan Hidrostatis",
        diagram: null,
        question: "Seorang penyelam berada pada kedalaman 35 meter di bawah permukaan laut yang memiliki massa jenis air laut ρ = 1.025 kg/m³. Jika g = 10 m/s² dan tekanan atmosfer di permukaan laut 100.000 Pa, besar tekanan hidrostatis yang dialami penyelam tersebut adalah...",
        options: ["358.750 Pa","458.750 Pa","350.000 Pa","258.750 Pa","307.500 Pa"],
        correctIndex: 0,
        explanation: "Tekanan hidrostatis murni dihitung tanpa tekanan atmosfer: P_h = ρ·g·h = 1.025 kg/m³ × 10 m/s² × 35 m = 358.750 Pa."
    },
    {
        id: "RES_Q15",
        originalNum: 15,
        topic: "Hukum Archimedes",
        diagram: null,
        question: "Sebuah balon udara bervolume 500 m³ diisi gas helium yang memiliki massa jenis 0,2 kg/m³. Jika massa jenis udara di sekitar balon adalah 1,2 kg/m³ dan percepatan gravitasi g = 10 m/s², maka gaya angkat bersih balon tersebut (sebelum dikurangi massa keranjang) adalah...",
        options: ["5.000 N","6.000 N","1.000 N","4.000 N","7.000 N"],
        correctIndex: 0,
        explanation: "Gaya angkat bersih balon: F_angkat = F_Archimedes − W_helium = (ρ_udara − ρ_helium)·g·V = (1,2 − 0,2) × 10 × 500 = 1,0 × 5.000 = 5.000 N."
    },
    {
        id: "RES_Q18",
        originalNum: 18,
        topic: "Persamaan Bernoulli",
        diagram: SVG_HORIZONTAL_PIPE,
        question: "Pada pipa horizontal tersebut (A₁ = 24 cm², v₁ = 1,8 m/s, A₂ = 8 cm², v₂ = 5,4 m/s), diketahui tekanan statis air pada bagian pertama adalah P₁ = 250.000 Pa dan massa jenis air ρ = 1.000 kg/m³. Besar tekanan air pada bagian kedua (P₂) berdasarkan persamaan Bernoulli adalah...",
        options: ["237.040 Pa","262.960 Pa","235.420 Pa","241.360 Pa","224.080 Pa"],
        correctIndex: 0,
        explanation: "Pada pipa horizontal (h₁ = h₂): P₂ = P₁ + ½·ρ·(v₁² − v₂²) = 250.000 + ½ × 1.000 × (1,8² − 5,4²) = 250.000 + 500 × (3,24 − 29,16) = 250.000 + 500 × (−25,92) = 250.000 − 12.960 = 237.040 Pa."
    },
    {
        id: "RES_Q25",
        originalNum: 25,
        topic: "Pipa Bertingkat",
        diagram: SVG_STEPPED_PIPE_ABC,
        question: "Sebuah sistem perpipaan mengalirkan air melalui tiga titik pengamatan A, B, dan C seperti pada gambar. Luas penampang pipa di titik A adalah 14 cm², di titik B adalah 7 cm², dan di titik C adalah 7 cm². Jika kecepatan aliran air di titik A sebesar v_A = 2,4 m/s, maka kecepatan aliran air pada titik B (v_B) dan titik C (v_C) adalah...",
        options: ["v_B = 4,8 m/s dan v_C = 4,8 m/s","v_B = 1,2 m/s dan v_C = 1,2 m/s","v_B = 4,8 m/s dan v_C = 9,6 m/s","v_B = 2,4 m/s dan v_C = 4,8 m/s","v_B = 3,6 m/s dan v_C = 4,8 m/s"],
        correctIndex: 0,
        explanation: "Berdasarkan persamaan kontinuitas A_A·v_A = A_B·v_B = A_C·v_C → 14 × 2,4 = 7 × v_B → v_B = 4,8 m/s. Karena A_C = A_B = 7 cm², maka v_C = v_B = 4,8 m/s."
    },
    {
        id: "RES_Q27",
        originalNum: 27,
        topic: "Pipa Bertingkat",
        diagram: SVG_STEPPED_PIPE_ABC,
        question: "Masih pada sistem pipa bertingkat yang sama (h_A = 4,8 m, h_B = 1,7 m, h_C = 0,6 m; v_A = 2,4 m/s, v_B = v_C = 4,8 m/s; P_A = 190.000 Pa), besar tekanan air pada titik C (P_C) adalah...",
        options: ["223.360 Pa","212.360 Pa","232.000 Pa","201.360 Pa","240.640 Pa"],
        correctIndex: 0,
        explanation: "Karena v_C = v_B = 4,8 m/s, selisih tekanan antara B dan C murni berasal dari penurunan ketinggian Δh_BC = 1,7 m − 0,6 m = 1,1 m: P_C = P_B + ρ·g·(h_B − h_C) = 212.360 Pa + 1.000×10×1,1 = 212.360 + 11.000 = 223.360 Pa."
    },
    {
        id: "RES_Q29",
        originalNum: 29,
        topic: "Pipa Bertingkat",
        diagram: SVG_STEPPED_PIPE_ABC,
        question: "Pada sistem pipa bertingkat tersebut (A_A = 14 cm², v_A = 2,4 m/s), volume air yang mengalir melewati penampang titik C selama 5 menit adalah...",
        options: ["1,008 m³ (1.008 liter)","0,504 m³ (504 liter)","3,360 m³ (3.360 liter)","0,336 m³ (336 liter)","2,016 m³ (2.016 liter)"],
        correctIndex: 0,
        explanation: "Debit aliran konstan di sepanjang pipa: Q = A_A · v_A = (14 × 10⁻⁴ m²) × 2,4 m/s = 3,36 × 10⁻³ m³/s. Selama waktu t = 5 menit = 300 sekon, volume air yang mengalir adalah V = Q · t = (3,36 × 10⁻³) × 300 = 1,008 m³ (1.008 liter)."
    },
    {
        id: "RES_Q30",
        originalNum: 30,
        topic: "Evaluasi Eksperimen Fluida",
        diagram: SVG_EXPERIMENT_TABLE,
        question: "Seorang siswa melakukan eksperimen aliran air pada pipa horizontal dan memperoleh tabel data Percobaan I s.d. IV di atas. Jika dihitung nilai debit air (Q = A · v) pada keempat percobaan dalam satuan cm³/s, maka diperoleh hasil...",
        options: ["Q_I = 16,2 cm³/s; Q_II = 16,8 cm³/s; Q_III = 18,9 cm³/s; Q_IV = 16,8 cm³/s","Q_I = 16,2 cm³/s; Q_II = 16,2 cm³/s; Q_III = 16,2 cm³/s; Q_IV = 16,2 cm³/s","Q_I = 1.620 cm³/s; Q_II = 1.680 cm³/s; Q_III = 1.890 cm³/s; Q_IV = 1.680 cm³/s","Q_I = 20,0 cm³/s; Q_II = 8,57 cm³/s; Q_III = 4,29 cm³/s; Q_IV = 2,14 cm³/s","Q_I = 180 cm³/s; Q_II = 168 cm³/s; Q_III = 189 cm³/s; Q_IV = 168 cm³/s"],
        correctIndex: 2,
        explanation: "Konversi kecepatan ke cm/s (1 m/s = 100 cm/s): Q_I = 18 cm² × 90 cm/s = 1.620 cm³/s; Q_II = 12 cm² × 140 cm/s = 1.680 cm³/s; Q_III = 9 cm² × 210 cm/s = 1.890 cm³/s; Q_IV = 6 cm² × 280 cm/s = 1.680 cm³/s."
    },
    {
        id: "RES_Q31",
        originalNum: 31,
        topic: "Evaluasi Eksperimen Fluida",
        diagram: SVG_EXPERIMENT_TABLE,
        question: "Berdasarkan tabel data eksperimen tersebut (ρ_air = 1.000 kg/m³), jumlah tekanan statis dan tekanan dinamis (P + ½ρv²) pada Percobaan I (v = 0,9 m/s, P = 260.000 Pa) dan Percobaan IV (v = 2,8 m/s, P = 176.000 Pa) berturut-turut adalah...",
        options: ["Percobaan I = 260.405 Pa dan Percobaan IV = 179.920 Pa","Percobaan I = 260.810 Pa dan Percobaan IV = 183.840 Pa","Percobaan I = 260.405 Pa dan Percobaan IV = 260.405 Pa","Percobaan I = 259.595 Pa dan Percobaan IV = 172.080 Pa","Percobaan I = 264.050 Pa dan Percobaan IV = 215.200 Pa"],
        correctIndex: 0,
        explanation: "Pada Percobaan I: P₁ + ½ρv₁² = 260.000 + 500×(0,9)² = 260.000 + 405 = 260.405 Pa. Pada Percobaan IV: P₄ + ½ρv₄² = 176.000 + 500×(2,8)² = 176.000 + 500×(7,84) = 176.000 + 3.920 = 179.920 Pa."
    },
    {
        id: "RES_Q32",
        originalNum: 32,
        topic: "Evaluasi Eksperimen Fluida",
        diagram: SVG_EXPERIMENT_TABLE,
        question: "Jika dihitung nilai total (P + ½ρv²) pada Percobaan II (v = 1,4 m/s, P = 237.000 Pa) dan Percobaan III (v = 2,1 m/s, P = 208.000 Pa), maka diperoleh nilai berturut-turut sebesar...",
        options: ["Percobaan II = 237.980 Pa dan Percobaan III = 210.205 Pa","Percobaan II = 238.960 Pa dan Percobaan III = 212.410 Pa","Percobaan II = 237.700 Pa dan Percobaan III = 209.050 Pa","Percobaan II = 236.020 Pa dan Percobaan III = 205.795 Pa","Percobaan II = 246.800 Pa dan Percobaan III = 230.050 Pa"],
        correctIndex: 0,
        explanation: "Pada Percobaan II: P₂ + ½ρv₂² = 237.000 + 500×(1,4)² = 237.000 + 500×1,96 = 237.980 Pa. Pada Percobaan III: P₃ + ½ρv₃² = 208.000 + 500×(2,1)² = 208.000 + 500×4,41 = 208.000 + 2.205 = 210.205 Pa."
    },
    {
        id: "RES_Q33",
        originalNum: 33,
        topic: "Evaluasi Eksperimen Fluida",
        diagram: SVG_EXPERIMENT_TABLE,
        question: "Berdasarkan evaluasi keempat percobaan pada tabel, nilai (P + ½ρv²) terus mengalami penurunan yang signifikan dari Percobaan I (260.405 Pa) hingga Percobaan IV (179.920 Pa). Analisis ilmiah yang paling tepat mengenai data eksperimen tersebut adalah...",
        options: ["Data tidak konsisten dengan persamaan Bernoulli fluida ideal karena pada fluida nyata terjadi disipasi energi mekanik akibat gesekan terhadap dinding pipa dan turbulensi saat pipa menyempit","Data sangat konsisten dengan fluida ideal karena tekanan statis selalu berkurang sebesar kelipatan luas penampang","Penurunan nilai P + ½ρv² membuktikan bahwa massa jenis air berkurang drastis ketika mengalir melalui pipa sempit","Persamaan Bernoulli tidak berlaku pada pipa horizontal melainkan hanya berlaku pada pipa vertikal","Kenaikan kecepatan aliran dari 0,9 m/s ke 2,8 m/s sudah sepenuhnya menggantikan penurunan tekanan sebesar 84.000 Pa"],
        correctIndex: 0,
        explanation: "Untuk fluida ideal pada pipa horizontal, jumlah P + ½ρv² seharusnya konstan. Penurunan tajam sebesar ~80.485 Pa menunjukkan kehilangan tinggi tekan (head loss) akibat gesekan internal fluida nyata terhadap dinding pipa, pusaran turbulen pada penyempitan, serta ketidakpastian alat ukur."
    },
];

if (typeof module !== "undefined") {
    module.exports = { MASTER_QUESTIONS, QUESTIONS_RESERVE };
}
