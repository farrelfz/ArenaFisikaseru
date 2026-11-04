#!/usr/bin/env python3
"""
KONVERSI DATASET SIMULASI HYDROARENA -> SKEMA VECTORARENA
=========================================================

Dataset simulasi HydroArena (`simulated_25_students.json`) memakai skema dan
kosakata tema fluida (kelas XI A - XI F, tier SUPERFLUIDA/SUPERKRITIS,
`grade`, `integrity`, `officialRank`). Skrip ini mengonversinya ke skema
kanonik VectorArena agar bisa dipakai sebagai data uji klasemen
(kelas X A - X K, tier Relativistik/Supersonik/Orbital/Subsonik/Statis,
`academicGrade`, `answersJson`).

ATURAN KONVERSI
---------------
1. Skor DIHITUNG ULANG dengan kontrak resmi VectorArena
   (lihat `scripts/simulate_vector_students.py` == `js/state.js`):
       baseScore  = correctCount * 3000
       grade      = round(correctCount / 25 * 100, 1)
       speedBonus = 0 bila grade < KKM 75.0, selain itu
                    round(gradeRatio * (sisaWaktu / 5400) * 25000)
       totalScore = baseScore + speedBonus
   HydroArena TIDAK menggate bonus dengan KKM, jadi 5 siswa di bawah KKM
   kehilangan bonusnya. Ini disengaja: angka di file ini harus konsisten
   dengan file simulasi VectorArena lainnya, bukan menyalin angka Hydro.

2. Kelas dipetakan round-robin X A - X K mengikuti urutan `officialRank`
   asli, sehingga 11 rombel VectorArena semuanya terisi (2-3 siswa/rombel,
   cukup untuk uji "Piala Rombel"). `absen` asli dipertahankan karena
   seluruh 25 nilai absen sumber memang unik -> absen per kelas dan
   alamat IP mock tetap unik tanpa data karangan.

3. `condition` diterjemahkan ke kosakata vektor (Riak Fluktuasi ->
   Fluktuasi Fokus, Kavitasi -> Deviasi Integritas, Olakan Vortiks ->
   Osilasi Fokus, Separasi Ekstrem -> Deviasi Ekstrem) lalu diberi sufiks
   tier hasil hitung ulang.

4. Field Hydro yang tidak ada di skema VectorArena dibuang
   (`rank`, `officialRank`, `grade`, `integrity`).

PEMAKAIAN
---------
    python3 scripts/convert_hydro_25_to_vector.py
    python3 scripts/convert_hydro_25_to_vector.py \\
        --input ../simulated_25_students.json \\
        --output simulated_25_students_from_hydro.json
"""

from __future__ import annotations

import argparse
import json
import math
from datetime import datetime
from pathlib import Path

TOTAL_QUESTIONS = 25
BASE_POINTS_PER_QUESTION = 3000
MAX_DURATION_SECONDS = 5400
MAX_SPEED_BONUS = 25000
ACADEMIC_KKM = 75.0
CLASSES = ['X A', 'X B', 'X C', 'X D', 'X E', 'X F', 'X G', 'X H', 'X I', 'X J', 'X K']

VOCABULARY_MAP = {
    'Riak Fluktuasi': 'Fluktuasi Fokus',
    'Olakan Vortiks': 'Osilasi Fokus',
    'Kavitasi Kritis': 'Deviasi Integritas Kritis',
    'Kavitasi': 'Deviasi Integritas',
    'Separasi Ekstrem': 'Deviasi Ekstrem',
}

TIER_LABELS = {
    'Relativistik': '⚡ Relativistik',
    'Supersonik': '🚀 Supersonik',
    'Orbital': '🛰️ Orbital',
    'Subsonik': '⏳ Subsonik',
    'Statis': '🎯 Statis',
}


def js_round(value: float) -> int:
    """Math.round() JS: floor(x + 0.5) untuk bilangan positif."""
    return int(math.floor(value + 0.5))


def calculate_vector_score(correct_count: int, duration_sec: int) -> dict:
    """Kontrak skoring VectorArena (identik dengan simulate_vector_students.py)."""
    grade = round((correct_count / TOTAL_QUESTIONS) * 100.0, 1)
    base_score = correct_count * BASE_POINTS_PER_QUESTION

    speed_bonus = 0
    if grade >= ACADEMIC_KKM:
        time_left = max(0, MAX_DURATION_SECONDS - duration_sec)
        time_ratio = time_left / MAX_DURATION_SECONDS
        accuracy_multiplier = correct_count / TOTAL_QUESTIONS
        speed_bonus = js_round(time_ratio * MAX_SPEED_BONUS * accuracy_multiplier)

    if grade >= 95.0:
        tier = 'Relativistik'
    elif grade >= 85.0:
        tier = 'Supersonik'
    elif grade >= 75.0:
        tier = 'Orbital'
    elif grade >= 60.0:
        tier = 'Subsonik'
    else:
        tier = 'Statis'

    return {
        'grade': grade,
        'baseScore': base_score,
        'speedBonus': speed_bonus,
        'totalScore': base_score + speed_bonus,
        'tier': tier,
        'statusKKM': 'TUNTAS' if grade >= ACADEMIC_KKM else 'REMEDIAL',
    }


