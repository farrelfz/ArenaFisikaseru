// ==========================================================================
// HYDROARENA SMAN 78 - DIAGRAM TEKNIS FLUIDA EDUKASI (CLEAN ACADEMIC THEME)
// STANDAR TIPOGRAFI TEKNIS: NON-OVERLAPPING TEXT, TEKS JERNIH, KONTRAS TINGGI
// ==========================================================================

// Q01 - Q03: Tangki Silinder Titik P dan Q
const SVG_TANK_PQ = `<svg viewBox="0 0 380 165" class="w-full max-w-md h-40 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <!-- Tangki & Air -->
    <rect x="65" y="15" width="165" height="125" fill="#ffffff" stroke="#334155" stroke-width="2"/>
    <path d="M67 24 Q 108 19, 148 24 T 228 24 L 228 138 L 67 138 Z" fill="#e0f2fe" opacity="0.9"/>
    
    <!-- Titik P (Kedalaman 2,6 m) -->
    <circle cx="145" cy="58" r="4.5" fill="#0284c7" stroke="#0369a1" stroke-width="1.5"/>
    <text x="135" y="52" fill="#0f172a" font-size="12" font-family="'JetBrains Mono', monospace" font-weight="700">P</text>
    <line x1="65" y1="58" x2="230" y2="58" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="3,3"/>
    
    <!-- Titik Q (1,2 m di atas dasar) -->
    <circle cx="130" cy="115" r="4.5" fill="#0284c7" stroke="#0369a1" stroke-width="1.5"/>
    <text x="120" y="108" fill="#0f172a" font-size="12" font-family="'JetBrains Mono', monospace" font-weight="700">Q</text>
    <line x1="65" y1="115" x2="230" y2="115" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="3,3"/>
    
    <!-- Garis Dimensi Vertikal -->
    <line x1="190" y1="24" x2="190" y2="58" stroke="#475569" stroke-width="1.2"/>
    <text x="198" y="44" fill="#1e293b" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="600">2,6 m</text>
    
    <line x1="190" y1="115" x2="190" y2="138" stroke="#475569" stroke-width="1.2"/>
    <text x="198" y="130" fill="#1e293b" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="600">1,2 m</text>
    
    <!-- Tinggi Total Tangki -->
    <line x1="258" y1="24" x2="258" y2="138" stroke="#1e3a8a" stroke-width="1.5"/>
    <line x1="250" y1="24" x2="266" y2="24" stroke="#1e3a8a" stroke-width="1.5"/>
    <line x1="250" y1="138" x2="266" y2="138" stroke="#1e3a8a" stroke-width="1.5"/>
    <text x="274" y="85" fill="#1e3a8a" font-size="12" font-family="'JetBrains Mono', monospace" font-weight="700">H = 9,4 m</text>
    
    <!-- Lantai Dasar -->
    <line x1="45" y1="140" x2="285" y2="140" stroke="#64748b" stroke-width="2"/>
</svg>`;

