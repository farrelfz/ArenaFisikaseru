// ==========================================================================
// HYDRO CHALLENGE — DIAGRAM TEKNIS SVG
// Gaya: clean academic, kontras tinggi, label tidak bertumpuk.
// Semua diagram bersifat generik (A₁, A₂, v₁, v₂, P₁, P₂) agar konsisten
// dipakai lintas butir soal dengan angka berbeda.
// ==========================================================================

// Pipa horizontal menyempit (bagian lebar → bagian sempit)
const SVG_PIPE_NARROW = `<svg viewBox="0 0 420 170" class="w-full max-w-md h-auto bg-slate-50 rounded-lg border border-slate-200 p-1" role="img" aria-label="Pipa horizontal menyempit dari penampang besar ke penampang kecil">
    <!-- Badan pipa -->
    <path d="M30 45 H200 V69 H390 V101 H200 V125 H30 Z" fill="#e0f2fe" stroke="#334155" stroke-width="2" stroke-linejoin="round"/>

    <!-- Garis aliran bagian lebar -->
    <line x1="52" y1="85" x2="100" y2="85" stroke="#0284c7" stroke-width="2.2"/>
    <polygon points="108,85 98,80.5 98,89.5" fill="#0284c7"/>
    <line x1="120" y1="85" x2="160" y2="85" stroke="#0284c7" stroke-width="2.2"/>
    <polygon points="168,85 158,80.5 158,89.5" fill="#0284c7"/>

    <!-- Garis aliran bagian sempit (lebih rapat & panjang) -->
    <line x1="220" y1="85" x2="272" y2="85" stroke="#0369a1" stroke-width="2.2"/>
    <polygon points="281,85 271,80.5 271,89.5" fill="#0369a1"/>
    <line x1="294" y1="85" x2="344" y2="85" stroke="#0369a1" stroke-width="2.2"/>
    <polygon points="353,85 343,80.5 343,89.5" fill="#0369a1"/>

    <!-- Label bagian lebar -->
    <text x="58" y="24" fill="#1e3a8a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">P₁</text>
    <text x="94" y="24" fill="#0369a1" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">v₁</text>
    <text x="60" y="117" fill="#0f172a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">A₁</text>

    <!-- Label bagian sempit -->
    <text x="278" y="24" fill="#1e3a8a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">P₂</text>
    <text x="314" y="24" fill="#0369a1" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">v₂</text>
    <text x="292" y="118" fill="#0f172a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">A₂</text>

    <!-- Keterangan bagian -->
    <text x="108" y="150" fill="#475569" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="middle">Bagian 1 (lebar)</text>
    <text x="300" y="150" fill="#475569" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="middle">Bagian 2 (sempit)</text>

    <!-- Arah aliran -->
    <text x="392" y="89" fill="#0284c7" font-size="13" font-family="'JetBrains Mono', monospace" font-weight="700">→</text>
</svg>`;

// Pipa horizontal: lebar → sempit → lebar kembali (tiga bagian)
const SVG_PIPE_THREE = `<svg viewBox="0 0 440 170" class="w-full max-w-md h-auto bg-slate-50 rounded-lg border border-slate-200 p-1" role="img" aria-label="Pipa horizontal dengan tiga bagian: lebar, sempit, lalu lebar kembali">
    <!-- Badan pipa -->
    <path d="M20 45 H160 V69 H280 V45 H420 V125 H280 V101 H160 V125 H20 Z" fill="#e0f2fe" stroke="#334155" stroke-width="2" stroke-linejoin="round"/>

    <!-- Aliran bagian 1 -->
    <line x1="40" y1="85" x2="92" y2="85" stroke="#0284c7" stroke-width="2.2"/>
    <polygon points="100,85 90,80.5 90,89.5" fill="#0284c7"/>

    <!-- Aliran bagian 2 (sempit) -->
    <line x1="178" y1="85" x2="240" y2="85" stroke="#0369a1" stroke-width="2.2"/>
    <polygon points="250,85 240,80.5 240,89.5" fill="#0369a1"/>

    <!-- Aliran bagian 3 -->
    <line x1="300" y1="85" x2="352" y2="85" stroke="#0284c7" stroke-width="2.2"/>
    <polygon points="360,85 350,80.5 350,89.5" fill="#0284c7"/>

    <!-- Label tekanan -->
    <text x="78" y="28" fill="#1e3a8a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">P₁</text>
    <text x="210" y="28" fill="#1e3a8a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">P₂</text>
    <text x="348" y="28" fill="#1e3a8a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">P₃</text>

    <!-- Label kecepatan (di dalam air) -->
    <text x="68" y="118" fill="#0369a1" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">v₁</text>
    <text x="208" y="118" fill="#0369a1" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">v₂</text>
    <text x="338" y="118" fill="#0369a1" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">v₃</text>

    <!-- Label luas penampang -->
    <text x="46" y="40" fill="#0f172a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600">A₁</text>
    <text x="192" y="61" fill="#0f172a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600">A₂</text>
    <text x="316" y="40" fill="#0f172a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600">A₃</text>

    <!-- Keterangan bagian -->
    <text x="90" y="152" fill="#475569" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="middle">Bagian 1</text>
    <text x="220" y="152" fill="#475569" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="middle">Bagian 2</text>
    <text x="350" y="152" fill="#475569" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="middle">Bagian 3</text>
</svg>`;