def generate_student_answers(correct_count: int) -> str:
    """Mock peta jawaban Q01-Q25 yang konsisten (sama seperti generator resmi)."""
    answers = {}
    for i in range(1, TOTAL_QUESTIONS + 1):
        is_correct = i <= correct_count
        answers[f'Q{i:02d}'] = {
            'selected': 'A' if is_correct else 'B',
            'isCorrect': is_correct,
            'score': BASE_POINTS_PER_QUESTION if is_correct else 0,
        }
    return json.dumps(answers)


def translate_condition(condition: str, tier: str) -> str:
    """Terjemahkan kosakata fluida ke vektor, lalu tambahkan tier hasil hitung ulang."""
    translated = condition
    for source, target in VOCABULARY_MAP.items():
        translated = translated.replace(source, target)
    return f'{translated} — {tier}'


def convert(students: list[dict]) -> list[dict]:
    ordered = sorted(students, key=lambda s: s.get('officialRank', 0))
    if len(ordered) != 25:
        raise ValueError(f'Dataset sumber harus berisi 25 siswa, ditemukan {len(ordered)}')

    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    records = []

    for index, student in enumerate(ordered):
        correct_count = int(student['correctCount'])
        duration_sec = int(student['durationSec'])
        score = calculate_vector_score(correct_count, duration_sec)
        class_name = CLASSES[index % len(CLASSES)]

        records.append({
            'name': student['name'],
            'className': class_name,
            'absen': int(student['absen']),
            'academicGrade': score['grade'],
            'correctCount': correct_count,
            'durationSec': duration_sec,
            'baseScore': score['baseScore'],
            'speedBonus': score['speedBonus'],
            'totalScore': score['totalScore'],
            'tier': TIER_LABELS[score['tier']],
            'statusKKM': score['statusKKM'],
            'tabSwitches': int(student.get('tabSwitches', 0)),
            'condition': translate_condition(student.get('condition', ''), score['tier']),
            'ip': f"192.168.78.{int(student['absen']) + 10}",
            'timestamp': timestamp,
            'answersJson': generate_student_answers(correct_count),
        })

    # Peringkat: totalScore desc, lalu durasi tercepat (sama seperti generator resmi)
    records.sort(key=lambda r: (-r['totalScore'], r['durationSec']))
    return records


def validate(records: list[dict]) -> None:
    assert len(records) == 25, f'jumlah record {len(records)} != 25'

    expected_keys = [
        'name', 'className', 'absen', 'academicGrade', 'correctCount', 'durationSec',
        'baseScore', 'speedBonus', 'totalScore', 'tier', 'statusKKM', 'tabSwitches',
        'condition', 'ip', 'timestamp', 'answersJson',
    ]
    class_absen = set()
    ips = set()

    for record in records:
        assert list(record.keys()) == expected_keys, f'urutan/field menyimpang: {record["name"]}'
        assert record['className'] in CLASSES, f'kelas tidak valid: {record["className"]}'
        assert record['totalScore'] == record['baseScore'] + record['speedBonus']
        assert record['baseScore'] == record['correctCount'] * BASE_POINTS_PER_QUESTION
        assert record['academicGrade'] == round(record['correctCount'] / TOTAL_QUESTIONS * 100, 1)

        if record['academicGrade'] < ACADEMIC_KKM:
            assert record['speedBonus'] == 0, f'bonus bocor ke bawah KKM: {record["name"]}'
            assert record['statusKKM'] == 'REMEDIAL'
        else:
            assert record['statusKKM'] == 'TUNTAS'

        answers = json.loads(record['answersJson'])
        assert len(answers) == TOTAL_QUESTIONS, f'answersJson tidak 25 butir: {record["name"]}'
        assert sum(1 for a in answers.values() if a['isCorrect']) == record['correctCount']

        key = (record['className'], record['absen'])
        assert key not in class_absen, f'absen ganda dalam kelas: {key}'
        class_absen.add(key)

        assert record['ip'] not in ips, f'IP ganda: {record["ip"]}'
        ips.add(record['ip'])

    assert len({r['className'] for r in records}) == len(CLASSES), 'tidak semua 11 rombel terisi'


def main() -> None:
    base_dir = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(description='Konversi simulasi 25 siswa HydroArena ke skema VectorArena')
    parser.add_argument('--input', default=str(base_dir.parent / 'simulated_25_students.json'))
    parser.add_argument('--output', default=str(base_dir / 'simulated_25_students_from_hydro.json'))
    args = parser.parse_args()

    source = json.loads(Path(args.input).read_text(encoding='utf-8'))
    records = convert(source)
    validate(records)

    output_path = Path(args.output)
    output_path.write_text(json.dumps(records, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

    passed = sum(1 for r in records if r['statusKKM'] == 'TUNTAS')
    average = sum(r['academicGrade'] for r in records) / len(records)

    print(f'Sumber  : {args.input}')
    print(f'Output  : {output_path}')
    print(f'Record  : {len(records)} siswa | {len({r["className"] for r in records})} rombel (X A - X K)')
    print(f'Rerata  : {average:.1f} | Ketuntasan KKM: {passed}/{len(records)}')
    print(f'Juara 1 : {records[0]["name"]} ({records[0]["totalScore"]:,} Pts, {records[0]["tier"]})')


if __name__ == '__main__':
    main()