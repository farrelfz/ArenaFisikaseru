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

    // 1. Vector Plane (Bidang Kartesius) — mendukung multi-vektor & komponen
    _renderVectorPlane(p) {
        const width = 320, height = 240, cx = 160, cy = 120;
        const scale = p.scale || 18;
        const vecs = Array.isArray(p.vectors) && p.vectors.length > 0
            ? p.vectors
            : [{ x: p.rx ?? p.x ?? 4, y: p.ry ?? p.y ?? 3, label: 'R' }];
        let sumX = 0, sumY = 0;
        for (const v of vecs) { sumX += (v.x || 0); sumY += (v.y || 0); }

        const colors = ['#38bdf8', '#f59e0b', '#a78bfa', '#34d399'];
        let defs = this._arrowHeadDef('arrow-axis', '#64748b') + this._arrowHeadDef('arrow-comp-x', '#06b6d4') + this._arrowHeadDef('arrow-comp-y', '#f59e0b');
        let lines = '';

        vecs.forEach((v, i) => {
            const vx = (v.x || 0) * scale;
            const vy = -(v.y || 0) * scale;
            const color = colors[i % colors.length];
            const lbl = v.label || `v${i+1}`;
            const aid = `vp-vec-${i}`;
            defs += this._arrowHeadDef(aid, color);
            lines += `<line x1="${cx}" y1="${cy}" x2="${cx+vx}" y2="${cy+vy}" stroke="${color}" stroke-width="3" marker-end="url(#${aid})" />`;
            lines += `<text x="${cx + vx/2 - 6}" y="${cy + vy/2 - 6}" fill="${color}" font-size="11" font-weight="bold">${Utils.escapeHtml(lbl)}</text>`;
        });

        if (p.showResultant && vecs.length > 1) {
            const rx = sumX * scale, ry = -sumY * scale;
            defs += this._arrowHeadDef('vp-res', '#10b981');
            lines += `<line x1="${cx}" y1="${cy}" x2="${cx+rx}" y2="${cy+ry}" stroke="#10b981" stroke-width="4" marker-end="url(#vp-res)" stroke-dasharray="6 3" />`;
            lines += `<text x="${cx + rx/2 + 4}" y="${cy + ry/2 - 6}" fill="#10b981" font-size="12" font-weight="bold">R</text>`;
        }

        if (p.showComponents && vecs.length === 1) {
            const v = vecs[0];
            const vx = (v.x || 0) * scale, vy = -(v.y || 0) * scale;
            const lbl = v.label || 'A';
            lines += `<line x1="${cx}" y1="${cy}" x2="${cx+vx}" y2="${cy}" stroke="#06b6d4" stroke-width="2.5" stroke-dasharray="4 3" marker-end="url(#arrow-comp-x)" />`;
            lines += `<line x1="${cx+vx}" y1="${cy}" x2="${cx+vx}" y2="${cy+vy}" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="4 3" marker-end="url(#arrow-comp-y)" />`;
            lines += `<text x="${cx + vx/2}" y="${cy + 16}" fill="#06b6d4" font-size="10">${Utils.escapeHtml(lbl)}ₓ</text>`;
            lines += `<text x="${cx + vx + 6}" y="${cy + vy/2}" fill="#f59e0b" font-size="10">${Utils.escapeHtml(lbl)}ᵧ</text>`;
        }

        return `
            <svg viewBox="0 0 ${width} ${height}" class="w-full max-w-sm h-auto select-none">
                <defs>${defs}</defs>
                <line x1="20" y1="${cy}" x2="${width-20}" y2="${cy}" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow-axis)" />
                <line x1="${cx}" y1="${height-20}" x2="${cx}" y2="20" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow-axis)" />
                <text x="${width-18}" y="${cy+15}" fill="#94a3b8" font-size="11" font-weight="bold">+X</text>
                <text x="${cx+8}" y="24" fill="#94a3b8" font-size="11" font-weight="bold">+Y</text>
                <text x="${cx-14}" y="${cy+15}" fill="#64748b" font-size="10">O</text>
                ${lines}
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

    // 3. Vector Parallelogram (Metode Jajaran Genjang) — parametrik a, b, theta
    _renderVectorParallelogram(p) {
        const a = p.a || 3, b = p.b || 4;
        const thetaDeg = p.theta ?? 90;
        const theta = thetaDeg * Math.PI / 180;
        const scale = 22;
        const ox = 60, oy = 150; // titik pangkal

        // Vektor A sepanjang sumbu X
        const ax = a * scale, ay = 0;
        // Vektor B membentuk sudut theta dari A
        const bx = b * Math.cos(theta) * scale, by = -b * Math.sin(theta) * scale;
        // Resultan = A + B
        const rx = ax + bx, ry = ay + by;

        return `
            <svg viewBox="0 0 320 200" class="w-full max-w-sm h-auto select-none">
                <defs>
                    ${this._arrowHeadDef('p-arr-a', '#38bdf8')}
                    ${this._arrowHeadDef('p-arr-b', '#f59e0b')}
                    ${this._arrowHeadDef('p-arr-r', '#10b981')}
                </defs>
                <!-- Vektor A -->
                <line x1="${ox}" y1="${oy}" x2="${ox+ax}" y2="${oy+ay}" stroke="#38bdf8" stroke-width="3" marker-end="url(#p-arr-a)" />
                <!-- Vektor B -->
                <line x1="${ox}" y1="${oy}" x2="${ox+bx}" y2="${oy+by}" stroke="#f59e0b" stroke-width="3" marker-end="url(#p-arr-b)" />
                <!-- Garis bantu jajaran genjang -->
                <line x1="${ox+ax}" y1="${oy+ay}" x2="${ox+rx}" y2="${oy+ry}" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4" />
                <line x1="${ox+bx}" y1="${oy+by}" x2="${ox+rx}" y2="${oy+ry}" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4" />
                <!-- Resultan diagonal -->
                <line x1="${ox}" y1="${oy}" x2="${ox+rx}" y2="${oy+ry}" stroke="#10b981" stroke-width="3.5" marker-end="url(#p-arr-r)" />
                <!-- Sudut theta -->
                <path d="M ${ox+18} ${oy} A 18 18 0 0 ${by < 0 ? 1 : 0} ${ox+18*Math.cos(theta)} ${oy+18*Math.sin(theta)}" fill="none" stroke="#94a3b8" stroke-width="1.5" />
                <text x="${ox+24}" y="${oy-6}" fill="#94a3b8" font-size="10">θ=${thetaDeg}°</text>
                <!-- Label -->
                <text x="${ox+ax/2-6}" y="${oy+18}" fill="#38bdf8" font-size="11" font-weight="bold">A=${a}</text>
                <text x="${ox+bx/2-12}" y="${oy+by/2-4}" fill="#f59e0b" font-size="11" font-weight="bold">B=${b}</text>
                <text x="${ox+rx/2-4}" y="${oy+ry/2-8}" fill="#10b981" font-size="12" font-weight="bold">R</text>
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

    // 8. Graph v-t (GVA: v = v₀ − gt, kemiringan negatif)
    _renderGraphVt(p) {
        const v0 = p.v0 || 30;
        const g = p.g || 10;
        const tMax = p.tMax || 8;
        // t saat v=0 (puncak)
        const tPeak = v0 / g;
        // Skala: sumbu t dari 0..tMax (lebar ~230px), sumbu v dari -v0..+v0 (tinggi ~120px)
        const x0 = 40, y0 = 140; // titik asal
        const xEnd = 270;
        const pxPerT = (xEnd - x0) / tMax;
        const pxPerV = 50 / v0; // 50px per satuan v0
        const yV0 = y0 - v0 * pxPerV; // y untuk v=v0 (atas)
        const yVNeg = y0 + v0 * pxPerV; // y untuk v=-v0 (bawah)
        const xPeak = x0 + tPeak * pxPerT;
        const xEndT = x0 + tMax * pxPerT;
        // y pada t=tMax: v = v0 - g*tMax
        const vEnd = v0 - g * tMax;
        const yEndV = y0 - vEnd * pxPerV;

        return `
            <svg viewBox="0 0 300 180" class="w-full max-w-xs h-auto select-none">
                <defs>
                    ${this._arrowHeadDef('vt-axis', '#64748b')}
                </defs>
                <!-- Sumbu t (horizontal) dan v (vertikal) -->
                <line x1="${x0}" y1="${y0}" x2="${xEnd}" y2="${y0}" stroke="#64748b" stroke-width="1.5" marker-end="url(#vt-axis)" />
                <line x1="${x0}" y1="${y0}" x2="${x0}" y2="${yV0 - 10}" stroke="#64748b" stroke-width="1.5" marker-end="url(#vt-axis)" />
                <text x="${xEnd-12}" y="${y0+15}" fill="#94a3b8" font-size="10">t (s)</text>
                <text x="${x0-22}" y="${yV0}" fill="#94a3b8" font-size="10">v (m/s)</text>

                <!-- Garis v = v₀ − gt (kemiringan negatif: dari kiri-atas ke kanan-bawah) -->
                <line x1="${x0}" y1="${yV0}" x2="${xEndT}" y2="${yEndV}" stroke="#38bdf8" stroke-width="3" />

                <!-- Titik puncak (v=0) -->
                <circle cx="${xPeak}" cy="${y0}" r="3.5" fill="#f59e0b" />
                <text x="${xPeak+4}" y="${y0-6}" fill="#f59e0b" font-size="9" font-weight="bold">t=${tPeak}s</text>

                <!-- Label kemiringan -->
                <text x="${x0+80}" y="${(yV0+y0)/2}" fill="#38bdf8" font-size="10" font-weight="bold">kemiringan = −g</text>

                <!-- Area segitiga positif (perpindahan naik) -->
                <polygon points="${x0},${y0} ${xPeak},${y0} ${x0},${yV0}" fill="#38bdf8" fill-opacity="0.12" />
                <text x="${x0+18}" y="${(y0+yV0)/2+4}" fill="#94a3b8" font-size="8">Luas = Perpindahan</text>
            </svg>
        `;
    }
};
