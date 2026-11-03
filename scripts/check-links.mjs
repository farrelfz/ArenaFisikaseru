// Cek setiap referensi lokal (src/href) di halaman-halaman utama repo ini,
// plus pastikan canonical/og:url menunjuk alamat kanonik ArenaFisikaseru.
// Dipakai di CI supaya tautan patah dan duplikasi alamat tidak lolos ke Pages.
//
// Jalankan dari mana saja: node scripts/check-links.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CANONICAL_BASE = 'https://farrelfz.github.io/ArenaFisikaseru';

const PAGES = [
    ['index.html', '/'],
    ['VectorArena/index.html', '/VectorArena/'],
    ['HydroArena/index.html', '/HydroArena/'],
];

// Halaman tambahan: hanya referensi relatif yang diperiksa (canonical tidak
// relevan untuk berkas Markdown).
const EXTRA_PAGES = [
    'VectorArena/README.md',
    'HydroArena/README.md',
];

const REF_PATTERN = /(?:src|href)="([^"]*)"/g;
const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;
const CANONICAL_PATTERN = /<link rel="canonical" href="([^"]+)"/;
const OG_URL_PATTERN = /<meta property="og:url" content="([^"]+)"/;

const failures = [];
let checked = 0;

for (const [page, route] of PAGES) {
    const pagePath = path.join(root, page);
    const pageDir = path.dirname(pagePath);
    const html = fs.readFileSync(pagePath, 'utf8');
    const expected = CANONICAL_BASE + route;

    const canonical = html.match(CANONICAL_PATTERN)?.[1];
    if (canonical !== expected) {
        failures.push(`${page}: canonical ${canonical ?? '(tidak ada)'} ≠ ${expected}`);
    }

    const ogUrl = html.match(OG_URL_PATTERN)?.[1];
    if (ogUrl !== expected) {
        failures.push(`${page}: og:url ${ogUrl ?? '(tidak ada)'} ≠ ${expected}`);
    }

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

// Referensi relatif di berkas Markdown (tautan dokumentasi, gambar).
const MD_REF_PATTERN = /\[[^\]]*\]\(([^)\s]+)\)|!\[[^\]]*\]\(([^)\s]+)\)/g;

for (const page of EXTRA_PAGES) {
    const pagePath = path.join(root, page);
    if (!fs.existsSync(pagePath)) continue;

    const pageDir = path.dirname(pagePath);
    const text = fs.readFileSync(pagePath, 'utf8');

    for (const match of text.matchAll(MD_REF_PATTERN)) {
        const ref = (match[1] || match[2] || '').trim();
        if (!ref || EXTERNAL.test(ref) || ref.startsWith('mailto:')) continue;

        const clean = ref.split(/[?#]/)[0];
        if (!clean || clean.startsWith('/')) continue;

        const target = path.join(pageDir, clean);
        checked += 1;

        if (!fs.existsSync(target)) {
            failures.push(`${page}: ${ref} → ${path.relative(root, target)} tidak ditemukan`);
        }
    }
}

console.log(`Diperiksa ${checked} referensi lokal + canonical/og:url di ${PAGES.length} halaman.`);

if (failures.length > 0) {
    console.error(`\n${failures.length} masalah:`);
    for (const failure of failures) console.error(` - ${failure}`);
    process.exit(1);
}

console.log('Semua referensi lokal valid dan canonical konsisten.');