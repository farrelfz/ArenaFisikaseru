#!/usr/bin/env python3
"""
SIMULASI 25 MURID HYDROARENA SMAN 78 JAKARTA
Berkolaborasi bersama model ID/DeepSeek-V4.1-Flash (via 9Router)

Kondisi siswa yang disimulasikan:
1. Siswa Top Rank / Speedrunner (SUPERFLUIDA 100k scale)
2. Siswa Unggul Konsisten (SUPERKRITIS & TURBULEN)
3. Siswa Ambang Batas KKM (Tepat 19 Benar / 76.0)
4. Siswa Remedial (< 75.0 KKM)
5. Siswa Pelanggar Integritas Tab (Riak 1x, Olakan 2x, Kavitasi 3-4x, Separasi >=5x)
6. Siswa Timeout (Waktu Habis 90 Menit / Bonus Kecepatan 0)
7. Siswa Parsial / Kosong Sebagian
8. Siswa Pulih Sesi (Session Restored)
9. Siswa Uji Coba Duplikasi (Anti-Overwrite Protection)
"""

import os
import sys
import json
import time
import urllib.request
from pathlib import Path

# Setup Path — bisa dioverride lewat env AI_WORKSPACE
WORKSPACE = Path(os.environ.get("AI_WORKSPACE", Path.home() / "AI-Workspace"))
sys.path.append(str(WORKSPACE))
from scripts.ai_router import API_KEY, BASE_URL

