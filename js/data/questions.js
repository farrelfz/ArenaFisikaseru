// ==========================================================================
// HYDROARENA SMAN 78 JAKARTA - BANK 25 BUTIR SOAL TERKURASI FLUIDA XI
// STANDAR SILABUS RESMI: FLUIDA STATIS & FLUIDA DINAMIS
// NOTASI TIPOGRAFI STANDAR ILMIAH (SUB & SUP)
// ==========================================================================

const MASTER_QUESTIONS = [
    {
        id: "Q01",
        num: 1,
        topic: "Tekanan Hidrostatis",
        diagram: SVG_TANK_PQ,
        question: "Sebuah tangki berbentuk silinder dengan kedalaman 9,4 meter terisi penuh oleh air (ρ = 1.000 kg/m<sup>3</sup>, g = 10 m/s<sup>2</sup>). Titik P berada 2,6 meter di bawah permukaan air dan titik Q berada 1,2 meter di atas dasar tangki. Besar tekanan hidrostatis yang dialami pada titik P dan titik Q berturut-turut adalah...",
        options: ["P<sub>P</sub> = 26.000 Pa dan P<sub>Q</sub> = 82.000 Pa","P<sub>P</sub> = 26.000 Pa dan P<sub>Q</sub> = 12.000 Pa","P<sub>P</sub> = 68.000 Pa dan P<sub>Q</sub> = 82.000 Pa","P<sub>P</sub> = 26.000 Pa dan P<sub>Q</sub> = 94.000 Pa","P<sub>P</sub> = 82.000 Pa dan P<sub>Q</sub> = 26.000 Pa"],
        correctIndex: 0,
        explanation: "Kedalaman titik P dari permukaan air adalah h<sub>P</sub> = 2,6 m, sehingga P<sub>P</sub> = ρ·g·h<sub>P</sub> = 1.000 × 10 × 2,6 = 26.000 Pa. Kedalaman titik Q dari permukaan air adalah h<sub>Q</sub> = 9,4 m − 1,2 m = 8,2 m, sehingga P<sub>Q</sub> = ρ·g·h<sub>Q</sub> = 1.000 × 10 × 8,2 = 82.000 Pa."
    },
    {
        id: "Q02",
        num: 2,
        topic: "Tekanan Hidrostatis",
        diagram: SVG_TANK_PQ,
        question: "Berdasarkan tangki silinder setinggi 9,4 meter dengan titik P pada kedalaman 2,6 meter di bawah permukaan air dan titik Q berada 1,2 meter di atas dasar tangki, perbandingan tekanan hidrostatis di titik Q terhadap titik P (P<sub>Q</sub> : P<sub>P</sub>) dalam bentuk paling sederhana adalah...",
        options: ["41 : 13","13 : 41","47 : 13","41 : 6","6 : 13"],
        correctIndex: 0,
        explanation: "Perbandingan tekanan hidrostatis P<sub>Q</sub> : P<sub>P</sub> = h<sub>Q</sub> : h<sub>P</sub> = 8,2 m : 2,6 m = 82 : 26. Jika kedua ruas dibagi 2, diperoleh perbandingan paling sederhana 41 : 13."
    },
    {
        id: "Q03",
        num: 3,
        topic: "Tekanan Hidrostatis",
        diagram: SVG_TANK_PQ,
        question: "Jika tekanan udara luar pada permukaan tangki terbuka tersebut adalah P<sub>atm</sub> = 1,0 × 10<sup>5</sup> Pa (100.000 Pa), maka besar tekanan mutlak (tekanan total) yang bekerja pada titik Q (yang berada 1,2 m di atas dasar tangki) adalah...",
        options: ["182.000 Pa","126.000 Pa","112.000 Pa","194.000 Pa","82.000 Pa"],
        correctIndex: 0,
        explanation: "Tekanan mutlak adalah jumlah tekanan atmosfer dan tekanan hidrostatis: P<sub>total</sub>(Q) = P<sub>atm</sub> + ρ·g·h<sub>Q</sub> = 100.000 Pa + 82.000 Pa = 182.000 Pa."
    },
    {
        id: "Q04",
        num: 4,
        topic: "Tekanan Hidrostatis",
        diagram: null,
        question: "Berdasarkan prinsip fisika pada fluida statis, pernyataan yang paling tepat mengenai hubungan antara posisi titik di dalam zat cair homogen dengan tekanan hidrostatis adalah...",
        options: ["Tekanan hidrostatis berbanding lurus dengan kedalaman titik yang diukur vertikal dari permukaan bebas zat cair","Tekanan hidrostatis berbanding lurus dengan jarak titik yang diukur vertikal dari dasar wadah","Tekanan hidrostatis bergantung pada luas penampang horizontal wadah silinder","Tekanan hidrostatis bernilai maksimum tepat pada permukaan bebas zat cair","Tekanan hidrostatis berbanding terbalik dengan percepatan gravitasi di tempat tersebut"],
        correctIndex: 0,
        explanation: "Sesuai persamaan P<sub>h</sub> = ρ·g·h, variabel h selalu diukur secara vertikal dari permukaan bebas zat cair ke titik pengamatan, sehingga makin dalam posisi titik dari permukaan, makin besar tekanan hidrostatisnya."
    },
    {
        id: "Q05",
        num: 5,
        topic: "Prinsip Pascal",
        diagram: SVG_HYDRAULIC_JACK,
        question: "Sebuah dongkrak hidrolik digunakan untuk mengangkat beban. Jika luas penampang piston kecil 8,5 cm<sup>2</sup> dan piston besar 340 cm<sup>2</sup>, serta gaya tekan yang diberikan pada piston kecil sebesar 220 N, maka gaya angkat yang dihasilkan pada piston besar adalah...",
        options: ["8.800 N","4.400 N","6.600 N","880 N","17.600 N"],
        correctIndex: 0,
        explanation: "Berdasarkan Hukum Pascal: F<sub>1</sub> / A<sub>1</sub> = F<sub>2</sub> / A<sub>2</sub> → F<sub>2</sub> = (A<sub>2</sub> / A<sub>1</sub>) × F<sub>1</sub> = (340 cm<sup>2</sup> / 8,5 cm<sup>2</sup>) × 220 N = 40 × 220 N = 8.800 N."
    },
    {
        id: "Q06",
        num: 6,
        topic: "Prinsip Pascal",
        diagram: SVG_HYDRAULIC_JACK,
        question: "Pada sistem dongkrak hidrolik dengan luas penampang piston kecil A<sub>1</sub> = 8,5 cm<sup>2</sup> dan piston besar A<sub>2</sub> = 340 cm<sup>2</sup>, keuntungan mekanis ideal sistem beserta jarak kenaikan piston besar (s<sub>2</sub>) ketika piston kecil ditekan turun sejauh s<sub>1</sub> = 16 cm adalah...",
        options: ["Keuntungan mekanis = 40 dan piston besar naik 0,4 cm","Keuntungan mekanis = 40 dan piston besar naik 4,0 cm","Keuntungan mekanis = 20 dan piston besar naik 0,8 cm","Keuntungan mekanis = 80 dan piston besar naik 0,2 cm","Keuntungan mekanis = 40 dan piston besar naik 16 cm"],
        correctIndex: 0,
        explanation: "Keuntungan mekanis KM = A<sub>2</sub> / A<sub>1</sub> = 340 / 8,5 = 40. Karena volume fluida yang berpindah tetap (A<sub>1</sub>·s<sub>1</sub> = A<sub>2</sub>·s<sub>2</sub>), maka s<sub>2</sub> = s<sub>1</sub> / 40 = 16 cm / 40 = 0,4 cm."
    },
    {
        id: "Q07",
        num: 7,
        topic: "Prinsip Pascal",
        diagram: null,
        question: "Dua silinder hidrolik yang saling terhubung memiliki perbandingan diameter penampang D<sub>1</sub> : D<sub>2</sub> = 1 : 5. Apabila pada piston silinder kecil diberikan gaya tekan sebesar 120 N, maka beban maksimum yang dapat ditahan oleh piston silinder besar adalah...",
        options: ["3.000 N","600 N","1.500 N","2.400 N","6.000 N"],
        correctIndex: 0,
        explanation: "Luas penampang lingkaran sebanding dengan kuadrat diameter (A ∝ D<sup>2</sup>), sehingga F<sub>2</sub> = (D<sub>2</sub> / D<sub>1</sub>)² × F<sub>1</sub> = (5 / 1)² × 120 N = 25 × 120 N = 3.000 N."
    },
    {
        id: "Q08",
        num: 8,
        topic: "Hukum Pokok Hidrostatika",
        diagram: SVG_U_TUBE,
        question: "Sebuah pipa U mula-mula diisi air (ρ<sub>air</sub> = 1.000 kg/m<sup>3</sup>), kemudian pada kaki kiri dituangkan minyak hingga terbentuk kolom minyak setinggi h<sub>1</sub> = 15 cm. Jika selisih tinggi permukaan air di kaki kanan terhadap bidang batas air-minyak adalah h<sub>2</sub> = 12 cm, maka massa jenis minyak tersebut adalah...",
        options: ["800 kg/m<sup>3</sup>","750 kg/m<sup>3</sup>","850 kg/m<sup>3</sup>","900 kg/m<sup>3</sup>","1.250 kg/m<sup>3</sup>"],
        correctIndex: 0,
        explanation: "Pada bidang batas horizontal yang sama berlaku Hukum Pokok Hidrostatika: ρ<sub>minyak</sub> · h<sub>1</sub> = ρ<sub>air</sub> · h<sub>2</sub> → ρ<sub>minyak</sub> × 15 cm = 1.000 × 12 cm → ρ<sub>minyak</sub> = 800 kg/m<sup>3</sup>."
    },
    {
        id: "Q09",
        num: 9,
        topic: "Hukum Pokok Hidrostatika",
        diagram: SVG_U_TUBE,
        question: "Pipa U berisi cairan raksa di bagian dasar, air (ρ<sub>1</sub> = 1,0 g/cm<sup>3</sup>) setinggi h<sub>1</sub> = 16 cm di kaki kiri, dan cairan X (ρ<sub>2</sub> = 0,8 g/cm<sup>3</sup>) di kaki kanan. Agar permukaan raksa pada kedua kaki pipa U tetap sejajar (sama tinggi), maka tinggi kolom cairan X yang harus dituangkan di kaki kanan adalah...",
        options: ["20 cm","16 cm","12,8 cm","24 cm","18 cm"],
        correctIndex: 0,
        explanation: "Karena permukaan raksa pada kedua kaki pipa sama tinggi, tekanan hidrostatis kedua cairan di atas batas raksa harus sama: ρ<sub>1</sub>·h<sub>1</sub> = ρ<sub>2</sub>·h<sub>2</sub> → 1,0 × 16 cm = 0,8 × h<sub>2</sub> → h<sub>2</sub> = 20 cm."
    },
    {
        id: "Q10",
        num: 10,
        topic: "Hukum Archimedes",
        diagram: null,
        question: "Sebuah balok logam ditimbang di udara menggunakan neraca pegas menunjukkan berat 80 N. Ketika balok tersebut dicelupkan seluruhnya ke dalam air (ρ<sub>air</sub> = 1.000 kg/m<sup>3</sup>, g = 10 m/s<sup>2</sup>), neraca pegas menunjukkan angka 60 N. Massa jenis balok logam tersebut adalah...",
        options: ["4.000 kg/m<sup>3</sup>","3.000 kg/m<sup>3</sup>","2.500 kg/m<sup>3</sup>","4.800 kg/m<sup>3</sup>","2.000 kg/m<sup>3</sup>"],
        correctIndex: 0,
        explanation: "Gaya apung F<sub>A</sub> = W<sub>udara</sub> − W<sub>semu</sub> = 80 N − 60 N = 20 N. Dari persamaan F<sub>A</sub> = ρ<sub>air</sub>·g·V diperoleh volume benda V = 20 / (1.000 × 10) = 0,002 m<sup>3</sup>. Massa benda m = 80 / 10 = 8 kg. Maka ρ<sub>benda</sub> = m / V = 8 kg / 0,002 m<sup>3</sup> = 4.000 kg/m<sup>3</sup>."
    },
    {
        id: "Q11",
        num: 11,
        topic: "Hukum Archimedes",
        diagram: null,
        question: "Sebuah benda padat homogen mengapung di permukaan air (ρ<sub>air</sub> = 1.000 kg/m<sup>3</sup>) dengan 25% bagian volumenya berada di atas permukaan air. Massa jenis benda padat tersebut adalah...",
        options: ["750 kg/m<sup>3</sup>","250 kg/m<sup>3</sup>","800 kg/m<sup>3</sup>","650 kg/m<sup>3</sup>","1.250 kg/m<sup>3</sup>"],
        correctIndex: 0,
        explanation: "Jika 25% volume berada di atas permukaan air, maka bagian volume yang tercelup di dalam air adalah V<sub>celup</sub> = 75% V = 0,75 V. Pada benda terapung berlaku ρ<sub>benda</sub> = (V<sub>celup</sub> / V<sub>total</sub>) × ρ<sub>air</sub> = 0,75 × 1.000 kg/m<sup>3</sup> = 750 kg/m<sup>3</sup>."
    },
    {
        id: "Q12",
        num: 12,
        topic: "Hukum Archimedes",
        diagram: null,
        question: "Sebuah rakit kayu memiliki volume 2,5 m<sup>3</sup> dan massa jenis 600 kg/m<sup>3</sup>. Jika rakit tersebut terapung di atas air danau (ρ<sub>air</sub> = 1.000 kg/m<sup>3</sup>, g = 10 m/s<sup>2</sup>), beban tambahan maksimum yang dapat diletakkan di atas rakit tepat sebelum rakit tenggelam seluruhnya adalah...",
        options: ["10.000 N","15.000 N","25.000 N","8.000 N","12.500 N"],
        correctIndex: 0,
        explanation: "Gaya apung maksimum saat seluruh volume rakit tercelup: F<sub>A(maks)</sub> = ρ<sub>air</sub>·g·V = 1.000 × 10 × 2,5 = 25.000 N. Berat rakit kosong: W<sub>rakit</sub> = ρ<sub>kayu</sub>·g·V = 600 × 10 × 2,5 = 15.000 N. Maka beban maksimum tambahan = 25.000 N − 15.000 N = 10.000 N."
    },
    {
        id: "Q13",
        num: 13,
        topic: "Hukum Archimedes",
        diagram: null,
        question: "Sebuah kubus kayu berada dalam kesetimbangan di antara dua lapisan cairan yang tidak bercampur, yaitu air (ρ<sub>air</sub> = 1,0 g/cm<sup>3</sup>) di bagian bawah dan minyak (ρ<sub>minyak</sub> = 0,8 g/cm<sup>3</sup>) di bagian atas. Jika 60% volume kubus tercelup di dalam air dan 40% sisanya tercelup di dalam minyak, massa jenis kubus kayu tersebut adalah...",
        options: ["0,92 g/cm<sup>3</sup>","0,90 g/cm<sup>3</sup>","0,88 g/cm<sup>3</sup>","0,84 g/cm<sup>3</sup>","0,96 g/cm<sup>3</sup>"],
        correctIndex: 0,
        explanation: "Gaya berat kubus diimbangi oleh jumlah gaya apung dari air dan minyak: ρ<sub>benda</sub> = (0,60 × ρ<sub>air</sub>) + (0,40 × ρ<sub>minyak</sub>) = (0,60 × 1,0) + (0,40 × 0,8) = 0,60 + 0,32 = 0,92 g/cm<sup>3</sup>."
    },
    {
        id: "Q14",
        num: 14,
        topic: "Persamaan Kontinuitas",
        diagram: SVG_HORIZONTAL_PIPE,
        question: "Air mengalir melalui pipa horizontal yang memiliki dua penampang berbeda seperti pada gambar. Pada bagian pertama, luas penampang pipa A<sub>1</sub> = 24 cm<sup>2</sup> dengan kecepatan aliran v<sub>1</sub> = 1,8 m/s. Pipa kemudian menyempit sehingga luas penampang pada bagian kedua menjadi A<sub>2</sub> = 8 cm<sup>2</sup>. Kecepatan aliran air pada bagian kedua (v<sub>2</sub>) adalah...",
        options: ["5,4 m/s","3,6 m/s","0,6 m/s","7,2 m/s","4,8 m/s"],
        correctIndex: 0,
        explanation: "Berdasarkan persamaan kontinuitas A<sub>1</sub>·v<sub>1</sub> = A<sub>2</sub>·v<sub>2</sub> → 24 cm<sup>2</sup> × 1,8 m/s = 8 cm<sup>2</sup> × v<sub>2</sub> → v<sub>2</sub> = 3 × 1,8 m/s = 5,4 m/s."
    },
    {
        id: "Q15",
        num: 15,
        topic: "Persamaan Kontinuitas",
        diagram: SVG_HORIZONTAL_PIPE,
        question: "Berdasarkan aliran air pada pipa horizontal dengan luas penampang pertama A<sub>1</sub> = 24 cm<sup>2</sup> dan kecepatan aliran v<sub>1</sub> = 1,8 m/s, besar debit air (Q) yang mengalir melalui pipa tersebut dalam satuan SI (m<sup>3</sup>/s) adalah...",
        options: ["4,32 × 10<sup>−3</sup> m<sup>3</sup>/s","4,32 × 10<sup>−2</sup> m<sup>3</sup>/s","1,44 × 10<sup>−3</sup> m<sup>3</sup>/s","2,16 × 10<sup>−3</sup> m<sup>3</sup>/s","4,32 × 10<sup>−4</sup> m<sup>3</sup>/s"],
        correctIndex: 0,
        explanation: "Luas penampang A<sub>1</sub> = 24 cm<sup>2</sup> = 24 × 10<sup>−4</sup> m<sup>2</sup>. Debit aliran Q = A<sub>1</sub> · v<sub>1</sub> = (24 × 10<sup>−4</sup> m<sup>2</sup>) × 1,8 m/s = 43,2 × 10<sup>−4</sup> m<sup>3</sup>/s = 4,32 × 10<sup>−3</sup> m<sup>3</sup>/s."
    },
    {
        id: "Q16",
        num: 16,
        topic: "Persamaan Kontinuitas",
        diagram: null,
        question: "Sebuah pipa silinder mengalirkan air dari bagian berdiameter D<sub>1</sub> = 8 cm dengan kelajuan 2 m/s menuju bagian pipa yang menyempit dengan diameter D<sub>2</sub> = 4 cm. Kelajuan aliran air pada bagian pipa berdiameter 4 cm tersebut adalah...",
        options: ["8 m/s","4 m/s","6 m/s","12 m/s","16 m/s"],
        correctIndex: 0,
        explanation: "Persamaan kontinuitas untuk penampang lingkaran: v<sub>2</sub> = (D<sub>1</sub> / D<sub>2</sub>)² × v<sub>1</sub> = (8 cm / 4 cm)² × 2 m/s = 4 × 2 m/s = 8 m/s."
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
        question: "Berdasarkan tangki terbuka dengan permukaan air 5,8 meter dari tanah dan lubang kebocoran pada ketinggian y = 2,3 meter di atas permukaan tanah (g = 10 m/s<sup>2</sup>), waktu yang diperlukan air untuk mencapai permukaan tanah sejak keluar secara horizontal dari lubang adalah...",
        options: ["t = √0,46 sekon (≈ 0,68 sekon)","t = √0,70 sekon (≈ 0,84 sekon)","t = 0,46 sekon","t = √1,16 sekon (≈ 1,08 sekon)","t = 0,23 sekon"],
        correctIndex: 0,
        explanation: "Gerak vertikal air setelah keluar horizontal dari lubang (v<sub>0y</sub> = 0) adalah gerak jatuh bebas dari ketinggian y = 2,3 m: y = ½·g·t<sup>2</sup> → t = √(2y / g) = √(2 × 2,3 / 10) = √0,46 s ≈ 0,68 s."
    },
    {
        id: "Q19",
        num: 19,
        topic: "Persamaan Bernoulli",
        diagram: SVG_HORIZONTAL_PIPE,
        question: "Berdasarkan hasil perhitungan kecepatan dan tekanan pada pipa horizontal yang menyempit dari 24 cm<sup>2</sup> menjadi 8 cm<sup>2</sup>, kesimpulan fisis yang benar mengenai hubungan antara luas penampang, kecepatan aliran, dan tekanan statis adalah...",
        options: ["Pada penampang yang lebih sempit, kecepatan aliran meningkat sehingga energi kinetik per satuan volume bertambah dan tekanan statis menurun","Pada penampang yang lebih sempit, kecepatan aliran meningkat sehingga tekanan statis ikut meningkat secara proporsional","Penyempitan penampang menyebabkan debit aliran berkurang drastis sehingga tekanan statis menurun","Tekanan statis pada kedua penampang tetap sama karena ketinggian pipa tidak berubah","Kecepatan aliran berbanding lurus dengan luas penampang dan berbanding lurus dengan tekanan statis"],
        correctIndex: 0,
        explanation: "Sesuai kekekalan energi mekanik fluida (Hukum Bernoulli) pada pipa horizontal, P + ½ρv<sup>2</sup> = konstan. Ketika penampang menyempit, laju v membesar sehingga tekanan dinamis (½ρv<sup>2</sup>) naik dan tekanan statis (P) turun dari 250.000 Pa menjadi 237.040 Pa."
    },
    {
        id: "Q20",
        num: 20,
        topic: "Teorema Torricelli",
        diagram: SVG_TORRICELLI_TANK,
        question: "Apabila posisi lubang pada tangki yang permukaan airnya berada 5,8 meter di atas tanah dapat diubah-ubah ketinggiannya, maka agar jarak horizontal pancaran air di tanah mencapai nilai maksimum, lubang harus dibuat pada ketinggian...",
        options: ["2,9 meter di atas tanah, dengan jarak pancar maksimum 5,8 meter","2,3 meter di atas tanah, dengan jarak pancar maksimum 5,8 meter","1,45 meter di atas tanah, dengan jarak pancar maksimum 2,9 meter","4,0 meter di atas tanah, dengan jarak pancar maksimum 6,4 meter","Tepat di dasar tangki, karena kecepatan pancaran air paling besar"],
        correctIndex: 0,
        explanation: "Persamaan jarak pancar x = 2√(h·y) dengan h + y = H = 5,8 m mencapai nilai maksimum ketika h = y = ½H = 2,9 m di atas tanah, yang menghasilkan jarak pancar maksimum x<sub>maks</sub> = H = 5,8 m."
    },
    {
        id: "Q21",
        num: 21,
        topic: "Pipa Bertingkat",
        diagram: SVG_STEPPED_PIPE_ABC,
        question: "Pada sistem pipa bertingkat tersebut, diketahui ketinggian titik A adalah h<sub>A</sub> = 4,8 m dan titik B adalah h<sub>B</sub> = 1,7 m. Jika kecepatan v<sub>A</sub> = 2,4 m/s, v<sub>B</sub> = 4,8 m/s, dan tekanan air di titik A sebesar P<sub>A</sub> = 190.000 Pa (ρ = 1.000 kg/m<sup>3</sup>, g = 10 m/s<sup>2</sup>), maka tekanan air pada titik B (P<sub>B</sub>) adalah...",
        options: ["212.360 Pa","221.000 Pa","181.360 Pa","203.720 Pa","229.640 Pa"],
        correctIndex: 0,
        explanation: "Menggunakan persamaan Bernoulli antara titik A dan B: P<sub>B</sub> = P<sub>A</sub> + ½ρ(v<sub>A</sub><sup>2</sup> − v<sub>B</sub><sup>2</sup>) + ρg(h<sub>A</sub> − h<sub>B</sub>) = 190.000 + 500×(2,4<sup>2</sup> − 4,8<sup>2</sup>) + 1.000×10×(4,8 − 1,7) = 190.000 + 500×(5,76 − 23,04) + 31.000 = 190.000 − 8.640 + 31.000 = 212.360 Pa."
    },
    {
        id: "Q22",
        num: 22,
        topic: "Persamaan Bernoulli",
        diagram: SVG_HORIZONTAL_PIPE,
        question: "Pada pipa horizontal tersebut (A<sub>1</sub> = 24 cm<sup>2</sup>, v<sub>1</sub> = 1,8 m/s, A<sub>2</sub> = 8 cm<sup>2</sup>, v<sub>2</sub> = 5,4 m/s), diketahui tekanan statis air pada bagian pertama adalah P<sub>1</sub> = 250.000 Pa dan massa jenis air ρ = 1.000 kg/m<sup>3</sup>. Besar tekanan air pada bagian kedua (P<sub>2</sub>) berdasarkan persamaan Bernoulli adalah...",
        options: ["237.040 Pa","262.960 Pa","235.420 Pa","241.360 Pa","224.080 Pa"],
        correctIndex: 0,
        explanation: "Pada pipa horizontal (h<sub>1</sub> = h<sub>2</sub>): P<sub>2</sub> = P<sub>1</sub> + ½·ρ·(v<sub>1</sub><sup>2</sup> − v<sub>2</sub><sup>2</sup>) = 250.000 + ½ × 1.000 × (1,8<sup>2</sup> − 5,4<sup>2</sup>) = 250.000 + 500 × (3,24 − 29,16) = 250.000 + 500 × (−25,92) = 250.000 − 12.960 = 237.040 Pa."
    },
    {
        id: "Q23",
        num: 23,
        topic: "Gaya Angkat Pesawat",
        diagram: SVG_AIRFOIL,
        question: "Perhatikan penampang sayap pesawat terbang (aerofoil) di atas! Agar sayap pesawat menghasilkan gaya angkat ke atas yang optimal saat bergerak maju di udara, hubungan kelajuan aliran udara dan tekanan statis pada bagian atas dan bawah sayap yang benar adalah...",
        options: ["v<sub>atas</sub> > v<sub>bawah</sub> sehingga P<sub>atas</sub> < P<sub>bawah</sub>","v<sub>atas</sub> < v<sub>bawah</sub> sehingga P<sub>atas</sub> > P<sub>bawah</sub>","v<sub>atas</sub> > v<sub>bawah</sub> sehingga P<sub>atas</sub> > P<sub>bawah</sub>","v<sub>atas</sub> = v<sub>bawah</sub> sehingga P<sub>atas</sub> < P<sub>bawah</sub>","v<sub>atas</sub> < v<sub>bawah</sub> sehingga P<sub>atas</sub> < P<sub>bawah</sub>"],
        correctIndex: 0,
        explanation: "Bentuk lengkungan sayap membuat garis alir udara di bagian atas lebih rapat sehingga kelajuan udara di atas sayap lebih besar (v<sub>atas</sub> > v<sub>bawah</sub>). Menurut prinsip Bernoulli, tekanan di atas sayap menjadi lebih kecil (P<sub>atas</sub> < P<sub>bawah</sub>) sehingga muncul gaya dorong ke atas."
    },
    {
        id: "Q24",
        num: 24,
        topic: "Gaya Angkat Pesawat",
        diagram: SVG_AIRFOIL,
        question: "Sebuah pesawat terbang memiliki luas total kedua sayap A = 60 m<sup>2</sup>. Kelajuan aliran udara di permukaan atas sayap adalah 250 m/s dan di permukaan bawah sayap adalah 200 m/s. Jika massa jenis udara ρ = 1,2 kg/m<sup>3</sup>, maka besar gaya angkat yang bekerja pada sayap pesawat tersebut adalah...",
        options: ["810.000 N (810 kN)","675.000 N (675 kN)","540.000 N (540 kN)","405.000 N (405 kN)","920.000 N (920 kN)"],
        correctIndex: 0,
        explanation: "Gaya angkat sayap pesawat dihitung dengan rumus Bernoulli: F<sub>angkat</sub> = ½ · ρ · A · (v<sub>atas</sub><sup>2</sup> − v<sub>bawah</sub><sup>2</sup>) = ½ × 1,2 × 60 × (250<sup>2</sup> − 200<sup>2</sup>) = 36 × (62.500 − 40.000) = 36 × 22.500 = 810.000 N (810 kN)."
    },
    {
        id: "Q25",
        num: 25,
        topic: "Pipa Bertingkat",
        diagram: SVG_STEPPED_PIPE_ABC,
        question: "Berdasarkan hasil perhitungan pada sistem pipa bertingkat (P<sub>A</sub> = 190.000 Pa, P<sub>B</sub> = 212.360 Pa, P<sub>C</sub> = 223.360 Pa), mengapa tekanan di titik C lebih besar daripada tekanan di titik A meskipun kecepatan aliran di titik C (4,8 m/s) lebih besar daripada di titik A (2,4 m/s)?",
        options: ["Penurunan energi potensial gravitasi per satuan volume akibat beda tinggi (42.000 Pa) jauh lebih besar daripada kenaikan tekanan dinamis akibat penyempitan pipa (8.640 Pa)","Luas penampang di titik C lebih kecil sehingga gaya tekan fluida menjadi berlipat ganda","Debit aliran air di titik C menjadi dua kali lipat lebih besar dibandingkan debit di titik A","Massa jenis air di titik C meningkat secara signifikan ketika mengalir menuruni pipa","Kecepatan aliran pada pipa menurun selalu berbanding lurus dengan tekanan statisnya"],
        correctIndex: 0,
        explanation: "Dari titik A ke C terjadi kenaikan tekanan dinamis sebesar ½ρ(v<sub>C</sub><sup>2</sup> − v<sub>A</sub><sup>2</sup>) = 8.640 Pa (yang cenderung menurunkan tekanan statis), namun secara bersamaan terjadi penurunan ketinggian Δh = 4,2 m yang menyumbang tambahan tekanan potensial ρgΔh = 42.000 Pa. Selisih bersihnya (+33.360 Pa) membuat P<sub>C</sub> > P<sub>A</sub>."
    },
];

