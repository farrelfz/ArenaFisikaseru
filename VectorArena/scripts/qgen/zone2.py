"""Zone 02 — Vector Representation (25 questions)."""

from __future__ import annotations

import math

from physics_engine import cardinal, direction_angle, displacement, magnitude, quadrant_of
from qgen.common import Registry, fmt


def build(reg: Registry) -> None:
    z = 2

    reg.mc(
        z,
        subtopic="Sistem Koordinat Kartesius",
        difficulty=1,
        text="Pada sistem koordinat Kartesius, titik yang berada di kuadran II memiliki …",
        correct="x negatif dan y positif",
        distractors=["x positif dan y positif", "x negatif dan y negatif", "x positif dan y negatif", "x nol dan y positif"],
        explanation="Kuadran I (+,+), II (−,+), III (−,−), IV (+,−). Kuadran II berarti x < 0 dan y > 0.",
        misconception="Menukar urutan kuadran II dan IV.",
        time=30,
    )

    reg.mc(
        z,
        subtopic="Vektor Posisi",
        difficulty=1,
        text="Vektor posisi menyatakan …",
        correct="letak suatu titik terhadap titik acuan (biasanya titik asal)",
        distractors=[
            "panjang lintasan yang ditempuh benda",
            "perubahan kecepatan per satuan waktu",
            "besar gaya yang bekerja pada benda",
            "hasil kali massa dan percepatan",
        ],
        explanation="Vektor posisi r menghubungkan titik asal O ke posisi titik yang ditinjau.",
        misconception="Menyamakan vektor posisi dengan jarak tempuh.",
        time=35,
    )

    reg.mc(
        z,
        subtopic="Perpindahan dan Jarak",
        difficulty=1,
        text="Perbedaan utama perpindahan dan jarak adalah …",
        correct="perpindahan adalah vektor, jarak adalah skalar",
        distractors=[
            "perpindahan selalu lebih besar daripada jarak",
            "jarak bergantung pada arah, perpindahan tidak",
            "perpindahan diukur dalam satuan waktu",
            "keduanya besaran vektor tetapi berbeda satuan",
        ],
        explanation="Perpindahan hanya bergantung pada posisi awal dan akhir (vektor). Jarak mengikuti seluruh lintasan (skalar) dan tidak pernah lebih kecil dari besar perpindahan.",
        misconception="Menganggap jarak selalu sama dengan besar perpindahan karena keduanya bersatuan meter.",
        time=40,
    )

    reg.mc(
        z,
        subtopic="Arah Mata Angin",
        difficulty=1,
        text="Dalam konvensi diagram vektor dengan sumbu X ke timur dan sumbu Y ke utara, arah barat daya bersesuaian dengan sudut …",
        correct="225°",
        distractors=["45°", "135°", "315°", "180°"],
        explanation="Timur = 0°, utara = 90°, barat = 180°, selatan = 270°. Barat daya berada di antara barat dan selatan, yaitu 225°.",
        misconception="Mengukur sudut searah jarum jam dari utara sehingga barat daya dianggap 135°.",
        time=35,
    )

    reg.mc(
        z,
        subtopic="Sumbu Positif dan Negatif",
        difficulty=1,
        text="Sebuah benda bergerak 4 m ke kiri sepanjang sumbu X. Dalam notasi vektor dengan arah kanan positif, perpindahan benda ditulis …",
        correct="−4i m",
        distractors=["+4i m", "−4j m", "+4j m", "4(i + j) m"],
        explanation="Gerak ke kiri berlawanan dengan arah positif sumbu X sehingga komponennya −4 m pada arah i.",
        misconception="Menuliskan arah kiri sebagai komponen j (vertikal).",
        time=35,
    )

    # --- Numeric quadrant questions (5) ---
    points = [(-4, 3), (5, -2), (-6, -7), (8, 9), (3, -10)]
    for x, y in points:
        reg.mc(
            z,
            subtopic="Identifikasi Kuadran",
            difficulty=1,
            text=f"Titik P({x}, {y}) pada bidang Kartesius terletak di kuadran …",
            correct=quadrant_of(x, y),
            distractors=[q for q in ["I", "II", "III", "IV"] if q != quadrant_of(x, y)],
            explanation=f"Tanda komponennya adalah x {'>' if x > 0 else '<'} 0 dan y {'>' if y > 0 else '<'} 0, sehingga titik berada di kuadran {quadrant_of(x, y)}.",
            misconception="Menentukan kuadran hanya dari salah satu tanda komponen.",
            time=30,
        )

    # --- Numeric position magnitude (5) ---
    pos = [(3, 4), (-5, 12), (-8, -6), (7, -24), (9, 40)]
    for x, y in pos:
        mag = magnitude(x, y)
        reg.numeric(
            z,
            subtopic="Besar Vektor Posisi",
            difficulty=2,
            text=f"Vektor posisi sebuah drone adalah r = {x}i {('+' if y >= 0 else '−')} {abs(y)}j meter. Jarak drone dari titik asal adalah …",
            answer=mag,
            unit="m",
            wrong_answers=[abs(x) + abs(y), abs(abs(x) - abs(y)), x * x + y * y, round(mag / 2, 1)],
            explanation="Jarak dari titik asal sama dengan besar vektor posisi.",
            steps=[f"|r| = √(({x})² + ({y})²)", f"|r| = √{x * x + y * y}", f"|r| = {fmt(mag)} m"],
            misconception="Menjumlahkan nilai absolut komponen alih-alih menggunakan Pythagoras.",
            formula="|r| = √(x² + y²)",
            verify={"fn": "magnitude", "args": {"x": x, "y": y}, "expected": mag},
            diagram={"type": "vector-plane", "params": {"vectors": [{"x": x, "y": y, "label": "r"}], "showResultant": True}},
            time=55,
        )

    # --- Displacement numeric (5) ---
    segments = [
        ((1, 2), (7, 10)),
        ((-3, 4), (5, -2)),
        ((0, 0), (-6, 8)),
        ((2, -5), (-4, 3)),
        ((-8, -1), (-2, -9)),
    ]
    for (x0, y0), (x1, y1) in segments:
        d = displacement(x0, y0, x1, y1)
        reg.numeric(
            z,
            subtopic="Vektor Perpindahan",
            difficulty=2,
            text=(
                f"Partikel bergerak dari titik A({x0}, {y0}) ke titik B({x1}, {y1}) pada bidang XY. "
                f"Besar perpindahan partikel adalah … meter."
            ),
            answer=d["magnitude"],
            unit="m",
            wrong_answers=[
                magnitude(x1, y1) - magnitude(x0, y0),
                abs(d["x"]) + abs(d["y"]),
                magnitude(x0, y0) + magnitude(x1, y1),
                abs(d["x"] * d["y"]),
            ],
            explanation="Vektor perpindahan adalah selisih vektor posisi akhir dan awal.",
            steps=[
                f"Δx = {x1} − ({x0}) = {fmt(d['x'])}",
                f"Δy = {y1} − ({y0}) = {fmt(d['y'])}",
                f"|Δr| = √(Δx² + Δy²) = {fmt(d['magnitude'])} m",
            ],
            misconception="Mengurangkan besar vektor posisi, bukan komponennya.",
            formula="Δr = r_B − r_A ; |Δr| = √(Δx² + Δy²)",
            verify={"fn": "displacement", "args": {"x0": x0, "y0": y0, "x1": x1, "y1": y1}, "index": "magnitude", "expected": d["magnitude"]},
            time=60,
        )

    # --- Direction/cardinal numeric (4) ---
    vectors_dir = [(0, 6), (5, 0), (0, -9), (-7, 0)]
    for x, y in vectors_dir:
        label = cardinal(direction_angle(x, y))
        reg.mc(
            z,
            subtopic="Arah Vektor",
            difficulty=1,
            text=f"Vektor perpindahan d = {x}i {('+' if y >= 0 else '−')} {abs(y)}j meter berarah ke …",
            correct=label,
            distractors=[c for c in ["Timur", "Utara", "Barat", "Selatan"] if c != label],
            explanation=f"Komponen ({x}, {y}) menunjuk ke arah {label.lower()}.",
            misconception="Menukar sumbu X dan Y saat membaca arah.",
            diagram={"type": "vector-plane", "params": {"vectors": [{"x": x, "y": y, "label": "d"}], "showResultant": False}},
            time=35,
        )

    # --- Diagram interpretation (4) ---
    diagrams = [
        ([(3, 2, "P"), (-4, 1, "Q")], "P"),
        ([(2, -3, "P"), (-1, 4, "Q")], "Q"),
        ([(-5, -2, "P"), (3, -4, "Q")], "P"),
        ([(6, 3, "P"), (2, 7, "Q")], "Q"),
    ]
    diagram_labels = {
        ("P", (3, 2)): "Diagram 1",
        ("Q", (-1, 4)): "Diagram 2",
        ("P", (-5, -2)): "Diagram 3",
        ("Q", (2, 7)): "Diagram 4",
    }
    for vecs, answer_label in diagrams:
        target = next(v for v in vecs if v[2] == answer_label)
        x, y, _ = target
        correct = f"x {'positif' if x > 0 else 'negatif'} dan y {'positif' if y > 0 else 'negatif'}"
        wrong = [
            f"x {'negatif' if x > 0 else 'positif'} dan y {'positif' if y > 0 else 'negatif'}",
            f"x {'positif' if x > 0 else 'negatif'} dan y {'negatif' if y > 0 else 'positif'}",
            "x nol dan y positif",
            "x positif dan y nol",
        ]
        reg.mc(
            z,
            subtopic="Interpretasi Diagram",
            difficulty=2,
            text=(
                f"Pada {diagram_labels[(answer_label, (target[0], target[1]))]}, vektor {answer_label} "
                f"digambarkan bersama vektor lain. Tanda komponen vektor {answer_label} adalah …"
            ),
            correct=correct,
            distractors=wrong,
            explanation=f"Vektor {answer_label} berujung di ({x}, {y}), sehingga komponen x {correct.split(' dan ')[0].split()[1]} dan komponen y {correct.split(' dan ')[1].split()[1]}.",
            misconception="Membaca tanda komponen dari posisi mata panah pada layar tanpa memperhatikan orientasi sumbu.",
            diagram={"type": "vector-plane", "params": {"vectors": [{"x": vx, "y": vy, "label": lbl} for vx, vy, lbl in vecs]}},
            time=50,
        )

    reg.add(
        z,
        subtopic="Interpretasi Diagram",
        difficulty=2,
        text="Pilih SEMUA pernyataan yang sesuai dengan diagram vektor (sumbu X ke kanan, sumbu Y ke atas).",
        qtype="multiple_select",
        options=[
            "Vektor A berada di kuadran I",
            "Vektor B memiliki komponen y negatif",
            "Vektor A dan B memiliki komponen x bertanda sama",
            "Vektor B berada di kuadran III",
            "Panjang vektor A lebih besar daripada vektor B",
        ],
        correct=["Vektor A berada di kuadran I", "Vektor B memiliki komponen y negatif"],
        explanation="A = (4, 3) berada di kuadran I; B = (2, −4) memiliki komponen y negatif dan berada di kuadran IV.",
        misconception="Menyimpulkan kuadran dari arah panah tanpa menghitung tanda komponen.",
        diagram={"type": "vector-plane", "params": {"vectors": [{"x": 4, "y": 3, "label": "A"}, {"x": 2, "y": -4, "label": "B"}]}},
        time=60,
    )

    reg.add(
        z,
        subtopic="Representasi Vektor",
        difficulty=1,
        text="Pasangkan posisi titik dengan kuadrannya.",
        qtype="matching",
        pairs=[
            {"left": "(3, 2)", "right": "Kuadran I"},
            {"left": "(−3, 2)", "right": "Kuadran II"},
            {"left": "(−3, −2)", "right": "Kuadran III"},
            {"left": "(3, −2)", "right": "Kuadran IV"},
        ],
        correct={"(3, 2)": "Kuadran I", "(−3, 2)": "Kuadran II", "(−3, −2)": "Kuadran III", "(3, −2)": "Kuadran IV"},
        explanation="Kuadran ditentukan oleh tanda komponen x dan y.",
        misconception="Menganggap kuadran III bertanda (+,−).",
        time=50,
    )

    reg.add(
        z,
        subtopic="Arah Mata Angin",
        difficulty=2,
        text="Pasangkan sudut (diukur dari sumbu X positif, berlawanan arah jarum jam) dengan arah mata anginnya.",
        qtype="matching",
        pairs=[
            {"left": "0°", "right": "Timur"},
            {"left": "90°", "right": "Utara"},
            {"left": "180°", "right": "Barat"},
            {"left": "270°", "right": "Selatan"},
        ],
        correct={"0°": "Timur", "90°": "Utara", "180°": "Barat", "270°": "Selatan"},
        explanation="Konvensi standar: 0° timur, 90° utara, 180° barat, 270° selatan.",
        misconception="Menganggap 90° sebagai timur karena arah putaran searah jarum jam.",
        time=45,
    )

    reg.add(
        z,
        subtopic="Prosedur Perpindahan",
        difficulty=2,
        text="Urutkan langkah menentukan besar perpindahan dari titik A ke titik B.",
        qtype="ordering",
        items=[
            "Tulis koordinat titik A dan B",
            "Hitung Δx = x_B − x_A dan Δy = y_B − y_A",
            "Susun vektor perpindahan Δr = Δx i + Δy j",
            "Hitung |Δr| = √(Δx² + Δy²)",
        ],
        correct=[
            "Tulis koordinat titik A dan B",
            "Hitung Δx = x_B − x_A dan Δy = y_B − y_A",
            "Susun vektor perpindahan Δr = Δx i + Δy j",
            "Hitung |Δr| = √(Δx² + Δy²)",
        ],
        explanation="Perpindahan dihitung dari selisih koordinat, lalu besarnya dari Pythagoras.",
        misconception="Langsung menggunakan koordinat titik B sebagai perpindahan.",
        time=60,
    )

    reg.add(
        z,
        subtopic="Perpindahan dan Jarak",
        difficulty=2,
        text="Seorang siswa berjalan 6 m ke timur lalu 8 m ke utara. Besar perpindahan siswa adalah 10 m.",
        qtype="true_false",
        correct="Benar",
        explanation="Perpindahan = √(6² + 8²) = 10 m. Jarak tempuhnya 14 m, tetapi perpindahan hanya bergantung posisi awal dan akhir.",
        misconception="Menganggap perpindahan sama dengan jarak tempuh (14 m).",
        time=40,
    )

    reg.mc(
        z,
        subtopic="Vektor Posisi",
        difficulty=2,
        text="Sebuah titik memiliki vektor posisi r = −3i + 4j. Pernyataan yang benar adalah …",
        correct="titik berada di kuadran II dengan |r| = 5",
        distractors=[
            "titik berada di kuadran IV dengan |r| = 5",
            "titik berada di kuadran II dengan |r| = 7",
            "titik berada di kuadran III dengan |r| = 5",
            "titik berada di kuadran I dengan |r| = 1",
        ],
        explanation="x = −3 (negatif) dan y = 4 (positif) → kuadran II. |r| = √(9 + 16) = 5.",
        misconception="Menghitung |r| sebagai 3 + 4 = 7 atau salah menentukan kuadran.",
        time=45,
    )

    reg.mc(
        z,
        subtopic="Notasi Vektor",
        difficulty=2,
        text="Vektor posisi titik (0, −5) dituliskan sebagai …",
        correct="−5j",
        distractors=["−5i", "5j", "−5i − 5j", "0i + 5j"],
        explanation="x = 0 sehingga komponen i nol; y = −5 sehingga vektornya −5j.",
        misconception="Menempatkan nilai negatif pada sumbu X padahal berada di sumbu Y.",
        time=35,
    )

    reg.numeric(
        z,
        subtopic="Sudut Vektor Posisi",
        difficulty=2,
        text="Vektor posisi r = 3i + 3j memiliki sudut terhadap sumbu X positif sebesar … derajat.",
        answer=direction_angle(3, 3),
        unit="°",
        wrong_answers=[30, 60, 135, 3],
        explanation="Karena komponen x dan y sama positif, vektor berada pada garis 45° di kuadran I.",
        steps=["tan θ = ry/rx = 3/3 = 1", "θ = atan2(3, 3) = 45°"],
        misconception="Menggunakan tan θ = rx/ry sehingga memperoleh 45° secara kebetulan, atau salah memilih 135°.",
        formula="θ = atan2(ry, rx)",
        verify={"fn": "direction_angle", "args": {"x": 3, "y": 3}, "expected": 45},
        diagram={"type": "vector-plane", "params": {"vectors": [{"x": 3, "y": 3, "label": "r"}], "showAngle": True}},
        time=50,
    )

    reg.numeric(
        z,
        subtopic="Sudut Vektor Posisi",
        difficulty=3,
        text="Sudut yang dibentuk vektor r = −4i + 4j terhadap sumbu X positif adalah … derajat.",
        answer=direction_angle(-4, 4),
        unit="°",
        wrong_answers=[45, 315, 225, 90],
        explanation="Vektor berada di kuadran II. atan2(4, −4) = 135°.",
        steps=["rx = −4, ry = 4 (kuadran II)", "θ = atan2(4, −4) = 135°"],
        misconception="Mengabaikan tanda rx sehingga menjawab 45°.",
        formula="θ = atan2(ry, rx)",
        verify={"fn": "direction_angle", "args": {"x": -4, "y": 4}, "expected": 135},
        time=60,
    )
    # --- Higher-order items (difficulty 3-4) ---
    reg.mc(
        z,
        subtopic="Vektor Posisi",
        difficulty=3,
        text=(
            "Posisi partikel dinyatakan r = (2t)i + (3t²)j meter dengan t dalam sekon. "
            "Vektor posisi pada t = 2 s adalah …"
        ),
        correct="4i + 12j m",
        distractors=["2i + 3j m", "4i + 6j m", "12i + 4j m", "4i + 12j m/s"],
        explanation=(
            "Substitusikan t = 2 s: rx = 2(2) = 4 m dan ry = 3(2²) = 12 m, sehingga r = 4i + 12j m. "
            "Satuannya meter karena ini vektor posisi, bukan kecepatan."
        ),
        misconception="Mengkuadratkan hanya koefisien tanpa memperhatikan variabel waktu, atau salah satuan.",
        time=80,
    )

    reg.mc(
        z,
        subtopic="Arah Vektor",
        difficulty=4,
        text=(
            "Sebuah vektor memiliki komponen Rx = −3 m dan Ry = −3 m. Pernyataan yang benar tentang "
            "arah vektor tersebut adalah …"
        ),
        correct="225° dari sumbu x positif, yaitu 45° di bawah sumbu x negatif (kuadran III)",
        distractors=[
            "45° dari sumbu x positif (kuadran I)",
            "135° dari sumbu x positif (kuadran II)",
            "315° dari sumbu x positif (kuadran IV)",
            "tidak dapat ditentukan karena komponennya negatif",
        ],
        explanation=(
            "Kedua komponen negatif menempatkan vektor di kuadran III. tan θ = (−3)/(−3) = 1 → θ = 45° "
            "diukur dari sumbu −x, sehingga arah baku = 180° + 45° = 225°."
        ),
        misconception="Menggunakan atan(Ry/Rx) tanpa koreksi kuadran sehingga memperoleh 45°.",
        formula="θ = atan2(Ry, Rx)",
        verify={"fn": "direction_angle", "args": {"x": -3, "y": -3}, "expected": 225},
        time=90,
    )

    reg.add(
        z,
        subtopic="Komponen Tanda",
        difficulty=3,
        text=(
            "Sebuah vektor berada di kuadran II bidang XY. Pilih SEMUA pernyataan yang benar."
        ),
        qtype="multiple_select",
        options=[
            "Komponen x bernilai negatif",
            "Komponen y bernilai positif",
            "Komponen x bernilai positif",
            "Sudut bakunya antara 90° dan 180°",
            "Sudut bakunya antara 180° dan 270°",
        ],
        correct=[
            "Komponen x bernilai negatif",
            "Komponen y bernilai positif",
            "Sudut bakunya antara 90° dan 180°",
        ],
        explanation=(
            "Kuadran II berarti x < 0 dan y > 0, sehingga atan2(Ry, Rx) menghasilkan sudut dalam "
            "rentang (90°, 180°)."
        ),
        misconception="Menganggap kuadran II memiliki x positif karena y positif.",
        time=75,
    )
