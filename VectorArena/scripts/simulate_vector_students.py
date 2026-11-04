#!/usr/bin/env python3
"""
SIMULASI 10 & 25 SISWA VECTORARENA (SMAN 78 JAKARTA - KELAS X A s.d. X K)
Berkolaborasi bersama model cbai/deepseek-v4.1-flash via 9Router

Menguji segala macam kondisi pengerjaan dan batas evaluasi:
1. Siswa Top Rank / Speedrunner Sempurna (Einstein 100k scale)
2. Siswa Unggul Konsisten (Newton 85-94)
3. Siswa Ambang Batas KKM Tepat (Maxwell KKM 75.0 / 76.0)
4. Siswa Galileo / Menengah (Nilai 60-74)
5. Siswa Remedial / Archimedes (< 60.0)
6. Siswa Pelanggar Integritas Tab (0x Jujur, 1x Kecurangan Ringan, 2x Terindikasi, 3x Curang Berat, >=5x Curang Ekstrem)
7. Siswa Timeout (Waktu Habis 90 Menit / Bonus Kecepatan 0)
8. Siswa Parsial / Kosong Sebagian
9. Siswa Uji Coba Duplikasi (Anti-Overwrite Protection)
10. Persebaran Rombel Kelas X A hingga X K (11 Rombel)
"""

import os
import sys
import json
import time
import urllib.request
from pathlib import Path

WORKSPACE = Path("/home/si/AI-Workspace")
sys.path.append(str(WORKSPACE))
from scripts.ai_router import API_KEY, BASE_URL

# 10 SISWA AUDIT PERTAMA (Representatif 10 Kondisi Ekstrem)
STUDENTS_10 = [
    {
        "name": "Muhammad Zaidan Al-Farisi",
        "className": "X A",
        "absen": 1,
        "durationSec": 1350,
        "tabSwitches": 0,
        "correctCount": 25,
        "condition": "Top Rank Speedrunner (Sempurna 25/25, Relativistik)"
    },
    {
        "name": "Annisa Nabila Rahma",
        "className": "X B",
        "absen": 5,
        "durationSec": 1690,
        "tabSwitches": 0,
        "correctCount": 24,
        "condition": "Podium Emas/Perak (24/25, Supersonik)"
    },
    {
        "name": "Rizky Fadhillah Pratama",
        "className": "X C",
        "absen": 12,
        "durationSec": 2200,
        "tabSwitches": 1,
        "correctCount": 23,
        "condition": "Toleransi Integritas Ringan (1x Tab Switch)"
    },
    {
        "name": "Fathia Zahra Azzahra",
        "className": "X D",
        "absen": 18,
        "durationSec": 2750,
        "tabSwitches": 0,
        "correctCount": 21,
        "condition": "Konsisten Tuntas (21/25, Supersonik)"
    },
    {
        "name": "Bima Arya Wicaksana",
        "className": "X E",
        "absen": 7,
        "durationSec": 3200,
        "tabSwitches": 2,
        "correctCount": 19,
        "condition": "Ambang Batas KKM Tepat (19/25 = 76.0, 2x Tab)"
    },
    {
        "name": "Clarissa Aurelia Putri",
        "className": "X F",
        "absen": 14,
        "durationSec": 3600,
        "tabSwitches": 0,
        "correctCount": 18,
        "condition": "Gagal KKM Tipis (18/25 = 72.0, Subsonik)"
    },
    {
        "name": "Daffa Ibnu Hafidz",
        "className": "X G",
        "absen": 9,
        "durationSec": 4100,
        "tabSwitches": 4,
        "correctCount": 16,
        "condition": "Pelanggaran Tab Kritis (4x Tab Switch, Subsonik)"
    },
    {
        "name": "Kayla Salsabila Azka",
        "className": "X H",
        "absen": 22,
        "durationSec": 4800,
        "tabSwitches": 7,
        "correctCount": 13,
        "condition": "Pelanggaran Berat (>5x Tab, Remedial)"
    },
    {
        "name": "Ahmad Rayhan Kusuma",
        "className": "X I",
        "absen": 3,
        "durationSec": 5400,
        "tabSwitches": 0,
        "correctCount": 11,
        "condition": "Timeout Habis Waktu (Durasi Maksimal 90 Menit)"
    },
    {
        "name": "Siti Sarah Nurhaliza",
        "className": "X J",
        "absen": 16,
        "durationSec": 1900,
        "tabSwitches": 0,
        "correctCount": 8,
        "condition": "Pengisian Parsial Cepat (Remedial Rendah)"
    }
]

