"""Zone 07 — GVB (Gerak Vertikal ke Bawah) — 25 questions.

GVB = thrown downward, v₀ > 0 (downward).  Kept strictly separate from GJB.
"""

from __future__ import annotations

from physics_engine import gvb_distance_at_t, gvb_fall_time, gvb_final_velocity
from qgen.common import Registry, fmt


def build(reg: Registry) -> None:
    z = 7

    # --- Concepts (8) ---
    reg.mc(
        z, subtopic="Konsep GVB", difficulty=1,
        text="Ciri utama gerak vertikal ke bawah (GVB) adalah …",
        correct="benda diberi kecepatan awal ke bawah sehingga v₀ ≠ 0",
        distractors=[
            "benda dilepaskan tanpa kecepatan awal",
            "percepatan benda nol",
            "benda bergerak dengan kelajuan tetap",
            "benda bergerak ke bawah dengan percepatan −g",
        ],
        explanation="GVB selalu memiliki kecepatan awal ke bawah. Lepas tanpa kecepatan awal adalah GJB.",
        misconception="Menyamakan GVB dengan GJB sehingga menganggap v₀ = 0.",
        time=35,
    )

    reg.mc(
        z, subtopic="Konsep GVB", difficulty=1,
        text="Pada GVB, kelajuan benda …",
        correct="bertambah karena percepatan gravitasi searah dengan gerak",
        distractors=[
            "berkurang karena melawan gravitasi",
            "tetap karena tidak ada gaya",
            "bertambah lalu berkurang",
            "berkurang setelah mencapai titik terendah",
        ],
        explanation="Arah gerak dan arah percepatan sama-sama ke bawah, sehingga kelajuan bertambah.",
        misconception="Menerapkan 'diperlambat' seperti pada GVA.",
        time=35,
    )

    reg.mc(
        z, subtopic="Perbedaan GVB dan GJB", difficulty=2,
        text="Sebuah batu dilempar ke bawah dengan kecepatan awal 5 m/s dari jendela. Gerak batu termasuk …",
        correct="GVB karena v₀ ≠ 0 dan berarah ke bawah",
        distractors=[
            "GJB karena benda akhirnya jatuh",
            "GVA karena benda bergerak vertikal",
            "gerak lurus beraturan karena gaya konstan",
            "bukan gerak vertikal karena ada kecepatan awal",
        ],
        explanation="Klasifikasi bergantung pada ada/tidaknya kecepatan awal saat dilepas.",
        misconception="Menganggap benda yang jatuh dari ketinggian selalu GJB.",
        time=45,
    )

    reg.mc(
        z, subtopic="Waktu Tempuh GVB", difficulty=2,
        text="Dibandingkan benda GJB dari ketinggian yang sama, benda GVB memerlukan waktu …",
        correct="lebih singkat karena sudah memiliki kecepatan awal",
        distractors=[
            "lebih lama karena kecepatan awal menambah jarak",
            "sama karena gravitasi sama",
            "lebih lama karena benda lebih berat",
            "tidak dapat dibandingkan",
        ],
        explanation="Dengan v₀ > 0 ke bawah, benda menempuh jarak lebih cepat dibanding mulai dari diam.",
        misconception="Menganggap kecepatan awal tidak memengaruhi waktu tempuh.",
        time=50,
    )

    reg.mc(
        z, subtopic="Konvensi Tanda", difficulty=2,
        text="Dengan arah positif ke atas, kecepatan awal pada GVB ditulis …",
        correct="negatif",
        distractors=["positif", "nol", "bergantung massa", "bergantung posisi"],
        explanation="Arah gerak awal ke bawah berlawanan dengan arah positif sehingga v₀ < 0 pada konvensi ini.",
        misconception="Selalu menuliskan v₀ positif tanpa memperhatikan konvensi tanda.",
        time=40,
    )

    reg.mc(
        z, subtopic="Percepatan GVB", difficulty=2,
        text="Percepatan benda pada GVB bernilai …",
        correct="g ke bawah sepanjang gerak",
        distractors=[
            "nol karena gaya gravitasi sudah 'digunakan' kecepatan awal",
            "berkurang seiring ketinggian",
            "g ke atas",
            "bergantung pada massa benda",
        ],
        explanation="Percepatan gravitasi tetap g ke bawah, tidak bergantung kecepatan awal.",
        misconception="Menganggap kecepatan awal 'mengurangi' percepatan gravitasi.",
        time=40,
    )

    reg.add(
        z, subtopic="Ciri GVB", difficulty=2,
        text="Pilih SEMUA pernyataan yang benar untuk GVB.",
        qtype="multiple_select",
        options=[
            "Kecepatan awal berarah ke bawah dan tidak nol",
            "Percepatan bernilai g ke bawah",
            "Kelajuan benda bertambah selama bergerak",
            "Kecepatan awal selalu nol",
            "Waktu tempuh tidak dipengaruhi kecepatan awal",
        ],
        correct=[
            "Kecepatan awal berarah ke bawah dan tidak nol",
            "Percepatan bernilai g ke bawah",
            "Kelajuan benda bertambah selama bergerak",
        ],
        explanation="GVB memerlukan v₀ ≠ 0 ke bawah; kecepatan awal memperpendek waktu tempuh dibanding GJB.",
        misconception="Menganggap v₀ nol karena sama dengan GJB.",
        time=65,
    )

    reg.add(
        z, subtopic="Perbedaan GVB dan GJB", difficulty=1,
        text="GJB adalah kasus khusus GVB dengan kecepatan awal nol.",
        qtype="true_false",
        correct="Benar",
        explanation="Dengan v₀ = 0, rumus GVB vₜ = √(v₀² + 2gh) tereduksi menjadi v = √(2gh) yang merupakan rumus GJB.",
        misconception="Menganggap GVB dan GJB tidak berkaitan sama sekali.",
        time=30,
    )

    # --- Numeric: final velocity (8) ---
    final_cases = [
        (5, 20, 10),
        (10, 15, 10),
        (2, 45, 10),
        (8, 9, 10),
        (4, 12, 10),
        (6, 27, 10),
        (10, 25, 10),
        (3, 8, 10),
    ]
    for v0, h, g in final_cases:
        vt = gvb_final_velocity(v0, h, g)
        reg.numeric(
            z, subtopic="Kecepatan Akhir GVB", difficulty=2,
            text=(
                f"Benda dilempar vertikal ke bawah dengan kecepatan  awal {fmt(v0)} m/s "
                f"dari ketinggian {fmt(h)} m (g = {fmt(g)} m/s²). "
                f"Kecepatan benda saat tiba di tanah adalah … m/s."
            ),
            answer=vt, nd=3, unit="m/s",
            wrong_answers=[v0 + g * h, g * h, v0, round(vt / 2, 3)],
            explanation="Gunakan vₜ² = v₀² + 2gh. Perhatikan bahwa v₀ tidak boleh diabaikan.",
            steps=[
                f"vₜ² = {fmt(v0)}² + 2({fmt(g)})({fmt(h)})",
                f"vₜ² = {fmt(v0 * v0 + 2 * g * h, 3)}",
                f"vₜ = {fmt(vt, 3)} m/s",
            ],
            misconception="Mengabaikan kecepatan awal sehingga memakai rumus GJB v = √(2gh).",
            formula="vₜ = √(v₀² + 2gh)",
            verify={"fn": "gvb_final_velocity", "args": {"v0_down": v0, "h": h, "g": g}, "expected": vt},
            diagram={"type": "gvb", "params": {"v0": v0, "h": h, "g": g}},
            time=60,
        )

    # --- Numeric: time (8) ---
    for v0, h, g in final_cases:
        t = gvb_fall_time(v0, h, g)
        vt = gvb_final_velocity(v0, h, g)
        reg.numeric(
            z, subtopic="Waktu Tempuh GVB", difficulty=3,
            text=(
                f"Benda dilempar vertikal ke bawah dengan kecepatan awal {fmt(v0)} m/s "
                f"dari ketinggian {fmt(h)} m (g = {fmt(g)} m/s²). "
                f"Waktu yang diperlukan untuk mencapai tanah adalah … sekon."
            ),
            answer=t, nd=3, unit="s",
            wrong_answers=[round(vt / g, 3), (v0 + vt) / g, h / (v0 + g), round(t * 2, 3)],
            explanation="Selesaikan h = v₀t + ½gt² dan ambil akar positif.",
            steps=[
                f"{fmt(h)} = {fmt(v0)}t + ½({fmt(g)})t²",
                f"t = (−v₀ + √(v₀² + 2gh))/g",
                f"t = {fmt(t, 3)} s",
            ],
            misconception="Menggunakan t = √(2h/g) (rumus GJB) meskipun kecepatan awal tidak nol.",
            formula="t = (−v₀ + √(v₀² + 2gh))/g",
            verify={"fn": "gvb_fall_time", "args": {"v0_down": v0, "h": h, "g": g}, "expected": t},
            diagram={"type": "gvb", "params": {"v0": v0, "h": h, "g": g}},
            time=80,
        )

    # --- Numeric: distance at t (3) ---
    dist_cases = [(5, 2, 10), (8, 1, 10), (10, 3, 10)]
    for v0, t, g in dist_cases:
        d = gvb_distance_at_t(v0, t, g)
        reg.numeric(
            z, subtopic="Jarak Tempuh GVB", difficulty=2,
            text=(
                f"Benda dilempar ke bawah dengan kecepatan awal {fmt(v0)} m/s. "
                f"Jarak yang ditempuh setelah {fmt(t)} s (g = {fmt(g)} m/s²) adalah … meter."
            ),
            answer=d, unit="m",
            wrong_answers=[0.5 * g * t * t, v0 * t, d * 2, d / 2],
            explanation="Jarak = v₀t + ½gt².",
            steps=[f"s = {fmt(v0)}({fmt(t)}) + ½({fmt(g)})({fmt(t)})²", f"s = {fmt(v0 * t)} + {fmt(0.5 * g * t * t)} = {fmt(d)} m"],
            misconception="Hanya memakai ½gt² sehingga mengabaikan kecepatan awal.",
            formula="s = v₀t + ½gt²",
            verify={"fn": "gvb_distance_at_t", "args": {"v0_down": v0, "t": t, "g": g}, "expected": d},
            diagram={"type": "gvb", "params": {"v0": v0, "h": d + 5, "g": g}},
            time=60,
        )

    # --- Contextual / analytical (6) ---
    reg.mc(
        z, subtopic="Soal Kontekstual", difficulty=3,
        text=(
            "Sebuah batu dilempar ke bawah dari tebing setinggi 45 m dengan v₀ = 20 m/s (g = 10 m/s²). "
            "Kecepatan batu saat menyentuh tanah adalah …"
        ),
        correct="√(400 + 900) = 36,06 m/s",
        distractors=["30 m/s", "70 m/s", "20 m/s", "45 m/s"],
        explanation="vₜ = √(20² + 2·10·45) = √(400 + 900) = √1300 ≈ 36,06 m/s.",
        misconception="Mengabaikan v₀ sehingga menggunakan √(2gh) = 30 m/s.",
        time=65,
    )

    reg.mc(
        z, subtopic="Kesalahan Konsep", difficulty=3,
        text=(
            "Seorang siswa menghitung waktu batu GVB (v₀ = 10 m/s, h = 45 m) dengan rumus t = √(2h/g) "
            "dan memperoleh 3 s. Kesalahan siswa tersebut adalah …"
        ),
        correct="menggunakan rumus GJB padahal benda memiliki kecepatan awal ke bawah",
        distractors=[
            "menggunakan nilai g yang salah",
            "membalik tanda percepatan",
            "menganggap benda dilempar ke atas",
            "tidak ada kesalahan, hasilnya benar",
        ],
        explanation="Rumus √(2h/g) hanya berlaku jika v₀ = 0. Dengan v₀ = 10 m/s, t = (−10 + √100+900)/10 = 2 s.",
        misconception="Terlalu cepat memakai rumus GJB untuk setiap benda yang jatuh ke bawah.",
        time=70,
    )

    reg.mc(
        z, subtopic="Perbandingan GVB-GJB", difficulty=3,
        text=(
            "Dua bola identik dilepaskan dari ketinggian 20 m pada waktu yang sama; bola A dilepaskan "
            "(GJB) dan bola B dilempar ke bawah dengan 10 m/s (GVB). Pernyataan yang benar adalah …"
        ),
        correct="bola B menyentuh tanah lebih dahulu",
        distractors=[
            "keduanya menyentuh tanah bersamaan",
            "bola A menyentuh tanah lebih dahulu",
            "bola B lebih lambat karena massa lebih besar",
            "tidak dapat ditentukan tanpa massa",
        ],
        explanation="t_GJB = √(2·20/10) = 2 s, t_GVB = (−10 + √(100 + 400))/10 ≈ 1,24 s. Bola B tiba lebih dahulu.",
        misconception="Menganggap waktu jatuh hanya ditentukan ketinggian.",
        time=75,
    )

    reg.add(
        z, subtopic="Urutan Penyelesaian GVB", difficulty=2,
        text="Urutkan langkah menyelesaikan soal GVB beserta penulisan tanda yang benar.",
        qtype="ordering",
        items=[
            "Tentukan arah positif (misalnya ke atas) dan beri tanda v₀",
            "Tuliskan perpindahan dengan arah yang konsisten",
            "Gunakan v² = v₀² − 2g(y − y₀) atau s = v₀t + ½gt²",
            "Ambil akar positif dan periksa apakah hasil wajar",
        ],
        correct=[
            "Tentukan arah positif (misalnya ke atas) dan beri tanda v₀",
            "Tuliskan perpindahan dengan arah yang konsisten",
            "Gunakan v² = v₀² − 2g(y − y₀) atau s = v₀t + ½gt²",
            "Ambil akar positif dan periksa apakah hasil wajar",
        ],
        explanation="Konsistensi tanda adalah sumber utama kesalahan pada GVB.",
        misconception="Mencampur arah positif antar besaran.",
        time=75,
    )

    reg.add(
        z, subtopic="Analisis Grafik GVB", difficulty=3,
        text=(
            "Grafik v-t GVB berupa garis lurus dengan kemiringan −10 m/s² (positif ke atas). "
            "Pilih SEMUA ciri grafik yang benar."
        ),
        qtype="multiple_select",
        options=[
            "Titik potong sumbu v bernilai negatif (v₀ ke bawah)",
            "Kemiringan garis bernilai negatif",
            "Garis memotong sumbu t saat benda berbalik arah ke atas",
            "Garis selalu mendatar",
            "Kelajuan bertambah seiring waktu",
        ],
        correct=[
            "Titik potong sumbu v bernilai negatif (v₀ ke bawah)",
            "Kemiringan garis bernilai negatif",
            "Kelajuan bertambah seiring waktu",
        ],
        explanation="Garis dimulai dari v₀ < 0 dan turun tajam; besarnya |v| terus bertambah sehingga benda tidak berbalik arah.",
        misconception="Menganggap grafik GVB sama dengan GVA karena sama-sama parabola.",
        diagram={"type": "graph-vt", "params": {"v0": -10, "g": 10, "tMax": 5}},
        time=75,
    )

    reg.add(
        z, subtopic="Pasangan Besaran GVB", difficulty=2,
        text="Pasangkan besaran dengan rumusnya pada GVB.",
        qtype="matching",
        pairs=[
            {"left": "Kecepatan akhir", "right": "vₜ = √(v₀² + 2gh)"},
            {"left": "Waktu tempuh", "right": "t = (−v₀ + √(v₀² + 2gh))/g"},
            {"left": "Jarak tempuh", "right": "s = v₀t + ½gt²"},
            {"left": "Kecepatan pada t", "right": "v = v₀ + gt"},
        ],
        correct={
            "Kecepatan akhir": "vₜ = √(v₀² + 2gh)",
            "Waktu tempuh": "t = (−v₀ + √(v₀² + 2gh))/g",
            "Jarak tempuh": "s = v₀t + ½gt²",
            "Kecepatan pada t": "v = v₀ + gt",
        },
        explanation="Pada konvensi 'ke bawah positif', tanda percepatan adalah +g.",
        misconception="Menuliskan v = v₀ − gt untuk konvensi ke bawah positif.",
        time=70,
    )

    # --- Boundary numeric (2) ---
    reg.numeric(
        z, subtopic="Batas v₀ Nol", difficulty=3,
        text=(
            "Untuk v₀ = 0 m/s dan h = 20 m (g = 10 m/s²), kecepatan akhir yang diperoleh dari rumus GVB "
            "vₜ = √(v₀² + 2gh) adalah … m/s."
        ),
        answer=gvb_final_velocity(0, 20), unit="m/s",
        wrong_answers=[20, 10, 0, 40],
        explanation="Dengan v₀ = 0, GVB tereduksi menjadi GJB: v = √(2·10·20) = 20 m/s.",
        steps=["vₜ = √(0 + 2·10·20)", "vₜ = √400 = 20 m/s"],
        misconception="Menganggap rumus GVB tidak berlaku saat v₀ = 0.",
        formula="vₜ = √(v₀² + 2gh)",
        verify={"fn": "gvb_final_velocity", "args": {"v0_down": 0, "h": 20, "g": 10}, "expected": 20},
        time=55,
    )

    reg.numeric(
        z, subtopic="Kecepatan Setelah Waktu Tertentu", difficulty=2,
        text=(
            "Benda dilempar ke bawah dengan 15 m/s (g = 10 m/s²). "
            "Kelajuan benda setelah 2 s adalah … m/s."
        ),
        answer=35, unit="m/s",
        wrong_answers=[5, 15, 30, 50],
        explanation="v = v₀ + gt = 15 + 10(2) = 35 m/s.",
        steps=["v = 15 + 10(2)", "v = 35 m/s"],
        misconception="Mengurangkan gravitasi sehingga memperoleh 5 m/s.",
        formula="v = v₀ + gt (ke bawah positif)",
        verify={"fn": "vertical_state", "args": {"v0": -15, "t": 2, "y0": 0, "g": 10}, "index": "speed", "expected": 35},
        time=50,
    )