// Bank Soal Cadangan Teruji (10 Butir Cadangan Evaluasi/Pengayaan)
const QUESTIONS_RESERVE = [
    {
        id: "RES_Q07",
        originalNum: 7,
        topic: "Tekanan Hidrostatis",
        diagram: null,
        question: "Seorang penyelam berada pada kedalaman 35 meter di bawah permukaan laut yang memiliki massa jenis air laut ρ = 1.025 kg/m<sup>3</sup>. Jika g = 10 m/s<sup>2</sup> dan tekanan atmosfer di permukaan laut 100.000 Pa, besar tekanan hidrostatis yang dialami penyelam tersebut adalah...",
        options: ["358.750 Pa","458.750 Pa","350.000 Pa","258.750 Pa","307.500 Pa"],
        correctIndex: 0,
        explanation: "Tekanan hidrostatis murni dihitung tanpa tekanan atmosfer: P<sub>h</sub> = ρ·g·h = 1.025 kg/m<sup>3</sup> × 10 m/s<sup>2</sup> × 35 m = 358.750 Pa."
    },
    {
        id: "RES_Q15",
        originalNum: 15,
        topic: "Hukum Archimedes",
        diagram: null,
        question: "Sebuah balon udara bervolume 500 m<sup>3</sup> diisi gas helium yang memiliki massa jenis 0,2 kg/m<sup>3</sup>. Jika massa jenis udara di sekitar balon adalah 1,2 kg/m<sup>3</sup> dan percepatan gravitasi g = 10 m/s<sup>2</sup>, maka gaya angkat bersih balon tersebut (sebelum dikurangi massa keranjang) adalah...",
        options: ["5.000 N","6.000 N","1.000 N","4.000 N","7.000 N"],
        correctIndex: 0,
        explanation: "Gaya angkat bersih balon: F<sub>angkat</sub> = F<sub>A</sub>rchimedes − W_helium = (ρ_udara − ρ_helium)·g·V = (1,2 − 0,2) × 10 × 500 = 1,0 × 5.000 = 5.000 N."
    },
    {
        id: "RES_Q18",
        originalNum: 18,
        topic: "Persamaan Bernoulli",
        diagram: SVG_HORIZONTAL_PIPE,
        question: "Pada pipa horizontal tersebut (A<sub>1</sub> = 24 cm<sup>2</sup>, v<sub>1</sub> = 1,8 m/s, A<sub>2</sub> = 8 cm<sup>2</sup>, v<sub>2</sub> = 5,4 m/s), diketahui tekanan statis air pada bagian pertama adalah P<sub>1</sub> = 250.000 Pa dan massa jenis air ρ = 1.000 kg/m<sup>3</sup>. Besar tekanan air pada bagian kedua (P<sub>2</sub>) berdasarkan persamaan Bernoulli adalah...",
        options: ["237.040 Pa","262.960 Pa","235.420 Pa","241.360 Pa","224.080 Pa"],
        correctIndex: 0,
        explanation: "Pada pipa horizontal (h<sub>1</sub> = h<sub>2</sub>): P<sub>2</sub> = P<sub>1</sub> + ½·ρ·(v<sub>1</sub><sup>2</sup> − v<sub>2</sub><sup>2</sup>) = 250.000 + ½ × 1.000 × (1,8<sup>2</sup> − 5,4<sup>2</sup>) = 250.000 + 500 × (3,24 − 29,16) = 250.000 + 500 × (−25,92) = 250.000 − 12.960 = 237.040 Pa."
    },
    {
        id: "RES_Q25",
        originalNum: 25,
        topic: "Pipa Bertingkat",
        diagram: SVG_STEPPED_PIPE_ABC,
        question: "Sebuah sistem perpipaan mengalirkan air melalui tiga titik pengamatan A, B, dan C seperti pada gambar. Luas penampang pipa di titik A adalah 14 cm<sup>2</sup>, di titik B adalah 7 cm<sup>2</sup>, dan di titik C adalah 7 cm<sup>2</sup>. Jika kecepatan aliran air di titik A sebesar v<sub>A</sub> = 2,4 m/s, maka kecepatan aliran air pada titik B (v<sub>B</sub>) dan titik C (v<sub>C</sub>) adalah...",
        options: ["v<sub>B</sub> = 4,8 m/s dan v<sub>C</sub> = 4,8 m/s","v<sub>B</sub> = 1,2 m/s dan v<sub>C</sub> = 1,2 m/s","v<sub>B</sub> = 4,8 m/s dan v<sub>C</sub> = 9,6 m/s","v<sub>B</sub> = 2,4 m/s dan v<sub>C</sub> = 4,8 m/s","v<sub>B</sub> = 3,6 m/s dan v<sub>C</sub> = 4,8 m/s"],
        correctIndex: 0,
        explanation: "Berdasarkan persamaan kontinuitas A<sub>A</sub>·v<sub>A</sub> = A<sub>B</sub>·v<sub>B</sub> = A<sub>C</sub>·v<sub>C</sub> → 14 × 2,4 = 7 × v<sub>B</sub> → v<sub>B</sub> = 4,8 m/s. Karena A<sub>C</sub> = A<sub>B</sub> = 7 cm<sup>2</sup>, maka v<sub>C</sub> = v<sub>B</sub> = 4,8 m/s."
    },
    {
        id: "RES_Q27",
        originalNum: 27,
        topic: "Pipa Bertingkat",
        diagram: SVG_STEPPED_PIPE_ABC,
        question: "Masih pada sistem pipa bertingkat yang sama (h<sub>A</sub> = 4,8 m, h<sub>B</sub> = 1,7 m, h<sub>C</sub> = 0,6 m; v<sub>A</sub> = 2,4 m/s, v<sub>B</sub> = v<sub>C</sub> = 4,8 m/s; P<sub>A</sub> = 190.000 Pa), besar tekanan air pada titik C (P<sub>C</sub>) adalah...",
        options: ["223.360 Pa","212.360 Pa","232.000 Pa","201.360 Pa","240.640 Pa"],
        correctIndex: 0,
        explanation: "Karena v<sub>C</sub> = v<sub>B</sub> = 4,8 m/s, selisih tekanan antara B dan C murni berasal dari penurunan ketinggian Δh<sub>B</sub>C = 1,7 m − 0,6 m = 1,1 m: P<sub>C</sub> = P<sub>B</sub> + ρ·g·(h<sub>B</sub> − h<sub>C</sub>) = 212.360 Pa + 1.000×10×1,1 = 212.360 + 11.000 = 223.360 Pa."
    },
    {
        id: "RES_Q29",
        originalNum: 29,
        topic: "Pipa Bertingkat",
        diagram: SVG_STEPPED_PIPE_ABC,
        question: "Pada sistem pipa bertingkat tersebut (A<sub>A</sub> = 14 cm<sup>2</sup>, v<sub>A</sub> = 2,4 m/s), volume air yang mengalir melewati penampang titik C selama 5 menit adalah...",
        options: ["1,008 m<sup>3</sup> (1.008 liter)","0,504 m<sup>3</sup> (504 liter)","3,360 m<sup>3</sup> (3.360 liter)","0,336 m<sup>3</sup> (336 liter)","2,016 m<sup>3</sup> (2.016 liter)"],
        correctIndex: 0,
        explanation: "Debit aliran konstan di sepanjang pipa: Q = A<sub>A</sub> · v<sub>A</sub> = (14 × 10<sup>−4</sup> m<sup>2</sup>) × 2,4 m/s = 3,36 × 10<sup>−3</sup> m<sup>3</sup>/s. Selama waktu t = 5 menit = 300 sekon, volume air yang mengalir adalah V = Q · t = (3,36 × 10<sup>−3</sup>) × 300 = 1,008 m<sup>3</sup> (1.008 liter)."
    },
    {
        id: "RES_Q30",
        originalNum: 30,
        topic: "Evaluasi Eksperimen Fluida",
        diagram: SVG_EXPERIMENT_TABLE,
        question: "Seorang siswa melakukan eksperimen aliran air pada pipa horizontal dan memperoleh tabel data Percobaan I s.d. IV di atas. Jika dihitung nilai debit air (Q = A · v) pada keempat percobaan dalam satuan cm<sup>3</sup>/s, maka diperoleh hasil...",
        options: ["Q_I = 16,2 cm<sup>3</sup>/s; Q_II = 16,8 cm<sup>3</sup>/s; Q_III = 18,9 cm<sup>3</sup>/s; Q_IV = 16,8 cm<sup>3</sup>/s","Q_I = 16,2 cm<sup>3</sup>/s; Q_II = 16,2 cm<sup>3</sup>/s; Q_III = 16,2 cm<sup>3</sup>/s; Q_IV = 16,2 cm<sup>3</sup>/s","Q_I = 1.620 cm<sup>3</sup>/s; Q_II = 1.680 cm<sup>3</sup>/s; Q_III = 1.890 cm<sup>3</sup>/s; Q_IV = 1.680 cm<sup>3</sup>/s","Q_I = 20,0 cm<sup>3</sup>/s; Q_II = 8,57 cm<sup>3</sup>/s; Q_III = 4,29 cm<sup>3</sup>/s; Q_IV = 2,14 cm<sup>3</sup>/s","Q_I = 180 cm<sup>3</sup>/s; Q_II = 168 cm<sup>3</sup>/s; Q_III = 189 cm<sup>3</sup>/s; Q_IV = 168 cm<sup>3</sup>/s"],
        correctIndex: 2,
        explanation: "Konversi kecepatan ke cm/s (1 m/s = 100 cm/s): Q_I = 18 cm<sup>2</sup> × 90 cm/s = 1.620 cm<sup>3</sup>/s; Q_II = 12 cm<sup>2</sup> × 140 cm/s = 1.680 cm<sup>3</sup>/s; Q_III = 9 cm<sup>2</sup> × 210 cm/s = 1.890 cm<sup>3</sup>/s; Q_IV = 6 cm<sup>2</sup> × 280 cm/s = 1.680 cm<sup>3</sup>/s."
    },
    {
        id: "RES_Q31",
        originalNum: 31,
        topic: "Evaluasi Eksperimen Fluida",
        diagram: SVG_EXPERIMENT_TABLE,
        question: "Berdasarkan tabel data eksperimen tersebut (ρ<sub>air</sub> = 1.000 kg/m<sup>3</sup>), jumlah tekanan statis dan tekanan dinamis (P + ½ρv<sup>2</sup>) pada Percobaan I (v = 0,9 m/s, P = 260.000 Pa) dan Percobaan IV (v = 2,8 m/s, P = 176.000 Pa) berturut-turut adalah...",
        options: ["Percobaan I = 260.405 Pa dan Percobaan IV = 179.920 Pa","Percobaan I = 260.810 Pa dan Percobaan IV = 183.840 Pa","Percobaan I = 260.405 Pa dan Percobaan IV = 260.405 Pa","Percobaan I = 259.595 Pa dan Percobaan IV = 172.080 Pa","Percobaan I = 264.050 Pa dan Percobaan IV = 215.200 Pa"],
        correctIndex: 0,
        explanation: "Pada Percobaan I: P<sub>1</sub> + ½ρv<sub>1</sub><sup>2</sup> = 260.000 + 500×(0,9)² = 260.000 + 405 = 260.405 Pa. Pada Percobaan IV: P₄ + ½ρv₄² = 176.000 + 500×(2,8)² = 176.000 + 500×(7,84) = 176.000 + 3.920 = 179.920 Pa."
    },
    {
        id: "RES_Q32",
        originalNum: 32,
        topic: "Evaluasi Eksperimen Fluida",
        diagram: SVG_EXPERIMENT_TABLE,
        question: "Jika dihitung nilai total (P + ½ρv<sup>2</sup>) pada Percobaan II (v = 1,4 m/s, P = 237.000 Pa) dan Percobaan III (v = 2,1 m/s, P = 208.000 Pa), maka diperoleh nilai berturut-turut sebesar...",
        options: ["Percobaan II = 237.980 Pa dan Percobaan III = 210.205 Pa","Percobaan II = 238.960 Pa dan Percobaan III = 212.410 Pa","Percobaan II = 237.700 Pa dan Percobaan III = 209.050 Pa","Percobaan II = 236.020 Pa dan Percobaan III = 205.795 Pa","Percobaan II = 246.800 Pa dan Percobaan III = 230.050 Pa"],
        correctIndex: 0,
        explanation: "Pada Percobaan II: P<sub>2</sub> + ½ρv<sub>2</sub><sup>2</sup> = 237.000 + 500×(1,4)² = 237.000 + 500×1,96 = 237.980 Pa. Pada Percobaan III: P₃ + ½ρv₃² = 208.000 + 500×(2,1)² = 208.000 + 500×4,41 = 208.000 + 2.205 = 210.205 Pa."
    },
    {
        id: "RES_Q33",
        originalNum: 33,
        topic: "Evaluasi Eksperimen Fluida",
        diagram: SVG_EXPERIMENT_TABLE,
        question: "Berdasarkan evaluasi keempat percobaan pada tabel, nilai (P + ½ρv<sup>2</sup>) terus mengalami penurunan yang signifikan dari Percobaan I (260.405 Pa) hingga Percobaan IV (179.920 Pa). Analisis ilmiah yang paling tepat mengenai data eksperimen tersebut adalah...",
        options: ["Data tidak konsisten dengan persamaan Bernoulli fluida ideal karena pada fluida nyata terjadi disipasi energi mekanik akibat gesekan terhadap dinding pipa dan turbulensi saat pipa menyempit","Data sangat konsisten dengan fluida ideal karena tekanan statis selalu berkurang sebesar kelipatan luas penampang","Penurunan nilai P + ½ρv<sup>2</sup> membuktikan bahwa massa jenis air berkurang drastis ketika mengalir melalui pipa sempit","Persamaan Bernoulli tidak berlaku pada pipa horizontal melainkan hanya berlaku pada pipa vertikal","Kenaikan kecepatan aliran dari 0,9 m/s ke 2,8 m/s sudah sepenuhnya menggantikan penurunan tekanan sebesar 84.000 Pa"],
        correctIndex: 0,
        explanation: "Untuk fluida ideal pada pipa horizontal, jumlah P + ½ρv<sup>2</sup> seharusnya konstan. Penurunan tajam sebesar ~80.485 Pa menunjukkan kehilangan tinggi tekan (head loss) akibat gesekan internal fluida nyata terhadap dinding pipa, pusaran turbulen pada penyempitan, serta ketidakpastian alat ukur."
    },
];

if (typeof module !== "undefined") {
    module.exports = { MASTER_QUESTIONS, QUESTIONS_RESERVE };
}