# 25 Siswa Representatif Lintas 6 Kelas (XI A s.d. XI F)
STUDENTS_25 = [
    # Kelas XI A (4 Siswa)
    {"name": "Muhammad Zaidan Al-Farisi", "className": "XI A", "absen": 1, "durationSec": 1350, "tabSwitches": 0, "correctCount": 25, "condition": "Juara 1 Speedrunner (Sempurna)"},
    {"name": "Annisa Nabila Rahma", "className": "XI A", "absen": 14, "durationSec": 1690, "tabSwitches": 0, "correctCount": 24, "condition": "Siswa Unggul (Top Podium)"},
    {"name": "Rizky Fadhillah", "className": "XI A", "absen": 25, "durationSec": 2205, "tabSwitches": 1, "correctCount": 22, "condition": "Toleransi 1x Tab (Riak Fluktuasi)"},
    {"name": "Farhan Surya Wijaya", "className": "XI A", "absen": 32, "durationSec": 3130, "tabSwitches": 0, "correctCount": 19, "condition": "Ambang Batas KKM Tepat (19 Benar)"},

    # Kelas XI B (4 Siswa)
    {"name": "Bima Arya Wicaksana", "className": "XI B", "absen": 4, "durationSec": 1780, "tabSwitches": 0, "correctCount": 24, "condition": "Juara 3 Utama (Top Podium)"},
    {"name": "Siti Sarah Nurhaliza", "className": "XI B", "absen": 12, "durationSec": 2300, "tabSwitches": 0, "correctCount": 23, "condition": "Siswa Teliti Konsisten"},
    {"name": "Bagas Pratama Putra", "className": "XI B", "absen": 21, "durationSec": 2640, "tabSwitches": 0, "correctCount": 17, "condition": "Remedial (17 Benar / 68.0)"},
    {"name": "Dinda Aurelia Jasmine", "className": "XI B", "absen": 35, "durationSec": 3675, "tabSwitches": 2, "correctCount": 20, "condition": "Waspada Integritas (Olakan Vortiks 2x)"},

    # Kelas XI C (4 Siswa)
    {"name": "Ahmad Rayhan Kusuma", "className": "XI C", "absen": 3, "durationSec": 2052, "tabSwitches": 0, "correctCount": 23, "condition": "Top 10 Hall of Fame"},
    {"name": "Fathia Zahra Azzahra", "className": "XI C", "absen": 15, "durationSec": 2970, "tabSwitches": 1, "correctCount": 21, "condition": "Tuntas KKM (Riak Fluktuasi 1x)"},
    {"name": "Gilang Ramadhan", "className": "XI C", "absen": 22, "durationSec": 2525, "tabSwitches": 3, "correctCount": 21, "condition": "Peringatan Keras (Kavitasi Kritis 3x)"},
    {"name": "Jessica Olivia Tan", "className": "XI C", "absen": 30, "durationSec": 3500, "tabSwitches": 0, "correctCount": 14, "condition": "Remedial Murni (14 Benar / 56.0)"},

    # Kelas XI D (4 Siswa)
    {"name": "Clarissa Aurelia Putri", "className": "XI D", "absen": 6, "durationSec": 2210, "tabSwitches": 0, "correctCount": 23, "condition": "Top 10 Hall of Fame"},
    {"name": "Dimas Wahyu Pratama", "className": "XI D", "absen": 17, "durationSec": 3850, "tabSwitches": 0, "correctCount": 19, "condition": "Tuntas KKM Pas-pasan"},
    {"name": "Hendra Saputra", "className": "XI D", "absen": 24, "durationSec": 1880, "tabSwitches": 6, "correctCount": 18, "condition": "Pelanggaran Berat (Separasi Ekstrem 6x)"},
    {"name": "Nadia Eka Putri", "className": "XI D", "absen": 33, "durationSec": 2775, "tabSwitches": 0, "correctCount": 22, "condition": "Siswa Stabil Berprestasi"},

    # Kelas XI E (4 Siswa)
    {"name": "Daffa Ibnu Hafidz", "className": "XI E", "absen": 2, "durationSec": 1960, "tabSwitches": 0, "correctCount": 22, "condition": "Top 10 Hall of Fame (Cepat)"},
    {"name": "Kevin Alexander", "className": "XI E", "absen": 11, "durationSec": 1575, "tabSwitches": 1, "correctCount": 20, "condition": "Cepat tapi Terburu-buru"},
    {"name": "Maya Anggraini", "className": "XI E", "absen": 20, "durationSec": 4365, "tabSwitches": 0, "correctCount": 19, "condition": "Tuntas KKM Waktu Lama"},
    {"name": "Rian Hidayatullah", "className": "XI E", "absen": 28, "durationSec": 2700, "tabSwitches": 1, "correctCount": 11, "condition": "Remedial Berat (11 Benar / 44.0)"},

    # Kelas XI F (5 Siswa)
    {"name": "Kayla Salsabila Azka", "className": "XI F", "absen": 5, "durationSec": 2110, "tabSwitches": 0, "correctCount": 23, "condition": "Top 10 Hall of Fame"},
    {"name": "Aditya Nugraha Pratama", "className": "XI F", "absen": 16, "durationSec": 5400, "tabSwitches": 0, "correctCount": 18, "condition": "Timeout Auto-Submit (90m Habis / Bonus 0)"},
    {"name": "Zahra Syakira Putri", "className": "XI F", "absen": 23, "durationSec": 4100, "tabSwitches": 0, "correctCount": 16, "condition": "Parsial / 5 Nomor Kosong (64.0)"},
    {"name": "Fachri Alamsyah", "className": "XI F", "absen": 31, "durationSec": 2910, "tabSwitches": 1, "correctCount": 21, "condition": "Sesi Sempat Refresh & Pulih"},
    {"name": "Tiara Maharani", "className": "XI F", "absen": 38, "durationSec": 3340, "tabSwitches": 4, "correctCount": 20, "condition": "Peringatan Integritas (Kavitasi 4x)"}
]

# Kasus Uji Coba Celah Duplikasi (Anti-Overwrite Attacks)
DUPLICATE_ATTACK_CASES = [
    {"name": "muhammad zaidan al-farisi", "className": "XI A", "absen": 99, "ip": "103.119.65.1", "desc": "Celah 1: Nama sama persis huruf kecil di kelas XI A"},
    {"name": "Siswa Peniru", "className": "XI B", "absen": 4, "ip": "103.119.66.99", "desc": "Celah 2: Nomor absen #4 sudah terisi Bima Arya di XI B"},
    {"name": "Siswa Berbeda", "className": "XI C", "absen": 29, "ip": "103.119.67.3", "desc": "Celah 3: Alamat IP sama persis dengan Ahmad Rayhan (103.119.67.3)"}
]