// Q04: Tiga Wadah Paradoks Hidrostatika (Silinder Lebar, Silinder Sempit, Corong)
const SVG_THREE_VESSELS = `<svg viewBox="0 0 400 150" class="w-full max-w-md h-36 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <!-- Garis Acuan Permukaan Air (h = 50 cm) -->
    <line x1="15" y1="42" x2="385" y2="42" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="4,3"/>
    <text x="20" y="34" fill="#0284c7" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">Tinggi Air Sama: h = 50 cm</text>

    <!-- Wadah I: Silinder Lebar (A = 400 cm²) -->
    <path d="M40 38 L40 120 L115 120 L115 38" fill="none" stroke="#334155" stroke-width="2"/>
    <rect x="42" y="44" width="71" height="74" fill="#bae6fd" opacity="0.85"/>
    <text x="77" y="20" fill="#1e3a8a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">Wadah I</text>
    <text x="77" y="137" fill="#475569" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="middle">A = 400 cm²</text>

    <!-- Wadah II: Silinder Sempit (A = 100 cm²) -->
    <path d="M165 38 L165 120 L215 120 L215 38" fill="none" stroke="#334155" stroke-width="2"/>
    <rect x="167" y="44" width="46" height="74" fill="#bae6fd" opacity="0.85"/>
    <text x="190" y="20" fill="#1e3a8a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">Wadah II</text>
    <text x="190" y="137" fill="#475569" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="middle">A = 100 cm²</text>

    <!-- Wadah III: Corong Melebar (A = 250 cm²) -->
    <path d="M265 38 L290 120 L355 120 L380 38" fill="none" stroke="#334155" stroke-width="2"/>
    <polygon points="268,44 290,120 355,120 377,44" fill="#bae6fd" opacity="0.85"/>
    <text x="322" y="20" fill="#1e3a8a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">Wadah III</text>
    <text x="322" y="137" fill="#475569" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="middle">A = 250 cm²</text>

    <!-- Garis Lantai Dasar -->
    <line x1="25" y1="121" x2="390" y2="121" stroke="#475569" stroke-width="2"/>
</svg>`;

// Q05 - Q06: Dongkrak Hidrolik
const SVG_HYDRAULIC_JACK = `<svg viewBox="0 0 380 145" class="w-full max-w-md h-36 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <!-- Badan Pipa Bejana U Hidrolik -->
    <path d="M55 35 L55 115 L305 115 L305 35 L215 35 L215 88 L105 88 L105 35 Z" fill="#e0f2fe" stroke="#334155" stroke-width="2"/>
    
    <!-- Piston Kecil -->
    <rect x="57" y="30" width="46" height="10" fill="#0284c7" rx="2"/>
    <line x1="80" y1="6" x2="80" y2="28" stroke="#dc2626" stroke-width="2.5"/>
    <polygon points="80,30 75,20 85,20" fill="#dc2626"/>
    <text x="30" y="16" fill="#dc2626" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">F₁ (Pompa)</text>
    <text x="35" y="133" fill="#475569" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600">A₁ = 8,5 cm²</text>
    
    <!-- Piston Besar & Beban -->
    <rect x="217" y="30" width="86" height="10" fill="#0284c7" rx="2"/>
    <rect x="225" y="8" width="70" height="20" fill="#1e40af" rx="3" stroke="#1e3a8a" stroke-width="1.5"/>
    <text x="260" y="22" fill="#ffffff" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">Mobil 800 kg</text>
    <text x="260" y="133" fill="#475569" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="middle">A₂ = 340 cm²</text>
</svg>`;

// Q08: Pipa U Minyak dan Air
const SVG_U_TUBE = `<svg viewBox="0 0 380 145" class="w-full max-w-md h-36 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <!-- Pipa U Kaca -->
    <path d="M115 15 L115 95 Q115 112 132 112 L238 112 Q255 112 255 95 L255 15" fill="none" stroke="#cbd5e1" stroke-width="20"/>
    
    <!-- Lapisan Cairan Kanan (Air) -->
    <path d="M115 68 L115 95 Q115 112 132 112 L238 112 Q255 112 255 95 L255 40" fill="none" stroke="#93c5fd" stroke-width="15"/>
    
    <!-- Lapisan Cairan Kiri (Minyak h₁ = 15 cm) -->
    <line x1="115" y1="22" x2="115" y2="68" stroke="#f59e0b" stroke-width="15"/>
    
    <!-- Garis Bidang Batas Horizontal -->
    <line x1="85" y1="68" x2="285" y2="68" stroke="#334155" stroke-width="1.5" stroke-dasharray="4,3"/>
    <text x="288" y="72" fill="#475569" font-size="9" font-family="'JetBrains Mono', monospace" font-weight="600">Bidang Batas</text>
    
    <!-- Label Ketinggian Sesuai Soal Q08 -->
    <text x="40" y="45" fill="#d97706" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">Minyak (h₁ = 15 cm)</text>
    <text x="268" y="45" fill="#0284c7" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">Air (h₂ = 12 cm)</text>
</svg>`;