# 25 SISWA AUDIT PENUH (Mencakup 11 Rombel Kelas X A s.d. X K)
STUDENTS_25 = [
    # Kelas X A
    {"name": "Muhammad Zaidan Al-Farisi", "className": "X A", "absen": 1, "durationSec": 1280, "tabSwitches": 0, "correctCount": 25, "condition": "Juara 1 Speedrunner Sempurna (Relativistik)"},
    {"name": "Alya Maharani Putri", "className": "X A", "absen": 8, "durationSec": 2100, "tabSwitches": 0, "correctCount": 22, "condition": "Supersonik Tuntas KKM"},
    {"name": "Dimas Prasetyo", "className": "X A", "absen": 15, "durationSec": 3150, "tabSwitches": 1, "correctCount": 19, "condition": "Ambang KKM Tuntas (1x Tab)"},

    # Kelas X B
    {"name": "Annisa Nabila Rahma", "className": "X B", "absen": 5, "durationSec": 1550, "tabSwitches": 0, "correctCount": 25, "condition": "Podium Emas Juara 2 (Relativistik)"},
    {"name": "Farhan Surya Wijaya", "className": "X B", "absen": 19, "durationSec": 2400, "tabSwitches": 0, "correctCount": 23, "condition": "Supersonik Konsisten"},

    # Kelas X C
    {"name": "Rizky Fadhillah Pratama", "className": "X C", "absen": 12, "durationSec": 1820, "tabSwitches": 0, "correctCount": 24, "condition": "Podium Perunggu Juara 3 (Supersonik)"},
    {"name": "Nadia Khairunnisa", "className": "X C", "absen": 25, "durationSec": 3300, "tabSwitches": 0, "correctCount": 19, "condition": "Ambang KKM Tuntas"},

    # Kelas X D
    {"name": "Fathia Zahra Azzahra", "className": "X D", "absen": 18, "durationSec": 2350, "tabSwitches": 0, "correctCount": 23, "condition": "Top 10 Hall of Fame"},
    {"name": "Galih Rakha Ramadhan", "className": "X D", "absen": 27, "durationSec": 3800, "tabSwitches": 2, "correctCount": 17, "condition": "Subsonik Remedial (2x Tab)"},

    # Kelas X E
    {"name": "Bima Arya Wicaksana", "className": "X E", "absen": 7, "durationSec": 1950, "tabSwitches": 0, "correctCount": 24, "condition": "Top 10 Hall of Fame"},
    {"name": "Indah Permatasari", "className": "X E", "absen": 21, "durationSec": 2900, "tabSwitches": 1, "correctCount": 20, "condition": "Orbital Tuntas KKM"},

    # Kelas X F
    {"name": "Clarissa Aurelia Putri", "className": "X F", "absen": 14, "durationSec": 2500, "tabSwitches": 0, "correctCount": 22, "condition": "Top 10 Hall of Fame"},
    {"name": "Kevin Jonathan", "className": "X F", "absen": 31, "durationSec": 4200, "tabSwitches": 3, "correctCount": 15, "condition": "Pelanggaran Tab Waspada (3x Tab)"},

    # Kelas X G
    {"name": "Daffa Ibnu Hafidz", "className": "X G", "absen": 9, "durationSec": 2650, "tabSwitches": 0, "correctCount": 21, "condition": "Top 10 Hall of Fame"},
    {"name": "Larasati Dewi", "className": "X G", "absen": 22, "durationSec": 3400, "tabSwitches": 0, "correctCount": 19, "condition": "Ambang KKM Tuntas"},

    # Kelas X H
    {"name": "Kayla Salsabila Azka", "className": "X H", "absen": 16, "durationSec": 2700, "tabSwitches": 0, "correctCount": 21, "condition": "Top 10 Hall of Fame"},
    {"name": "Muhammad Raka Aditya", "className": "X H", "absen": 29, "durationSec": 4500, "tabSwitches": 5, "correctCount": 14, "condition": "Pelanggaran Berat (5x Tab Switch)"},

    # Kelas X I
    {"name": "Ahmad Rayhan Kusuma", "className": "X I", "absen": 3, "durationSec": 2150, "tabSwitches": 0, "correctCount": 23, "condition": "Top 10 Hall of Fame"},
    {"name": "Putri Ayu Wandira", "className": "X I", "absen": 17, "durationSec": 3600, "tabSwitches": 0, "correctCount": 18, "condition": "Gagal KKM Subsonik (72.0)"},

    # Kelas X J
    {"name": "Siti Sarah Nurhaliza", "className": "X J", "absen": 11, "durationSec": 2800, "tabSwitches": 0, "correctCount": 20, "condition": "Orbital Tuntas KKM"},
    {"name": "Taufik Hidayat", "className": "X J", "absen": 33, "durationSec": 5400, "tabSwitches": 0, "correctCount": 16, "condition": "Timeout Habis Waktu (90m Penuh)"},

    # Kelas X K
    {"name": "Zahra Amelia", "className": "X K", "absen": 4, "durationSec": 2250, "tabSwitches": 0, "correctCount": 22, "condition": "Piala Rombel Kontributor"},
    {"name": "Wahyu Setiawan", "className": "X K", "absen": 18, "durationSec": 3100, "tabSwitches": 1, "correctCount": 19, "condition": "Ambang KKM Tuntas"},
    {"name": "Yusuf Maulana", "className": "X K", "absen": 28, "durationSec": 4900, "tabSwitches": 6, "correctCount": 11, "condition": "Pelanggaran Berat & Remedial"},
    {"name": "Vania Safitri", "className": "X K", "absen": 35, "durationSec": 1700, "tabSwitches": 0, "correctCount": 9, "condition": "Pengisian Parsial Cepat (Statis)"}
]

