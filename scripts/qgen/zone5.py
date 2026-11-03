"""Zone 05 — Vector Components (40 questions)."""

from __future__ import annotations

import math

from physics_engine import analytical_resultant, direction_angle, vector_components
from qgen.common import Registry, fmt


def build(reg: Registry) -> None:
    z = 5

    reg.mc(
        z,
        subtopic="Penguraian Vektor",
        difficulty=1,
        text="Sebuah vektor A membentuk sudut θ terhadap sumbu X positif. Komponen horizontal (sumbu X) vektor tersebut adalah …",
        correct="A cos θ",
        distractors=["A sin θ", "A tan θ", "A / cos θ", "A / sin θ"],
        explanation="Proyeksi pada sumbu X berdekatan dengan sudut θ, sehingga digunakan kosinus: Ax = A cos θ.",
        misconception="Menukar sinus dan kosinus sehingga menggunakan A sin θ untuk komponen horizontal.",
        time=35,
    )

    reg.mc(
        z,
        subtopic="Penguraian Vektor",
        difficulty=1,
        text="Komponen vertikal (sumbu Y) dari vektor A yang membentuk sudut θ terhadap sumbu X positif adalah …",
        correct="A sin θ",
        distractors=["A cos θ", "A tan θ", "A / sin θ", "A / cos θ"],
        explanation="Proyeksi pada sumbu Y berhadapan dengan sudut θ, sehingga digunakan sinus: Ay = A sin θ.",
        misconception="Menggunakan kosinus untuk komponen vertikal.",
        time=35,
    )

    reg.mc(
        z,
        subtopic="Tanda Komponen",
        difficulty=1,
        text="Vektor yang berada di kuadran III memiliki komponen …",
        correct="x negatif dan y negatif",
        distractors=["x positif dan y positif", "x negatif dan y positif", "x positif dan y negatif", "x nol dan y negatif"],
        explanation="Kuadran III berada di kiri bawah, sehingga kedua komponen bernilai negatif.",
        misconception="Menganggap komponen y selalu positif karena arah 'atas'.",
        time=30,
    )

    reg.mc(
        z,
        subtopic="Referensi Sudut",
        difficulty=2,
        text="Sebuah vektor berarah 150° dari sumbu X positif. Komponen x dan y vektor tersebut berturut-turut …",
        correct="negatif dan positif",
        distractors=["positif dan positif", "negatif dan negatif", "positif dan negatif", "nol dan positif"],
        explanation="150° berada di kuadran II: cos 150° < 0 dan sin 150° > 0.",
        misconception="Menghitung komponen dengan sudut 30° tanpa menyesuaikan tanda kuadran.",
        time=40,
    )

    # --- Component numerics (14) ---
    comp_cases = [
        (10, 30, 0),
        (10, 30, 1),
        (10, 60, 0),
        (10, 60, 1),
        (20, 45, 0),
        (20, 45, 1),
        (12, 120, 0),
        (12, 120, 1),
        (16, 150, 0),
        (16, 150, 1),
        (24, 210, 0),
        (24, 210, 1),
        (18, 300, 0),
        (18, 300, 1),
    ]
    axis_name = {0: "horizontal (sumbu X)", 1: "vertikal (sumbu Y)"}
    for mag, angle, index in comp_cases:
        ax, ay = vector_components(mag, angle)
        value = (ax, ay)[index]
        other = (ay, ax)[index]
        reg.numeric(
            z,
            subtopic="Komponen Vektor",
            difficulty=2,
            text=(
                f"Sebuah vektor gaya besarnya {mag} N membentuk sudut {angle}° terhadap sumbu X positif. "
                f"Komponen {axis_name[index]} vektor tersebut adalah … N."
            ),
            answer=value,
            unit="N",
            wrong_answers=[other, -value, mag, value + other],
            explanation=(
                f"Gunakan Ax = A cos θ dan Ay = A sin θ. Pada θ = {angle}°, "
                f"komponen {'x' if index == 0 else 'y'} = {mag} × {'cos' if index == 0 else 'sin'} {angle}°."
            ),
            steps=[
                f"A = {mag} N, θ = {angle}°",
                f"A{'x' if index == 0 else 'y'} = {mag} × {'cos' if index == 0 else 'sin'} {angle}°",
                f"A{'x' if index == 0 else 'y'} = {fmt(value)} N",
            ],
            misconception="Menukar penggunaan sinus dan kosinus, atau salah memberi tanda pada kuadran.",
            formula="Ax = A cos θ ; Ay = A sin θ",
            verify={"fn": "vector_components", "args": {"mag": mag, "angle_deg": angle}, "index": index, "expected": value},
            diagram={"type": "vector-plane", "params": {"vectors": [{"x": round(ax, 3), "y": round(ay, 3), "label": "A"}], "showComponents": True}},
            time=60,
        )

    # --- Analytical resultants: magnitude (6) ---
    resultant_sets = [
        [(6, 0), (8, 90)],
        [(5, 0), (5, 90)],
        [(10, 0), (10, 60)],
        [(8, 0), (6, 90)],
        [(12, 0), (5, 90)],
        [(10, 0), (10, 120)],
    ]
    for vectors in resultant_sets:
        r = analytical_resultant(vectors)
        desc = " dan ".join(f"{m} N pada {a}°" for m, a in vectors)
        reg.numeric(
            z,
            subtopic="Resultan Analitis",
            difficulty=3,
            text=f"Dua vektor: {desc}. Besar resultannya adalah … N.",
            answer=r["magnitude"],
            nd=3,
            unit="N",
            wrong_answers=[sum(m for m, _ in vectors), abs(vectors[0][0] - vectors[1][0]), r["rx"] + r["ry"], math.sqrt(abs(r["rx"] ** 2 - r["ry"] ** 2))],
            explanation="Jumlahkan komponen x dan y dari seluruh vektor, lalu hitung besar resultan.",
            steps=[
                f"Rx = {fmt(r['rx'], 3)} N",
                f"Ry = {fmt(r['ry'], 3)} N",
                f"R = √(Rx² + Ry²) = {fmt(r['magnitude'], 3)} N",
            ],
            misconception="Menjumlahkan besar vektor tanpa menguraikan komponen.",
            formula="Rx = ΣAx ; Ry = ΣAy ; R = √(Rx² + Ry²)",
            verify={"fn": "analytical_resultant", "args": {"vectors": vectors}, "index": "magnitude", "expected": r["magnitude"]},
            time=75,
        )

    # --- Analytical resultants: direction (6) ---
    for vectors in resultant_sets:
        r = analytical_resultant(vectors)
        desc = " dan ".join(f"{m} N pada {a}°" for m, a in vectors)
        reg.numeric(
            z,
            subtopic="Arah Resultan",
            difficulty=3,
            text=f"Dua vektor: {desc}. Arah resultan terhadap sumbu X positif adalah … derajat.",
            answer=r["angle"],
            nd=2,
            unit="°",
            wrong_answers=[(360 - r["angle"]) % 360, (r["angle"] + 90) % 360, 45, abs(vectors[0][1] - vectors[1][1])],
            explanation="Arah resultan ditentukan dengan atan2(Ry, Rx) agar kuadran yang benar diperoleh.",
            steps=[
                f"Rx = {fmt(r['rx'], 3)} N, Ry = {fmt(r['ry'], 3)} N",
                f"θ = atan2(Ry, Rx) = {fmt(r['angle'])}° (kuadran {r['quadrant']})",
            ],
            misconception="Menggunakan atan(Ry/Rx) tanpa memperhatikan tanda sehingga salah kuadran.",
            formula="θ = atan2(Ry, Rx)",
            verify={"fn": "analytical_resultant", "args": {"vectors": vectors}, "index": "angle", "expected": r["angle"]},
            time=75,
        )

    # --- Resultant quadrant identification (6) ---
    quad_sets = [
        [(5, 0), (5, 90)],
        [(5, 180), (5, 90)],
        [(5, 180), (5, 270)],
        [(5, 0), (5, 270)],
        [(4, 0), (4, 180)],
        [(6, 90), (6, 270)],
    ]
    for idx, vectors in enumerate(quad_sets):
        r = analytical_resultant(vectors)
        magnitude_text = fmt(r["magnitude"])
        reg.mc(
            z,
            subtopic="Kuadran Resultan",
            difficulty=2,
            text=(
                "Dua vektor dijumlahkan: "
                + " dan ".join(f"{m} satuan pada {a}°" for m, a in vectors)
                + ". Letak resultan yang benar adalah …"
            ),
            correct=f"kuadran {r['quadrant']} dengan besar {magnitude_text} satuan",
            distractors=[
                f"kuadran {q} dengan besar {magnitude_text} satuan"
                for q in ["I", "II", "III", "IV"]
                if q != r["quadrant"]
            ][:3]
            + [f"resultan nol"],
            explanation=f"Rx = {fmt(r['rx'])} dan Ry = {fmt(r['ry'])}, sehingga resultan berada di kuadran {r['quadrant']}.",
            misconception="Menentukan kuadran dari besar vektor, bukan dari tanda Rx dan Ry.",
            formula="θ = atan2(Ry, Rx)",
            time=55,
        )

    reg.add(
        z,
        subtopic="Komponen Vektor",
        difficulty=2,
        text="Pilih SEMUA pernyataan yang benar tentang penguraian vektor.",
        qtype="multiple_select",
        options=[
            "Ax = A cos θ jika θ diukur dari sumbu X positif",
            "Ay = A sin θ jika θ diukur dari sumbu X positif",
            "Komponen x bernilai negatif di kuadran II dan III",
            "Komponen y bernilai positif di kuadran I dan II",
            "Besar komponen selalu sama dengan besar vektor asal",
        ],
        correct=[
            "Ax = A cos θ jika θ diukur dari sumbu X positif",
            "Ay = A sin θ jika θ diukur dari sumbu X positif",
            "Komponen x bernilai negatif di kuadran II dan III",
            "Komponen y bernilai positif di kuadran I dan II",
        ],
        explanation="Empat pernyataan pertama benar; komponen selalu lebih kecil atau sama dengan besar vektor (sama hanya jika vektor sejajar sumbu).",
        misconception="Menganggap besar komponen sama dengan besar vektor untuk semua sudut.",
        time=65,
    )

    reg.add(
        z,
        subtopic="Tanda Komponen",
        difficulty=2,
        text="Pasangkan kuadran dengan tanda komponen (x, y).",
        qtype="matching",
        pairs=[
            {"left": "Kuadran I", "right": "(+, +)"},
            {"left": "Kuadran II", "right": "(−, +)"},
            {"left": "Kuadran III", "right": "(−, −)"},
            {"left": "Kuadran IV", "right": "(+, −)"},
        ],
        correct={"Kuadran I": "(+, +)", "Kuadran II": "(−, +)", "Kuadran III": "(−, −)", "Kuadran IV": "(+, −)"},
        explanation="Tanda komponen mengikuti posisi kuadran pada bidang Kartesius.",
        misconception="Menukar tanda kuadran II dengan kuadran IV.",
        time=50,
    )

    reg.add(
        z,
        subtopic="Resultan Nol",
        difficulty=3,
        text="Dua vektor besarnya 6 N dan 8 N menghasilkan resultan 10 N. Kedua vektor tersebut saling tegak lurus.",
        qtype="true_false",
        correct="Benar",
        explanation="√(6² + 8²) = 10, sesuai teorema Pythagoras yang berlaku untuk vektor tegak lurus.",
        misconception="Menganggap 10 N mustahil karena 6 + 8 = 14.",
        time=45,
    )

    reg.add(
        z,
        subtopic="Prosedur Analitis",
        difficulty=2,
        text="Urutkan langkah menentukan resultan tiga vektor secara analitis.",
        qtype="ordering",
        items=[
            "Tentukan sudut setiap vektor terhadap sumbu X positif",
            "Hitung Ax = A cos θ dan Ay = A sin θ untuk setiap vektor",
            "Jumlahkan Rx = ΣAx dan Ry = ΣAy",
            "Hitung R = √(Rx² + Ry²)",
            "Hitung θ = atan2(Ry, Rx)",
        ],
        correct=[
            "Tentukan sudut setiap vektor terhadap sumbu X positif",
            "Hitung Ax = A cos θ dan Ay = A sin θ untuk setiap vektor",
            "Jumlahkan Rx = ΣAx dan Ry = ΣAy",
            "Hitung R = √(Rx² + Ry²)",
            "Hitung θ = atan2(Ry, Rx)",
        ],
        explanation="Urutan ini mencegah kesalahan tanda dan memastikan arah dihitung pada kuadran yang benar.",
        misconception="Menghitung besar resultan sebelum menjumlahkan komponen.",
        time=75,
    )

    reg.add(
        z,
        subtopic="Interpretasi Komponen",
        difficulty=2,
        text="Diagram menunjukkan vektor dengan komponen proyeksi pada kedua sumbu. Jika panjang vektor 10 N dan sudutnya 37° terhadap sumbu X, komponen horizontalnya paling dekat dengan …",
        qtype="mc",
        options=["8 N", "6 N", "10 N", "3,7 N", "0 N"],
        correct="8 N",
        explanation="Ax = 10 cos 37° ≈ 10 × 0,8 = 8 N.",
        misconception="Menggunakan sin 37° sehingga memperoleh 6 N untuk komponen horizontal.",
        diagram={"type": "vector-plane", "params": {"vectors": [{"x": 8, "y": 6, "label": "A"}], "showComponents": True}},
        time=55,
    )

    reg.add(
        z,
        subtopic="Interpretasi Komponen",
        difficulty=3,
        text="Sebuah vektor 20 N berarah 210°. Manakah pasangan komponen yang benar?",
        qtype="mc",
        options=[
            "Ax ≈ −17,32 N dan Ay = −10 N",
            "Ax ≈ 17,32 N dan Ay = 10 N",
            "Ax ≈ −10 N dan Ay = −17,32 N",
            "Ax = −20 N dan Ay = 0 N",
            "Ax = 0 N dan Ay = −20 N",
        ],
        correct="Ax ≈ −17,32 N dan Ay = −10 N",
        explanation="cos 210° = −0,866 dan sin 210° = −0,5, sehingga Ax = −17,32 N dan Ay = −10 N.",
        misconception="Menggunakan sudut 30° dan memberi tanda positif pada kedua komponen.",
        diagram={"type": "vector-plane", "params": {"vectors": [{"x": -17.32, "y": -10, "label": "F"}], "showComponents": True}},
        time=70,
    )

    reg.add(
        z,
        subtopic="Besar Komponen",
        difficulty=3,
        text="Sebuah vektor 50 N membentuk sudut 53° terhadap sumbu X. Besar komponen vertikalnya paling dekat dengan …",
        qtype="mc",
        options=["40 N", "30 N", "50 N", "20 N", "10 N"],
        correct="40 N",
        explanation="Ay = 50 sin 53° ≈ 50 × 0,8 = 40 N.",
        misconception="Menggunakan cos 53° ≈ 0,6 sehingga memperoleh 30 N untuk komponen vertikal.",
        time=55,
    )

    reg.add(
        z,
        subtopic="Arah Resultan",
        difficulty=3,
        text="Resultan dua vektor memiliki Rx = −6 N dan Ry = 8 N. Arah resultan terhadap sumbu X positif adalah …",
        qtype="mc",
        options=["126,87°", "53,13°", "233,13°", "306,87°", "90°"],
        correct="126,87°",
        explanation="atan2(8, −6) = 126,87° (kuadran II).",
        misconception="Menghitung atan(8/6) = 53,13° tanpa memperhatikan tanda Rx.",
        time=60,
    )