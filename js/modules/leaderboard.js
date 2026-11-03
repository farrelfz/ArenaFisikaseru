// ==========================================================================
// VECTORARENA - MODUL KLASEMEN & GAMIFIKASI KOMPETISI FISIKA
// ==========================================================================

const LeaderboardModule = {
    renderAll() {
        this.renderLobbyTop5();
        this.renderPodiumTop3();
        this.renderFullTable();
    },

    formatDisplayName(fullName) {
        if (!fullName) return "-";
        const parts = fullName.trim().split(/\s+/);
        if (parts.length <= 2) return fullName;
        return `${parts[0]} ${parts[1]}`;
    },

    getTier(grade) {
        const g = Number(grade) || 0;
        if (g >= 95.0) {
            return { name: "RELATIVISTIK", class: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40", label: "≥ 95" };
        } else if (g >= 85.0) {
            return { name: "SUPERSONIK", class: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40", label: "85-94" };
        } else if (g >= 75.0) {
            return { name: "ORBITAL", class: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", label: "75-84" };
        } else if (g >= 60.0) {
            return { name: "SUBSONIK", class: "bg-amber-500/20 text-amber-300 border-amber-500/40", label: "60-74" };
        } else {
            return { name: "STATIS", class: "bg-slate-700 text-slate-300 border-slate-600", label: "< 60" };
        }
    },

    getFairPlayBadge(tabSwitches) {
        const sw = Number(tabSwitches) || 0;
        if (sw === 0) {
            return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" title="Integritas Sempurna • 0x Pindah Tab">
                <i data-lucide="shield-check" class="w-3 h-3 text-emerald-400"></i>
                <span>Fokus Penuh (0x)</span>
            </span>`;
        } else if (sw <= 2) {
            return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30" title="Peringatan Ringan • ${sw}x Pindah Tab">
                <i data-lucide="alert-circle" class="w-3 h-3 text-amber-400"></i>
                <span>Fluktuasi (${sw}x)</span>
            </span>`;
        } else {
            return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30" title="Pelanggaran Berat • ${sw}x Pindah Tab">
                <i data-lucide="alert-triangle" class="w-3 h-3 text-rose-400"></i>
                <span>Pelanggaran (${sw}x)</span>
            </span>`;
        }
    },

    getSortedRecords(classFilter = "ALL", searchQuery = "") {
        let list = [...State.leaderboardRecords];

        if (classFilter !== "ALL") {
            list = list.filter(r => r.className === classFilter);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(r =>
                (r.name && r.name.toLowerCase().includes(q)) ||
                (r.className && r.className.toLowerCase().includes(q)) ||
                (r.ip && String(r.ip).toLowerCase().includes(q)) ||
                (String(r.absen) === q)
            );
        }

        return list.sort((a, b) => {
            if ((b.totalScore || 0) !== (a.totalScore || 0)) {
                return (b.totalScore || 0) - (a.totalScore || 0);
            }
            if ((b.academicGrade || 0) !== (a.academicGrade || 0)) {
                return (b.academicGrade || 0) - (a.academicGrade || 0);
            }
            return (a.durationSec || 0) - (b.durationSec || 0);
        });
    },

    renderLobbyTop5() {
        const container = document.getElementById('lobby-top5-list');
        const countBadge = document.getElementById('nav-participant-count');
        if (!container) return;

        const sorted = this.getSortedRecords("ALL").slice(0, 5);
        if (countBadge) countBadge.textContent = State.leaderboardRecords.length;

        if (sorted.length === 0) {
            container.innerHTML = `
                <div class="p-6 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                    <i data-lucide="trophy" class="w-7 h-7 text-indigo-400 mx-auto"></i>
                    <p class="font-semibold text-slate-200">Arena Kompetisi Siap Dimulai</p>
                    <p class="text-[11px] text-slate-400">Jadilah yang pertama menyelesaikan evaluasi untuk meraih Posisi #1 Podium!</p>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        container.innerHTML = sorted.map((r, idx) => {
            const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
            const tier = this.getTier(r.academicGrade);
            const initials = (r.name || "V").split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
            const avatarBg = idx === 0 ? "bg-amber-500/20 text-amber-300 border-amber-500/40" :
                             idx === 1 ? "bg-slate-300/20 text-slate-200 border-slate-400/40" :
                             idx === 2 ? "bg-amber-700/20 text-amber-400 border-amber-700/40" :
                             "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";

            return `
                <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-md transition flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                        <span class="font-mono font-bold text-sm w-6 text-center shrink-0">${medal}</span>
                        <div class="w-8 h-8 rounded-full ${avatarBg} border flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                            ${initials}
                        </div>
                        <div class="min-w-0">
                            <div class="text-xs font-bold text-white truncate">${Utils.escapeHtml(r.name)}</div>
                            <div class="text-[11px] text-slate-400 flex items-center gap-2 font-mono mt-0.5">
                                <span class="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold">${Utils.escapeHtml(r.className)}</span>
                                <span class="px-1.5 py-0.2 rounded text-[10px] ${tier.class}">${tier.name}</span>
                            </div>
                        </div>
                    </div>
                    <div class="text-right shrink-0">
                        <div class="text-xs font-mono font-bold text-indigo-300">${Utils.formatNumber(r.totalScore)} Pts</div>
                        <div class="text-[10px] text-emerald-400 font-semibold font-mono">${r.correctCount || 0}/${r.totalQuestions || CONFIG.TOTAL_QUESTIONS} Benar</div>
                    </div>
                </div>
            `;
        }).join('');

        if (window.lucide) lucide.createIcons();
    },

    renderPodiumTop3() {
        const container = document.getElementById('lb-podium-container');
        if (!container) return;

        const sorted = this.getSortedRecords("ALL").slice(0, 3);
        const rank1 = sorted[0] || null;
        const rank2 = sorted[1] || null;
        const rank3 = sorted[2] || null;

        const buildCard = (r, rank, colorGrad, ringColor) => {
            if (!r) {
                return `
                    <div class="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center flex flex-col items-center justify-center min-h-[220px]">
                        <div class="w-10 h-10 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center font-mono font-bold text-sm mb-2">#${rank}</div>
                        <p class="text-xs text-slate-500 font-medium">Posisi Belum Terisi</p>
                    </div>
                `;
            }
            const initials = (r.name || "V").split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
            const tier = this.getTier(r.academicGrade);
            return `
                <div class="p-6 rounded-2xl bg-gradient-to-b ${colorGrad} border border-slate-700/80 shadow-xl relative overflow-hidden flex flex-col items-center text-center transition hover:-translate-y-1">
                    <div class="w-12 h-12 rounded-full ${ringColor} border-2 flex items-center justify-center font-mono font-bold text-base shadow-lg mb-3">
                        ${initials}
                    </div>
                    <div class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white mb-2">
                        Peringkat #${rank}
                    </div>
                    <h4 class="text-sm font-bold text-white truncate max-w-[180px]">${Utils.escapeHtml(r.name)}</h4>
                    <p class="text-xs text-slate-300 font-mono mt-0.5">${r.className} • Absen #${r.absen}</p>
                    
                    <div class="mt-4 pt-3 border-t border-slate-700/60 w-full flex items-center justify-around text-xs font-mono">
                        <div>
                            <div class="text-[10px] text-slate-400">Total Skor</div>
                            <div class="font-bold text-indigo-300">${Utils.formatNumber(r.totalScore)}</div>
                        </div>
                        <div>
                            <div class="text-[10px] text-slate-400">Akurasi</div>
                            <div class="font-bold text-emerald-300">${r.academicGrade}%</div>
                        </div>
                    </div>
                </div>
            `;
        };

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div class="order-2 md:order-1">${buildCard(rank2, 2, 'from-slate-900 via-slate-900/90 to-slate-800/40', 'bg-slate-300/20 text-slate-200 border-slate-300')}</div>
                <div class="order-1 md:order-2 -mt-4">${buildCard(rank1, 1, 'from-amber-950/40 via-slate-900 to-slate-900', 'bg-amber-500/20 text-amber-300 border-amber-400')}</div>
                <div class="order-3 md:order-3">${buildCard(rank3, 3, 'from-slate-900 via-slate-900/90 to-slate-800/40', 'bg-amber-700/20 text-amber-400 border-amber-600')}</div>
            </div>
        `;
    },

    renderFullTable() {
        const tbody = document.getElementById('lb-full-table-body');
        if (!tbody) return;

        const classFilter = document.getElementById('filter-lb-class') ? document.getElementById('filter-lb-class').value : "ALL";
        const searchVal = document.getElementById('filter-lb-search') ? document.getElementById('filter-lb-search').value : "";
        const sorted = this.getSortedRecords(classFilter, searchVal);

        if (sorted.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="p-8 text-center text-xs text-slate-400">
                        Tidak ada catatan pengerjaan yang cocok dengan filter yang dipilih.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = sorted.map((r, idx) => {
            const tier = this.getTier(r.academicGrade);
            const fairPlay = this.getFairPlayBadge(r.tabSwitches);
            const mins = Math.floor((r.durationSec || 0) / 60);
            const secs = (r.durationSec || 0) % 60;

            return `
                <tr class="border-b border-slate-800/80 hover:bg-slate-800/30 transition text-xs">
                    <td class="p-3.5 font-mono font-bold text-center text-slate-300">#${idx + 1}</td>
                    <td class="p-3.5 font-medium text-white">
                        <div class="font-bold text-slate-100">${Utils.escapeHtml(r.name)}</div>
                        <div class="text-[10px] text-slate-400 font-mono">${r.ip || '-'}</div>
                    </td>
                    <td class="p-3.5 font-mono text-center text-slate-300">${r.className} (#${r.absen})</td>
                    <td class="p-3.5 text-center">
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${tier.class}">${tier.name}</span>
                    </td>
                    <td class="p-3.5 font-mono text-center text-slate-300">${mins}m ${secs}s</td>
                    <td class="p-3.5 text-center">${fairPlay}</td>
                    <td class="p-3.5 font-mono text-right font-bold text-indigo-300 text-sm">
                        ${Utils.formatNumber(r.totalScore)}
                        <span class="block text-[10px] text-emerald-400 font-normal">${r.academicGrade}% (${r.correctCount}/${r.totalQuestions || CONFIG.TOTAL_QUESTIONS})</span>
                    </td>
                </tr>
            `;
        }).join('');

        if (window.lucide) lucide.createIcons();
    }
};

if (typeof module !== 'undefined') {
    module.exports = { LeaderboardModule };
}
