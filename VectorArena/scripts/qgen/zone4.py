"""Zone 04 — Geometrical Vector Methods (35 questions)."""

from __future__ import annotations

import math

from physics_engine import angle_between, cosine_rule_angle, cosine_rule_resultant
from qgen.common import Registry, fmt


def build(reg: Registry) -> None:
    z = 4

    reg.mc(
        z,
        subtopic="Metode Segitiga",
        difficulty=1,
        text="Pada metode segitiga, resultan dua vektor diperoleh dengan cara …",
        correct="menyambung ujung vektor pertama ke pangkal vektor kedua, lalu menarik vektor dari pangkal pertama ke ujung kedua",
        distractors=[
            "menggambar kedua vektor dari titik pangkal yang sama lalu menarik diagonal",
            "membalik arah vektor kedua lalu menyambungkannya",
            "menjumlahkan panjang kedua panah tanpa memperhatikan arah",
            "memutar vektor pertama sebesar 90°",
        ],
        explanation="Metode segitiga menyambung vektor secara ujung-ke-pangkal; resultan menghubungkan titik awal ke titik akhir.",
        misconception="Menukar metode segitiga dengan metode jajar genjang (keduanya sah, tetapi konstruksinya berbeda).",
        time=45,
    )

    reg.mc(
        z,
        subtopic="Metode Jajar Genjang",
        difficulty=1,
        text="Pada metode jajar genjang, kedua vektor digambar dari titik pangkal yang sama, dan resultan digambarkan sebagai …",
        correct="diagonal jajar genjang dari titik pangkal",
        distractors=[
            "sisi miring yang menghubungkan ujung kedua vektor",
            "selisih panjang kedua vektor",
            "garis bagi sudut antara kedua vektor",
            "proyeksi vektor pertama pada vektor kedua",
        ],
        explanation="Diagonal jajar genjang yang berpangkal di titik awal menyatakan jumlah kedua vektor.",
        misconception="Mengambil sisi penghubung ujung vektor sebagai resultan (itu justru selisih).",
        time=40,
    )

    reg.mc(
        z,
        subtopic="Metode Poligon",
        difficulty=2,
        text="Metode poligon digunakan untuk menentukan resultan …",
        correct="tiga vektor atau lebih dengan menyambung ujung ke pangkal secara berurutan",
        distractors=[
            "tepat dua vektor yang saling tegak lurus saja",
            "dua vektor yang berlawanan arah saja",
            "vektor yang tidak memiliki komponen",
            "vektor yang sudutnya selalu 90°",
        ],
        explanation="Poligon adalah generalisasi metode segitiga untuk banyak vektor; resultan menghubungkan titik awal ke titik akhir.",
        misconception="Menganggap metode poligon hanya berlaku untuk vektor segaris.",
        time=40,
    )

    reg.mc(
        z,
        subtopic="Aturan Kosinus",
        difficulty=2,
        text="Rumus aturan kosinus untuk besar resultan dua vektor yang membentuk sudut θ adalah …",
        correct="R = √(A² + B² + 2AB cos θ)",
        distractors=[
            "R = √(A² + B² − 2AB cos θ)",
            "R = A + B cos θ",
            "R = √(A² − B²)",
            "R = A B sin θ",
        ],
        explanation="Untuk resultan (bukan selisih), tanda pada suku silang adalah positif: R² = A² + B² + 2AB cos θ.",
        misconception="Menggunakan rumus selisih (tanda minus) untuk resultan penjumlahan.",
        time=45,
    )

    reg.mc(
        z,
        subtopic="Sudut Antara Vektor",
        difficulty=2,
        text="Sudut θ pada aturan kosinus resultan diukur antara …",
        correct="kedua vektor dengan titik pangkal berimpit",
        distractors=[
            "vektor dan sumbu X positif",
            "vektor dan sumbu Y positif",
            "vektor dan garis horizontal sembarang",
            "vektor dan resultannya",
        ],
        explanation="Sudut antara dua vektor didefinisikan setelah keduanya diletakkan berpangkal sama.",
        misconception="Mengukur sudut dari sumbu X, bukan antara kedua vektor.",
        time=40,
    )

    # --- Cosine rule resultants (9) ---
    cases = [
        (3, 4, 90),
        (6, 8, 90),
        (5, 5, 60),
        (5, 5, 120),
        (6, 6, 120),
        (8, 8, 60),
        (10, 10, 90),
        (7, 7, 120),
        (12, 5, 90),
    ]
    for a, b, theta in cases:
        r = cosine_rule_resultant(a, b, theta)
        naive = a + b
        diff = abs(a - b)
        reg.numeric(
            z,
            subtopic="Resultan Aturan Kosinus",
            difficulty=3,
            text=(
                f"Dua vektor besarnya {a} satuan dan {b} satuan membentuk sudut {theta}°. "
                f"Besar resultan kedua vektor adalah … satuan."
            ),
            answer=r,
            nd=3,
            unit="satuan",
            wrong_answers=[naive, diff, a * b / 2, math.sqrt(a * a + b * b)],
            explanation="Kedua vektor tidak tegak lurus, sehingga komponen silang harus diperhitungkan melalui aturan kosinus.",
            steps=[
                f"R² = {a}² + {b}² + 2({a})({b}) cos {theta}°",
                f"R² = {a * a + b * b + 2 * a * b * math.cos(math.radians(theta)):.3f}",
                f"R = {fmt(r, 3)} satuan",
            ],
            misconception="Menjumlahkan besar vektor secara langsung, atau memakai aturan Pythagoras padahal sudutnya bukan 90°.",
            formula="R = √(A² + B² + 2AB cos θ)",
            verify={"fn": "cosine_rule_resultant", "args": {"a": a, "b": b, "theta_deg": theta}, "expected": r},
            diagram={"type": "vector-parallelogram", "params": {"a": a, "b": b, "theta": theta}},
            time=70,
        )

    # --- Equal-magnitude conceptual resultants (4) ---
    equal_cases = [(30, "lebih besar dari"), (60, "lebih besar dari"), (90, "lebih besar dari"), (120, "sama dengan")]
    for theta, relation in equal_cases:
        r = cosine_rule_resultant(10, 10, theta)
        correct = f"{fmt(r, 2)} satuan"
        reg.mc(
            z,
            subtopic="Resultan Vektor Sama Besar",
            difficulty=2,
            text=(
                f"Dua vektor sama besar 10 satuan membentuk sudut {theta}°. "
                f"Besar resultannya adalah …"
            ),
            correct=correct,
            distractors=[fmt(20, 2), fmt(0, 2), fmt(10 * math.sin(math.radians(theta)), 2), fmt(math.sqrt(200 - 200 * math.cos(math.radians(theta))), 2)],
            explanation=(
                f"R = √(10² + 10² + 2·10·10·cos {theta}°) = {fmt(r, 3)} ≈ {correct}. "
                f"Pada {theta}°, resultan {relation} besar masing-masing vektor."
            ),
            misconception="Menganggap resultan dua vektor sama besar selalu 20 satuan.",
            formula="R = √(2A²(1 + cos θ))",
            diagram={"type": "vector-parallelogram", "params": {"a": 10, "b": 10, "theta": theta}},
            time=60,
        )

    # --- Angle between via dot product (6) ---
    angle_cases = [
        ((1, 0), (0, 1)),
        ((1, 0), (1, 1)),
        ((0, 1), (1, 1)),
        ((1, 0), (-1, 0)),
        ((3, 4), (4, -3)),
        ((1, 1), (-1, 1)),
    ]
    for (ax, ay), (bx, by) in angle_cases:
        theta = angle_between(ax, ay, bx, by)
        reg.numeric(
            z,
            subtopic="Sudut Antara Vektor",
            difficulty=3,
            text=(
                f"Sudut antara vektor A = {ax}i {('+' if ay >= 0 else '−')} {abs(ay)}j dan "
                f"B = {bx}i {('+' if by >= 0 else '−')} {abs(by)}j adalah … derajat."
            ),
            answer=theta,
            nd=2,
            unit="°",
            wrong_answers=[90, abs(90 - theta), 180 - theta, theta / 2],
            explanation="Sudut dihitung dari hasil kali titik: cos θ = (A·B)/(|A||B|).",
            steps=[
                f"A·B = ({ax})({bx}) + ({ay})({by}) = {ax * bx + ay * by}",
                f"|A||B| = {fmt(math.hypot(ax, ay) * math.hypot(bx, by), 3)}",
                f"θ = arccos(...) = {fmt(theta)}°",
            ],
            misconception="Menggunakan hasil kali silang atau mengabaikan tanda hasil kali titik.",
            formula="cos θ = (A·B)/(|A||B|)",
            verify={"fn": "angle_between", "args": {"ax": ax, "ay": ay, "bx": bx, "by": by}, "expected": theta},
            time=70,
        )

    # --- cosine rule angle (3) ---
    triples = [(6, 8, 10), (5, 5, 5), (7, 7, 7)]
    for a, b, r in triples:
        theta = cosine_rule_angle(a, b, r)
        reg.numeric(
            z,
            subtopic="Sudut dari Resultan",
            difficulty=4,
            text=(
                f"Dua vektor dengan besar {a} satuan dan {b} satuan menghasilkan resultan {r} satuan. "
                f"Sudut antara kedua vektor adalah … derajat."
            ),
            answer=theta,
            nd=2,
            unit="°",
            wrong_answers=[60, 90, 120, 45],
            explanation="Gunakan aturan kosinus terbalik: cos θ = (R² − A² − B²)/(2AB).",
            steps=[
                f"cos θ = ({r}² − {a}² − {b}²)/(2·{a}·{b})",
                f"cos θ = {(r * r - a * a - b * b) / (2 * a * b):.4f}",
                f"θ = {fmt(theta)}°",
            ],
            misconception="Menganggap resultan sama dengan salah satu sisi segitiga siku-siku.",
            formula="cos θ = (R² − A² − B²)/(2AB)",
            verify={"fn": "cosine_rule_angle", "args": {"a": a, "b": b, "resultant": r}, "expected": theta},
            time=75,
        )

    reg.add(
        z,
        subtopic="Metode Grafis",
        difficulty=2,
        text="Pilih SEMUA pernyataan yang benar tentang metode grafis vektor.",
        qtype="multiple_select",
        options=[
            "Panjang panah mewakili besar vektor",
            "Arah panah mewakili arah vektor",
            "Metode poligon dapat dipakai untuk lebih dari dua vektor",
            "Resultan selalu dapat dibaca langsung dari panjang total semua panah",
            "Sudut antara vektor tidak memengaruhi resultan",
        ],
        correct=[
            "Panjang panah mewakili besar vektor",
            "Arah panah mewakili arah vektor",
            "Metode poligon dapat dipakai untuk lebih dari dua vektor",
        ],
        explanation="Skala panjang dan arah panah adalah dasar metode grafis. Resultan bergantung pada sudut, dan bukan sekadar total panjang panah.",
        misconception="Menjumlahkan panjang panah tanpa menyusunnya sesuai arah.",
        time=60,
    )

    reg.add(
        z,
        subtopic="Aturan Kosinus",
        difficulty=2,
        text="Jika sudut antara dua vektor adalah 90°, aturan kosinus tereduksi menjadi teorema Pythagoras.",
        qtype="true_false",
        correct="Benar",
        explanation="cos 90° = 0 sehingga R = √(A² + B²), yaitu teorema Pythagoras.",
        misconception="Menganggap aturan kosinus tidak berlaku untuk sudut 90°.",
        time=30,
    )

    reg.add(
        z,
        subtopic="Konstruksi Grafis",
        difficulty=2,
        text="Pasangkan metode dengan ciri konstruksinya.",
        qtype="matching",
        pairs=[
            {"left": "Metode segitiga", "right": "vektor disambung ujung ke pangkal"},
            {"left": "Metode jajar genjang", "right": "kedua vektor berpangkal sama, resultan = diagonal"},
            {"left": "Metode poligon", "right": "banyak vektor disambung berurutan"},
            {"left": "Aturan kosinus", "right": "menghitung resultan dari besar dan sudut"},
        ],
        correct={
            "Metode segitiga": "vektor disambung ujung ke pangkal",
            "Metode jajar genjang": "kedua vektor berpangkal sama, resultan = diagonal",
            "Metode poligon": "banyak vektor disambung berurutan",
            "Aturan kosinus": "menghitung resultan dari besar dan sudut",
        },
        explanation="Setiap metode memiliki konstruksi grafis atau rumus yang khas.",
        misconception="Menganggap metode segitiga dan jajar genjang identik dalam konstruksi.",
        time=55,
    )

    reg.add(
        z,
        subtopic="Prosedur Metode Jajar Genjang",
        difficulty=2,
        text="Urutkan langkah melukis resultan dengan metode jajar genjang.",
        qtype="ordering",
        items=[
            "Gambar kedua vektor dari titik pangkal yang sama",
            "Lengkapi bangun jajar genjang dengan garis sejajar",
            "Tarik diagonal dari titik pangkal",
            "Ukur panjang diagonal dan tentukan arahnya",
        ],
        correct=[
            "Gambar kedua vektor dari titik pangkal yang sama",
            "Lengkapi bangun jajar genjang dengan garis sejajar",
            "Tarik diagonal dari titik pangkal",
            "Ukur panjang diagonal dan tentukan arahnya",
        ],
        explanation="Diagonal dari titik pangkal adalah resultan; panjang dan arahnya dibaca dari diagonal tersebut.",
        misconception="Menarik diagonal dari ujung vektor, bukan dari titik pangkal.",
        time=65,
    )

    # --- Diagram interpretations (3) ---
    reg.mc(
        z,
        subtopic="Interpretasi Segitiga Vektor",
        difficulty=2,
        text="Pada diagram metode segitiga, vektor A dan B disambung ujung ke pangkal dan membentuk sudut 90°. Jika |A| = 9 dan |B| = 12, besar resultan adalah …",
        correct="15",
        distractors=["21", "3", "108", "√21"],
        explanation="Karena sudut sambungan 90°, resultan = √(9² + 12²) = 15.",
        misconception="Menjumlahkan 9 + 12 = 21.",
        diagram={"type": "vector-triangle", "params": {"a": 9, "b": 12, "theta": 90}},
        time=55,
    )

    reg.mc(
        z,
        subtopic="Interpretasi Jajar Genjang",
        difficulty=3,
        text="Dua vektor sama besar membentuk jajar genjang. Jika resultan (diagonal) sama besar dengan masing-masing vektor, sudut antara kedua vektor adalah …",
        correct="120°",
        distractors=["60°", "90°", "30°", "150°"],
        explanation="R = A menuntut 2A² + 2A² cos θ = A² → cos θ = −1/2 → θ = 120°.",
        misconception="Menganggap diagonal selalu lebih panjang sehingga memilih 60°.",
        diagram={"type": "vector-parallelogram", "params": {"a": 10, "b": 10, "theta": 120}},
        time=70,
    )

    reg.mc(
        z,
        subtopic="Interpretasi Poligon",
        difficulty=3,
        text="Empat vektor disusun ujung ke pangkal dan membentuk poligon tertutup. Pernyataan yang benar adalah …",
        correct="resultan keempat vektor sama dengan nol",
        distractors=[
            "resultan sama dengan vektor terpanjang",
            "resultan sama dengan jumlah panjang keempat vektor",
            "resultan tegak lurus terhadap vektor pertama",
            "resultan tidak dapat ditentukan",
        ],
        explanation="Poligon tertutup berarti titik akhir berimpit dengan titik awal, sehingga perpindahan total nol.",
        misconception="Menganggap poligon tertutup tetap memiliki resultan sebesar kelilingnya.",
        diagram={"type": "vector-polygon", "params": {"closed": True}},
        time=55,
    )

    reg.mc(
        z,
        subtopic="Analisis Resultan Gabungan",
        difficulty=4,
        text=(
            "Lima vektor gaya bekerja pada satu titik: 10 N ke timur, 10 N ke utara, 10 N ke barat, "
            "10 N ke selatan, dan 5 N ke timur laut. Besar resultan kelima gaya tersebut adalah …"
        ),
        correct="5 N",
        distractors=["45 N", "0 N", "10 N", "5√2 N"],
        explanation=(
            "Empat gaya 10 N saling meniadakan berpasangan (timur–barat dan utara–selatan), "
            "sehingga resultan hanya berasal dari gaya 5 N ke timur laut, yaitu 5 N."
        ),
        misconception="Menjumlahkan seluruh besar gaya menjadi 45 N karena mengabaikan arah.",
        diagram={"type": "vector-polygon", "params": {"closed": False}},
        time=85,
    )