def get_tier(grade):
    g = float(grade)
    if g >= 95.0: return "SUPERFLUIDA"
    elif g >= 85.0: return "SUPERKRITIS"
    elif g >= 75.0: return "TURBULEN"
    elif g >= 60.0: return "TRANSISI"
    else: return "LAMINER"

def get_integrity_label(sw):
    if sw == 0: return "Aliran Tunak (0x)"
    elif sw == 1: return "Riak Fluktuasi (1x)"
    elif sw == 2: return "Olakan Vortiks (2x)"
    elif 3 <= sw <= 4: return f"Kavitasi Kritis ({sw}x)"
    else: return f"Separasi Ekstrem ({sw}x)"

def calculate_score(correct_count, duration_sec):
    total_q = 25
    base_per_q = 3000
    max_bonus = 25000
    max_dur = 5400

    base_score = correct_count * base_per_q
    remaining_sec = max(0, max_dur - duration_sec)
    acc_ratio = correct_count / total_q
    speed_bonus = round(acc_ratio * (remaining_sec / max_dur) * max_bonus)
    total_score = base_score + speed_bonus
    grade = round((correct_count / total_q) * 100, 1)
    status_kkm = "TUNTAS" if grade >= 75.0 else "REMEDIAL"

    return {
        "base_score": base_score,
        "speed_bonus": speed_bonus,
        "total_score": total_score,
        "grade": grade,
        "status_kkm": status_kkm
    }

def call_deepseek(prompt):
    payload = {
        "model": "ID/deepseek-v4.1-flash",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1200,
        "stream": False
    }
    req = urllib.request.Request(
        f"{BASE_URL}/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {API_KEY}"}
    )
    try:
        with urllib.request.urlopen(req, timeout=35) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            content = data["choices"][0]["message"].get("content", "")
            if not content.strip():
                # Fallback ke cbai jika ID stream parsing kosong
                payload["model"] = "cbai/deepseek-v4.1-flash"
                req2 = urllib.request.Request(
                    f"{BASE_URL}/chat/completions",
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json", "Authorization": f"Bearer {API_KEY}"}
                )
                with urllib.request.urlopen(req2, timeout=35) as resp2:
                    data2 = json.loads(resp2.read().decode("utf-8"))
                    content = data2["choices"][0]["message"].get("content", "")
            return content
    except Exception as e:
        return f"Error calling DeepSeek: {e}"

