// ==========================================================================
// HYDROARENA SMAN 78 - DIAGRAM TEKNIS FLUIDA EDUKASI (CLEAN ACADEMIC THEME)
// ==========================================================================

const SVG_TANK_PQ = `<svg viewBox="0 0 380 155" class="w-full max-w-md h-36 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <rect x="65" y="15" width="165" height="120" fill="#ffffff" stroke="#334155" stroke-width="2"/>
    <path d="M67 24 Q 108 19, 148 24 T 228 24 L 228 133 L 67 133 Z" fill="#e0f2fe" opacity="0.9"/>
    <!-- Point P -->
    <circle cx="145" cy="58" r="4.5" fill="#0284c7" stroke="#0369a1" stroke-width="1.5"/>
    <text x="138" y="50" fill="#0f172a" font-size="12" font-family="Inter, sans-serif" font-weight="700">P</text>
    <line x1="65" y1="58" x2="230" y2="58" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="3,3"/>
    <!-- Point Q -->
    <circle cx="130" cy="115" r="4.5" fill="#0284c7" stroke="#0369a1" stroke-width="1.5"/>
    <text x="122" y="107" fill="#0f172a" font-size="12" font-family="Inter, sans-serif" font-weight="700">Q</text>
    <line x1="65" y1="115" x2="230" y2="115" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="3,3"/>
    <!-- Dimension markers -->
    <line x1="190" y1="24" x2="190" y2="58" stroke="#475569" stroke-width="1.2"/>
    <text x="196" y="45" fill="#1e293b" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="600">2,6 m</text>
    <line x1="190" y1="115" x2="190" y2="134" stroke="#475569" stroke-width="1.2"/>
    <text x="196" y="128" fill="#1e293b" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="600">1,2 m</text>
    <line x1="258" y1="24" x2="258" y2="134" stroke="#1e3a8a" stroke-width="1.5"/>
    <line x1="250" y1="24" x2="266" y2="24" stroke="#1e3a8a" stroke-width="1.5"/>
    <line x1="250" y1="134" x2="266" y2="134" stroke="#1e3a8a" stroke-width="1.5"/>
    <text x="272" y="83" fill="#1e3a8a" font-size="12" font-family="'JetBrains Mono', monospace" font-weight="700">9,4 m</text>
    <line x1="45" y1="135" x2="285" y2="135" stroke="#64748b" stroke-width="2"/>
</svg>`;

const SVG_HYDRAULIC_JACK = `<svg viewBox="0 0 380 140" class="w-full max-w-md h-32 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <path d="M60 35 L60 115 L295 115 L295 35 L210 35 L210 88 L105 88 L105 35 Z" fill="#e0f2fe" stroke="#334155" stroke-width="2"/>
    <rect x="62" y="30" width="41" height="9" fill="#0284c7" rx="2"/>
    <rect x="212" y="30" width="81" height="9" fill="#0284c7" rx="2"/>
    <line x1="82" y1="8" x2="82" y2="28" stroke="#dc2626" stroke-width="2.5"/>
    <polygon points="82,30 77,20 87,20" fill="#dc2626"/>
    <text x="40" y="20" fill="#dc2626" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">F₁ = ? (Gaya Masukan)</text>
    <text x="38" y="130" fill="#475569" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="600">A₁ = 8,5 cm²</text>
    <text x="205" y="20" fill="#1e3a8a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">F₂ = Beban (W)</text>
    <text x="205" y="130" fill="#475569" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="600">A₂ = 340 cm²</text>
</svg>`;

const SVG_HORIZONTAL_PIPE = `<svg viewBox="0 0 380 140" class="w-full max-w-md h-32 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <path d="M30 28 L175 28 L215 48 L345 48 L345 86 L215 86 L175 106 L30 106 Z" fill="#e0f2fe" stroke="#334155" stroke-width="2"/>
    <line x1="65" y1="67" x2="135" y2="67" stroke="#0284c7" stroke-width="2.5"/>
    <polygon points="140,67 130,61 130,73" fill="#0284c7"/>
    <line x1="245" y1="67" x2="310" y2="67" stroke="#0284c7" stroke-width="2.5"/>
    <polygon points="315,67 305,61 305,73" fill="#0284c7"/>
    <text x="55" y="20" fill="#0f172a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">A₁ = 24 cm²</text>
    <text x="240" y="38" fill="#0f172a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">A₂ = 8 cm²</text>
    <text x="35" y="125" fill="#475569" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="600">v₁ = 1,8 m/s | P₁ = 250.000 Pa</text>
    <text x="245" y="108" fill="#1e3a8a" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">v₂ = ? | P₂ = ?</text>
</svg>`;

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

