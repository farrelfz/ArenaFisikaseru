// Verifikasi konsistensi 25 soal terkurasi
const { CURATED_25_QUESTIONS } = require("../js/data/curated_25.js");

let errors = [];
const ids = new Set();
const keys = ["A", "B", "C", "D", "E"];

for (const q of CURATED_25_QUESTIONS) {
    // 1. correctKey valid & dalam range options
    const idx = keys.indexOf(q.correctKey);
    if (idx < 0) { errors.push(q.id + ": correctKey tidak valid: " + q.correctKey); continue; }
    if (idx >= q.options.length) {
        errors.push(q.id + ": correctKey index " + idx + " melampaui options (len=" + q.options.length + ")");
        continue;
    }

    // 2. options[correctKey] === correctAnswer
    if (q.options[idx] !== q.correctAnswer) {
        errors.push(q.id + ": options[" + idx + "]=\"" + q.options[idx] + "\" ≠ correctAnswer=\"" + q.correctAnswer + "\"");
    }

    // 3. Tidak ada opsi duplikat
    if (new Set(q.options).size !== q.options.length) {
        errors.push(q.id + ": ada opsi duplikat");
    }

    // 4. ID unik
    if (ids.has(q.id)) errors.push(q.id + ": ID duplikat");
    ids.add(q.id);

    // 5. difficulty 1-4
    if (q.difficulty < 1 || q.difficulty > 4) {
        errors.push(q.id + ": difficulty=" + q.difficulty + " di luar 1-4");
    }

    // 6. zoneId 1-8
    if (q.zoneId < 1 || q.zoneId > 8) {
        errors.push(q.id + ": zoneId=" + q.zoneId + " di luar 1-8");
    }

    // 7. explanation tidak kosong
    if (!q.explanation || q.explanation.trim().length < 10) {
        errors.push(q.id + ": explanation kosong/too short");
    }

    // 8. question tidak kosong
    if (!q.question || q.question.trim().length < 10) {
        errors.push(q.id + ": question kosong/too short");
    }
}

// Sebaran per zona
const zones = {};
CURATED_25_QUESTIONS.forEach(q => { zones[q.zoneId] = (zones[q.zoneId] || 0) + 1; });

// Sebaran difficulty
const diffs = {};
CURATED_25_QUESTIONS.forEach(q => { diffs[q.difficulty] = (diffs[q.difficulty] || 0) + 1; });

// Sebaran bloom
const blooms = {};
CURATED_25_QUESTIONS.forEach(q => { blooms[q.bloom] = (blooms[q.bloom] || 0) + 1; });

console.log("=== VERIFIKASI 25 SOAL TERKURASI ===");
console.log("Total soal:", CURATED_25_QUESTIONS.length);
console.log("ID unik:", ids.size);
console.log("Sebaran zona:", JSON.stringify(zones));
console.log("Sebaran difficulty:", JSON.stringify(diffs));
console.log("Sebaran bloom:", JSON.stringify(blooms));
console.log("");

if (errors.length === 0) {
    console.log("✅ SEMUA 25 SOAL KONSISTEN — tidak ada tumpang tindih");
    console.log("   - correctKey ↔ correctAnswer: 25/25 cocok");
    console.log("   - Tidak ada opsi duplikat");
    console.log("   - Tidak ada ID duplikat");
    console.log("   - difficulty 1-4, zoneId 1-8");
    console.log("   - explanation & question tidak kosong");
} else {
    console.log("❌ DITEMUKAN " + errors.length + " MASALAH:");
    errors.forEach(e => console.log("  - " + e));
}
