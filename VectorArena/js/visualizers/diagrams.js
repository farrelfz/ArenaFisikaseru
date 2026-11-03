// ==========================================================================
// VECTORARENA - ENGINE VISUALISATOR FISIKA VEKTOR & KINEMATIKA (SVG MURNI)
// ==========================================================================

const Visualizers = {
    /**
     * Render diagram SVG berdasarkan objek diagram pada soal.
     * Tipe:
     * 1. vector-plane (Bidang Kartesius dengan sumbu x-y & vektor R)
     * 2. vector-triangle (Metode Segitiga Vektor)
     * 3. vector-parallelogram (Metode Jajaran Genjang)
     * 4. vector-polygon (Metode Poligon Penjumlahan Banyak Vektor)
     * 5. gva (Gerak Vertikal ke Atas: titik peluncuran, puncak h_max, lintasan)
     * 6. gvb (Gerak Vertikal ke Bawah: pelemparan dari ketinggian h)
     * 7. gjb (Gerak Jatuh Bebas: pelepasan dari v0=0)
     * 8. graph-vt (Grafik Kecepatan terhadap Waktu v-t)
     */
    render(diagram, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !diagram || !diagram.type) return;

        let svgHtml = '';
        switch (diagram.type) {
            case 'vector-plane':
                svgHtml = this._renderVectorPlane(diagram.params || {});
                break;
            case 'vector-triangle':
                svgHtml = this._renderVectorTriangle(diagram.params || {});
                break;
            case 'vector-parallelogram':
                svgHtml = this._renderVectorParallelogram(diagram.params || {});
                break;
            case 'vector-polygon':
                svgHtml = this._renderVectorPolygon(diagram.params || {});
                break;
            case 'gva':
                svgHtml = this._renderGVA(diagram.params || {});
                break;
            case 'gvb':
                svgHtml = this._renderGVB(diagram.params || {});
                break;
            case 'gjb':
                svgHtml = this._renderGJB(diagram.params || {});
                break;
            case 'graph-vt':
                svgHtml = this._renderGraphVt(diagram.params || {});
                break;
            default:
                svgHtml = `<div class="text-xs text-slate-400 italic py-2">Diagram fisika tipe "${Utils.escapeHtml(diagram.type)}" siap dianalisis.</div>`;
        }

        container.innerHTML = `
            <div class="my-3 p-3 bg-slate-900/90 rounded-xl border border-slate-700/80 shadow-inner flex flex-col items-center justify-center overflow-x-auto">
                ${svgHtml}
            </div>
        `;
    },

    _arrowHeadDef(id, color) {
        return `
            <marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="${color}" />
            </marker>
        `;
    },

    // 1. Vector Plane (Bidang Kartesius)
    _renderVectorPlane(p) {
        const width = 320;
        const height = 240;
        const cx = 160;
        const cy = 120;
        const scale = p.scale || 18;

        const vx = (p.rx ?? p.x ?? 4) * scale;
        const vy = -(p.ry ?? p.y ?? 3) * scale; // Y terbalik di SVG

        return `
            <svg viewBox="0 0 ${width} ${height}" class="w-full max-w-sm h-auto select-none">
                <defs>
                    ${this._arrowHeadDef('arrow-axis', '#64748b')}
                    ${this._arrowHeadDef('arrow-vec', '#38bdf8')}
                    ${this._arrowHeadDef('arrow-comp-x', '#06b6d4')}
                    ${this._arrowHeadDef('arrow-comp-y', '#f59e0b')}
                </defs>

                <!-- Grid Halus -->
                <line x1="20" y1="${cy}" x2="${width-20}" y2="${cy}" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow-axis)" />
                <line x1="${cx}" y1="${height-20}" x2="${cx}" y2="20" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow-axis)" />

                <text x="${width-18}" y="${cy+15}" fill="#94a3b8" font-size="11" font-weight="bold">+X</text>
                <text x="${cx+8}" y="24" fill="#94a3b8" font-size="11" font-weight="bold">+Y</text>
                <text x="${cx-14}" y="${cy+15}" fill="#64748b" font-size="10">O</text>

                <!-- Komponen X dan Y putus-putus -->
                <line x1="${cx}" y1="${cy}" x2="${cx+vx}" y2="${cy}" stroke="#06b6d4" stroke-width="2.5" stroke-dasharray="4 3" marker-end="url(#arrow-comp-x)" />
                <line x1="${cx+vx}" y1="${cy}" x2="${cx+vx}" y2="${cy+vy}" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="4 3" marker-end="url(#arrow-comp-y)" />

                <!-- Vektor Resultan Utama R -->
                <line x1="${cx}" y1="${cy}" x2="${cx+vx}" y2="${cy+vy}" stroke="#38bdf8" stroke-width="3.5" marker-end="url(#arrow-vec)" />

                <!-- Label Vektor -->
                <text x="${cx + vx/2 - 12}" y="${cy + vy/2 - 8}" fill="#38bdf8" font-size="12" font-weight="bold">R</text>
                <text x="${cx + vx/2}" y="${cy + 16}" fill="#06b6d4" font-size="10">Rx</text>
                <text x="${cx + vx + 8}" y="${cy + vy/2}" fill="#f59e0b" font-size="10">Ry</text>
            </svg>
        `;
    },

    // 2. Vector Triangle (Metode Segitiga)
    _renderVectorTriangle(p) {
        return `
            <svg viewBox="0 0 320 200" class="w-full max-w-sm h-auto select-none">
                <defs>
                    ${this._arrowHeadDef('arr-a', '#38bdf8')}
                    ${this._arrowHeadDef('arr-b', '#f59e0b')}
                    ${this._arrowHeadDef('arr-r', '#10b981')}
                </defs>
                <!-- Vektor A -->
                <line x1="50" y1="150" x2="170" y2="150" stroke="#38bdf8" stroke-width="3" marker-end="url(#arr-a)" />
                <text x="105" y="170" fill="#38bdf8" font-size="11" font-weight="bold">A</text>

                <!-- Vektor B dari ujung A -->
                <line x1="170" y1="150" x2="250" y2="50" stroke="#f59e0b" stroke-width="3" marker-end="url(#arr-b)" />
                <text x="218" y="95" fill="#f59e0b" font-size="11" font-weight="bold">B</text>

                <!-- Resultan R = A + B dari pangkal A ke ujung B -->
                <line x1="50" y1="150" x2="246" y2="54" stroke="#10b981" stroke-width="3.5" marker-end="url(#arr-r)" stroke-dasharray="5 3" />
                <text x="135" y="90" fill="#10b981" font-size="12" font-weight="bold">R = A + B</text>
            </svg>
        `;
    },

    // 3. Vector Parallelogram (Metode Jajaran Genjang)
    _renderVectorParallelogram(p) {
        return `
            <svg viewBox="0 0 320 200" class="w-full max-w-sm h-auto select-none">
                <defs>
                    ${this._arrowHeadDef('p-arr-a', '#38bdf8')}
                    ${this._arrowHeadDef('p-arr-b', '#f59e0b')}
                    ${this._arrowHeadDef('p-arr-r', '#10b981')}
                </defs>
                <!-- Vektor A & B dari titik tangkap sama (50, 150) -->
                <line x1="50" y1="150" x2="190" y2="150" stroke="#38bdf8" stroke-width="3" marker-end="url(#p-arr-a)" />
                <line x1="50" y1="150" x2="130" y2="50" stroke="#f59e0b" stroke-width="3" marker-end="url(#p-arr-b)" />

                <!-- Garis Bantu Jajaran Genjang -->
                <line x1="190" y1="150" x2="270" y2="50" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4" />
                <line x1="130" y1="50" x2="270" y2="50" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4" />

                <!-- Resultan Diagonal R -->
                <line x1="50" y1="150" x2="266" y2="54" stroke="#10b981" stroke-width="3.5" marker-end="url(#p-arr-r)" />

                <text x="110" y="170" fill="#38bdf8" font-size="11" font-weight="bold">A</text>
                <text x="75" y="95" fill="#f59e0b" font-size="11" font-weight="bold">B</text>
                <text x="160" y="90" fill="#10b981" font-size="12" font-weight="bold">R</text>
            </svg>
        `;
    },

    // 4. Vector Polygon (Metode Poligon)
    _renderVectorPolygon(p) {
        return `
            <svg viewBox="0 0 320 200" class="w-full max-w-sm h-auto select-none">
                <defs>
                    ${this._arrowHeadDef('poly-arr', '#38bdf8')}
                    ${this._arrowHeadDef('poly-res', '#ef4444')}
                </defs>
                <line x1="40" y1="150" x2="120" y2="150" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#poly-arr)" />
                <line x1="120" y1="150" x2="190" y2="90" stroke="#06b6d4" stroke-width="2.5" marker-end="url(#poly-arr)" />
                <line x1="190" y1="90" x2="260" y2="110" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#poly-arr)" />

                <!-- Resultan Penutup -->
                <line x1="40" y1="150" x2="256" y2="112" stroke="#ef4444" stroke-width="3" stroke-dasharray="5 3" marker-end="url(#poly-res)" />
                
                <text x="80" y="168" fill="#38bdf8" font-size="10">v₁</text>
                <text x="160" y="115" fill="#06b6d4" font-size="10">v₂</text>
                <text x="230" y="95" fill="#f59e0b" font-size="10">v₃</text>
                <text x="140" y="145" fill="#ef4444" font-size="11" font-weight="bold">R = v₁ + v₂ + v₃</text>
            </svg>
        `;
    },

    // 5. GVA (Gerak Vertikal ke Atas)
    _renderGVA(p) {
        const v0 = p.v0 || 20;
        return `
            <svg viewBox="0 0 280 220" class="w-full max-w-xs h-auto select-none">
                <defs>
                    ${this._arrowHeadDef('gva-arr', '#10b981')}
                    ${this._arrowHeadDef('gva-g', '#ef4444')}
                </defs>
                <!-- Tanah -->
                <line x1="30" y1="190" x2="250" y2="190" stroke="#64748b" stroke-width="2" />
                <text x="210" y="208" fill="#64748b" font-size="10">Tanah (y=0)</text>

                <!-- Lintasan Parabola Vertikal (Naik & Turun) -->
                <path d="M 80,185 Q 140,25 200,185" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 3" />

                <!-- Vektor Kecepatan Awal v0 naik -->
                <line x1="80" y1="185" x2="80" y2="120" stroke="#10b981" stroke-width="3" marker-end="url(#gva-arr)" />
                <text x="45" y="150" fill="#10b981" font-size="11" font-weight="bold">v₀ = ${v0} m/s</text>

                <!-- Titik Puncak Hmax -->
                <circle cx="140" cy="38" r="4" fill="#f59e0b" />
                <text x="150" y="42" fill="#f59e0b" font-size="11" font-weight="bold">Puncak (v = 0)</text>

                <!-- Arah Gravitasi g ke bawah -->
                <line x1="220" y1="60" x2="220" y2="105" stroke="#ef4444" stroke-width="2.5" marker-end="url(#gva-g)" />
                <text x="228" y="85" fill="#ef4444" font-size="10" font-weight="bold">a = -g</text>
            </svg>
        `;
    },

    // 6. GVB (Gerak Vertikal ke Bawah)
    _renderGVB(p) {
        return `
            <svg viewBox="0 0 280 200" class="w-full max-w-xs h-auto select-none">
                <defs>
                    ${this._arrowHeadDef('gvb-arr', '#f59e0b')}
                </defs>
                <!-- Gedung / Ketinggian h -->
                <rect x="40" y="40" width="60" height="130" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
                <!-- Tanah -->
                <line x1="20" y1="170" x2="260" y2="170" stroke="#64748b" stroke-width="2" />

                <!-- Benda dilempar ke bawah dengan v0 > 0 -->
                <circle cx="140" cy="45" r="5" fill="#38bdf8" />
                <line x1="140" y1="45" x2="140" y2="95" stroke="#f59e0b" stroke-width="3" marker-end="url(#gvb-arr)" />
                <text x="152" y="70" fill="#f59e0b" font-size="10" font-weight="bold">v₀ ke bawah</text>

                <line x1="140" y1="100" x2="140" y2="165" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3 3" />
                <!-- Kecepatan akhir v_t -->
                <line x1="140" y1="130" x2="140" y2="168" stroke="#ef4444" stroke-width="3" marker-end="url(#gvb-arr)" />
                <text x="152" y="155" fill="#ef4444" font-size="10" font-weight="bold">v_t &gt; v₀</text>
            </svg>
        `;
    },

    // 7. GJB (Gerak Jatuh Bebas)
    _renderGJB(p) {
        return `
            <svg viewBox="0 0 280 200" class="w-full max-w-xs h-auto select-none">
                <defs>
                    ${this._arrowHeadDef('gjb-arr', '#06b6d4')}
                </defs>
                <!-- Tanah -->
                <line x1="30" y1="175" x2="250" y2="175" stroke="#64748b" stroke-width="2" />
                <text x="200" y="190" fill="#64748b" font-size="10">Tanah</text>

                <!-- Titik Lepas v0 = 0 -->
                <circle cx="120" cy="35" r="6" fill="#38bdf8" />
                <text x="135" y="38" fill="#38bdf8" font-size="10" font-weight="bold">v₀ = 0 (Dilepas)</text>

                <!-- Lintasan Jatuh -->
                <line x1="120" y1="41" x2="120" y2="172" stroke="#475569" stroke-width="2" stroke-dasharray="4 3" />

                <!-- Kecepatan bertambah seiring waktu -->
                <line x1="120" y1="90" x2="120" y2="125" stroke="#06b6d4" stroke-width="2.5" marker-end="url(#gjb-arr)" />
                <text x="130" y="112" fill="#06b6d4" font-size="9">v = g·t</text>

                <line x1="120" y1="135" x2="120" y2="172" stroke="#10b981" stroke-width="3.5" marker-end="url(#gjb-arr)" />
                <text x="130" y="160" fill="#10b981" font-size="10" font-weight="bold">v_tanah = &radic;(2gh)</text>
            </svg>
        `;
    },

    // 8. Graph v-t
    _renderGraphVt(p) {
        return `
            <svg viewBox="0 0 300 180" class="w-full max-w-xs h-auto select-none">
                <defs>
                    ${this._arrowHeadDef('vt-axis', '#64748b')}
                </defs>
                <!-- Sumbu t (horizontal) dan v (vertikal) -->
                <line x1="40" y1="140" x2="270" y2="140" stroke="#64748b" stroke-width="1.5" marker-end="url(#vt-axis)" />
                <line x1="40" y1="140" x2="40" y2="20" stroke="#64748b" stroke-width="1.5" marker-end="url(#vt-axis)" />
                <text x="260" y="155" fill="#94a3b8" font-size="10">t (s)</text>
                <text x="18" y="25" fill="#94a3b8" font-size="10">v (m/s)</text>

                <!-- Garis kurva linear GJB / percepatan konstan -->
                <line x1="40" y1="140" x2="230" y2="40" stroke="#38bdf8" stroke-width="3" />
                <text x="130" y="75" fill="#38bdf8" font-size="10" font-weight="bold">Kemiringan = g</text>

                <!-- Area di bawah grafik = jarak tempuh -->
                <polygon points="40,140 230,140 230,40" fill="#38bdf8" fill-opacity="0.15" />
                <text x="135" y="125" fill="#94a3b8" font-size="9">Luas = Jarak Tempuh (h)</text>
            </svg>
        `;
    }
};