// Q09: Pipa U Raksa dengan Air dan Cairan X (Permukaan Raksa Sejajar)
const SVG_U_TUBE_MERCURY = `<svg viewBox="0 0 390 150" class="w-full max-w-md h-36 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <!-- Pipa U Kaca -->
    <path d="M120 15 L120 95 Q120 112 137 112 L243 112 Q260 112 260 95 L260 15" fill="none" stroke="#cbd5e1" stroke-width="20"/>
    
    <!-- Dasar Pipa: Raksa / Mercury (Abu-abu logam setimbang sejajar) -->
    <path d="M120 70 L120 95 Q120 112 137 112 L243 112 Q260 112 260 95 L260 70" fill="none" stroke="#64748b" stroke-width="15"/>
    
    <!-- Kaki Kiri: Air (h₁ = 16 cm) -->
    <line x1="120" y1="20" x2="120" y2="70" stroke="#38bdf8" stroke-width="15"/>
    
    <!-- Kaki Kanan: Cairan X (h₂ = ?) -->
    <line x1="260" y1="12" x2="260" y2="70" stroke="#fbbf24" stroke-width="15"/>

    <!-- Garis Batas Raksa Sejajar -->
    <line x1="90" y1="70" x2="290" y2="70" stroke="#0f172a" stroke-width="1.5" stroke-dasharray="3,2"/>
    <text x="190" y="85" fill="#334155" font-size="9" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">Permukaan Raksa Sejajar</text>

    <!-- Label Kiri & Kanan -->
    <text x="35" y="45" fill="#0284c7" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">Air (h₁ = 16 cm)</text>
    <text x="278" y="42" fill="#d97706" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">Cairan X (h₂ = ?)</text>
</svg>`;

// Q10: Hukum Archimedes (Penimbangan Batu di Udara vs Air)
const SVG_ARCHIMEDES_SCALE = `<svg viewBox="0 0 390 145" class="w-full max-w-md h-36 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <!-- Penimbangan 1: Di Udara Bebas (80 N) -->
    <g transform="translate(45, 10)">
        <rect x="35" y="5" width="20" height="35" rx="3" fill="#ffffff" stroke="#334155" stroke-width="1.5"/>
        <line x1="45" y1="40" x2="45" y2="60" stroke="#64748b" stroke-width="1.5"/>
        <rect x="33" y="60" width="24" height="24" rx="2" fill="#94a3b8" stroke="#334155" stroke-width="1.5"/>
        <text x="45" y="100" fill="#0f172a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">W_udara = 80 N</text>
        <text x="45" y="115" fill="#64748b" font-size="10" font-family="'JetBrains Mono', monospace" text-anchor="middle">(Di Udara)</text>
    </g>

    <!-- Pemisah -->
    <line x1="195" y1="15" x2="195" y2="125" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4,3"/>

    <!-- Penimbangan 2: Tercelup Total dalam Air (60 N) -->
    <g transform="translate(235, 10)">
        <!-- Bejana Air -->
        <rect x="15" y="48" width="60" height="50" rx="2" fill="#e0f2fe" stroke="#334155" stroke-width="1.5"/>
        <!-- Neraca Pegas -->
        <rect x="35" y="5" width="20" height="35" rx="3" fill="#ffffff" stroke="#334155" stroke-width="1.5"/>
        <line x1="45" y1="40" x2="45" y2="65" stroke="#64748b" stroke-width="1.5"/>
        <rect x="33" y="65" width="24" height="24" rx="2" fill="#94a3b8" stroke="#334155" stroke-width="1.5"/>
        <text x="45" y="112" fill="#0284c7" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">W_semu = 60 N</text>
        <text x="45" y="126" fill="#0369a1" font-size="10" font-family="'JetBrains Mono', monospace" text-anchor="middle">(Tercelup Air)</text>
    </g>
</svg>`;

