// Verifikasi bank soal Hydro Challenge.
// - memastikan struktur tiap butir lengkap (5 opsi, kunci valid, pembahasan, diagram)
// - memastikan opsi kunci benar-benar memuat nilai hasil hitung fisis
// Jalankan: node scripts/verify-questions.js
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.join(__dirname, '..');
const diagramsSrc = fs.readFileSync(path.join(root, 'js/data/diagrams.js'), 'utf8');
const questionsSrc = fs.readFileSync(path.join(root, 'js/data/questions.js'), 'utf8');

const ctx = { module: undefined, console };
vm.createContext(ctx);
vm.runInContext(diagramsSrc, ctx);
vm.runInContext(questionsSrc + '\n;globalThis.__MQ = MASTER_QUESTIONS;', ctx);

const Q = ctx.__MQ;

// Nilai akhir yang WAJIB muncul pada opsi kunci (sudah dihitung ulang manual).
const expectedKeyValue = {
    Q01: '6 m/s',
    Q02: null, // konseptual
    Q03: '16.000 Pa',
    Q04: null, // konseptual
    Q05: '204.000 Pa',
    Q06: '150.000 Pa',
    Q07: '15 cm',
    Q08: null, // analisis pernyataan
    Q09: '57,6 Pa',
    Q10: '8 cm',
    Q11: '12,7 cm',
    Q12: '1.920 Pa',
    Q13: '220.000 Pa',
    Q14: '4 L/s',
    Q15: '4 kali semula'
};

const norm = (s) => String(s).toLowerCase().replace(/[.,]/g, '').replace(/\s+/g, ' ').trim();

let fail = 0;
const rows = [];

Q.forEach((q, i) => {
    const problems = [];

    if (q.num !== i + 1) problems.push('num tidak berurutan');
    if (!q.id || q.id !== 'Q' + String(i + 1).padStart(2, '0')) problems.push('id tidak konsisten');
    if (q.options.length !== 5) problems.push('jumlah opsi=' + q.options.length);
    if (!(q.correctIndex >= 0 && q.correctIndex <= 4)) problems.push('correctIndex di luar 0-4');
    if (!q.question || q.question.length < 60) problems.push('stem terlalu pendek');
    if (!q.explanation || q.explanation.length < 60) problems.push('pembahasan terlalu pendek');
    if (!['Mudah', 'Sedang', 'Sulit'].includes(q.level)) problems.push('level tidak valid: ' + q.level);
    if (!q.diagram || !String(q.diagram).includes('<svg')) problems.push('diagram SVG tidak ada');
    if (new Set(q.options.map(o => o.trim())).size !== q.options.length) problems.push('ada opsi duplikat');

    const keyText = q.options[q.correctIndex];
    const exp = expectedKeyValue[q.id];
    if (exp && !norm(keyText).includes(norm(exp))) {
        problems.push('opsi kunci "' + keyText + '" tidak memuat nilai harapan "' + exp + '"');
    }

    if (problems.length) fail++;
    rows.push(`${q.id} [${q.level.padEnd(6)}] ${q.topic.padEnd(28)} -> ${problems.length ? 'FAIL: ' + problems.join('; ') : 'OK'}`);
});

const levelCount = Q.reduce((a, q) => { a[q.level] = (a[q.level] || 0) + 1; return a; }, {});
const topicCount = Q.reduce((a, q) => { a[q.topic] = (a[q.topic] || 0) + 1; return a; }, {});

console.log(rows.join('\n'));
console.log('');
console.log('Total soal   :', Q.length);
console.log('Komposisi    :', JSON.stringify(levelCount));
console.log('Topik        :', JSON.stringify(topicCount));
console.log('Butir gagal  :', fail);
process.exit(fail ? 1 : 0);