// Venturi dengan dua pipa vertikal (manometer terbuka)
const SVG_VENTURI_TUBES = `<svg viewBox="0 0 420 190" class="w-full max-w-md h-auto bg-slate-50 rounded-lg border border-slate-200 p-1" role="img" aria-label="Tabung venturi dengan dua pipa vertikal untuk mengukur selisih tekanan">
    <!-- Pipa venturi -->
    <path d="M25 115 H170 V129 H300 V115 H395 V155 H300 V141 H170 V155 H25 Z" fill="#e0f2fe" stroke="#334155" stroke-width="2" stroke-linejoin="round"/>

    <!-- Pipa vertikal kiri -->
    <rect x="95" y="25" width="12" height="90" fill="#ffffff" stroke="#94a3b8" stroke-width="1.6"/>
    <rect x="97" y="55" width="8" height="60" fill="#7dd3fc"/>

    <!-- Pipa vertikal kanan -->
    <rect x="229" y="25" width="12" height="104" fill="#ffffff" stroke="#94a3b8" stroke-width="1.6"/>
    <rect x="231" y="85" width="8" height="44" fill="#7dd3fc"/>

    <!-- Garis acuan permukaan -->
    <line x1="60" y1="55" x2="300" y2="55" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="4,3"/>
    <line x1="60" y1="85" x2="300" y2="85" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="4,3"/>

    <!-- Selisih tinggi h -->
    <line x1="316" y1="55" x2="316" y2="85" stroke="#b45309" stroke-width="1.6"/>
    <line x1="310" y1="55" x2="322" y2="55" stroke="#b45309" stroke-width="1.6"/>
    <line x1="310" y1="85" x2="322" y2="85" stroke="#b45309" stroke-width="1.6"/>
    <text x="328" y="74" fill="#b45309" font-size="12" font-family="'JetBrains Mono', monospace" font-weight="700">h</text>

    <!-- Aliran -->
    <line x1="40" y1="135" x2="88" y2="135" stroke="#0284c7" stroke-width="2.2"/>
    <polygon points="96,135 86,130.5 86,139.5" fill="#0284c7"/>
    <line x1="190" y1="135" x2="240" y2="135" stroke="#0369a1" stroke-width="2.2"/>
    <polygon points="249,135 239,130.5 239,139.5" fill="#0369a1"/>
    <line x1="315" y1="135" x2="360" y2="135" stroke="#0284c7" stroke-width="2.2"/>
    <polygon points="368,135 358,130.5 358,139.5" fill="#0284c7"/>

    <!-- Label -->
    <text x="60" y="18" fill="#1e3a8a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">P₁ (lebih besar)</text>
    <text x="252" y="18" fill="#1e3a8a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">P₂ (lebih kecil)</text>
    <text x="101" y="175" fill="#475569" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="middle">bagian lebar</text>
    <text x="235" y="175" fill="#475569" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="middle">bagian sempit</text>
</svg>`;