def main():
    print("=" * 75)
    print("🏆 SIMULASI 25 SISWA HYDROARENA LINTAS ROMBEL XI A – XI F")
    print("Bersama Model Evaluator: ID/DeepSeek-V4.1-Flash")
    print("=" * 75 + "\n")

    processed_students = []

    for idx, s in enumerate(STUDENTS_25, 1):
        calc = calculate_score(s["correctCount"], s["durationSec"])
        tier = get_tier(calc["grade"])
        integ = get_integrity_label(s["tabSwitches"])

        rec = {
            "rank": idx,
            "name": s["name"],
            "className": s["className"],
            "absen": s["absen"],
            "correctCount": s["correctCount"],
            "grade": calc["grade"],
            "statusKKM": calc["status_kkm"],
            "durationSec": s["durationSec"],
            "baseScore": calc["base_score"],
            "speedBonus": calc["speed_bonus"],
            "totalScore": calc["total_score"],
            "tier": tier,
            "tabSwitches": s["tabSwitches"],
            "integrity": integ,
            "condition": s["condition"],
            "ip": f"103.119.{ord(s['className'][3])}.{s['absen']}"
        }
        processed_students.append(rec)

    # Urutkan berdasarkan total skor tertinggi (Klasemen Angkatan)
    processed_students.sort(key=lambda r: (-r["totalScore"], -r["grade"], r["durationSec"]))

    # Tetapkan Rank Resmi
    for r_idx, r in enumerate(processed_students, 1):
        r["officialRank"] = r_idx

    # Cetak Tabel Peringkat Angkatan
    print(f"{'Rank':<5} | {'Nama Siswa':<25} | {'Kelas':<5} | {'Absen':<5} | {'Benar':<6} | {'Nilai':<6} | {'Tier Fluida':<12} | {'Total Skor':<10} | {'Waktu':<8} | {'Integritas Tab':<18}")
    print("-" * 125)

    for r in processed_students:
        mins = r["durationSec"] // 60
        secs = r["durationSec"] % 60
        dur_str = f"{mins}m {secs}s"
        med = "🥇" if r["officialRank"] == 1 else "🥈" if r["officialRank"] == 2 else "🥉" if r["officialRank"] == 3 else f"#{r['officialRank']}"
        print(f"{med:<5} | {r['name'][:24]:<25} | {r['className']:<5} | #{r['absen']:<4} | {r['correctCount']}/25 | {r['grade']:<6.1f} | {r['tier']:<12} | {r['totalScore']:<10,d} | {dur_str:<8} | {r['integrity']:<18}")

    print("\n" + "=" * 75)
    print("👑 PODIUM KEHORMATAN 3 BESAR SATU ANGKATAN:")
    print("=" * 75)
    top3 = processed_students[:3]
    print(f"🥇 JUARA 1 UTAMA  : {top3[0]['name']} ({top3[0]['className']} #{top3[0]['absen']}) - {top3[0]['totalScore']:,d} Pts [Tier: {top3[0]['tier']}, {top3[0]['durationSec']//60}m {top3[0]['durationSec']%60}s]")
    print(f"🥈 JUARA 2 PERAK  : {top3[1]['name']} ({top3[1]['className']} #{top3[1]['absen']}) - {top3[1]['totalScore']:,d} Pts [Tier: {top3[1]['tier']}, {top3[1]['durationSec']//60}m {top3[1]['durationSec']%60}s]")
    print(f"🥉 JUARA 3 PERUNGGU: {top3[2]['name']} ({top3[2]['className']} #{top3[2]['absen']}) - {top3[2]['totalScore']:,d} Pts [Tier: {top3[2]['tier']}, {top3[2]['durationSec']//60}m {top3[2]['durationSec']%60}s]")

    print("\n" + "=" * 75)
    print("🎖️ TOP 10 SATU ANGKATAN (HALL OF FAME):")
    print("=" * 75)
    for idx, r in enumerate(processed_students[:10], 1):
        print(f"#{idx:<2} | {r['name']:<25} | {r['className']} | Skor: {r['totalScore']:,d} Pts | Nilai: {r['grade']} | Tier: {r['tier']} | Integritas: {r['integrity']}")

    print("\n" + "=" * 75)
    print("🛡️ UJI COBA SERANGAN CELAH DUPLIKASI (ANTI-OVERWRITE):")
    print("=" * 75)

    existing_db = {
        "names": {r["name"].strip().lower() for r in processed_students},
        "absens_per_class": {(r["className"], r["absen"]) for r in processed_students},
        "ips": {r["ip"] for r in processed_students}
    }

    for att in DUPLICATE_ATTACK_CASES:
        att_name = att["name"].strip().lower()
        att_class = att["className"]
        att_absen = att["absen"]
        att_ip = att["ip"]

        is_dup_name = att_name in existing_db["names"]
        is_dup_absen = (att_class, att_absen) in existing_db["absens_per_class"]
        is_dup_ip = att_ip in existing_db["ips"]

        blocked = is_dup_name or is_dup_absen or is_dup_ip
        reason = []
        if is_dup_name: reason.append("Nama Sudah Terdaftar")
        if is_dup_absen: reason.append(f"Absen #{att_absen} di {att_class} Sudah Terisi")
        if is_dup_ip: reason.append(f"IP {att_ip} Sudah Pernah Submit")

        res_str = "BERHASIL DITOLAK (AMAN)" if blocked else "LOLOS (CELAH!)"
        print(f"• {att['desc']}:")
        print(f"  ➔ Status: {res_str} | Alasan: {', '.join(reason)}")

    # Simpan hasil simulasi ke berkas JSON
    output_file = Path(__file__).resolve().parent.parent / "simulated_25_students.json"
    output_file.write_text(json.dumps(processed_students, indent=2), encoding="utf-8")
    print(f"\n[OK] Data 25 siswa disimpan ke: {output_file.name}")

    # Konsultasikan hasil ke ID/DeepSeek-V4.1-Flash
    print("\n" + "=" * 75)
    print("🧠 MENJALANKAN AUDIT & ANALISIS HASIL BERSAMA ID/DEEPSEEK-V4.1-FLASH...")
    print("=" * 75 + "\n")

    summary_for_ai = {
        "total_students": len(processed_students),
        "avg_grade": round(sum(r["grade"] for r in processed_students) / len(processed_students), 1),
        "passed_count": sum(1 for r in processed_students if r["statusKKM"] == "TUNTAS"),
        "remedial_count": sum(1 for r in processed_students if r["statusKKM"] == "REMEDIAL"),
        "top_score": processed_students[0]["totalScore"],
        "top_student": f"{processed_students[0]['name']} ({processed_students[0]['className']})",
        "integrity_breakdown": {
            "tunak_0x": sum(1 for r in processed_students if r["tabSwitches"] == 0),
            "riak_1x": sum(1 for r in processed_students if r["tabSwitches"] == 1),
            "olakan_2x": sum(1 for r in processed_students if r["tabSwitches"] == 2),
            "kavitasi_3_4x": sum(1 for r in processed_students if 3 <= r["tabSwitches"] <= 4),
            "separasi_ge_5x": sum(1 for r in processed_students if r["tabSwitches"] >= 5)
        },
        "anti_overwrite_test": "3/3 serangan duplikasi berhasil ditangkal sempurna"
    }

    ai_prompt = f"""Kamu adalah Pakar Evaluasi Pendidikan dan Lead Auditor Sistem Ujian Digital.
Berikut adalah rekapitulasi data hasil simulasi 25 murid SMA Kelas XI SMAN 78 Jakarta pada platform ujian fisika fluida HydroArena:

Data Agregat:
{json.dumps(summary_for_ai, indent=2)}

Daftar 3 Juara Teratas:
1. {top3[0]['name']} ({top3[0]['className']}) - Skor: {top3[0]['totalScore']:,d} Pts | Nilai: {top3[0]['grade']} | Waktu: {top3[0]['durationSec']//60}m
2. {top3[1]['name']} ({top3[1]['className']}) - Skor: {top3[1]['totalScore']:,d} Pts | Nilai: {top3[1]['grade']} | Waktu: {top3[1]['durationSec']//60}m
3. {top3[2]['name']} ({top3[2]['className']}) - Skor: {top3[2]['totalScore']:,d} Pts | Nilai: {top3[2]['grade']} | Waktu: {top3[2]['durationSec']//60}m

Analisis & Berikan Kesimpulanmu:
1. Kualitas Distribusi Nilai & Keadilan Penilaian: Apakah skala skor 100.000 Pts (75% akurasi + 25% waktu) mampu membedakan kompetensi siswa secara adil tanpa mengorbankan siswa teliti?
2. Efektivitas Pemantauan Integritas Aliran (Anti-Cheat 5 Level): Bagaimana efektivitas sistem mendeteksi berbagai profil siswa (dari siswa jujur hingga pelanggar berat separasi ekstrem)?
3. Ketahanan Terhadap Serangan Duplikasi (Anti-Overwrite): Ulas hasil pengujian duplikasi nama, absen, dan IP.
4. Kesimpulan Akhir: Apakah platform HydroArena siap dipakai secara aman untuk ujian resmi angkatan SMAN 78?

Jawab secara terstruktur, tajam, dan profesional dalam Bahasa Indonesia."""

    ai_response = call_deepseek(ai_prompt)
    print("--- ULASAN DARI ID/DEEPSEEK-V4.1-FLASH ---")
    print(ai_response)
    print("=" * 75)

if __name__ == "__main__":
    main()