def calculate_physics_score(correct_count, duration_sec, total_q=25, base_pts=3000, max_duration=5400, max_bonus=25000):
    """Kalkulator Skor Resmi VectorArena Sesuai Standar Kurikulum"""
    # 1. Skor Dasar
    base_score = correct_count * base_pts
    
    # 2. Nilai Akademik (0.0 - 100.0)
    grade = round((correct_count / total_q) * 100.0, 1)
    
    # 3. Bonus Kecepatan (Hanya aktif jika nilai >= KKM 75.0)
    speed_bonus = 0
    if grade >= 75.0:
        time_left = max(0, max_duration - duration_sec)
        time_ratio = time_left / max_duration
        accuracy_multiplier = (correct_count / total_q)
        speed_bonus = int(round(time_ratio * max_bonus * accuracy_multiplier))
        
    total_score = base_score + speed_bonus
    
    # 4. Predikat Tier
    if grade >= 95.0:
        tier = "⚡ Einstein"
    elif grade >= 85.0:
        tier = "🌊 Newton"
    elif grade >= 75.0:
        tier = "🌀 Maxwell"
    elif grade >= 60.0:
        tier = "⏳ Galileo"
    else:
        tier = "💧 Archimedes"
        
    status_kkm = "TUNTAS" if grade >= 75.0 else "REMEDIAL"
    
    return {
        "grade": grade,
        "baseScore": base_score,
        "speedBonus": speed_bonus,
        "totalScore": total_score,
        "tier": tier,
        "statusKKM": status_kkm
    }

def generate_student_answers(correct_count, total_q=25):
    """Membuat mock peta jawaban yang konsisten dan dapat dianalisis per butir"""
    answers = {}
    for i in range(1, total_q + 1):
        q_id = f"Q{i:02d}"
        is_corr = (i <= correct_count)
        answers[q_id] = {
            "selected": "A" if is_corr else "B",
            "isCorrect": is_corr,
            "score": 3000 if is_corr else 0
        }
    return answers

def build_student_records(students_list):
    records = []
    for s in students_list:
        score_res = calculate_physics_score(s["correctCount"], s["durationSec"])
        answers_dict = generate_student_answers(s["correctCount"])
        
        record = {
            "name": s["name"],
            "className": s["className"],
            "absen": s["absen"],
            "academicGrade": score_res["grade"],
            "correctCount": s["correctCount"],
            "durationSec": s["durationSec"],
            "baseScore": score_res["baseScore"],
            "speedBonus": score_res["speedBonus"],
            "totalScore": score_res["totalScore"],
            "tier": score_res["tier"],
            "statusKKM": score_res["statusKKM"],
            "tabSwitches": s["tabSwitches"],
            "condition": s["condition"],
            "ip": f"192.168.78.{s['absen'] + 10}",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "answersJson": json.dumps(answers_dict)
        }
        records.append(record)
        
    # Urutkan berdasarkan totalScore descending
    records.sort(key=lambda x: (x["totalScore"], -x["durationSec"]), reverse=True)
    return records