// Venturi dengan manometer U berisi raksa
const SVG_VENTURI_MANOMETER = `<svg viewBox="0 0 420 190" class="w-full max-w-md h-auto bg-slate-50 rounded-lg border border-slate-200 p-1" role="img" aria-label="Tabung venturi dihubungkan ke manometer U berisi raksa">
    <!-- Pipa venturi -->
    <path d="M25 45 H180 V53 H300 V45 H395 V75 H300 V67 H180 V75 H25 Z" fill="#e0f2fe" stroke="#334155" stroke-width="2" stroke-linejoin="round"/>

    <!-- Aliran -->
    <line x1="40" y1="60" x2="86" y2="60" stroke="#0284c7" stroke-width="2.2"/>
    <polygon points="94,60 84,55.5 84,64.5" fill="#0284c7"/>
    <line x1="200" y1="60" x2="250" y2="60" stroke="#0369a1" stroke-width="2.2"/>
    <polygon points="259,60 249,55.5 249,64.5" fill="#0369a1"/>
    <line x1="315" y1="60" x2="360" y2="60" stroke="#0284c7" stroke-width="2.2"/>
    <polygon points="368,60 358,55.5 358,64.5" fill="#0284c7"/>

    <!-- Pipa penghubung ke manometer -->
    <path d="M108 75 V160 Q108 170 118 170 H250 Q260 170 260 160 V67" fill="none" stroke="#cbd5e1" stroke-width="14" stroke-linecap="round"/>

    <!-- Raksa di dalam manometer U (kaki kanan lebih tinggi) -->
    <path d="M108 130 V160 Q108 164 112 164 H256 Q260 164 260 160 V104" fill="none" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>

    <!-- Garis acuan selisih tinggi -->
    <line x1="70" y1="130" x2="300" y2="130" stroke="#0284c7" stroke-width="1.1" stroke-dasharray="4,3"/>
    <line x1="70" y1="104" x2="300" y2="104" stroke="#0284c7" stroke-width="1.1" stroke-dasharray="4,3"/>
    <line x1="312" y1="104" x2="312" y2="130" stroke="#b45309" stroke-width="1.6"/>
    <line x1="306" y1="104" x2="318" y2="104" stroke="#b45309" stroke-width="1.6"/>
    <line x1="306" y1="130" x2="318" y2="130" stroke="#b45309" stroke-width="1.6"/>
    <text x="322" y="121" fill="#b45309" font-size="12" font-family="'JetBrains Mono', monospace" font-weight="700">Δh</text>

    <!-- Label -->
    <text x="76" y="35" fill="#1e3a8a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">P₁</text>
    <text x="258" y="35" fill="#1e3a8a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">P₂</text>
    <text x="110" y="181" fill="#475569" font-size="9" font-family="'JetBrains Mono', monospace" font-weight="600">raksa ρ = 13.600 kg/m³</text>
</svg>`;

// Penyemprot cairan (atomizer): udara dipercepat di ujung sempit, cairan terangkat
const SVG_SPRAYER = `<svg viewBox="0 0 440 190" class="w-full max-w-md h-auto bg-slate-50 rounded-lg border border-slate-200 p-1" role="img" aria-label="Penyemprot cairan: udara mengalir melalui ujung pipa sempit dan mengangkat cairan dari wadah">
    <!-- Pipa udara -->
    <path d="M20 40 H230 V52 H330 V68 H230 V80 H20 Z" fill="#e0f2fe" stroke="#334155" stroke-width="2" stroke-linejoin="round"/>

    <!-- Aliran udara -->
    <line x1="42" y1="60" x2="104" y2="60" stroke="#0284c7" stroke-width="2.2"/>
    <polygon points="113,60 103,55.5 103,64.5" fill="#0284c7"/>
    <line x1="128" y1="60" x2="190" y2="60" stroke="#0284c7" stroke-width="2.2"/>
    <polygon points="199,60 189,55.5 189,64.5" fill="#0284c7"/>
    <line x1="242" y1="60" x2="300" y2="60" stroke="#0369a1" stroke-width="2.2"/>
    <polygon points="310,60 300,55.5 300,64.5" fill="#0369a1"/>

    <!-- Butiran semprotan -->
    <circle cx="350" cy="52" r="2.4" fill="#0284c7"/>
    <circle cx="366" cy="62" r="2.4" fill="#0284c7"/>
    <circle cx="382" cy="50" r="2.4" fill="#0284c7"/>
    <circle cx="396" cy="64" r="2.4" fill="#0284c7"/>
    <circle cx="410" cy="55" r="2.4" fill="#0284c7"/>
    <circle cx="358" cy="72" r="1.8" fill="#0284c7"/>
    <circle cx="390" cy="76" r="1.8" fill="#0284c7"/>

    <!-- Wadah cairan -->
    <rect x="170" y="110" width="190" height="65" rx="4" fill="#ffffff" stroke="#334155" stroke-width="2"/>
    <rect x="173" y="125" width="184" height="47" fill="#7dd3fc"/>
    <line x1="173" y1="125" x2="357" y2="125" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="4,3"/>

    <!-- Pipa kecil pengangkat cairan -->
    <rect x="253" y="68" width="12" height="82" fill="#ffffff" stroke="#94a3b8" stroke-width="1.6"/>
    <rect x="255" y="88" width="8" height="62" fill="#7dd3fc"/>

    <!-- Label -->
    <text x="220" y="18" fill="#1e3a8a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">PENYEMPROT CAIRAN (ATOMIZER)</text>
    <text x="66" y="32" fill="#0369a1" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">udara</text>
    <text x="250" y="32" fill="#b45309" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">v ↑ , P ↓</text>
    <text x="352" y="92" fill="#0284c7" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">semprotan</text>
    <text x="182" y="168" fill="#0f172a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600">cairan</text>
    <text x="270" y="100" fill="#0f172a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600">pipa cairan</text>
</svg>`;

// Ekspor untuk lingkungan modul (opsional)
if (typeof module !== 'undefined') {
    module.exports = {
        SVG_PIPE_NARROW,
        SVG_PIPE_THREE,
        SVG_VENTURI_TUBES,
        SVG_VENTURI_MANOMETER,
        SVG_SPRAYER
    };
}
