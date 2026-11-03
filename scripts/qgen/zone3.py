"""Zone 03 — Vector Operations (35 questions)."""

from __future__ import annotations

from physics_engine import add, magnitude, subtract
from qgen.common import Registry, fmt


def build(reg: Registry) -> None:
    z = 3

    reg.mc(
        z,
        subtopic="Penjumlahan Vektor",
        difficulty=1,
        text="Dua vektor yang segaris dan searah memiliki resultan yang …",
        correct="besarnya sama dengan jumlah besar kedua vektor",
        distractors=[
            "besarnya sama dengan selisih besar kedua vektor",
            "besarnya nol",
            "besarnya sama dengan hasil kali besar kedua vektor",
            "arahnya tegak lurus terhadap kedua vektor",
        ],
        explanation="Untuk vektor searah, resultan = A + B dan arahnya sama dengan arah kedua vektor.",
        misconception="Mengurangkan besar vektor meskipun arahnya sama.",
        time=30,
    )

    reg.mc(
        z,
        subtopic="Penjumlahan Vektor",
        difficulty=1,
        text="Dua vektor sama besar yang berlawanan arah memiliki resultan …",
        correct="nol",
        distractors=["dua kali besar salah satu vektor", "setengah besar salah satu vektor", "sama dengan besar salah satu vektor", "tak hingga"],
        explanation="A + (−A) = 0. Resultan nol berarti tidak ada perubahan posisi total.",
        misconception="Tetap menjumlahkan besar vektor meskipun arahnya berlawanan.",
        time=30,
    )

    reg.mc(
        z,
        subtopic="Sifat Penjumlahan Vektor",
        difficulty=2,
        text="Sifat komutatif pada penjumlahan vektor dinyatakan oleh …",
        correct="A + B = B + A",
        distractors=["A + B = A − B", "A · B = B · A", "A + (B + C) = (A + B) + C", "A + 0 = A"],
        explanation="Komutatif berarti urutan penjumlahan tidak mengubah resultan. A + (B + C) = (A + B) + C adalah sifat asosiatif.",
        misconception="Menukar sifat komutatif dengan asosiatif.",
        time=40,
    )

    reg.mc(
        z,
        subtopic="Pengurangan Vektor",
        difficulty=1,
        text="Pengurangan vektor A − B ekuivalen dengan …",
        correct="A + (−B)",
        distractors=["−A + B", "B − A", "−(A + B)", "A + B"],
        explanation="Mengurangi B sama dengan menambahkan vektor negatif B, yaitu vektor B yang dibalik arahnya.",
        misconception="Menganggap A − B sama dengan B − A.",
        time=35,
    )

    # --- Addition numerics (8) ---
    add_cases = [
        ((3, 0), (5, 0)),
        ((4, 0), (-9, 0)),
        ((6, 0), (0, 8)),
        ((3, 4), (0, 0)),
        ((5, 0), (5, 0)),
        ((2, 3), (4, 0)),
        ((-5, 2), (5, -2)),
        ((1, 2), (7, 6)),
    ]
    for (ax, ay), (bx, by) in add_cases:
        r = add(ax, ay, bx, by)
        mag_sum = magnitude(ax, ay) + magnitude(bx, by)
        reg.numeric(
            z,
            subtopic="Resultan Penjumlahan",
            difficulty=2,
            text=(
                f"Dua vektor A = {ax}i {('+' if ay >= 0 else '−')} {abs(ay)}j dan "
                f"B = {bx}i {('+' if by >= 0 else '−')} {abs(by)}j (satuan SI). "
                f"Besar resultan A + B adalah …"
            ),
            answer=r["magnitude"],
            unit="satuan",
            wrong_answers=[mag_sum, abs(magnitude(ax, ay) - magnitude(bx, by)), abs(r["x"]) + abs(r["y"]), magnitude(ax, ay) * magnitude(bx, by)],
            explanation="Resultan diperoleh dengan menjumlahkan komponen sejenis, lalu menghitung besarnya.",
            steps=[
                f"Rx = {ax} + ({bx}) = {fmt(r['x'])}",
                f"Ry = {ay} + ({by}) = {fmt(r['y'])}",
                f"|R| = √(Rx² + Ry²) = {fmt(r['magnitude'])}",
            ],
            misconception="Menjumlahkan besar vektor secara langsung tanpa memperhatikan arah.",
            formula="R = A + B ; |R| = √(Rx² + Ry²)",
            verify={"fn": "add", "args": {"ax": ax, "ay": ay, "bx": bx, "by": by}, "index": "magnitude", "expected": r["magnitude"]},
            time=55,
        )

    # --- Subtraction numerics (8) ---
    sub_cases = [
        ((8, 0), (3, 0)),
        ((2, 0), (9, 0)),
        ((5, 5), (2, 1)),
        ((-3, 4), (1, 1)),
        ((6, 8), (0, 0)),
        ((10, 0), (0, 10)),
        ((4, -2), (-1, 3)),
        ((0, 7), (0, 2)),
    ]
    for (ax, ay), (bx, by) in sub_cases:
        r = subtract(ax, ay, bx, by)
        plus = add(ax, ay, bx, by)
        reg.numeric(
            z,
            subtopic="Resultan Pengurangan",
            difficulty=2,
            text=(
                f"Diketahui A = {ax}i {('+' if ay >= 0 else '−')} {abs(ay)}j dan "
                f"B = {bx}i {('+' if by >= 0 else '−')} {abs(by)}j. "
                f"Besar vektor A − B adalah …"
            ),
            answer=r["magnitude"],
            unit="satuan",
            wrong_answers=[plus["magnitude"], magnitude(ax, ay) + magnitude(bx, by), abs(r["x"]) + abs(r["y"]), abs(magnitude(ax, ay) - magnitude(bx, by))],
            explanation="Kurangkan komponen B dari komponen A yang bersesuaian, lalu hitung besarnya.",
            steps=[
                f"Rx = {ax} − ({bx}) = {fmt(r['x'])}",
                f"Ry = {ay} − ({by}) = {fmt(r['y'])}",
                f"|A − B| = √(Rx² + Ry²) = {fmt(r['magnitude'])}",
            ],
            misconception="Menghitung A + B padahal yang diminta A − B.",
            formula="R = A − B",
            verify={"fn": "subtract", "args": {"ax": ax, "ay": ay, "bx": bx, "by": by}, "index": "magnitude", "expected": r["magnitude"]},
            time=60,
        )

    # --- Zero resultant (6) ---
    zero_cases = [(12, "timur"), (20, "utara"), (35, "barat"), (8, "selatan"), (48, "timur laut"), (15, "barat daya")]
    for value, direction in zero_cases:
        opposite = {
            "timur": "barat",
            "barat": "timur",
            "utara": "selatan",
            "selatan": "utara",
            "timur laut": "barat daya",
            "barat daya": "timur laut",
        }[direction]
        reg.mc(
            z,
            subtopic="Resultan Nol",
            difficulty=2,
            text=(
                f"Vektor F₁ besarnya {value} N berarah ke {direction}. Agar resultan F₁ + F₂ = 0, "
                f"vektor F₂ harus …"
            ),
            correct=f"berbesar {value} N ke arah {opposite}",
            distractors=[
                f"berbesar {value} N ke arah {direction}",
                f"berbesar {value * 2} N ke arah {opposite}",
                f"berbesar 0 N",
                f"berbesar {value} N tegak lurus arah {direction}",
            ],
            explanation="Resultan nol menuntut F₂ = −F₁, yaitu besar sama dan arah berlawanan 180°.",
            misconception="Menganggap resultan nol cukup dengan salah satu vektor bernilai nol.",
            time=45,
        )

    reg.add(
        z,
        subtopic="Sifat Penjumlahan Vektor",
        difficulty=2,
        text="Pilih SEMUA pernyataan yang benar tentang operasi vektor.",
        qtype="multiple_select",
        options=[
            "A + B = B + A",
            "A − B = B − A",
            "A + (B + C) = (A + B) + C",
            "A + 0 = A",
            "|A + B| selalu sama dengan |A| + |B|",
        ],
        correct=["A + B = B + A", "A + (B + C) = (A + B) + C", "A + 0 = A"],
        explanation=(
            "Penjumlahan vektor komutatif dan asosiatif, serta memiliki elemen identitas 0. "
            "Pengurangan tidak komutatif. |A + B| = |A| + |B| hanya berlaku bila searah."
        ),
        misconception="Menganggap |A + B| selalu sama dengan jumlah besar vektor.",
        time=60,
    )

    reg.add(
        z,
        subtopic="Pengurangan Vektor",
        difficulty=2,
        text="A − B dan B − A memiliki besar yang sama tetapi arah berlawanan.",
        qtype="true_false",
        correct="Benar",
        explanation="B − A = −(A − B), sehingga besarnya sama dan arahnya berlawanan 180°.",
        misconception="Menganggap A − B = B − A karena besar hasilnya sama.",
        time=35,
    )

    reg.add(
        z,
        subtopic="Resultan Nol",
        difficulty=1,
        text="Tiga vektor gaya seimbang. Jika F₁ = 10 N ke timur dan F₂ = 6 N ke barat, maka F₃ adalah …",
        qtype="mc",
        options=["4 N ke timur", "4 N ke barat", "16 N ke timur", "16 N ke barat", "0 N"],
        correct="4 N ke barat",
        explanation="Resultan F₁ + F₂ = 10 N timur − 6 N timur = 4 N ke timur. Agar jumlah ketiga gaya nol, F₃ harus 4 N ke barat.",
        misconception="Lupa bahwa F₃ harus melawan resultan sisa.",
        time=50,
    )

    reg.add(
        z,
        subtopic="Komponen dan Resultan",
        difficulty=2,
        text="Pasangkan operasi dengan hasilnya untuk A = 4i + 3j dan B = 1i + 2j.",
        qtype="matching",
        pairs=[
            {"left": "A + B", "right": "5i + 5j"},
            {"left": "A − B", "right": "3i + 1j"},
            {"left": "B − A", "right": "−3i − 1j"},
            {"left": "−A", "right": "−4i − 3j"},
        ],
        correct={"A + B": "5i + 5j", "A − B": "3i + 1j", "B − A": "−3i − 1j", "−A": "−4i − 3j"},
        explanation="Operasi dilakukan komponen demi komponen.",
        misconception="Mengurangkan komponen secara terbalik.",
        time=55,
    )

    reg.add(
        z,
        subtopic="Prosedur Resultan",
        difficulty=2,
        text="Urutkan langkah menghitung resultan dua vektor secara analitis.",
        qtype="ordering",
        items=[
            "Uraikan setiap vektor menjadi komponen x dan y",
            "Jumlahkan seluruh komponen x menjadi Rx",
            "Jumlahkan seluruh komponen y menjadi Ry",
            "Hitung |R| = √(Rx² + Ry²)",
            "Tentukan arah dengan θ = atan2(Ry, Rx)",
        ],
        correct=[
            "Uraikan setiap vektor menjadi komponen x dan y",
            "Jumlahkan seluruh komponen x menjadi Rx",
            "Jumlahkan seluruh komponen y menjadi Ry",
            "Hitung |R| = √(Rx² + Ry²)",
            "Tentukan arah dengan θ = atan2(Ry, Rx)",
        ],
        explanation="Metode analitis selalu melalui penguraian komponen sebelum resultan dan arah dihitung.",
        misconception="Menghitung resultan dari besar vektor tanpa menguraikan komponen.",
        time=70,
    )

    # --- Diagram set (5) ---
    diagram_cases = [
        ([(6, 0, "F₁"), (0, 8, "F₂")], add(6, 0, 0, 8)["magnitude"], "vektor tegak lurus"),
        ([(5, 0, "F₁"), (5, 0, "F₂")], add(5, 0, 5, 0)["magnitude"], "vektor searah"),
        ([(9, 0, "F₁"), (-4, 0, "F₂")], add(9, 0, -4, 0)["magnitude"], "vektor berlawanan arah"),
        ([(0, 12, "F₁"), (5, 0, "F₂")], add(0, 12, 5, 0)["magnitude"], "vektor tegak lurus"),
        ([(3, 4, "F₁"), (3, 4, "F₂")], add(3, 4, 3, 4)["magnitude"], "vektor identik"),
    ]
    for case_no, (vecs, expected, note) in enumerate(diagram_cases, start=1):
        reg.numeric(
            z,
            subtopic="Interpretasi Diagram Resultan",
            difficulty=2,
            text=f"Gambar {case_no} menunjukkan dua vektor dengan hubungan {note}. Besar resultannya adalah … satuan.",
            answer=expected,
            unit="satuan",
            wrong_answers=[expected * 2, expected / 2, sum(magnitude(v[0], v[1]) for v in vecs), expected + 1],
            explanation="Resultan dihitung dari komponen kedua vektor, sesuai arah masing-masing pada diagram.",
            steps=[f"Rx = {fmt(sum(v[0] for v in vecs))}", f"Ry = {fmt(sum(v[1] for v in vecs))}", f"|R| = {fmt(expected)}"],
            misconception="Menjumlahkan panjang panah pada gambar tanpa memperhatikan arah.",
            formula="|R| = √(Rx² + Ry²)",
            verify=None,
            diagram={"type": "vector-plane", "params": {"vectors": [{"x": vx, "y": vy, "label": lbl} for vx, vy, lbl in vecs], "showResultant": True}},
            time=55,
        )

    # --- Final properties / conceptual (remaining) ---
    reg.mc(
        z,
        subtopic="Penjumlahan Vektor",
        difficulty=2,
        text="Resultan dua vektor besarnya paling kecil ketika sudut antara keduanya …",
        correct="180°",
        distractors=["0°", "45°", "90°", "120°"],
        explanation="|R|² = A² + B² + 2AB cos θ. Nilai minimum terjadi saat cos θ = −1, yaitu θ = 180°.",
        misconception="Menganggap resultan minimum saat sudut 90°.",
        time=45,
    )

    reg.mc(
        z,
        subtopic="Penjumlahan Vektor",
        difficulty=2,
        text="Dua vektor besarnya 7 satuan dan 10 satuan. Besar resultan yang TIDAK mungkin adalah …",
        correct="20 satuan",
        distractors=["3 satuan", "10 satuan", "17 satuan", "13 satuan"],
        explanation="Besar resultan berada pada rentang |10 − 7| = 3 sampai 10 + 7 = 17 satuan. Nilai 20 berada di luar rentang.",
        misconception="Mengira resultan dapat melebihi jumlah besar kedua vektor.",
        time=50,
    )

    reg.mc(
        z,
        subtopic="Pengurangan Vektor",
        difficulty=2,
        text="Diketahui |A| = 8 dan |B| = 6. Jika A dan B tegak lurus, besar |A − B| adalah …",
        correct="10",
        distractors=["14", "2", "48", "√14"],
        explanation="Karena tegak lurus, |A − B| = √(8² + 6²) = 10.",
        misconception="Mengurangkan besar vektor (8 − 6 = 2).",
        time=45,
    )

    reg.mc(
        z,
        subtopic="Resultan Nol",
        difficulty=3,
        text="Tiga vektor gaya sama besar 12 N bekerja pada satu titik dengan sudut 120° satu sama lain. Resultan ketiga gaya adalah …",
        correct="0 N",
        distractors=["12 N", "24 N", "36 N", "6 N"],
        explanation="Tiga vektor sama besar dengan sudut 120° membentuk simetri penuh sehingga jumlah vektornya nol.",
        misconception="Menjumlahkan besar gaya (36 N) karena mengabaikan arah.",
        time=60,
    )

    reg.mc(
        z,
        subtopic="Sifat Penjumlahan Vektor",
        difficulty=2,
        text="Manakah pernyataan yang salah?",
        correct="Pengurangan vektor bersifat komutatif",
        distractors=[
            "Penjumlahan vektor bersifat komutatif",
            "Vektor nol adalah elemen identitas penjumlahan",
            "Vektor negatif memiliki besar yang sama dengan vektor asalnya",
            "Resultan dua vektor dapat lebih kecil dari salah satu vektor",
        ],
        explanation="A − B ≠ B − A (kecuali keduanya nol), sehingga pengurangan tidak komutatif.",
        misconception="Menganggap semua operasi vektor komutatif.",
        time=45,
    )
    # --- Higher-order items (difficulty 3-4) ---
    reg.mc(
        z,
        subtopic="Pengurangan Vektor",
        difficulty=3,
        text=(
            "Vektor A = 6i + 2j dan B = 2i + 5j (satuan SI). Besar vektor A − B adalah … satuan."
        ),
        correct="5",
        distractors=["4", "3", "7", "√58"],
        explanation=(
            "A − B = (6−2)i + (2−5)j = 4i − 3j. Besarnya √(4² + (−3)²) = √25 = 5 satuan."
        ),
        misconception="Mengurangkan hanya komponen x sehingga memperoleh 4, atau salah tanda pada komponen y.",
        formula="|A − B| = √((Ax−Bx)² + (Ay−By)²)",
        verify={"fn": "subtract", "args": {"ax": 6, "ay": 2, "bx": 2, "by": 5}, "index": "magnitude", "expected": 5},
        time=80,
    )

    reg.mc(
        z,
        subtopic="Sifat Operasi Vektor",
        difficulty=3,
        text=(
            "Diketahui A = 3i + 4j dan B = 3i + 4j. Seorang siswa menyimpulkan bahwa "
            "A + B = 6i + 8j dan |A + B| = 14. Analisis yang tepat adalah …"
        ),
        correct="A + B benar 6i + 8j, tetapi besarnya 10 bukan 14",
        distractors=[
            "keduanya benar karena 6 + 8 = 14",
            "keduanya salah karena A + B = 3i + 4j",
            "A + B salah, seharusnya 10i + 12j",
            "besarnya tidak dapat dihitung tanpa sudut antara A dan B",
        ],
        explanation=(
            "Penjumlahan komponen sudah benar (6i + 8j). Besarnya √(6² + 8²) = √100 = 10, "
            "bukan jumlah komponen 6 + 8."
        ),
        misconception="Menjumlahkan komponen untuk memperoleh besar, padahal besar adalah akar jumlah kuadrat.",
        formula="|R| = √(Rx² + Ry²)",
        verify={"fn": "add", "args": {"ax": 3, "ay": 4, "bx": 3, "by": 4}, "index": "magnitude", "expected": 10},
        time=85,
    )

    reg.mc(
        z,
        subtopic="Analisis Resultan",
        difficulty=4,
        text=(
            "Dua vektor memiliki besar 8 N dan 6 N. Manakah pernyataan yang BENAR tentang kemungkinan "
            "besar resultannya?"
        ),
        correct="resultan dapat bernilai 2 N sampai 14 N, bergantung sudut antara kedua vektor",
        distractors=[
            "resultan selalu 10 N",
            "resultan selalu 14 N",
            "resultan dapat bernilai 0 N sampai 14 N",
            "resultan tidak dapat dihitung tanpa massa benda",
        ],
        explanation=(
            "Besar resultan dua vektor terbatas pada |a − b| ≤ R ≤ a + b, yaitu 2 N ≤ R ≤ 14 N. "
            "Nilai 10 N hanya terjadi jika sudutnya 90°."
        ),
        misconception="Menganggap resultan selalu dijumlahkan langsung atau selalu tegak lurus.",
        time=90,
    )

    reg.add(
        z,
        subtopic="Urutan Operasi Vektor",
        difficulty=3,
        text="Urutkan langkah menentukan resultan tiga vektor dengan metode analitis.",
        qtype="ordering",
        items=[
            "Uraikan setiap vektor menjadi komponen x dan y",
            "Jumlahkan semua komponen x dan semua komponen y",
            "Hitung besar resultan dengan akar jumlah kuadrat komponen",
            "Tentukan arah dengan atan2(Ry, Rx) dan sesuaikan kuadrannya",
        ],
        correct=[
            "Uraikan setiap vektor menjadi komponen x dan y",
            "Jumlahkan semua komponen x dan semua komponen y",
            "Hitung besar resultan dengan akar jumlah kuadrat komponen",
            "Tentukan arah dengan atan2(Ry, Rx) dan sesuaikan kuadrannya",
        ],
        explanation="Urutan ini mencegah pencampuran besar dan arah sebelum komponen selesai dijumlahkan.",
        misconception="Menghitung besar resultan sebelum komponen selesai dijumlahkan.",
        time=85,
    )