// Q13: Kubus Kayu Melayang Antara Lapisan Minyak & Air
const SVG_TWO_LIQUIDS_CUBE = `<svg viewBox="0 0 380 145" class="w-full max-w-md h-36 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <!-- Bejana Kaca -->
    <rect x="100" y="15" width="180" height="115" fill="#ffffff" stroke="#334155" stroke-width="2"/>
    
    <!-- Lapisan Bawah: Air (ρ = 1,0 g/cm³) -->
    <rect x="102" y="70" width="176" height="58" fill="#bae6fd" opacity="0.9"/>
    <!-- Lapisan Atas: Minyak (ρ = 0,8 g/cm³) -->
    <rect x="102" y="25" width="176" height="45" fill="#fef3c7" opacity="0.9"/>
    
    <!-- Garis Batas Minyak-Air -->
    <line x1="102" y1="70" x2="278" y2="70" stroke="#334155" stroke-width="1.2" stroke-dasharray="3,2"/>
    
    <!-- Kubus Kayu (40% di Minyak, 60% di Air) -->
    <rect x="165" y="50" width="50" height="50" fill="#d97706" rx="2" stroke="#78350f" stroke-width="1.5" opacity="0.95"/>
    <text x="190" y="80" fill="#ffffff" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">Kayu</text>
    
    <!-- Label Kiri & Kanan -->
    <text x="90" y="48" fill="#b45309" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="end">Minyak (40% V)</text>
    <text x="90" y="98" fill="#0369a1" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="end">Air (60% V)</text>
</svg>`;

// Q14: Persamaan Kontinuitas Pipa Bercabang Menuju Tandon
const SVG_BRANCHED_PIPE = `<svg viewBox="0 0 390 145" class="w-full max-w-md h-36 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <!-- Pipa Utama & Cabang -->
    <path d="M25 50 L115 50 L160 25 L255 25 L255 45 L175 45 L145 65 L175 85 L255 85 L255 105 L160 105 L115 80 L25 80 Z" 
          fill="#e0f2fe" stroke="#334155" stroke-width="2"/>
    
    <!-- Label Pipa Utama -->
    <text x="30" y="42" fill="#1e3a8a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">Pipa Utama (A₀=30cm²)</text>
    <text x="45" y="98" fill="#475569" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600">v₀ = 3 m/s</text>
    
    <!-- Cabang A (Atas) -->
    <text x="265" y="28" fill="#0f172a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">Cabang A (A_A=12cm²)</text>
    <text x="265" y="42" fill="#0284c7" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600">v_A = 4 m/s</text>
    
    <!-- Cabang B (Bawah Menuju Tandon) -->
    <text x="265" y="88" fill="#0f172a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">Cabang B (A_B=10cm²)</text>
    <text x="265" y="102" fill="#dc2626" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">v_B = ? → Tandon 1.260 L</text>
</svg>`;

// Q15 & Q22: Pipa Horizontal Menyempit (Bernoulli & Debit)
const SVG_HORIZONTAL_PIPE = `<svg viewBox="0 0 380 145" class="w-full max-w-md h-36 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <path d="M30 28 L175 28 L215 48 L345 48 L345 86 L215 86 L175 106 L30 106 Z" fill="#e0f2fe" stroke="#334155" stroke-width="2"/>
    <line x1="65" y1="67" x2="135" y2="67" stroke="#0284c7" stroke-width="2.5"/>
    <polygon points="140,67 130,61 130,73" fill="#0284c7"/>
    <line x1="245" y1="67" x2="310" y2="67" stroke="#0284c7" stroke-width="2.5"/>
    <polygon points="315,67 305,61 305,73" fill="#0284c7"/>
    
    <text x="40" y="20" fill="#0f172a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">Penampang 1 (A₁ = 24 cm²)</text>
    <text x="225" y="38" fill="#0f172a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">Penampang 2 (A₂ = 8 cm²)</text>
    <text x="35" y="125" fill="#475569" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600">v₁ = 1,8 m/s | P₁ = 250.000 Pa</text>
    <text x="235" y="108" fill="#1e3a8a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">v₂ = ? | P₂ = ?</text>
</svg>`;

