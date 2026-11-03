"""Zone 06 — GVA (Gerak Vertikal ke Atas) — 30 questions.

Convention: positive = upward, a = −g.  The engine derives every number; the
question text never states the answer.
"""

from __future__ import annotations

import math

from physics_engine import (
    G_DEFAULT,
    gva_max_height,
    gva_max_height_time,
    gva_total_flight_time,
    gva_total_flight_time_to_ground,
    vertical_state,
)
from qgen.common import Registry, fmt


def scenario(v0: float, y0: float, g: float, task: str) -> str:
    base = (
        f"Sebuah bola dilempar vertikal ke atas dengan kecepatan awal {fmt(v0)} m/s "
    )
    if y0 > 0:
        base += f"dari atap gedung yang tingginya {fmt(y0)} m "
    else:
        base += "dari permukaan tanah "
    return f"{base}(g = {fmt(g)} m/s², hambatan udara diabaikan). {task}"


def build(reg: Registry) -> None:
    z = 6

    # --- Concepts (8) ---
    reg.mc(
        z, subtopic="Konsep GVA", difficulty=1,
        text="Pada gerak vertikal ke atas (GVA), percepatan benda di titik tertinggi bernilai …",
        correct="sama dengan g dan berarah ke bawah",
        distractors=[
            "nol karena kecepatan benda nol",
            "sama dengan g dan berarah ke atas",
            "berubah arah dari ke atas menjadi ke bawah",
            "tidak dapat ditentukan tanpa massa benda",
        ],
        explanation=(
            "Percepatan gravitasi bekerja sepanjang lintasan, termasuk di titik tertinggi. "
            "Yang bernilai nol di titik tertinggi adalah KECEPATAN, bukan percepatan."
        ),
        misconception="Menyimpulkan percepatan nol karena kecepatan nol di titik tertinggi.",
        time=40,
    )

    reg.mc(
        z, subtopic="Konsep GVA", difficulty=1,
        text="Kecepatan benda pada titik tertinggi gerak vertikal ke atas adalah …",
        correct="nol, lalu benda mulai bergerak turun",
        distractors=[
            "maksimum dan berbalik arah",
            "sama dengan kecepatan awalnya",
            "negatif dan terus menurun",
            "tidak nol karena gravitasi tetap bekerja",
        ],
        explanation="Tepat sebelum berbalik, kelajuan menurun hingga nol sesaat. Setelah itu benda bergerak turun (GVB).",
        misconception="Menganggap benda langsung berbalik arah dengan kecepatan awal.",
        time=35,
    )

    reg.mc(
        z, subtopic="Konsep GVA", difficulty=1,
        text="Selama benda naik pada GVA, kelajuannya …",
        correct="berkurang karena percepatan berarah berlawanan dengan arah gerak",
        distractors=[
            "bertambah karena percepatan searah gerak",
            "tetap konstan",
            "bertambah lalu berkurang",
            "berkurang lalu bertambah selama masih naik",
        ],
        explanation="Dengan positif ke atas, a = −g berlawanan arah dengan v > 0 sehingga laju berkurang linear terhadap waktu.",
        misconception="Menganggap benda yang dilempar ke atas selalu dipercepat.",
        time=40,
    )

    reg.mc(
        z, subtopic="Waktu Naik dan Turun", difficulty=2,
        text="Benda dilempar vertikal ke atas lalu kembali ke titik awal. Waktu untuk naik dan waktu untuk turun adalah …",
        correct="sama besar, jika hambatan udara diabaikan",
        distractors=[
            "waktu naik lebih lama karena melawan gravitasi",
            "waktu turun lebih lama karena kecepatan awal nol",
            "waktu naik setengah dari waktu turun",
            "tidak dapat dibandingkan tanpa massa",
        ],
        explanation="Gerak simetris terhadap titik tertinggi ketika hambatan udara diabaikan: t_naik = t_turun = v₀/g.",
        misconception="Menganggap gerak naik selalu memakan waktu lebih lama.",
        time=45,
    )

    reg.mc(
        z, subtopic="Konsep GVA", difficulty=2,
        text="Pernyataan yang benar tentang massa benda pada GVA (ideal) adalah …",
        correct="massa tidak memengaruhi waktu tempuh maupun ketinggian maksimum",
        distractors=[
            "benda lebih berat mencapai ketinggian lebih besar",
            "benda lebih ringan memiliki percepatan lebih besar",
            "massa menentukan arah gerak benda",
            "massa memperbesar percepatan gravitasi",
        ],
        explanation="Semua benda mengalami percepatan gravitasi sama besarnya sehingga gerak ideal tidak bergantung massa.",
        misconception="Menganggap benda berat jatuh/terbang lebih cepat.",
        time=40,
    )

    reg.mc(
        z, subtopic="Kecepatan Sesaat", difficulty=2,
        text="Pada t = ½ t_puncak, kecepatan benda GVA yang dilempar dengan v₀ adalah …",
        correct="½ v₀",
        distractors=["¼ v₀", "½ g v₀", "nol", "2v₀"],
        explanation="v = v₀ − gt. Pada t = v₀/(2g) diperoleh v = v₀ − g·v₀/(2g) = v₀/2.",
        misconception="Menganggap kecepatan berkurang secara kuadratik terhadap waktu.",
        time=50,
    )

    reg.add(
        z, subtopic="Kondisi GVA", difficulty=2,
        text="Pilih SEMUA pernyataan yang benar untuk GVA ideal.",
        qtype="multiple_select",
        options=[
            "Kecepatan awal berarah ke atas",
            "Percepatan selalu −g sepanjang gerak",
            "Di titik tertinggi kecepatan nol",
            "Di titik tertinggi percepatan nol",
            "Ketinggian maksimum sebanding dengan kuadrat kecepatan awal",
        ],
        correct=[
            "Kecepatan awal berarah ke atas",
            "Percepatan selalu −g sepanjang gerak",
            "Di titik tertinggi kecepatan nol",
            "Ketinggian maksimum sebanding dengan kuadrat kecepatan awal",
        ],
        explanation="Percepatan tetap −g bahkan di titik tertinggi. h_max = v₀²/(2g) menunjukkan ketergantungan kuadratik.",
        misconception="Menganggap percepatan nol di titik tertinggi.",
        time=65,
    )

    reg.add(
        z, subtopic="Konsep GVA", difficulty=1,
        text="Pada GVA, benda diperlambat saat naik dan dipercepat saat turun.",
        qtype="true_false",
        correct="Benar",
        explanation="Percepatan selalu −g; saat naik arah gerak berlawanan dengan a sehingga diperlambat, saat turun searah sehingga dipercepat.",
        misconception="Menganggap percepatan berubah tanda pada titik tertinggi.",
        time=30,
    )

    # --- Parameterised numeric computations (22) ---
    cases = [
        # (v0, y0, g, set-of-derived values already validated)
        (20, 0, 10),
        (30, 0, 10),
        (15, 0, 10),
        (25, 0, 10),
        (40, 0, 10),
        (10, 0, 10),
        (20, 20, 10),
        (30, 45, 10),
        (50, 0, 10),
        (12, 0, 10),
        (28, 0, 9.8),
        (35, 0, 9.8),
    ]
    for v0, y0, g in cases:
        t_peak = gva_max_height_time(v0, g)
        peak = gva_max_height(v0, y0, g)
        rel = peak - y0
        t_total = gva_total_flight_time(v0, g)
        t_ground = gva_total_flight_time_to_ground(v0, y0, g)

        reg.numeric(
            z, subtopic="Waktu ke Titik Tertinggi", difficulty=2,
            text=scenario(v0, y0, g, "Waktu yang diperlukan untuk mencapai titik tertinggi adalah … sekon."),
            answer=t_peak, unit="s",
            wrong_answers=[t_total, 2 * t_peak + 1, v0 * g, g / v0],
            explanation="Di titik tertinggi v = 0, sehingga 0 = v₀ − gt dan t = v₀/g.",
            steps=[f"0 = {fmt(v0)} − {fmt(g)}·t", f"t_puncak = {fmt(v0)}/{fmt(g)} = {fmt(t_peak)} s"],
            misconception="Menggunakan rumus h_max/v₀ atau lupa membagi dengan g.",
            formula="t_max = v₀/g",
            verify={"fn": "gva_max_height_time", "args": {"v0": v0, "g": g}, "expected": t_peak},
            diagram={"type": "gva", "params": {"v0": v0, "y0": y0, "g": g}},
            time=55,
        )

        reg.numeric(
            z, subtopic="Ketinggian Maksimum", difficulty=2,
            text=scenario(v0, y0, g, "Ketinggian maksimum bola diukur dari permukaan tanah adalah … meter."),
            answer=peak, unit="m",
            wrong_answers=[rel, v0 * t_peak, v0 * g, peak / 2],
            explanation="Gunakan v² = v₀² − 2g(y − y₀) dengan v = 0 di titik tertinggi.",
            steps=[
                f"0 = {fmt(v0)}² − 2({fmt(g)})(y_max − {fmt(y0)})",
                f"y_max − {fmt(y0)} = {fmt(rel)} m",
                f"y_max = {fmt(peak)} m",
            ],
            misconception="Menghitung perubahan ketinggian saja (dari posisi awal) padahal yang diminta dari permukaan tanah.",
            formula="h_max = v₀²/(2g) ; y_max = y₀ + h_max",
            verify={"fn": "gva_max_height", "args": {"v0": v0, "y0": y0, "g": g}, "expected": peak},
            diagram={"type": "gva", "params": {"v0": v0, "y0": y0, "g": g}},
            time=65,
        )

        reg.numeric(
            z, subtopic="Waktu Kembali ke Titik Awal", difficulty=2,
            text=scenario(v0, y0, g, "Waktu total bola kembali ke ketinggian awalnya adalah … sekon."),
            answer=t_total, unit="s",
            wrong_answers=[t_peak, t_ground, 4 * t_peak, t_peak / 2],
            explanation="Gerak simetris: waktu naik sama dengan waktu turun, sehingga t_total = 2v₀/g.",
            steps=[f"t_naik = {fmt(t_peak)} s", f"t_total = 2 × {fmt(t_peak)} = {fmt(t_total)} s"],
            misconception="Menganggap waktu total sama dengan waktu ke titik tertinggi.",
            formula="t_total = 2v₀/g",
            verify={"fn": "gva_total_flight_time", "args": {"v0": v0, "g": g}, "expected": t_total},
            diagram={"type": "gva", "params": {"v0": v0, "y0": y0, "g": g}},
            time=60,
        )

        if y0 > 0:
            reg.numeric(
                z, subtopic="Waktu Mencapai Tanah", difficulty=3,
                text=scenario(v0, y0, g, "Waktu total bola sejak dilempar hingga menyentuh tanah adalah … sekon."),
                answer=t_ground, nd=3, unit="s",
                wrong_answers=[t_total, t_peak, t_total + math.sqrt(2 * y0 / g), t_ground / 2],
                explanation="Selesaikan y = y₀ + v₀t − ½gt² = 0 dan ambil akar positif.",
                steps=[
                    f"0 = {fmt(y0)} + {fmt(v0)}t − ½({fmt(g)})t²",
                    f"t = (v₀ + √(v₀² + 2gy₀))/g",
                    f"t = {fmt(t_ground, 3)} s",
                ],
                misconception="Menggunakan t_total = 2v₀/g meskipun benda tidak kembali ke ketinggian awal.",
                formula="t = (v₀ + √(v₀² + 2gy₀))/g",
                verify={"fn": "gva_total_flight_time_to_ground", "args": {"v0": v0, "y0": y0, "g": g}, "expected": t_ground},
                diagram={"type": "gva", "params": {"v0": v0, "y0": y0, "g": g}},
                time=85,
            )

        # velocity after a given fraction of rise time
        t_check = t_peak * 0.5
        state = vertical_state(v0, t_check, y0, g)
        reg.numeric(
            z, subtopic="Kecepatan Sesaat", difficulty=2,
            text=scenario(v0, y0, g, f"Kecepatan bola pada t = {fmt(t_check)} s (setengah waktu menuju titik tertinggi) adalah … m/s."),
            answer=state["v"], unit="m/s",
            wrong_answers=[-state["v"], 0, v0, state["v"] + g * t_check],
            explanation="Gunakan v = v₀ − gt dengan tanda positif ke atas.",
            steps=[f"v = {fmt(v0)} − {fmt(g)} × {fmt(t_check)}", f"v = {fmt(state['v'])} m/s"],
            misconception="Menganggap kelajuan selalu berkurang secara linear menuju nol tepat di t_puncak tanpa menghitung.",
            formula="v = v₀ − gt",
            verify={"fn": "vertical_state", "args": {"v0": v0, "t": t_check, "y0": y0, "g": g}, "index": "v", "expected": state["v"]},
            diagram={"type": "gva", "params": {"v0": v0, "y0": y0, "g": g}},
            time=60,
        )

    # --- Position at a given height (2 quick items for g=9.8 case) ---
    reg.numeric(
        z, subtopic="Analisis Grafik", difficulty=3,
        text=(
            "Grafik kecepatan terhadap waktu untuk sebuah benda GVA berupa garis lurus dengan "
            "v = 30 − 10t (m/s). Kecepatan benda pada t = 5 s adalah … m/s."
        ),
        answer=-20, unit="m/s",
        wrong_answers=[20, 0, 30, -30],
        explanation="Substitusikan t = 5 s: v = 30 − 10(5) = −20 m/s. Tanda negatif menandakan benda sudah bergerak turun.",
        steps=["v = 30 − 10(5)", "v = −20 m/s (arah ke bawah)"],
        misconception="Mengabaikan tanda negatif yang menandakan perubahan arah gerak.",
        formula="v = v₀ − gt",
        verify={"fn": "vertical_state", "args": {"v0": 30, "t": 5, "y0": 0, "g": 10}, "index": "v", "expected": -20},
        diagram={"type": "graph-vt", "params": {"v0": 30, "g": 10, "tMax": 8}},
        time=50,
    )

    reg.numeric(
        z, subtopic="Analisis Grafik", difficulty=4,
        text=(
            "Grafik posisi terhadap waktu untuk GVA dengan v₀ = 20 m/s dan y₀ = 0 menghasilkan "
            "parabola. Posisi benda pada t = 3 s adalah … meter di atas tanah."
        ),
        answer=vertical_state(20, 3)["y"], unit="m",
        wrong_answers=[30, 20, 60, 45],
        explanation="y = v₀t − ½gt² = 20(3) − ½(10)(9) = 60 − 45 = 15 m.",
        steps=["y = 20(3) − ½(10)(3²)", "y = 60 − 45", "y = 15 m"],
        misconception="Menggunakan y = v₀t saja sehingga mengabaikan perlambatan gravitasi.",
        formula="y = y₀ + v₀t − ½gt²",
        verify={"fn": "vertical_state", "args": {"v0": 20, "t": 3, "y0": 0, "g": 10}, "index": "y", "expected": 15},
        diagram={"type": "graph-vt", "params": {"v0": 20, "g": 10, "tMax": 4}},
        time=80,
    )

    # --- Contextual problems (4) ---
    reg.mc(
        z, subtopic="Soal Kontekstual", difficulty=3,
        text="Seorang pemain bola melambungkan bola dengan v₀ = 15 m/s. Ketinggian maksimum yang dicapai bola (g = 10 m/s²) adalah …",
        correct="11,25 m",
        distractors=["22,5 m", "15 m", "5,6 m", "112,5 m"],
        explanation="h = v₀²/(2g) = 225/20 = 11,25 m.",
        misconception="Menggunakan h = v₀t dengan t = v₀ (tanpa membagi g).",
        time=55,
    )

    reg.mc(
        z, subtopic="Kesalahan Konsep", difficulty=3,
        text="Seorang siswa berargumen: 'Pada titik tertinggi, percepatan bola nol karena kecepatannya nol.' Analisis yang tepat adalah …",
        correct="argumen salah; kecepatan nol tetapi percepatan tetap g ke bawah",
        distractors=[
            "argumen benar karena a = Δv/Δt = 0",
            "argumen benar hanya jika massa bola kecil",
            "argumen salah karena kecepatan di titik tertinggi tidak nol",
            "argumen benar untuk gerak dengan hambatan udara",
        ],
        explanation="Di titik tertinggi v = 0 hanya sesaat, tetapi selama Δt kecil di sekitarnya kecepatan tetap berubah, sehingga a = −g.",
        misconception="Menyimpulkan a = 0 dari v = 0.",
        time=65,
    )

    reg.mc(
        z, subtopic="Nilai Gravitasi", difficulty=3,
        text="Dua bola identik dilempar vertikal ke atas di Bumi (g = 9,8 m/s²) dan di Bulan (g = 1,6 m/s²) dengan kecepatan awal sama. Pernyataan yang benar adalah …",
        correct="di Bulan bola mencapai ketinggian maksimum lebih besar dan waktu tempuh lebih lama",
        distractors=[
            "di Bulan bola mencapai ketinggian maksimum lebih kecil",
            "ketinggian maksimum sama karena kecepatan awal sama",
            "di Bulan waktu naik lebih singkat",
            "gerak di Bulan tidak memenuhi persamaan GVA",
        ],
        explanation="h_max = v₀²/(2g) dan t_total = 2v₀/g; g lebih kecil menyebabkan h dan t lebih besar.",
        misconception="Menganggap gerak vertikal tidak bergantung pada nilai g.",
        time=60,
    )

    reg.add(
        z, subtopic="Urutan Tahapan GVA", difficulty=2,
        text="Urutkan besaran yang dihitung untuk menentukan ketinggian maksimum GVA.",
        qtype="ordering",
        items=[
            "Tetapkan v₀ dan arah positif ke atas",
            "Gunakan syarat v = 0 di titik tertinggi",
            "Substitusi ke v² = v₀² − 2g(y − y₀)",
            "Selesaikan untuk ketinggian maksimum",
        ],
        correct=[
            "Tetapkan v₀ dan arah positif ke atas",
            "Gunakan syarat v = 0 di titik tertinggi",
            "Substitusi ke v² = v₀² − 2g(y − y₀)",
            "Selesaikan untuk ketinggian maksimum",
        ],
        explanation="Syarat v = 0 mengubah persamaan kecepatan menjadi persamaan ketinggian maksimum.",
        misconception="Menghitung h_max tanpa menerapkan syarat v = 0.",
        time=70,
    )

    reg.add(
        z, subtopic="Pasangan Besaran GVA", difficulty=2,
        text="Pasangkan besaran dengan rumusnya pada GVA.",
        qtype="matching",
        pairs=[
            {"left": "Waktu ke titik tertinggi", "right": "t = v₀/g"},
            {"left": "Ketinggian maksimum", "right": "h = v₀²/(2g)"},
            {"left": "Waktu kembali ke posisi awal", "right": "t = 2v₀/g"},
            {"left": "Kecepatan di titik tertinggi", "right": "v = 0"},
        ],
        correct={
            "Waktu ke titik tertinggi": "t = v₀/g",
            "Ketinggian maksimum": "h = v₀²/(2g)",
            "Waktu kembali ke posisi awal": "t = 2v₀/g",
            "Kecepatan di titik tertinggi": "v = 0",
        },
        explanation="Keempat hubungan ini diturunkan dari v = v₀ − gt dan v² = v₀² − 2gh.",
        misconception="Menukar rumus h_max dengan t_max.",
        time=65,
    )

    # --- Q about y0 above ground at maximum height (still numeric) ---
    reg.numeric(
        z, subtopic="Ketinggian dari Tanah", difficulty=3,
        text=(
            "Bola dilempar vertikal ke atas dari balkon setinggi 12 m dengan v₀ = 8 m/s (g = 10 m/s²). "
            "Ketinggian maksimum bola diukur dari tanah adalah … meter."
        ),
        answer=gva_max_height(8, 12, 10), unit="m",
        wrong_answers=[gva_max_height(8, 0, 10), 8, 20, 3.2],
        explanation="h_max relatif terhadap titik lempar = 8²/(2·10) = 3,2 m. Ketinggian dari tanah = 12 + 3,2 = 15,2 m.",
        steps=["h_rel = 64/20 = 3,2 m", "y_max = 12 + 3,2 = 15,2 m"],
        misconception="Melupakan ketinggian awal sehingga menjawab 3,2 m.",
        formula="y_max = y₀ + v₀²/(2g)",
        verify={"fn": "gva_max_height", "args": {"v0": 8, "y0": 12, "g": 10}, "expected": 15.2},
        diagram={"type": "gva", "params": {"v0": 8, "y0": 12, "g": 10}},
        time=70,
    )