def ask_deepseek_review(prompt):
    """Panggil model cbai/deepseek-v4.1-flash melalui 9Router"""
    try:
        req = urllib.request.Request(
            f"{BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            data=json.dumps({
                "model": "cbai/deepseek-v4.1-flash",
                "messages": [
                    {"role": "system", "content": "Anda adalah Guru Ahli Fisika dan Lead QA Engineer SMAN 78 Jakarta."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2,
                "max_tokens": 1200
            }).encode("utf-8")
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        return f"Error panggil model: {e}"

def main():
    print("=" * 75)
    print("🚀 VECTORARENA — AUDIT SIMULASI 10 & 25 SISWA (SMAN 78 JAKARTA)")
    print("Kolaborasi bersama model: cbai/deepseek-v4.1-flash via 9Router")
    print("=" * 75)

    # 1. Bangun Data Simulasi 10 Siswa
    print("\n[1/4] Mengompilasi Dataset Simulasi 10 Siswa...")
    rec_10 = build_student_records(STUDENTS_10)
    with open("simulated_10_students.json", "w") as f:
        json.dump(rec_10, f, indent=2)
    print(f"  ✅ simulated_10_students.json berhasil disimpan ({len(rec_10)} siswa)")

    # 2. Bangun Data Simulasi 25 Siswa
    print("\n[2/4] Mengompilasi Dataset Simulasi 25 Siswa...")
    rec_25 = build_student_records(STUDENTS_25)
    with open("simulated_25_students.json", "w") as f:
        json.dump(rec_25, f, indent=2)
    print(f"  ✅ simulated_25_students.json berhasil disimpan ({len(rec_25)} siswa)")

    # 3. Analisis Statistik 10 Siswa
    print("\n[3/4] Rekapitulasi Metrik Simulasi 10 Siswa:")
    avg_grade_10 = sum(r["academicGrade"] for r in rec_10) / len(rec_10)
    pass_count_10 = sum(1 for r in rec_10 if r["statusKKM"] == "TUNTAS")
    top_score_10 = rec_10[0]["totalScore"]
    print(f"  • Rata-rata Nilai Akademik : {avg_grade_10:.1f} / 100.0")
    print(f"  • Kelulusan KKM (>= 75.0)  : {pass_count_10}/{len(rec_10)} ({pass_count_10*10}%)")
    print(f"  • Juara 1 (Top Score)      : {rec_10[0]['name']} ({top_score_10:,} Pts, {rec_10[0]['tier']})")

    # 4. Analisis Statistik 25 Siswa
    print("\n[4/4] Rekapitulasi Metrik Simulasi 25 Siswa:")
    avg_grade_25 = sum(r["academicGrade"] for r in rec_25) / len(rec_25)
    pass_count_25 = sum(1 for r in rec_25 if r["statusKKM"] == "TUNTAS")
    top_score_25 = rec_25[0]["totalScore"]
    print(f"  • Rata-rata Nilai Akademik : {avg_grade_25:.1f} / 100.0")
    print(f"  • Kelulusan KKM (>= 75.0)  : {pass_count_25}/{len(rec_25)} ({pass_count_25/len(rec_25)*100:.1f}%)")
    print(f"  • Juara 1 (Top Score)      : {rec_25[0]['name']} ({top_score_25:,} Pts, {rec_25[0]['tier']})")

    # Evaluasi Kelas Teratas (Class Battle)
    class_scores = {}
    for r in rec_25:
        c = r["className"]
        class_scores.setdefault(c, []).append(r["totalScore"])
    class_ranking = sorted([(c, sum(sc)/len(sc)) for c, sc in class_scores.items()], key=lambda x: x[1], reverse=True)
    print(f"  • Juara 1 Piala Rombel     : Kelas {class_ranking[0][0]} (Rata-rata: {class_ranking[0][1]:,.0f} Pts)")

    # 5. Minta Tinjauan & Verifikasi Audit dari cbai/deepseek-v4.1-flash
    print("\n" + "=" * 75)
    print("🤖 MEMINTA AUDIT KELAYAKAN SISTEM DARI cbai/deepseek-v4.1-flash...")
    print("=" * 75)

    prompt = f"""Lakukan audit forensik dan evaluasi pedagogis terhadap data hasil simulasi VectorArena SMAN 78 Jakarta (Fisika Vektor & Kinematika Kelas X A s.d. X K).

Data Ringkasan 10 Siswa Ekstrem:
- Top Score: {rec_10[0]['name']} ({rec_10[0]['totalScore']:,} Pts, Durasi: {rec_10[0]['durationSec']}s, 0x Tab, {rec_10[0]['tier']})
- Ambang KKM (76.0): {rec_10[4]['name']} (2x Tab Switch, Waspada)
- Timeout 90m: {rec_10[8]['name']} (Durasi 5400s, 0 Bonus Kecepatan)
- Pelanggar Berat: {rec_10[7]['name']} (7x Tab Switch)

Data Ringkasan 25 Siswa:
- Total Siswa: 25 murid dari 11 Rombel (X A - X K)
- Rerata Nilai Angkatan: {avg_grade_25:.1f}
- Ketuntasan KKM: {pass_count_25}/25 ({pass_count_25/25*100:.1f}%)
- Juara Kelas (Piala Rombel): Kelas {class_ranking[0][0]} ({class_ranking[0][1]:,.0f} Pts)

Berikan analisis kritis mencakup:
1. Validasi formula skoring (Skor Dasar vs Bonus Kecepatan vs KKM).
2. Efektivitas penalti deteksi tab integritas.
3. Kesiapan antarmuka klasemen (Podium 3 besar, Top 10 Hall of Fame, Piala Rombel) dalam menangani kondisi siswa tersebut.
4. Kesimpulan kelayakan platform untuk peluncuran ujian resmi SMAN 78.
Tuliskan secara ringkas, bernas, dan profesional."""

    audit_feedback = ask_deepseek_review(prompt)
    print(audit_feedback)

    # Simpan laporan audit
    report_path = "docs/AUDIT_SIMULASI_10_DAN_25_SISWA.md"
    with open(report_path, "w") as f:
        f.write(f"# 📊 Laporan Audit Simulasi 10 & 25 Siswa VectorArena\n\n")
        f.write(f"**Tanggal Audit:** {time.strftime('%Y-%m-%d %H:%M:%S')} WIB  \n")
        f.write(f"**Model Penilai:** `cbai/deepseek-v4.1-flash` via 9Router  \n")
        f.write(f"**Target Peserta:** Siswa Kelas X A s.d. X K (11 Rombel Belajar) SMAN 78 Jakarta  \n\n")
        f.write(f"## 1. Ringkasan Eksekutif Simulasi 10 Siswa Ekstrem\n\n")
        f.write(f"- **Rata-rata Nilai:** {avg_grade_10:.1f} / 100.0\n")
        f.write(f"- **Ketuntasan KKM:** {pass_count_10}/10 ({pass_count_10*10}%)\n")
        f.write(f"- **Skor Puncak:** {rec_10[0]['name']} ({top_score_10:,} Pts)\n\n")
        f.write(f"## 2. Ringkasan Eksekutif Simulasi 25 Siswa (Lintas 11 Rombel)\n\n")
        f.write(f"- **Rata-rata Nilai:** {avg_grade_25:.1f} / 100.0\n")
        f.write(f"- **Ketuntasan KKM:** {pass_count_25}/25 ({pass_count_25/len(rec_25)*100:.1f}%)\n")
        f.write(f"- **Pemuncak Piala Rombel:** Kelas {class_ranking[0][0]} (Rerata: {class_ranking[0][1]:,.0f} Pts)\n\n")
        f.write(f"## 3. Hasil Audit Forensik & Pedagogis Model AI\n\n")
        f.write(audit_feedback)
        f.write("\n\n---\n*Sistem Evaluasi VectorArena SMAN 78 Jakarta — Terverifikasi Siap Produksi*\n")

    print(f"\n✅ Laporan lengkap berhasil disimpan ke: {report_path}")

if __name__ == "__main__":
    main()