// Q19: Pipa Horizontal Bernoulli dengan Manometer (Selisih Tekanan Delta P = 16.000 Pa)
const SVG_MANOMETER_PIPE = `<svg viewBox="0 0 390 155" class="w-full max-w-md h-36 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <!-- Pipa Horizontal Menyempit -->
    <path d="M25 45 L155 45 L195 65 L365 65 L365 105 L195 105 L155 125 L25 125 Z" fill="#e0f2fe" stroke="#334155" stroke-width="2"/>

    <!-- Tabung Manometer 1 (Pipa Masuk Lebar) -->
    <rect x="80" y="15" width="16" height="30" fill="#ffffff" stroke="#334155" stroke-width="1.5"/>
    <rect x="81" y="24" width="14" height="21" fill="#38bdf8" opacity="0.9"/>

    <!-- Tabung Manometer 2 (Pipa Sempit) -->
    <rect x="270" y="25" width="16" height="40" fill="#ffffff" stroke="#334155" stroke-width="1.5"/>
    <rect x="271" y="48" width="14" height="17" fill="#38bdf8" opacity="0.9"/>

    <!-- Indikator Selisih Tekanan Delta P = 16.000 Pa -->
    <line x1="97" y1="24" x2="270" y2="24" stroke="#dc2626" stroke-width="1.2" stroke-dasharray="3,2"/>
    <line x1="97" y1="48" x2="270" y2="48" stroke="#dc2626" stroke-width="1.2" stroke-dasharray="3,2"/>
    <line x1="185" y1="24" x2="185" y2="48" stroke="#dc2626" stroke-width="1.5"/>
    <text x="190" y="39" fill="#dc2626" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">ΔP = 16.000 Pa</text>

    <!-- Panah Aliran -->
    <line x1="45" y1="85" x2="105" y2="85" stroke="#0284c7" stroke-width="2.5"/>
    <polygon points="110,85 100,79 100,91" fill="#0284c7"/>
    <line x1="230" y1="85" x2="300" y2="85" stroke="#0284c7" stroke-width="2.5"/>
    <polygon points="305,85 295,79 295,91" fill="#0284c7"/>

    <!-- Label Parameter Bersih Sesuai Q19 -->
    <text x="90" y="142" fill="#0f172a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">A₁ = 24 cm² (v₁ = ?)</text>
    <text x="280" y="125" fill="#0f172a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">A₂ = 8 cm²</text>
</svg>`;

// Q17 & Q20: Teorema Torricelli Satu Lubang
const SVG_TORRICELLI_TANK = `<svg viewBox="0 0 380 155" class="w-full max-w-md h-36 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <rect x="45" y="15" width="105" height="75" fill="#e0f2fe" stroke="#334155" stroke-width="2"/>
    <rect x="58" y="90" width="12" height="48" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
    <rect x="122" y="90" width="12" height="48" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
    <path d="M150 62 Q 235 64, 285 138" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="4,3"/>
    
    <line x1="175" y1="18" x2="175" y2="62" stroke="#64748b" stroke-width="1.2"/>
    <text x="182" y="44" fill="#0f172a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="600">h = 3,5 m</text>
    
    <line x1="175" y1="62" x2="175" y2="138" stroke="#64748b" stroke-width="1.2"/>
    <text x="182" y="105" fill="#0f172a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="600">y = 2,3 m</text>
    
    <text x="54" y="55" fill="#1e3a8a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">H = 5,8 m</text>
    <line x1="25" y1="138" x2="345" y2="138" stroke="#475569" stroke-width="2"/>
</svg>`;

