"""Zone 01 — Vector Fundamentals (25 questions)."""

from __future__ import annotations

from physics_engine import magnitude, unit_vector
from qgen.common import Registry, fmt


def build(reg: Registry) -> None:
    z = 1

    reg.mc(
        z,
        subtopic="Besaran Skalar dan Vektor",
        difficulty=1,
        text="Kelompok besaran berikut yang seluruhnya merupakan besaran vektor adalah …",
        correct="kecepatan, gaya, dan perpindahan",
        distractors=[
            "jarak, kelajuan, dan percepatan",
            "massa, waktu, dan suhu",
            "usaha, daya, dan momentum",
            "energi, gaya, dan jarak",
        ],
        explanation=(
            "Besaran vektor memiliki besar sekaligus arah. Kecepatan, gaya, dan perpindahan "
            "memenuhi keduanya. Jarak, kelajuan, massa, waktu, suhu, usaha, energi, dan daya "
            "adalah besaran skalar (hanya besar)."
        ),
        misconception="Menganggap 'arah' pada kalimat sehari-hari cukup untuk menjadikan suatu besaran vektor.",
        time=40,
    )

    reg.mc(
        z,
        subtopic="Besaran Skalar dan Vektor",
        difficulty=1,
        text=(
            "Perhatikan besaran berikut: (1) berat, (2) massa, (3) kuat arus listrik, "
            "(4) impuls, (5) tekanan. Besaran yang tergolong vektor adalah …"
        ),
        correct="(1) dan (4)",
        distractors=["(1), (2), dan (4)", "(2), (3), dan (5)", "(1), (3), dan (4)", "(4) dan (5)"],
        explanation=(
            "Berat adalah gaya gravitasi (vektor), impuls adalah perubahan momentum (vektor). "
            "Massa adalah skalar. Kuat arus listrik dan tekanan diperlakukan sebagai skalar "
            "dalam kurikulum fisika SMA."
        ),
        misconception="Menyimpulkan bahwa kuat arus listrik adalah vektor karena digambarkan dengan panah pada rangkaian.",
        time=45,
    )

    reg.mc(
        z,
        subtopic="Besaran Skalar dan Vektor",
        difficulty=1,
        text="Manakah pernyataan yang benar tentang besaran skalar?",
        correct="Besaran skalar hanya memiliki nilai dan tidak memiliki arah",
        distractors=[
            "Besaran skalar selalu bernilai positif",
            "Besaran skalar dapat dijumlahkan dengan aturan jajar genjang",
            "Besaran skalar memiliki satuan yang selalu sama dengan besaran vektor",
            "Besaran skalar berubah nilainya jika arah pengukuran diubah",
        ],
        explanation=(
            "Skalar dicirikan oleh nilai (dan satuan) saja. Nilainya boleh negatif (misalnya suhu), "
            "dan penjumlahannya mengikuti aljabar biasa, bukan aturan vektor."
        ),
        misconception="Menganggap skalar selalu positif sehingga suhu −5 °C dianggap bukan skalar.",
        time=35,
    )

    reg.mc(
        z,
        subtopic="Vektor Nol",
        difficulty=1,
        text="Sifat yang tepat untuk vektor nol adalah …",
        correct="besarnya nol dan arahnya tidak terdefinisi",
        distractors=[
            "besarnya satu satuan dan arahnya ke sumbu X positif",
            "besarnya nol dan arahnya selalu ke atas",
            "besarnya tak hingga dan arahnya ke pusat bumi",
            "besarnya negatif dan arahnya berlawanan dengan sumbu Y",
        ],
        explanation=(
            "Vektor nol ditulis 0 dengan |0| = 0. Karena panjangnya nol, tidak ada arah yang dapat "
            "ditetapkan. Vektor nol tetap boleh muncul sebagai hasil penjumlahan dua vektor berlawanan."
        ),
        misconception="Mengira vektor nol tidak dapat dijumlahkan atau memiliki arah tertentu.",
        time=35,
    )

    reg.mc(
        z,
        subtopic="Kesamaan Dua Vektor",
        difficulty=1,
        text="Dua vektor A dan B dinyatakan sama (A = B) jika dan hanya jika …",
        correct="besar dan arah keduanya sama",
        distractors=[
            "besar keduanya sama meskipun arahnya tegak lurus",
            "arah keduanya sama meskipun besarnya berbeda",
            "titik tangkap keduanya berada di titik yang sama",
            "hasil kali keduanya bernilai satu",
        ],
        explanation=(
            "Vektor adalah objek bebas: posisi gambar tidak menentukan. Kesamaan vektor hanya "
            "menuntut magnitudo sama dan arah sama."
        ),
        misconception="Menganggap titik tangkap harus identik agar dua vektor dianggap sama.",
        time=40,
    )

    reg.mc(
        z,
        subtopic="Vektor Berlawanan",
        difficulty=1,
        text="Vektor P memiliki besar 15 N dan arahnya ke barat. Vektor −P memiliki …",
        correct="besar 15 N dan arah ke timur",
        distractors=[
            "besar −15 N dan arah ke barat",
            "besar 15 N dan arah ke barat",
            "besar 15 N dan arah ke selatan",
            "besar 0 N",
        ],
        explanation=(
            "Tanda minus membalik arah vektor sebesar 180°, bukan membuat magnitudonya negatif. "
            "Barat dibalik menjadi timur, besar tetap 15 N."
        ),
        misconception="Menyatakan magnitudo vektor bernilai negatif (−15 N).",
        time=40,
    )

    reg.mc(
        z,
        subtopic="Notasi Vektor",
        difficulty=1,
        text="Dalam notasi vektor satuan, i, j, dan k berturut-turut menyatakan arah …",
        correct="sumbu X positif, sumbu Y positif, dan sumbu Z positif",
        distractors=[
            "sumbu X positif, sumbu Z positif, dan sumbu Y positif",
            "sumbu Y positif, sumbu X positif, dan sumbu Z positif",
            "sumbu X negatif, sumbu Y negatif, dan sumbu Z negatif",
            "arah utara, timur, dan atas",
        ],
        explanation="i, j, k adalah vektor basis ortonormal pada sumbu X, Y, Z dengan besar satu satuan.",
        misconception="Menukar urutan j dan k atau menganggap i,j,k menyatakan besar, bukan arah.",
        time=30,
    )

    reg.numeric(
        z,
        subtopic="Magnitudo Vektor",
        difficulty=2,
        text="Sebuah vektor posisi dinyatakan r = 6i − 8j (satuan meter). Besar vektor r adalah …",
        answer=magnitude(6, -8),
        unit="m",
        wrong_answers=[2, 14, 48, -2],
        explanation="Besar vektor dihitung dengan teorema Pythagoras dari komponennya.",
        steps=["rx = 6 m, ry = −8 m", "|r| = √(6² + (−8)²) = √(36 + 64)", "|r| = √100 = 10 m"],
        misconception="Menjumlahkan komponen secara aljabar (6 − 8 = −2) sebagai besar vektor.",
        formula="|r| = √(rx² + ry²)",
        verify={"fn": "magnitude", "args": {"x": 6, "y": -8}, "expected": 10},
        time=50,
    )

    reg.numeric(
        z,
        subtopic="Vektor Satuan",
        difficulty=2,
        text="Vektor satuan yang searah dengan vektor A = 3i + 4j adalah …",
        answer=unit_vector(3, 4)[0],
        unit="(tanpa satuan)",
        wrong_answers=[0.8, 3 / 7, 4 / 7, 1 / 7],
        explanation=(
            "Vektor satuan diperoleh dengan membagi vektor dengan besarnya. |A| = 5 sehingga "
            "u = (3/5)i + (4/5)j = 0,6i + 0,8j. Komponen pertamanya 0,6."
        ),
        steps=["|A| = √(3² + 4²) = 5", "u = A/|A| = (3/5)i + (4/5)j", "u = 0,6i + 0,8j"],
        misconception="Membagi setiap komponen dengan jumlah komponen (3 + 4 = 7).",
        formula="u = A / |A|",
        verify={"fn": "unit_vector", "args": {"x": 3, "y": 4}, "index": 0, "expected": 0.6},
        time=55,
    )

    reg.mc(
        z,
        subtopic="Kelajuan dan Kecepatan",
        difficulty=2,
        text="Pernyataan yang benar mengenai kelajuan dan kecepatan adalah …",
        correct="kelajuan adalah skalar, sedangkan kecepatan adalah vektor",
        distractors=[
            "kelajuan adalah vektor, sedangkan kecepatan adalah skalar",
            "kelajuan selalu lebih besar daripada besar kecepatan",
            "kecepatan tidak mungkin nol jika kelajuan bernilai positif",
            "kelajuan dapat bernilai negatif bila benda bergerak mundur",
        ],
        explanation=(
            "Kelajuan menyatakan seberapa cepat posisi berubah tanpa arah (skalar). Kecepatan "
            "menyatakan perpindahan per satuan waktu dan memiliki arah (vektor). Pada gerak "
            "satu arah, besar kecepatan sama dengan kelajuan."
        ),
        misconception="Menganggap kelajuan selalu lebih besar dari kecepatan, atau menukar keduanya.",
        time=45,
    )

    reg.add(
        z,
        subtopic="Klasifikasi Besaran",
        difficulty=1,
        text="Pilih SEMUA besaran yang termasuk vektor.",
        qtype="multiple_select",
        options=["perpindahan", "kelajuan", "gaya", "suhu", "percepatan", "usaha"],
        correct=["perpindahan", "gaya", "percepatan"],
        explanation=(
            "Perpindahan, gaya, dan percepatan memiliki besar dan arah. Kelajuan, suhu, dan usaha "
            "hanya memiliki besar."
        ),
        misconception="Memasukkan kelajuan sebagai vektor karena mirip dengan kecepatan.",
        time=50,
    )

    reg.add(
        z,
        subtopic="Klasifikasi Besaran",
        difficulty=1,
        text="Pilih SEMUA besaran yang termasuk skalar.",
        qtype="multiple_select",
        options=["jarak", "perpindahan", "massa", "waktu", "momentum", "suhu"],
        correct=["jarak", "massa", "waktu", "suhu"],
        explanation="Jarak, massa, waktu, dan suhu hanya memiliki besar. Perpindahan dan momentum adalah vektor.",
        misconception="Memasukkan jarak sebagai vektor karena diukur dalam satuan panjang yang sama dengan perpindahan.",
        time=45,
    )

    reg.add(
        z,
        subtopic="Sifat Vektor",
        difficulty=2,
        text="Pilih SEMUA pernyataan yang benar tentang vektor.",
        qtype="multiple_select",
        options=[
            "Vektor dapat dipindahkan sejajar tanpa mengubah nilainya",
            "Dua vektor berlawanan dapat menghasilkan resultan nol jika besarnya sama",
            "Magnitudo vektor selalu bernilai positif atau nol",
            "Vektor dengan besar sama pasti memiliki arah yang sama",
            "Penjumlahan vektor selalu menghasilkan besar yang lebih besar dari kedua vektor",
        ],
        correct=[
            "Vektor dapat dipindahkan sejajar tanpa mengubah nilainya",
            "Dua vektor berlawanan dapat menghasilkan resultan nol jika besarnya sama",
            "Magnitudo vektor selalu bernilai positif atau nol",
        ],
        explanation=(
            "Vektor bebas dipindahkan sejajar. Dua vektor sama besar berlawanan arah berjumlah nol. "
            "Magnitudo tidak pernah negatif. Besar sama tidak menjamin arah sama, dan resultan bisa "
            "lebih kecil dari salah satu vektor (misalnya vektor berlawanan)."
        ),
        misconception="Menganggap besar resultan selalu lebih besar daripada besar masing-masing vektor.",
        time=60,
    )

    reg.add(
        z,
        subtopic="Magnitudo Vektor",
        difficulty=1,
        text="Magnitudo sebuah vektor dapat bernilai negatif.",
        qtype="true_false",
        correct="Salah",
        explanation="Magnitudo adalah panjang vektor, sehingga selalu ≥ 0. Arah dinyatakan terpisah, bukan dengan tanda pada magnitudo.",
        misconception="Menggunakan tanda minus untuk menyatakan magnitudo, bukan arah.",
        time=25,
    )

    reg.add(
        z,
        subtopic="Kesamaan Dua Vektor",
        difficulty=1,
        text="Dua vektor yang besarnya sama tetapi arahnya berlawanan merupakan vektor yang sama.",
        qtype="true_false",
        correct="Salah",
        explanation="Kesamaan vektor menuntut besar DAN arah sama. Besar sama dengan arah berlawanan berarti A = −B, bukan A = B.",
        misconception="Hanya memeriksa besar tanpa memeriksa arah.",
        time=25,
    )

    reg.add(
        z,
        subtopic="Klasifikasi Besaran",
        difficulty=1,
        text=(
            "Pasangkan setiap besaran dengan definisinya. Pilihan jawaban yang sama BUKAN berarti "
            "besaran tersebut sama jenisnya — perhatikan definisinya."
        ),
        qtype="matching",
        pairs=[
            {"left": "perpindahan", "right": "memiliki besar dan arah (vektor)"},
            {"left": "kelajuan", "right": "hanya memiliki besar (skalar)"},
            {"left": "gaya", "right": "tarikan atau dorongan berarah (vektor)"},
            {"left": "usaha", "right": "hasil kali titik gaya dan perpindahan (skalar)"},
        ],
        correct={
            "perpindahan": "memiliki besar dan arah (vektor)",
            "kelajuan": "hanya memiliki besar (skalar)",
            "gaya": "tarikan atau dorongan berarah (vektor)",
            "usaha": "hasil kali titik gaya dan perpindahan (skalar)",
        },
        explanation="Perpindahan dan gaya memiliki arah; kelajuan dan usaha tidak.",
        misconception="Menganggap usaha sebagai vektor karena dihitung dari gaya dan perpindahan.",
        time=50,
    )

    reg.add(
        z,
        subtopic="Notasi Vektor",
        difficulty=2,
        text="Pasangkan notasi dengan maknanya.",
        qtype="matching",
        pairs=[
            {"left": "i", "right": "vektor satuan arah sumbu X"},
            {"left": "|A|", "right": "besar vektor A"},
            {"left": "−A", "right": "vektor A dibalik arahnya"},
            {"left": "u_A", "right": "vektor satuan searah A"},
        ],
        correct={
            "i": "vektor satuan arah sumbu X",
            "|A|": "besar vektor A",
            "−A": "vektor A dibalik arahnya",
            "u_A": "vektor satuan searah A",
        },
        explanation="Notasi vektor membedakan komponen, besar, arah berlawanan, dan vektor satuan.",
        misconception="Menganggap −A berarti besar A bernilai negatif.",
        time=45,
    )

    # --- Numeric magnitude set (5) ---
    numeric_sets = [
        (8, 15, 17),
        (7, 24, 25),
        (9, 12, 15),
        (12, 16, 20),
        (5, 12, 13),
    ]
    for x, y, r in numeric_sets:
        reg.numeric(
            z,
            subtopic="Magnitudo Vektor",
            difficulty=2,
            text=(
                f"Sebuah partikel mengalami perpindahan s = {x}i + {y}j meter. "
                f"Besar perpindahan partikel tersebut adalah …"
            ),
            answer=magnitude(x, y),
            unit="m",
            wrong_answers=[x + y, abs(x - y), round((x * x + y * y) / 2, 1), x * y],
            explanation=f"Besar perpindahan dihitung dari komponen-komponennya dengan Pythagoras.",
            steps=[
                f"sx = {x} m dan sy = {y} m",
                f"|s| = √({x}² + {y}²) = √{x * x + y * y}",
                f"|s| = {r} m",
            ],
            misconception="Menjumlahkan komponen secara langsung alih-alih menggunakan Pythagoras.",
            formula="|s| = √(sx² + sy²)",
            verify={"fn": "magnitude", "args": {"x": x, "y": y}, "expected": r},
            time=50,
        )

    # --- Vector negation / direction set (5) ---
    FILLER = {
        "barat": "selatan",
        "utara": "barat",
        "timur laut": "tenggara",
        "tenggara": "selatan",
        "selatan": "timur",
    }
    directions = [
        ("barat", "timur", 18),
        ("utara", "selatan", 32),
        ("timur laut", "barat daya", 45),
        ("tenggara", "barat laut", 60),
        ("selatan", "utara", 24),
    ]
    for origin, opposite, value in directions:
        reg.mc(
            z,
            subtopic="Vektor Berlawanan",
            difficulty=2,
            text=(
                f"Sebuah vektor F bernilai {value} N berarah ke {origin}. "
                f"Vektor −F memiliki besar dan arah …"
            ),
            correct=f"{value} N ke arah {opposite}",
            distractors=[
                f"−{value} N ke arah {origin}",
                f"{value} N ke arah {origin}",
                f"0 N",
                f"{value} N ke arah {FILLER[origin]}",
            ],
            explanation=(
                f"Vektor negatif mempertahankan besar ({value} N) dan membalik arah 180°, "
                f"sehingga arahnya menjadi {opposite}."
            ),
            misconception="Menuliskan besar vektor sebagai bilangan negatif.",
            time=40,
        )

    # --- Additional magnitude/unit-vector reasoning (remaining 2) ---
    reg.numeric(
        z,
        subtopic="Vektor Satuan",
        difficulty=2,
        text="Komponen vertikal (sumbu Y) dari vektor satuan yang searah vektor B = 5i − 12j adalah …",
        answer=unit_vector(5, -12)[1],
        unit="(tanpa satuan)",
        wrong_answers=[12 / 13, 5 / 13, -5 / 13, -1],
        explanation="|B| = 13, sehingga komponen Y vektor satuannya adalah −12/13 ≈ −0,923.",
        steps=["|B| = √(5² + (−12)²) = 13", "u_B = (5/13)i + (−12/13)j", "u_B,y = −12/13 ≈ −0,923"],
        misconception="Lupa tanda negatif pada komponen Y di kuadran IV.",
        formula="u = B / |B|",
        verify={"fn": "unit_vector", "args": {"x": 5, "y": -12}, "index": 1, "expected": -12 / 13},
        time=60,
    )

    reg.mc(
        z,
        subtopic="Vektor Nol",
        difficulty=2,
        text="Manakah penulisan yang menyatakan vektor nol?",
        correct="0i + 0j",
        distractors=["0i + 1j", "1i + 0j", "−1i + 1j", "0,5i + 0,5j"],
        explanation="Vektor nol memiliki kedua komponen bernilai nol sehingga besarnya nol.",
        misconception="Menganggap vektor dengan salah satu komponen nol sebagai vektor nol.",
        time=30,
    )
    # --- Higher-order items (difficulty 3-4) ---
    reg.mc(
        z,
        subtopic="Besaran Skalar dan Vektor",
        difficulty=3,
        text=(
            "Sebuah mobil menempuh perjalanan: 40 km ke timur lalu 30 km ke utara. "
            "Perbandingan besar perpindahan terhadap jarak total yang ditempuh adalah …"
        ),
        correct="50 : 70 = 5 : 7",
        distractors=["40 : 30 = 4 : 3", "70 : 50 = 7 : 5", "30 : 70 = 3 : 7", "1 : 1"],
        explanation=(
            "Jarak total = 40 + 30 = 70 km. Perpindahan adalah resultan tegak lurus: "
            "√(40² + 30²) = 50 km. Jadi perpindahan : jarak = 50 : 70 = 5 : 7."
        ),
        misconception="Menganggap perpindahan selalu sama dengan jarak tempuh.",
        time=75,
    )

    reg.mc(
        z,
        subtopic="Analisis Kesalahan",
        difficulty=4,
        text=(
            "Dua siswa menyimpulkan: (A) 'karena kedua vektor memiliki besar 5 satuan, vektornya pasti sama'; "
            "(B) 'dua vektor dengan besar berbeda tidak mungkin searah'. Pernyataan yang benar adalah …"
        ),
        correct="keduanya salah; vektor sama menuntut besar DAN arah sama, dan arah tidak bergantung besar",
        distractors=[
            "keduanya benar",
            "hanya A yang benar",
            "hanya B yang benar",
            "A benar hanya jika kedua vektor bernilai nol",
        ],
        explanation=(
            "Kesamaan vektor menuntut besar dan arah identik, sehingga besar sama belum tentu sama "
            "arahnya. Sebaliknya, dua vektor dengan besar berbeda tetap dapat searah (misalnya 3 N dan 7 N "
            "ke timur)."
        ),
        misconception="Menguji kesamaan vektor hanya dari besarnya.",
        time=90,
    )

    reg.add(
        z,
        subtopic="Penerapan Notasi Vektor",
        difficulty=3,
        text=(
            "Sebuah perpindahan dinyatakan s = 3i + 4j meter. Pilih SEMUA pernyataan yang benar."
        ),
        qtype="multiple_select",
        options=[
            "Komponen horizontalnya 3 m ke arah sumbu x positif",
            "Besar perpindahannya 7 m",
            "Besar perpindahannya 5 m",
            "Arahnya membentuk sudut kira-kira 53° terhadap sumbu x positif",
            "Arahnya membentuk sudut kira-kira 37° terhadap sumbu x positif",
        ],
        correct=[
            "Komponen horizontalnya 3 m ke arah sumbu x positif",
            "Besar perpindahannya 5 m",
            "Arahnya membentuk sudut kira-kira 53° terhadap sumbu x positif",
        ],
        explanation=(
            "|s| = √(3² + 4²) = 5 m (bukan 3 + 4). θ = atan(4/3) ≈ 53° terhadap sumbu x positif."
        ),
        misconception="Menjumlahkan komponen secara langsung (3 + 4 = 7) untuk memperoleh besar vektor.",
        time=80,
    )
