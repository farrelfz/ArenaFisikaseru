"""Zone 08 — GJB (Gerak Jatuh Bebas) — 25 questions.

GJB = released from rest (v₀ = 0), only gravity, air resistance neglected.
"""

from __future__ import annotations

import math

from physics_engine import gjb_fall_time, gjb_height_from_time, gjb_impact_velocity, gjb_speed_from_time
from qgen.common import Registry, fmt


def build(reg: Registry) -> None:
    z = 8

    # --- Concepts (8) ---
    reg.mc(
        z, subtopic="Syarat GJB", difficulty=1,
        text="Syarat terjadinya gerak jatuh bebas (GJB) adalah …",
        correct="benda dilepaskan tanpa kecepatan awal dan hanya dipengaruhi gravitasi",
        distractors=[
            "benda dilempar ke bawah dengan kecepatan awal tertentu",
            "benda bergerak dengan kecepatan konstan",
            "benda dilempar ke atas lalu berhenti",
            "benda bergerak di bidang miring",
        ],
        explanation="GJB mengharuskan v₀ = 0, gaya hanya gravitasi, dan hambatan udara diabaikan.",
        misconception="Menganggap setiap benda yang jatuh adalah GJB.",
        time=35,
    )

    reg.mc(
        z, subtopic="Syarat GJB", difficulty=1,
        text="Pada GJB ideal, besaran yang memengaruhi waktu jatuh adalah …",
        correct="ketinggian dan percepatan gravitasi",
        distractors=[
            "massa dan berat benda",
            "bentuk dan warna benda",
            "kecepatan awal dan massa",
            "volume benda dan suhu udara",
        ],
        explanation="t = √(2h/g) hanya bergantung pada h dan g. Massa tidak berpengaruh pada GJB ideal.",
        misconception="Menganggap benda bermassa lebih besar jatuh lebih cepat.",
        time=40,
    )

    reg.mc(
        z, subtopic="Kecepatan GJB", difficulty=1,
        text="Kelajuan benda pada GJB setelah jatuh selama t adalah …",
        correct="v = gt",
        distractors=["v = ½gt²", "v = h/t", "v = 2gt", "v = √(gh)"],
        explanation="Karena v₀ = 0, v = v₀ + gt = gt.",
        misconception="Menukar rumus kecepatan dengan rumus ketinggian.",
        time=35,
    )

    reg.mc(
        z, subtopic="Jarak GJB", difficulty=1,
        text="Jarak yang ditempuh benda GJB setelah t sekon adalah …",
        correct="h = ½gt²",
        distractors=["h = gt", "h = gt²", "h = ½gt", "h = v₀t + gt"],
        explanation="Dengan v₀ = 0, persamaan posisi tereduksi menjadi s = ½gt².",
        misconception="Lupa faktor ½ pada persamaan posisi.",
        time=35,
    )

    reg.mc(
        z, subtopic="Hambatan Udara", difficulty=2,
        text="Jika hambatan udara diperhitungkan, pernyataan yang benar tentang benda yang dijatuhkan dari ketinggian h adalah …",
        correct="waktu jatuhnya lebih lama daripada GJB ideal",
        distractors=[
            "waktu jatuhnya lebih singkat",
            "waktu jatuhnya tidak berubah",
            "kecepatan akhirnya lebih besar",
            "benda tidak akan pernah menyentuh tanah",
        ],
        explanation="Hambatan udara melawan gerak sehingga percepatan efektif lebih kecil dari g dan waktu jatuh bertambah.",
        misconception="Menganggap hambatan udara mempercepat benda karena 'mendorong' ke bawah.",
        time=50,
    )

    reg.mc(
        z, subtopic="Perbandingan GJB dan GVA", difficulty=2,
        text="Sebuah bola dilempar vertikal ke atas dari suatu titik. Gerak bola pada saat turun melewati titik lempar tersebut dapat dipandang sebagai …",
        correct="gerak jatuh bebas hanya jika bola berhenti sesaat di titik tertinggi",
        distractors=[
            "GJB sejak dilempar",
            "GVB sejak dilempar",
            "gerak lurus beraturan",
            "GVA sepanjang waktu",
        ],
        explanation="Pada titik tertinggi kelajuan nol, sehingga bagian gerak turun dari titik tersebut memenuhi syarat GJB.",
        misconception="Mengklasifikasikan seluruh gerak keseluruhan sebagai GJB.",
        time=60,
    )

    reg.add(
        z, subtopic="Ciri GJB", difficulty=2,
        text="Pilih SEMUA ciri gerak jatuh bebas (ideal).",
        qtype="multiple_select",
        options=[
            "Kecepatan awal nol",
            "Percepatan gravitasi konstan",
            "Kelajuan bertambah secara linear terhadap waktu",
            "Hambatan udara diabaikan",
            "Kelajuan tidak bergantung waktu",
        ],
        correct=[
            "Kecepatan awal nol",
            "Percepatan gravitasi konstan",
            "Kelajuan bertambah secara linear terhadap waktu",
            "Hambatan udara diabaikan",
        ],
        explanation="v = gt menunjukkan kelajuan bertambah linear terhadap waktu.",
        misconception="Menganggap kelajuan tetap karena percepatan konstan.",
        time=65,
    )

    reg.add(
        z, subtopic="Massa dan GJB", difficulty=1,
        text="Pada GJB ideal, dua benda bermassa berbeda yang dijatuhkan dari ketinggian sama akan menyentuh tanah pada waktu yang berbeda.",
        qtype="true_false",
        correct="Salah",
        explanation="t = √(2h/g) tidak mengandung massa, sehingga kedua benda menyentuh tanah bersamaan (hambatan udara diabaikan).",
        misconception="Menganggap benda lebih berat jatuh lebih cepat.",
        time=30,
    )

    # --- Numeric: fall time (8) ---
    heights = [5, 20, 45, 80, 125, 180, 11.25, 31.25]
    for h in heights:
        t = gjb_fall_time(h)
        reg.numeric(
            z, subtopic="Waktu Jatuh Bebas", difficulty=1 if h <= 45 else 2,
            text=f"Benda dijatuhkan tanpa kecepatan awal dari ketinggian {fmt(h)} m (g = 10 m/s²). Waktu benda menyentuh tanah adalah … sekon.",
            answer=t, nd=3, unit="s",
            wrong_answers=[2 * h / 10, round(math.sqrt(h / 5) * 2, 3), round(math.sqrt(h / 10), 3), round(math.sqrt(2 * h) / 10, 3)],
            explanation=(
                f"GJB mulai dari v₀ = 0 sehingga h = ½gt². Dengan h = {fmt(h)} m diperoleh "
                f"t = √(2h/g) = √({fmt(2 * h / 10)}) ≈ {fmt(t, 3)} s."
            ),
            steps=[f"t = √(2 × {fmt(h)} / 10)", f"t = √{fmt(2 * h / 10)} = {fmt(t, 3)} s"],
            misconception="Memakai t = √(h/g) sehingga lupa faktor 2.",
            formula="t = √(2h/g)",
            verify={"fn": "gjb_fall_time", "args": {"h": h, "g": 10}, "expected": t},
            diagram={"type": "gjb", "params": {"h": h, "g": 10}},
            time=50,
        )

    # --- Numeric: impact velocity (8) ---
    for h in heights:
        v = gjb_impact_velocity(h)
        reg.numeric(
            z, subtopic="Kecepatan Tumbukan", difficulty=2,
            text=f"Benda jatuh bebas dari ketinggian {fmt(h)} m (g = 10 m/s²). Kelajuan benda saat menyentuh tanah adalah … m/s.",
            answer=v, nd=3, unit="m/s",
            wrong_answers=[v / 2, v * 2, round(gjb_fall_time(h) * 10 / 2, 3), round(h * 10, 3)],
            explanation=(
                f"Dengan v₀ = 0, rumus v² = v₀² + 2gh tereduksi menjadi v = √(2gh). "
                f"Untuk h = {fmt(h)} m: v = √({fmt(20 * h)}) ≈ {fmt(v, 3)} m/s."
            ),
            steps=[f"v = √(2 × 10 × {fmt(h)})", f"v = √{fmt(20 * h)} = {fmt(v, 3)} m/s"],
            misconception="Menganggap kecepatan akhir sama dengan ketinggian kali gravitasi.",
            formula="v = √(2gh)",
            verify={"fn": "gjb_impact_velocity", "args": {"h": h, "g": 10}, "expected": v},
            diagram={"type": "gjb", "params": {"h": h, "g": 10}},
            time=50,
        )

    # --- Numeric: height from time (3) ---
    times = [1, 2, 3]
    for t in times:
        h = gjb_height_from_time(t)
        reg.numeric(
            z, subtopic="Ketinggian dari Waktu", difficulty=2,
            text=f"Benda jatuh bebas selama {fmt(t)} s (g = 10 m/s²). Ketinggian awal benda adalah … meter.",
            answer=h, unit="m",
            wrong_answers=[10 * t, h / 2, h * 2, 5 * t],
            explanation=(
                f"Jarak jatuh memenuhi h = ½gt². Untuk t = {fmt(t)} s: "
                f"h = ½ × 10 × {fmt(t)}² = {fmt(h)} m."
            ),
            steps=[f"h = ½ × 10 × ({fmt(t)})²", f"h = {fmt(h)} m"],
            misconception="Menggunakan h = gt tanpa faktor ½ atau tanpa kuadrat waktu.",
            formula="h = ½gt²",
            verify={"fn": "gjb_height_from_time", "args": {"t": t, "g": 10}, "expected": h},
            time=50,
        )

    # --- Numeric: speed from time (2 boundary) ---
    for t in [1.5, 2.5]:
        v = gjb_speed_from_time(t)
        reg.numeric(
            z, subtopic="Kecepatan dari Waktu", difficulty=2,
            text=f"Kelajuan benda yang jatuh bebas selama {fmt(t)} s (g = 10 m/s²) adalah … m/s.",
            answer=v, nd=1, unit="m/s",
            wrong_answers=[2 * v, v / 2, round(0.5 * 10 * t * t, 2), round(v + 10, 2)],
            explanation=(
                f"Kelajuan bertambah linear terhadap waktu: v = gt = 10 × {fmt(t)} = {fmt(v, 1)} m/s."
            ),
            steps=[f"v = 10 × {fmt(t)}", f"v = {fmt(v, 1)} m/s"],
            misconception="Memakai rumus jarak ½gt² untuk kecepatan.",
            formula="v = gt",
            verify={"fn": "gjb_speed_from_time", "args": {"t": t, "g": 10}, "expected": v},
            time=45,
        )

    # --- Contextual (2) ---
    reg.mc(
        z, subtopic="Soal Kontekstual", difficulty=2,
        text="Sebuah kelereng dijatuhkan dari meja setinggi 1,25 m. Dengan g = 10 m/s², waktu kelereng menyentuh lantai adalah …",
        correct="0,5 s",
        distractors=["0,25 s", "0,75 s", "1,0 s", "2,5 s"],
        explanation="t = √(2 × 1,25 / 10) = √0,25 = 0,5 s.",
        misconception="Menggunakan t = h/v tanpa menentukan v terlebih dahulu.",
        time=55,
    )

    reg.mc(
        z, subtopic="Perbandingan", difficulty=3,
        text="Dua benda dijatuhkan dari ketinggian h dan 4h. Perbandingan waktu jatuh keduanya adalah …",
        correct="1 : 2",
        distractors=["1 : 4", "1 : 16", "2 : 1", "1 : √2"],
        explanation="t ∝ √h, sehingga t₂/t₁ = √4 = 2.",
        misconception="Menganggap waktu sebanding langsung dengan ketinggian (1 : 4).",
        time=60,
    )

    # --- Structure (2) ---
    reg.add(
        z, subtopic="Urutan Penyelesaian GJB", difficulty=1,
        text="Urutkan langkah menyelesaikan soal GJB.",
        qtype="ordering",
        items=[
            "Pastikan benda dilepas tanpa kecepatan awal",
            "Tetapkan ketinggian dan arah positif (ke bawah)",
            "Gunakan h = ½gt² atau v = gt",
            "Selesaikan persamaan dan periksa satuan",
        ],
        correct=[
            "Pastikan benda dilepas tanpa kecepatan awal",
            "Tetapkan ketinggian dan arah positif (ke bawah)",
            "Gunakan h = ½gt² atau v = gt",
            "Selesaikan persamaan dan periksa satuan",
        ],
        explanation="Validasi syarat v₀ = 0 lebih dulu agar GJB tidak tertukar dengan GVB.",
        misconception="Memulai perhitungan tanpa memeriksa syarat GJB.",
        time=60,
    )

    reg.add(
        z, subtopic="Pasangan Besaran GJB", difficulty=2,
        text="Pasangkan besaran dengan rumusnya pada GJB.",
        qtype="matching",
        pairs=[
            {"left": "Waktu jatuh", "right": "t = √(2h/g)"},
            {"left": "Kecepatan akhir", "right": "v = √(2gh)"},
            {"left": "Jarak tempuh", "right": "h = ½gt²"},
            {"left": "Kecepatan pada t", "right": "v = gt"},
        ],
        correct={
            "Waktu jatuh": "t = √(2h/g)",
            "Kecepatan akhir": "v = √(2gh)",
            "Jarak tempuh": "h = ½gt²",
            "Kecepatan pada t": "v = gt",
        },
        explanation="Keempat rumus diturunkan dari v₀ = 0 pada persamaan gerak dipercepat.",
        misconception="Mencampur rumus waktu dengan rumus kecepatan.",
        time=60,
    )
    # --- Higher-order items (difficulty 3-4) ---
    reg.mc(
        z, subtopic="Analisis Jarak per Sekon", difficulty=3,
        text=(
            "Sebuah benda jatuh bebas dari keadaan diam (g = 10 m/s²). Jarak yang ditempuh pada "
            "sekon kedua (antara t = 1 s dan t = 2 s) adalah … meter."
        ),
        correct="15",
        distractors=["5", "20", "10", "25"],
        explanation=(
            "h(2) = ½·10·4 = 20 m dan h(1) = ½·10·1 = 5 m. Jarak pada sekon kedua = 20 − 5 = 15 m. "
            "Pola ½g(2n − 1) memberi ½·10·3 = 15 m."
        ),
        misconception="Menganggap jarak tiap sekon sama besar karena mengira kelajuan konstan.",
        formula="Δh = ½g(2n − 1) untuk sekon ke-n",
        time=85,
    )

    reg.mc(
        z, subtopic="Perbandingan Kuantitatif", difficulty=4,
        text=(
            "Benda A dijatuhkan dari ketinggian h dan benda B dari ketinggian 2h. "
            "Perbandingan kelajuan saat menyentuh tanah (vA : vB) adalah …"
        ),
        correct="1 : √2",
        distractors=["1 : 2", "1 : 4", "2 : 1", "1 : 1"],
        explanation=(
            "v = √(2gh) sehingga v ∝ √h. Dengan hB = 2h, vB/vA = √2, atau vA : vB = 1 : √2."
        ),
        misconception="Menganggap kelajuan sebanding linear dengan ketinggian sehingga memperoleh 1 : 2.",
        formula="v = √(2gh) ⇒ v ∝ √h",
        time=90,
    )

    reg.add(
        z, subtopic="Analisis Grafik GJB", difficulty=3,
        text=(
            "Grafik kecepatan terhadap waktu untuk GJB (ke bawah positif) berbentuk garis lurus "
            "melalui titik asal. Pilih SEMUA ciri grafik yang benar."
        ),
        qtype="multiple_select",
        options=[
            "Garis mulai dari titik (0, 0)",
            "Kemiringan garis sama dengan percepatan gravitasi g",
            "Luas daerah di bawah garis menyatakan jarak tempuh",
            "Grafik berbentuk parabola",
            "Kemiringan garis bernilai negatif",
        ],
        correct=[
            "Garis mulai dari titik (0, 0)",
            "Kemiringan garis sama dengan percepatan gravitasi g",
            "Luas daerah di bawah garis menyatakan jarak tempuh",
        ],
        explanation=(
            "v = gt adalah fungsi linear dengan v(0) = 0 dan kemiringan g. Jarak adalah integral v dt, "
            "yaitu luas daerah di bawah grafik. Grafik v-t GJB adalah garis lurus, bukan parabola."
        ),
        misconception="Menganggap grafik v-t GJB berbentuk parabola seperti grafik posisi-waktu.",
        diagram={"type": "graph-vt", "params": {"v0": 0, "g": 10, "tMax": 4}},
        time=85,
    )