// Q18: Teorema Torricelli Dua Lubang dengan Jarak Pancaran Sama
const SVG_DUAL_TORRICELLI = `<svg viewBox="0 0 390 155" class="w-full max-w-md h-36 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <!-- Tangki Tinggi 5,0 m -->
    <rect x="35" y="15" width="105" height="120" fill="#e0f2fe" stroke="#334155" stroke-width="2"/>
    <text x="45" y="40" fill="#1e3a8a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">H = 5,0 m</text>

    <!-- Lubang B (Atas: y_B = 3,2 m) -->
    <circle cx="140" cy="58" r="3" fill="#dc2626"/>
    <path d="M140 58 Q 235 60, 310 135" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="4,2"/>
    <text x="150" y="54" fill="#1e40af" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">Lubang B (y_B = ?)</text>

    <!-- Lubang A (Bawah: y_A = 1,8 m) -->
    <circle cx="140" cy="92" r="3" fill="#dc2626"/>
    <path d="M140 92 Q 220 95, 310 135" fill="none" stroke="#059669" stroke-width="2"/>
    <text x="150" y="98" fill="#047857" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">Lubang A (y_A = 1,8 m)</text>

    <!-- Jarak Jatuh Sama di x = 4,8 m -->
    <circle cx="310" cy="135" r="4" fill="#dc2626"/>
    <text x="310" y="150" fill="#dc2626" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">Jarak Sama: x = 4,8 m</text>
    
    <!-- Lantai Dasar -->
    <line x1="20" y1="135" x2="370" y2="135" stroke="#475569" stroke-width="2"/>
</svg>`;

// Q21 & Q25: Pipa Bertingkat Bernoulli (Titik A, B, C)
const SVG_STEPPED_PIPE_ABC = `<svg viewBox="0 0 390 170" class="w-full max-w-md h-40 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <path d="M25 22 L130 22 L158 68 L235 68 L262 108 L360 108 L360 128 L250 128 L222 88 L145 88 L118 42 L25 42 Z" fill="#e0f2fe" stroke="#334155" stroke-width="2"/>
    
    <!-- Point A -->
    <circle cx="70" cy="32" r="5" fill="#1e40af" stroke="#ffffff" stroke-width="1.5"/>
    <text x="65" y="16" fill="#1e40af" font-size="12" font-family="'JetBrains Mono', monospace" font-weight="700">A</text>
    
    <!-- Point B -->
    <circle cx="190" cy="78" r="5" fill="#1e40af" stroke="#ffffff" stroke-width="1.5"/>
    <text x="186" y="62" fill="#1e40af" font-size="12" font-family="'JetBrains Mono', monospace" font-weight="700">B</text>
    
    <!-- Point C -->
    <circle cx="315" cy="118" r="5" fill="#1e40af" stroke="#ffffff" stroke-width="1.5"/>
    <text x="310" y="102" fill="#1e40af" font-size="12" font-family="'JetBrains Mono', monospace" font-weight="700">C</text>
    
    <!-- Penyangga Fisik -->
    <rect x="85" y="42" width="18" height="100" fill="#cbd5e1" stroke="#64748b"/>
    <rect x="295" y="128" width="28" height="14" fill="#cbd5e1" stroke="#64748b"/>
    <line x1="15" y1="142" x2="375" y2="142" stroke="#475569" stroke-width="2"/>
    
    <!-- Keterangan Dimensi Bebas Tumpang Tindih -->
    <text x="195" y="160" fill="#334155" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="middle">A_A=14cm², h_A=4,8m | A_B=7cm², h_B=1,7m | A_C=7cm², h_C=0,6m</text>
</svg>`;