const SVG_STEPPED_PIPE_ABC = `<svg viewBox="0 0 390 155" class="w-full max-w-md h-36 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <path d="M25 22 L130 22 L158 68 L235 68 L262 108 L360 108 L360 128 L250 128 L222 88 L145 88 L118 42 L25 42 Z" fill="#e0f2fe" stroke="#334155" stroke-width="2"/>
    <!-- Point A -->
    <circle cx="70" cy="32" r="5" fill="#1e40af" stroke="#ffffff" stroke-width="1.5"/>
    <text x="65" y="16" fill="#1e40af" font-size="12" font-family="Inter, sans-serif" font-weight="700">A</text>
    <!-- Point B -->
    <circle cx="190" cy="78" r="5" fill="#1e40af" stroke="#ffffff" stroke-width="1.5"/>
    <text x="186" y="62" fill="#1e40af" font-size="12" font-family="Inter, sans-serif" font-weight="700">B</text>
    <!-- Point C -->
    <circle cx="315" cy="118" r="5" fill="#1e40af" stroke="#ffffff" stroke-width="1.5"/>
    <text x="310" y="102" fill="#1e40af" font-size="12" font-family="Inter, sans-serif" font-weight="700">C</text>
    <!-- Supports -->
    <rect x="85" y="42" width="18" height="100" fill="#cbd5e1" stroke="#64748b"/>
    <rect x="295" y="128" width="28" height="14" fill="#cbd5e1" stroke="#64748b"/>
    <line x1="15" y1="142" x2="375" y2="142" stroke="#475569" stroke-width="2"/>
    <text x="60" y="152" fill="#475569" font-size="10" font-family="'JetBrains Mono', monospace">A_A=14cm², h_A=4,8m | A_B=7cm², h_B=1,7m | A_C=7cm², h_C=0,6m</text>
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

const SVG_U_TUBE = `<svg viewBox="0 0 380 135" class="w-full max-w-md h-32 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <path d="M115 15 L115 95 Q115 112 132 112 L238 112 Q255 112 255 95 L255 15" fill="none" stroke="#cbd5e1" stroke-width="18"/>
    <path d="M115 62 L115 95 Q115 112 132 112 L238 112 Q255 112 255 95 L255 34" fill="none" stroke="#93c5fd" stroke-width="14"/>
    <line x1="115" y1="24" x2="115" y2="68" stroke="#3b82f6" stroke-width="14"/>
    <line x1="90" y1="68" x2="280" y2="68" stroke="#475569" stroke-width="1.2" stroke-dasharray="3,3"/>
    <text x="25" y="48" fill="#1e40af" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">Minyak (h₁)</text>
    <text x="268" y="52" fill="#0284c7" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">Air (h₂)</text>
</svg>`;

const SVG_AIRFOIL = `<svg viewBox="0 0 380 125" class="w-full max-w-md h-28 bg-slate-50 rounded-lg border border-slate-200 p-1">
    <path d="M65 72 Q 155 22, 295 72 Z" fill="#e2e8f0" stroke="#334155" stroke-width="2"/>
    <path d="M35 45 Q 155 10, 325 48" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="4,2"/>
    <path d="M35 88 L 325 88" fill="none" stroke="#64748b" stroke-width="1.5"/>
    <text x="140" y="24" fill="#2563eb" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">Aliran Udara Atas (v₁)</text>
    <text x="140" y="106" fill="#475569" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="600">Aliran Udara Bawah (v₂)</text>
</svg>`;

if (typeof module !== "undefined") {
    module.exports = {
        SVG_TANK_PQ,
        SVG_HYDRAULIC_JACK,
        SVG_HORIZONTAL_PIPE,
        SVG_TORRICELLI_TANK,
        SVG_STEPPED_PIPE_ABC,
        SVG_EXPERIMENT_TABLE,
        SVG_U_TUBE,
        SVG_AIRFOIL
    };
}
