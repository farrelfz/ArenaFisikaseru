// ==========================================================================
// HYDROARENA SMAN 78 JAKARTA - BANK 25 BUTIR SOAL TERKURASI FLUIDA XI
// STANDAR ASESMEN KOMPETITIF (SNBT/UTBK & ANALISIS BERBOBOT)
// FORMAT NOTASI ILMIAH RESMI DENGAN TAG SUB & SUP
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
        question: "Tiga wadah berbeda bentuk diisi air (ρ = 1.000 kg/m<sup>3</sup>, g = 10 m/s<sup>2</sup>) hingga ketinggian yang sama, yaitu 50 cm di atas dasar. Wadah I berupa silinder lebar dengan luas dasar 400 cm<sup>2</sup>, wadah II berupa silinder sempit dengan luas dasar 100 cm<sup>2</sup>, dan wadah III berupa wadah yang melebar ke atas (corong) dengan luas dasar 250 cm<sup>2</sup>. Jika P<sub>I</sub>, P<sub>II</sub>, P<sub>III</sub> adalah tekanan hidrostatis di dasar tiap wadah dan F<sub>I</sub>, F<sub>II</sub>, F<sub>III</sub> adalah gaya hidrostatis total pada dasar tiap wadah, maka pernyataan yang benar adalah...",
        options: ["P<sub>I</sub> = P<sub>II</sub> = P<sub>III</sub> = 5.000 Pa, sedangkan F<sub>I</sub> : F<sub>II</sub> : F<sub>III</sub> = 8 : 2 : 5","P<sub>I</sub> = P<sub>II</sub> = P<sub>III</sub> = 5.000 Pa, sedangkan F<sub>I</sub> = F<sub>II</sub> = F<sub>III</sub> = 200 N","P<sub>I</sub> : P<sub>II</sub> : P<sub>III</sub> = 8 : 2 : 5, sedangkan F<sub>I</sub> = F<sub>II</sub> = F<sub>III</sub>","P<sub>I</sub> : P<sub>II</sub> : P<sub>III</sub> = 8 : 2 : 5, sedangkan F<sub>I</sub> : F<sub>II</sub> : F<sub>III</sub> = 8 : 2 : 5","P<sub>III</sub> > P<sub>I</sub> > P<sub>II</sub> karena wadah III berbentuk corong sehingga menampung volume air paling besar"],
        correctIndex: 0,
        explanation: "Tekanan hidrostatis adalah besaran intensif yang hanya bergantung pada kedalaman: P = ρ·g·h = 1.000 × 10 × 0,50 = 5.000 Pa, sama untuk ketiga wadah. Gaya hidrostatis bersifat ekstensif: F = P·A, sehingga F<sub>I</sub> = 5.000 × 0,04 = 200 N; F<sub>II</sub> = 5.000 × 0,01 = 50 N; F<sub>III</sub> = 5.000 × 0,025 = 125 N. Perbandingannya: F<sub>I</sub> : F<sub>II</sub> : F<sub>III</sub> = 200 : 50 : 125 = 8 : 2 : 5 (Paradoks Hidrostatika)."
    },
    {
        id: "Q05",
        num: 5,
        topic: "Prinsip Pascal",
        diagram: SVG_HYDRAULIC_JACK,
        question: "Sebuah dongkrak hidrolik memiliki piston kecil dengan luas penampang A<sub>1</sub> = 8,5 cm<sup>2</sup> dan piston besar dengan A<sub>2</sub> = 340 cm<sup>2</sup>. Dongkrak tersebut digunakan untuk mengangkat mobil bermassa 800 kg (g = 10 m/s<sup>2</sup>) setinggi 8 cm. Jika efisiensi sistem adalah 80% dan setiap kali penekanan piston kecil turun sejauh 20 cm, maka gaya minimum yang harus diberikan pada setiap penekanan dan jumlah penekanan yang diperlukan berturut-turut adalah...",
        options: ["250 N dan 16 kali penekanan","200 N dan 16 kali penekanan","250 N dan 40 kali penekanan","312,5 N dan 16 kali penekanan","200 N dan 20 kali penekanan"],
        correctIndex: 0,
        explanation: "Keuntungan mekanis KM = A<sub>2</sub> / A<sub>1</sub> = 340 / 8,5 = 40. Berat mobil W = m·g = 800 × 10 = 8.000 N, sehingga gaya ideal F<sub>1(ideal)</sub> = 8.000 / 40 = 200 N. Dengan efisiensi 80%: F<sub>1(nyata)</sub> = 200 / 0,80 = 250 N. Jarak tempuh piston kecil: A<sub>1</sub>·s<sub>1</sub> = A<sub>2</sub>·s<sub>2</sub> → s<sub>1</sub> = 40 × 8 cm = 320 cm. Jumlah penekanan: 320 cm / 20 cm = 16 kali penekanan."
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
        diagram: null,
        question: "Pipa utama saluran air berpenampang A<sub>0</sub> = 30 cm<sup>2</sup> mengalirkan air dengan kelajuan v<sub>0</sub> = 3 m/s, kemudian bercabang menjadi dua pipa. Cabang A berpenampang 12 cm<sup>2</sup> dengan kelajuan aliran 4 m/s, sedangkan cabang B berpenampang 10 cm<sup>2</sup>. Jika seluruh air dari cabang B dialirkan untuk mengisi tandon berkapasitas 1.260 liter, maka kelajuan aliran di cabang B dan waktu yang diperlukan hingga tandon penuh adalah...",
        options: ["v<sub>B</sub> = 4,2 m/s dan tandon penuh dalam 5 menit","v<sub>B</sub> = 4,2 m/s dan tandon penuh dalam 50 menit","v<sub>B</sub> = 4,2 m/s dan tandon penuh dalam 2,5 menit","v<sub>B</sub> = 4,8 m/s dan tandon penuh dalam 5 menit","v<sub>B</sub> = 13,8 m/s dan tandon penuh dalam 5 menit"],
        correctIndex: 0,
        explanation: "Debit pipa utama terbagi ke kedua cabang: Q<sub>0</sub> = Q<sub>A</sub> + Q<sub>B</sub>. Q<sub>0</sub> = 30×10<sup>−4</sup> × 3 = 9×10<sup>−3</sup> m<sup>3</sup>/s = 9 L/s. Q<sub>A</sub> = 12×10<sup>−4</sup> × 4 = 4,8×10<sup>−3</sup> m<sup>3</sup>/s = 4,8 L/s. Maka Q<sub>B</sub> = 9 − 4,8 = 4,2 L/s = 4,2×10<sup>−3</sup> m<sup>3</sup>/s. Kelajuan cabang B: v<sub>B</sub> = Q<sub>B</sub> / A<sub>B</sub> = 4,2×10<sup>−3</sup> / 10×10<sup>−4</sup> = 4,2 m/s. Waktu pengisian tandon: t = Volume / Q<sub>B</sub> = 1.260 L / 4,2 L/s = 300 sekon = 5 menit."
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
        diagram: null,
        question: "Sebuah tangki penampung air memiliki permukaan air 5,0 meter di atas tanah. Dua lubang semprotan dibuat pada dinding tangki: lubang A pada ketinggian y<sub>A</sub> = 1,8 meter dari tanah dan lubang B pada ketinggian yang berbeda. Pancaran air dari kedua lubang mengenai tanah pada jarak horizontal yang sama dari dinding tangki (g = 10 m/s<sup>2</sup>). Ketinggian letak lubang B dan jarak horizontal pancaran tersebut adalah...",
        options: ["y<sub>B</sub> = 3,2 m dan x = 4,8 m","y<sub>B</sub> = 2,5 m dan x = 5,0 m","y<sub>B</sub> = 3,2 m dan x = 5,0 m","y<sub>B</sub> = 3,2 m dan x = 6,4 m","y<sub>B</sub> = 1,8 m dan x = 4,8 m"],
        correctIndex: 0,
        explanation: "Jarak pancar x = 2√((H − y)·y). Syarat x<sub>A</sub> = x<sub>B</sub> berarti nilai perkalian kedalaman dan ketinggian sama: (H − y<sub>A</sub>)·y<sub>A</sub> = (H − y<sub>B</sub>)·y<sub>B</sub>. Berdasarkan sifat simetri akar persamaan kuadrat, y<sub>A</sub> + y<sub>B</sub> = H = 5,0 m → y<sub>B</sub> = 5,0 − 1,8 = 3,2 m. Jarak jangkauan: x = 2√(3,2 × 1,8) = 2√5,76 = 2 × 2,4 = 4,8 meter."
    },
    {
        id: "Q19",
        num: 19,
        topic: "Persamaan Bernoulli",
        diagram: SVG_HORIZONTAL_PIPE,
        question: "Air mengalir melalui pipa horizontal yang menyempit dari penampang A<sub>1</sub> = 24 cm<sup>2</sup> menuju A<sub>2</sub> = 8 cm<sup>2</sup>. Manometer pada kedua penampang mencatat selisih tekanan statis sebesar 16.000 Pa (ρ<sub>air</sub> = 1.000 kg/m<sup>3</sup>). Kelajuan aliran air pada penampang masuk (v<sub>1</sub>) dan selisih tekanan statis yang terbaca jika debit aliran digandakan menjadi dua kali lipat semula adalah...",
        options: ["v<sub>1</sub> = 2 m/s dan selisih tekanan menjadi 64.000 Pa","v<sub>1</sub> = 2 m/s dan selisih tekanan menjadi 32.000 Pa","v<sub>1</sub> = 2 m/s dan selisih tekanan menjadi 4.000 Pa","v<sub>1</sub> ≈ 5,66 m/s dan selisih tekanan menjadi 64.000 Pa","v<sub>1</sub> = 4 m/s dan selisih tekanan menjadi 16.000 Pa"],
        correctIndex: 0,
        explanation: "Persamaan kontinuitas: A<sub>1</sub>v<sub>1</sub> = A<sub>2</sub>v<sub>2</sub> → v<sub>2</sub> = 3v<sub>1</sub>. Persamaan Bernoulli pipa horizontal: ΔP = ½ρ(v<sub>2</sub><sup>2</sup> − v<sub>1</sub><sup>2</sup>) = ½(1.000)(9v<sub>1</sub><sup>2</sup> − v<sub>1</sub><sup>2</sup>) = 4.000v<sub>1</sub><sup>2</sup>. Diketahui ΔP = 16.000 Pa → 4.000v<sub>1</sub><sup>2</sup> = 16.000 → v<sub>1</sub><sup>2</sup> = 4 → v<sub>1</sub> = 2 m/s. Karena ΔP sebanding dengan kuadrat kelajuan (ΔP ∝ v<sup>2</sup> ∝ Q<sup>2</sup>), saat debit digandakan 2×, selisih tekanan meningkat 2<sup>2</sup> = 4× lipat: 4 × 16.000 = 64.000 Pa."
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
        question: "Sebuah pesawat terbang bermassa total 54 ton (W = 540.000 N, g = 10 m/s<sup>2</sup>) memiliki luas total kedua sayap A = 40 m<sup>2</sup>. Saat terbang mendatar stabil (gaya angkat sama dengan berat pesawat), kelajuan aliran udara di atas sayap terukur 1,25 kali kelajuan aliran udara di bawah sayap. Jika massa jenis udara luar ρ = 1,2 kg/m<sup>3</sup>, besar kelajuan aliran udara di bawah sayap (v<sub>2</sub>) dan di atas sayap (v<sub>1</sub>) berturut-turut adalah...",
        options: ["v<sub>2</sub> = 200 m/s dan v<sub>1</sub> = 250 m/s","v<sub>2</sub> = 250 m/s dan v<sub>1</sub> = 200 m/s","v<sub>2</sub> = 200 m/s dan v<sub>1</sub> = 200 m/s","v<sub>2</sub> ≈ 141 m/s dan v<sub>1</sub> ≈ 177 m/s","v<sub>2</sub> = 100 m/s dan v<sub>1</sub> = 125 m/s"],
        correctIndex: 0,
        explanation: "Gaya angkat pesawat saat terbang mendatar: F<sub>angkat</sub> = W = 540.000 N. Rumus gaya angkat Bernoulli: F<sub>angkat</sub> = ½ · ρ · A · (v<sub>1</sub><sup>2</sup> − v<sub>2</sub><sup>2</sup>). Substitusi v<sub>1</sub> = 1,25 v<sub>2</sub> → v<sub>1</sub><sup>2</sup> − v<sub>2</sub><sup>2</sup> = (1,5625 − 1)v<sub>2</sub><sup>2</sup> = 0,5625 v<sub>2</sub><sup>2</sup>. Maka: ½ × 1,2 × 40 × 0,5625 v<sub>2</sub><sup>2</sup> = 13,5 v<sub>2</sub><sup>2</sup> = 540.000 → v<sub>2</sub><sup>2</sup> = 40.000 → v<sub>2</sub> = 200 m/s dan v<sub>1</sub> = 1,25 × 200 = 250 m/s."
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