// Q23 & Q24: Penampang Sayap Aerofoil Pesawat
const SVG_AIRFOIL = `<svg viewBox="0 0 380 130" class="w-full max-w-md h-32 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <path d="M65 72 Q 155 22, 295 72 Z" fill="#e2e8f0" stroke="#334155" stroke-width="2"/>
    <path d="M35 45 Q 155 10, 325 48" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="4,2"/>
    <path d="M35 88 L 325 88" fill="none" stroke="#64748b" stroke-width="1.5"/>
    <text x="190" y="24" fill="#2563eb" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">Aliran Udara Atas (v₁)</text>
    <text x="190" y="112" fill="#475569" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="middle">Aliran Udara Bawah (v₂)</text>
</svg>`;

const SVG_EXPERIMENT_TABLE = `<svg viewBox="0 0 390 135" class="w-full max-w-md h-32 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <rect x="10" y="8" width="370" height="118" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    <line x1="10" y1="34" x2="380" y2="34" stroke="#cbd5e1" stroke-width="1.5"/>
    <text x="22" y="25" fill="#0f172a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">Percobaan</text>
    <text x="105" y="25" fill="#0f172a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">A (cm²)</text>
    <text x="185" y="25" fill="#0f172a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">v (m/s)</text>
    <text x="275" y="25" fill="#0f172a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700">Tekanan P (Pa)</text>
    <text x="45" y="52" fill="#334155" font-size="10" font-family="'JetBrains Mono', monospace">I</text>
    <text x="115" y="52" fill="#334155" font-size="10" font-family="'JetBrains Mono', monospace">18</text>
    <text x="192" y="52" fill="#334155" font-size="10" font-family="'JetBrains Mono', monospace">0,9</text>
    <text x="285" y="52" fill="#334155" font-size="10" font-family="'JetBrains Mono', monospace">260.000</text>
    <text x="43" y="72" fill="#334155" font-size="10" font-family="'JetBrains Mono', monospace">II</text>
    <text x="115" y="72" fill="#334155" font-size="10" font-family="'JetBrains Mono', monospace">12</text>
    <text x="192" y="72" fill="#334155" font-size="10" font-family="'JetBrains Mono', monospace">1,4</text>
    <text x="285" y="72" fill="#334155" font-size="10" font-family="'JetBrains Mono', monospace">237.000</text>
    <text x="41" y="92" fill="#334155" font-size="10" font-family="'JetBrains Mono', monospace">III</text>
    <text x="118" y="92" fill="#334155" font-size="10" font-family="'JetBrains Mono', monospace">9</text>
    <text x="192" y="92" fill="#334155" font-size="10" font-family="'JetBrains Mono', monospace">2,1</text>
    <text x="285" y="92" fill="#334155" font-size="10" font-family="'JetBrains Mono', monospace">208.000</text>
    <text x="41" y="112" fill="#334155" font-size="10" font-family="'JetBrains Mono', monospace">IV</text>
    <text x="118" y="112" fill="#334155" font-size="10" font-family="'JetBrains Mono', monospace">6</text>
    <text x="192" y="112" fill="#334155" font-size="10" font-family="'JetBrains Mono', monospace">2,8</text>
    <text x="285" y="112" fill="#334155" font-size="10" font-family="'JetBrains Mono', monospace">176.000</text>
</svg>`;

if (typeof module !== "undefined") {
    module.exports = {
        SVG_TANK_PQ,
        SVG_THREE_VESSELS,
        SVG_HYDRAULIC_JACK,
        SVG_U_TUBE,
        SVG_U_TUBE_MERCURY,
        SVG_ARCHIMEDES_SCALE,
        SVG_TWO_LIQUIDS_CUBE,
        SVG_BRANCHED_PIPE,
        SVG_HORIZONTAL_PIPE,
        SVG_MANOMETER_PIPE,
        SVG_TORRICELLI_TANK,
        SVG_DUAL_TORRICELLI,
        SVG_STEPPED_PIPE_ABC,
        SVG_AIRFOIL,
        SVG_EXPERIMENT_TABLE
    };
}
