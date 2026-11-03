// Cek setiap referensi lokal (src/href) di halaman-halaman utama repo ini.
// Dipakai di CI supaya tautan aset yang patah tidak lolos ke GitHub Pages.
//
// Jalankan dari mana saja: node scripts/check-links.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const PAGES = [
    ['index.html', '/'],
    ['VectorArena/index.html', '/VectorArena/'],
    ['HydroArena/index.html', '/HydroArena/'],
];

const REF_PATTERN = /(?:src|href)="([^"]*)"/g;
const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

const failures = [];
let checked = 0;

for (const [page, route] of PAGES) {
    const pagePath = path.join(root, page);
    const pageDir = path.dirname(pagePath);
    const html = fs.readFileSync(pagePath, 'utf8');

    for (const [, rawRef] of html.matchAll(REF_PATTERN)) {
        const ref = rawRef.trim();
        if (!ref || EXTERNAL.test(ref)) continue;

        const clean = ref.split(/[?#]/)[0];
        if (!clean) continue;

        const target = clean.startsWith('/') ? path.join(root, clean) : path.join(pageDir, clean);
        checked += 1;

        const exists = fs.existsSync(target);
        const resolves = exists
            ? (fs.statSync(target).isDirectory() ? fs.existsSync(path.join(target, 'index.html')) : true)
            : false;

        if (!resolves) {
            failures.push(`${route}${ref} → ${path.relative(root, target)} tidak ditemukan`);
        }
    }
}

console.log(`Diperiksa ${checked} referensi lokal dari ${PAGES.length} halaman.`);

if (failures.length > 0) {
    console.error(`\n${failures.length} referensi rusak:`);
    for (const failure of failures) console.error(` - ${failure}`);
    process.exit(1);
}

console.log('Semua referensi lokal valid.');