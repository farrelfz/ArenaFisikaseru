// ==========================================================================
// HYDROARENA SMAN 78 - MODUL KLASEMEN & GAMIFIKASI ARENA KOMPETISI SAINS
// ==========================================================================

const LeaderboardModule = {
    render() {
        this.renderLobbyTop5();
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
            return { name: "SUPERFLUIDA", class: "tier-superfluida", label: "≥ 95" };
        } else if (g >= 85.0) {
            return { name: "SUPERKRITIS", class: "tier-superkritis", label: "85-94" };
        } else if (g >= 75.0) {
            return { name: "TURBULEN", class: "tier-turbulen", label: "75-84" };
        } else if (g >= 60.0) {
            return { name: "TRANSISI", class: "tier-transisi", label: "60-74" };
        } else {
            return { name: "LAMINER", class: "tier-laminer", label: "< 60" };
        }
    },

    getFairPlayBadge(tabSwitches) {
        const sw = Number(tabSwitches) || 0;
        if (sw === 0) {
            return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200" title="Klasifikasi 1: Integritas Purna (Aliran Tunak • 0x Pindah Tab)">
                <i data-lucide="shield-check" class="w-3 h-3 text-emerald-600"></i>
                <span>Aliran Tunak (0x)</span>
            </span>`;
        } else if (sw === 1) {
            return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200" title="Klasifikasi 2: Toleransi Ringan (Riak Fluktuasi • 1x Pindah Tab)">
                <i data-lucide="waves" class="w-3 h-3 text-blue-600"></i>
                <span>Riak Fluktuasi (1x)</span>
            </span>`;
        } else if (sw === 2) {
            return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200" title="Klasifikasi 3: Waspada (Olakan Vortiks • 2x Pindah Tab)">
                <i data-lucide="alert-circle" class="w-3 h-3 text-amber-600"></i>
                <span>Olakan Vortiks (2x)</span>
            </span>`;
        } else if (sw >= 3 && sw <= 4) {
            return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200" title="Klasifikasi 4: Peringatan Keras (Kavitasi Kritis • ${sw}x Pindah Tab)">
                <i data-lucide="alert-triangle" class="w-3 h-3 text-orange-600"></i>
                <span>Kavitasi Kritis (${sw}x)</span>
            </span>`;
        } else {
            return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200" title="Klasifikasi 5: Pelanggaran Berat (Separasi Ekstrem • ≥5x Pindah Tab)">
                <i data-lucide="alert-octagon" class="w-3 h-3 text-rose-600"></i>
                <span>Separasi Ekstrem (${sw}x)</span>
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
                <div class="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <i data-lucide="trophy" class="w-6 h-6 text-slate-400 mx-auto mb-1"></i>
                    <p class="font-semibold text-slate-700">Arena Ujian Belum Dimulai</p>
                    <p class="text-[11px] text-slate-500">Mulai pengerjaan pertama untuk menduduki Peringkat #1!</p>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        container.innerHTML = sorted.map((r, idx) => {
            const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
            const tier = this.getTier(r.academicGrade);
            const initials = (r.name || "P").split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
            const avatarBg = idx === 0 ? "bg-amber-100 text-amber-800 border-amber-300" :
                             idx === 1 ? "bg-slate-100 text-slate-700 border-slate-300" :
                             idx === 2 ? "bg-orange-100 text-orange-800 border-orange-300" :
                             "bg-blue-50 text-blue-700 border-blue-200";

            return `
                <div class="p-3 rounded-lg bg-white border border-slate-200 hover:border-blue-300 shadow-sm transition flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <span class="font-mono font-bold text-xs w-6 text-slate-700 shrink-0 text-center">${medal}</span>
                        <div class="w-7 h-7 rounded-full ${avatarBg} border flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                            ${initials}
                        </div>
                        <div class="min-w-0">
                            <div class="text-xs font-bold text-slate-900 truncate">${Utils.escapeHtml(r.name)}</div>
                            <div class="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
                                <span class="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold">${Utils.escapeHtml(r.className)}</span>
                                <span class="px-1 py-0.2 rounded text-[10px] ${tier.class}">${tier.name}</span>
                            </div>
                        </div>
                    </div>
                    <div class="text-right shrink-0">
                        <div class="text-xs font-mono font-bold text-blue-900">${Utils.formatNumber(r.totalScore)} Pts</div>
                        <div class="text-[10px] text-emerald-700 font-semibold font-mono">${Math.min(CONFIG.TOTAL_QUESTIONS, r.correctCount)}/${CONFIG.TOTAL_QUESTIONS} Benar</div>
                    </div>
                </div>
            `;
        }).join('');

        if (window.lucide) lucide.createIcons();
    },

    renderPodiumTop3(sorted) {
        const container = document.getElementById('lb-podium-container');
        if (!container) return;

        const rank1 = (sorted && sorted[0]) || null;
        const rank2 = (sorted && sorted[1]) || null;
        const rank3 = (sorted && sorted[2]) || null;

        const buildPodiumCard = (rec, rank, styleType) => {
            if (!rec) {
                if (rank === 1) {
                    return `
                        <div class="edu-card p-6 rounded-xl podium-empty-gold min-h-[295px] pt-8 -mt-2 sm:-mt-4 flex flex-col justify-between items-center text-center shadow-lg transition-transform hover:-translate-y-1">
                            <div class="absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-100 text-amber-950 shadow-lg ring-4 ring-white animate-bounce" title="Tahta Juara 1">
                                <i data-lucide="crown" class="w-6 h-6 fill-amber-950"></i>
                            </div>
                            <div class="space-y-2 mt-4">
                                <span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-200/90 text-amber-950 border border-amber-300 inline-flex items-center gap-1.5 shadow-sm">
                                    <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-800"></i>
                                    <span>👑 TAHTA UTAMA ANGKATAN</span>
                                </span>
                                <h4 class="text-sm font-bold text-slate-800 mt-2">Slot Juara 1 Terbuka</h4>
                                <p class="text-xs text-slate-500 max-w-[200px] mx-auto leading-relaxed">Raih total skor tertinggi dan klaim tahta emas bergengsi ini!</p>
                            </div>
                            <div class="w-full p-3 rounded-lg bg-white/90 border border-amber-200 text-xs font-mono text-amber-900 font-semibold space-y-0.5">
                                <div>Target: Akurasi Tinggi + Speedrun</div>
                                <div class="text-[10px] text-amber-700 font-normal">Tier Superfluida • Aliran Tunak</div>
                            </div>
                        </div>
                    `;
                } else if (rank === 2) {
                    return `
                        <div class="edu-card p-6 rounded-xl podium-empty-silver min-h-[265px] pt-7 mt-3 flex flex-col justify-between items-center text-center shadow-md transition-transform hover:-translate-y-1">
                            <div class="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-800 shadow-md ring-4 ring-white" title="Slot Juara 2">
                                <span class="text-sm">🥈</span>
                            </div>
                            <div class="space-y-1.5 mt-2">
                                <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-200 text-slate-800 border border-slate-300 inline-block">🥈 JUARA 2 PERAK</span>
                                <h4 class="text-xs font-bold text-slate-800 mt-1">Slot Juara 2 Terbuka</h4>
                                <p class="text-[11px] text-slate-500 max-w-[190px] mx-auto leading-relaxed">Tuntaskan 25 butir soal dengan efisiensi waktu tinggi.</p>
                            </div>
                            <div class="w-full p-2.5 rounded-lg bg-white/90 border border-slate-200 text-[11px] font-mono text-slate-700 font-semibold">
                                <div>Slot Podium Siap Diperebutkan</div>
                            </div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="edu-card p-6 rounded-xl podium-empty-bronze min-h-[255px] pt-7 mt-3 flex flex-col justify-between items-center text-center shadow-md transition-transform hover:-translate-y-1">
                            <div class="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-orange-200 text-orange-950 shadow-md ring-4 ring-white" title="Slot Juara 3">
                                <span class="text-sm">🥉</span>
                            </div>
                            <div class="space-y-1.5 mt-2">
                                <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-orange-200 text-orange-950 border border-orange-300 inline-block">🥉 JUARA 3 PERUNGGU</span>
                                <h4 class="text-xs font-bold text-slate-800 mt-1">Slot Juara 3 Terbuka</h4>
                                <p class="text-[11px] text-slate-500 max-w-[190px] mx-auto leading-relaxed">Pertahankan akurasi dan kecepatan Anda.</p>
                            </div>
                            <div class="w-full p-2.5 rounded-lg bg-white/90 border border-orange-200 text-[11px] font-mono text-orange-900 font-semibold">
                                <div>Slot Podium Siap Diperebutkan</div>
                            </div>
                        </div>
                    `;
                }
            }

            const tier = this.getTier(rec.academicGrade);
            const initials = (rec.name || "P").split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
            const mins = Math.floor((rec.durationSec || 0) / 60);
            const secs = (rec.durationSec || 0) % 60;
            const fairPlay = this.getFairPlayBadge(rec.tabSwitches);

            let cardClass = "podium-card-silver min-h-[265px] pt-7 mt-3";
            let crownEl = `
                <div class="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-800 shadow-md ring-4 ring-white" title="Juara 2">
                    <span class="text-sm">🥈</span>
                </div>
            `;
            let medalBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-200 text-slate-800 border border-slate-300">🥈 JUARA 2</span>`;

            if (rank === 1) {
                cardClass = "podium-card-gold min-h-[295px] pt-8 -mt-2 sm:-mt-4 shadow-xl";
                crownEl = `
                    <div class="absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 text-amber-950 shadow-xl ring-4 ring-white animate-bounce" title="👑 Juara 1 Utama Angkatan">
                        <i data-lucide="crown" class="w-6 h-6 fill-amber-950"></i>
                    </div>
                `;
                medalBadge = `<span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-300 text-amber-950 border border-amber-400 shadow-sm animate-pulse flex items-center gap-1.5">
                    <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-900"></i>
                    <span>👑 JUARA 1 UTAMA</span>
                </span>`;
            } else if (rank === 3) {
                cardClass = "podium-card-bronze min-h-[255px] pt-7 mt-3";
                crownEl = `
                    <div class="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-orange-200 text-orange-950 shadow-md ring-4 ring-white" title="Juara 3">
                        <span class="text-sm">🥉</span>
                    </div>
                `;
                medalBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-orange-200 text-orange-950 border border-orange-300">🥉 JUARA 3</span>`;
            }

            return `
                <div class="edu-card p-5 rounded-xl ${cardClass} flex flex-col justify-between transition-transform hover:-translate-y-1">
                    ${crownEl}
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            ${medalBadge}
                            <span class="px-2 py-0.5 rounded font-mono text-[10px] font-bold ${tier.class}">${tier.name}</span>
                        </div>

                        <div class="flex items-center gap-2.5 pt-1">
                            <div class="w-10 h-10 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                                ${initials}
                            </div>
                            <div class="min-w-0">
                                <h4 class="text-sm font-bold text-slate-900 truncate" title="${Utils.escapeHtml(rec.name)}">${Utils.escapeHtml(rec.name)}</h4>
                                <div class="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                                    <span class="font-semibold text-slate-800">${Utils.escapeHtml(rec.className)}</span>
                                    <span>•</span>
                                    <span>Absen #${String(rec.absen).padStart(2, '0')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-slate-200/80 space-y-1.5 mt-2">
                        <div class="flex items-baseline justify-between font-mono">
                            <span class="text-[11px] font-semibold text-slate-500 uppercase">Total Skor</span>
                            <span class="text-lg font-bold text-blue-900 tabular-nums">${Utils.formatNumber(rec.totalScore)}</span>
                        </div>
                        <div class="grid grid-cols-2 gap-1 pt-1 border-t border-slate-100 text-[11px] font-mono">
                            <div>
                                <span class="text-slate-400">Nilai Quiz:</span>
                                <span class="font-bold text-slate-800 ml-1">${rec.academicGrade}</span>
                            </div>
                            <div class="text-right">
                                <span class="text-slate-400">Waktu:</span>
                                <span class="font-semibold text-slate-700 ml-1">${mins}m ${secs}s</span>
                            </div>
                        </div>
                        <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] font-mono text-slate-500">
                            <span>Akurasi: <strong class="text-emerald-700">${Math.min(CONFIG.TOTAL_QUESTIONS, rec.correctCount)}/${CONFIG.TOTAL_QUESTIONS}</strong></span>
                            <span>Bonus: <strong class="text-emerald-700">+${Utils.formatNumber(rec.speedBonus)}</strong></span>
                        </div>
                    </div>

                    <div class="pt-2 flex items-center justify-between">
                        ${fairPlay}
                        <span class="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            ${rec.academicGrade >= CONFIG.ACADEMIC_KKM ? "Tuntas KKM" : "Remedial"}
                        </span>
                    </div>
                </div>
            `;
        };

        // Urutan Podium Tradisional: 2 (Perak), 1 (Emas - Tengah), 3 (Perunggu)
        container.innerHTML = `
            <div class="order-2 md:order-1">${buildPodiumCard(rank2, 2, "silver")}</div>
            <div class="order-1 md:order-2">${buildPodiumCard(rank1, 1, "gold")}</div>
            <div class="order-3 md:order-3">${buildPodiumCard(rank3, 3, "bronze")}</div>
        `;

        if (window.lucide) lucide.createIcons();
    },

    renderTop10(top10) {
        const container = document.getElementById('lb-top10-container');
        if (!container) return;

        let html = '';
        const list = top10 || [];
        for (let i = 0; i < 10; i++) {
            const r = list[i] || null;
            const rank = i + 1;

            if (r) {
                const tier = this.getTier(r.academicGrade);
                const mins = Math.floor((r.durationSec || 0) / 60);
                const secs = (r.durationSec || 0) % 60;
                const initials = (r.name || "P").split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

                let rankBadge = `<span class="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-800 text-slate-300 border border-slate-700">#${rank}</span>`;
                let cardStyle = "hof-card-elite";

                if (rank === 1) {
                    rankBadge = `<span class="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-sm flex items-center gap-1">🥇 #1</span>`;
                    cardStyle = "hof-card-gold";
                } else if (rank === 2) {
                    rankBadge = `<span class="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-200 text-slate-900 shadow-sm flex items-center gap-1">🥈 #2</span>`;
                    cardStyle = "hof-card-silver";
                } else if (rank === 3) {
                    rankBadge = `<span class="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-orange-400 text-slate-950 shadow-sm flex items-center gap-1">🥉 #3</span>`;
                    cardStyle = "hof-card-bronze";
                } else if (rank <= 5) {
                    rankBadge = `<span class="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-blue-900/80 text-blue-300 border border-blue-600/50">🎖️ #${rank}</span>`;
                }

                html += `
                    <div class="p-3.5 rounded-xl ${cardStyle} flex flex-col justify-between transition-all hover:-translate-y-1 shadow-sm text-left">
                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                ${rankBadge}
                                <span class="px-2 py-0.5 rounded font-mono text-[10px] font-bold ${tier.class}">${tier.name}</span>
                            </div>

                            <div class="flex items-center gap-2 pt-1">
                                <div class="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                                    ${initials}
                                </div>
                                <div class="min-w-0 flex-1">
                                    <h4 class="text-xs font-bold text-white truncate" title="${Utils.escapeHtml(r.name)}">${Utils.escapeHtml(r.name)}</h4>
                                    <div class="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                        <span class="px-1.5 py-0.2 rounded bg-slate-800 text-blue-300 font-bold border border-slate-700">${Utils.escapeHtml(r.className)}</span>
                                        <span>Absen #${String(r.absen || 0).padStart(2, '0')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono">
                            <div>
                                <div class="text-[9px] text-slate-400 uppercase tracking-wider">Total Skor</div>
                                <div class="text-xs font-bold text-amber-300">${Utils.formatNumber(r.totalScore)} Pts</div>
                            </div>
                            <div class="text-right">
                                <div class="text-[9px] text-slate-400 uppercase tracking-wider">Nilai • Waktu</div>
                                <div class="text-[11px] font-semibold text-emerald-400">${r.academicGrade} <span class="text-slate-500">•</span> ${mins}m ${secs}s</div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="p-3.5 rounded-xl hof-card-empty flex flex-col justify-between text-left min-h-[125px] transition-all hover:border-slate-700">
                        <div class="flex items-center justify-between">
                            <span class="px-2 py-0.5 rounded font-mono font-bold text-[10px] ${rank === 1 ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : rank <= 3 ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 text-slate-400'}">
                                #${rank} TERBUKA
                            </span>
                            <span class="text-[9px] font-mono text-slate-500">Hall of Fame</span>
                        </div>
                        <div class="my-1.5 space-y-0.5">
                            <div class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 rounded-full ${rank === 1 ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}"></span>
                                <span>Slot Diperebutkan</span>
                            </div>
                            <div class="text-[10px] text-slate-500 font-mono">Target: Tuntas KKM (≥75)</div>
                        </div>
                        <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono text-[10px] text-slate-400">
                            <span>Kelas XI A – F</span>
                            <span class="text-blue-400 font-semibold">Siap Berlaga</span>
                        </div>
                    </div>
                `;
            }
        }

        container.innerHTML = html;
        if (window.lucide) lucide.createIcons();
    },

    renderClassBattle(records) {
        const container = document.getElementById('lb-class-battle-container');
        if (!container) return;

        const classStats = CONFIG.CLASSES.map(cls => {
            const classRecs = records.filter(r => r.className === cls);
            const count = classRecs.length;
            const avgScore = count > 0 ? Math.round(classRecs.reduce((sum, r) => sum + (r.totalScore || 0), 0) / count) : 0;
            const avgGrade = count > 0 ? (classRecs.reduce((sum, r) => sum + (r.academicGrade || 0), 0) / count).toFixed(1) : "0.0";
            const passedCount = classRecs.filter(r => (r.academicGrade || 0) >= CONFIG.ACADEMIC_KKM).length;
            const passRate = count > 0 ? Math.round((passedCount / count) * 100) : 0;
            const topStudent = classRecs.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))[0] || null;

            return { cls, count, avgScore, avgGrade, passRate, topStudent };
        });

        // Urutkan kelas berdasarkan rata-rata skor tertinggi
        classStats.sort((a, b) => b.avgScore - a.avgScore);

        container.innerHTML = classStats.map((cs, idx) => {
            const hasData = cs.count > 0;
            const rankBadge = hasData
                ? (idx === 0 ? "🥇 #1" : idx === 1 ? "🥈 #2" : idx === 2 ? "🥉 #3" : `#${idx + 1}`)
                : `<span class="text-slate-400 font-bold">#${idx + 1}</span>`;
            const scoreDisplay = hasData
                ? `<span class="text-xs font-bold text-blue-900 tabular-nums">${Utils.formatNumber(cs.avgScore)} <span class="text-[10px] text-slate-500 font-normal">Rerata</span></span>`
                : `<span class="text-[11px] font-mono text-slate-400">Siap Berlaga</span>`;
            const progressPct = hasData ? Math.min(100, Math.round((cs.avgScore / CONFIG.MAX_TOTAL_SCORE) * 100)) : 0;
            const statusLine = hasData ? `${cs.count} Siswa • Tuntas ${cs.passRate}%` : `0 Siswa Terdaftar`;
            const topScorerLine = hasData && cs.topStudent
                ? `★ ${Utils.escapeHtml(this.formatDisplayName(cs.topStudent.name))}`
                : `<span class="text-slate-400 font-normal">★ Menunggu</span>`;

            return `
                <div class="p-3.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 transition shadow-sm space-y-2">
                    <div class="flex items-center justify-between font-mono">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-bold">${rankBadge}</span>
                            <span class="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">${cs.cls}</span>
                        </div>
                        ${scoreDisplay}
                    </div>

                    <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div class="bg-blue-700 h-full rounded-full transition-all duration-500" style="width: ${progressPct}%"></div>
                    </div>

                    <div class="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-0.5">
                        <span>${statusLine}</span>
                        <span class="text-slate-800 font-semibold truncate max-w-[150px]" title="Top Scorer">
                            ${topScorerLine}
                        </span>
                    </div>
                </div>
            `;
        }).join('');

        if (window.lucide) lucide.createIcons();
    },

    setClassFilter(cls) {
        const select = document.getElementById('lb-class-filter');
        if (select) select.value = cls;
        this.renderClassFilterButtons(cls);
        this.renderFullTable();
    },

    renderClassFilterButtons(activeCls = "ALL") {
        const container = document.getElementById('lb-class-quick-pills');
        if (!container) return;
        const classes = ['ALL', ...CONFIG.CLASSES];
        container.innerHTML = classes.map(c => {
            const isActive = c === activeCls;
            const label = c === 'ALL' ? 'Semua Kelas' : c;
            return `
                <button type="button" onclick="LeaderboardModule.setClassFilter('${c}')"
                    class="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition shadow-sm ${isActive ? 'bg-blue-800 text-white shadow-blue-900/20' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
                    ${label}
                </button>
            `;
        }).join('');
    },

    renderFullTable() {
        const classFilter = (document.getElementById('lb-class-filter')?.value) || 'ALL';
        const searchQuery = ((document.getElementById('lb-search-input')?.value) || '').toLowerCase().trim();
        const tbody = document.getElementById('lb-table-body');
        if (!tbody) return;

        const allRecords = this.getSortedRecords("ALL");
        const filtered = this.getSortedRecords(classFilter, searchQuery);

        // Update Stat Badges Angkatan
        const totalParticipants = allRecords.length;
        const avgGrade = totalParticipants > 0 ? (allRecords.reduce((sum, r) => sum + (r.academicGrade || 0), 0) / totalParticipants).toFixed(1) : "0.0";
        const topScore = totalParticipants > 0 ? allRecords[0].totalScore : 0;
        const passedCount = allRecords.filter(r => (r.academicGrade || 0) >= CONFIG.ACADEMIC_KKM).length;
        const passRate = totalParticipants > 0 ? Math.round((passedCount / totalParticipants) * 100) : 0;

        const elStatCount = document.getElementById('lb-stat-count');
        const elStatAvg = document.getElementById('lb-stat-avg');
        const elStatTop = document.getElementById('lb-stat-top');
        const elStatPass = document.getElementById('lb-stat-pass');

        if (elStatCount) elStatCount.textContent = `${totalParticipants} Siswa`;
        if (elStatAvg) elStatAvg.textContent = `${avgGrade} / 100`;
        if (elStatTop) elStatTop.textContent = `${Utils.formatNumber(topScore)} Pts`;
        if (elStatPass) elStatPass.textContent = `${passRate}% (${passedCount} Tuntas)`;

        // Update Counter Lengkap Tabel
        const elTableCountBadge = document.getElementById('lb-table-count-badge');
        const elFooterTotal = document.getElementById('lb-footer-total-count');
        const classLabel = classFilter === 'ALL' ? 'Seluruh Kelas (XI A–XI F)' : `Kelas ${classFilter}`;
        if (elTableCountBadge) elTableCountBadge.textContent = `${filtered.length} Siswa Terdaftar`;
        if (elFooterTotal) elFooterTotal.textContent = `${filtered.length} Siswa • ${classLabel}`;

        // Render Podium Top 3 (berdasarkan filter kelas yang aktif bila ada)
        const elPodiumTitle = document.getElementById('lb-podium-title');
        if (elPodiumTitle) {
            elPodiumTitle.textContent = classFilter === 'ALL'
                ? 'Podium Kehormatan 3 Besar • Satu Angkatan'
                : `Podium Kehormatan 3 Besar • Kelas ${classFilter}`;
        }
        this.renderPodiumTop3(filtered.slice(0, 3));

        // Render 10 Terbaik Satu Angkatan (Selalu Top 10 Lintas Seluruh Rombel XI A–XI F)
        this.renderTop10(allRecords.slice(0, 10));

        // Render Quick Class Filter Buttons
        this.renderClassFilterButtons(classFilter);

        // Render Class Battle (selalu komparatif 6 kelas)
        this.renderClassBattle(allRecords);

        // Render Tabel
        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="py-12 text-center text-xs text-slate-500 bg-slate-50">
                        <i data-lucide="search-x" class="w-7 h-7 text-slate-400 mx-auto mb-2"></i>
                        <p class="font-semibold text-slate-700">Tidak ada data siswa yang cocok</p>
                        <p class="text-[11px] text-slate-400">Ubah filter kelas atau kata kunci pencarian Anda.</p>
                    </td>
                </tr>
            `;
            if (window.lucide) lucide.createIcons();
        } else {
            tbody.innerHTML = filtered.map((r, idx) => {
                const mins = Math.floor((r.durationSec || 0) / 60);
                const secs = (r.durationSec || 0) % 60;
                const tier = this.getTier(r.academicGrade);
                const fairPlay = this.getFairPlayBadge(r.tabSwitches);
                const isPassed = (r.academicGrade || 0) >= CONFIG.ACADEMIC_KKM;

                let rankBadge = `<span class="font-mono text-slate-600 font-bold">#${idx + 1}</span>`;
                let rowBg = "hover:bg-blue-50/40";
                if (idx === 0) {
                    rankBadge = `<span class="inline-flex items-center gap-1 font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">🥇 #1</span>`;
                    rowBg = "bg-amber-50/20 hover:bg-amber-50/40";
                } else if (idx === 1) {
                    rankBadge = `<span class="inline-flex items-center gap-1 font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">🥈 #2</span>`;
                    rowBg = "bg-slate-50/30 hover:bg-slate-50/60";
                } else if (idx === 2) {
                    rankBadge = `<span class="inline-flex items-center gap-1 font-mono font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded border border-orange-300">🥉 #3</span>`;
                    rowBg = "bg-orange-50/20 hover:bg-orange-50/40";
                }

                return `
                    <tr class="${rowBg} transition-colors border-b border-slate-100">
                        <td class="py-3 px-3.5 text-center">${rankBadge}</td>
                        <td class="py-3 px-3.5">
                            <div class="font-bold text-slate-900 text-xs">${Utils.escapeHtml(r.name)}</div>
                            <div class="flex items-center gap-1.5 mt-0.5">
                                ${fairPlay}
                            </div>
                        </td>
                        <td class="py-3 px-3 text-center font-mono">
                            <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">${Utils.escapeHtml(r.className)}</span>
                            <span class="text-slate-500 ml-1 text-xs">#${String(r.absen).padStart(2, '0')}</span>
                        </td>
                        <td class="py-3 px-3 text-center">
                            <span class="px-2 py-0.5 rounded font-mono text-[10px] ${tier.class}">${tier.name}</span>
                        </td>
                        <td class="py-3 px-3 text-center font-mono">
                            <div class="text-xs font-bold ${isPassed ? 'text-emerald-700' : 'text-rose-700'}">${r.academicGrade}</div>
                            <span class="inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded ${isPassed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
                                ${isPassed ? 'TUNTAS' : 'REMEDIAL'}
                            </span>
                        </td>
                        <td class="py-3 px-3 text-center font-mono">
                            <div class="text-xs font-semibold text-slate-800">${r.correctCount}/${CONFIG.TOTAL_QUESTIONS}</div>
                            <div class="w-16 mx-auto bg-slate-200 rounded-full h-1 mt-1 overflow-hidden">
                                <div class="${isPassed ? 'bg-emerald-600' : 'bg-rose-500'} h-full rounded-full" style="width: ${(r.correctCount / CONFIG.TOTAL_QUESTIONS) * 100}%"></div>
                            </div>
                        </td>
                        <td class="py-3 px-3 text-center font-mono text-xs text-slate-600">${mins}m ${secs}s</td>
                        <td class="py-3 px-3.5 text-right font-mono">
                            <div class="text-xs font-bold text-blue-900">${Utils.formatNumber(r.totalScore)}</div>
                            <div class="text-[10px] text-emerald-600 font-semibold">+${Utils.formatNumber(r.speedBonus)} spd</div>
                        </td>
                    </tr>
                `;
            }).join('');

            if (window.lucide) lucide.createIcons();
        }

        this.renderItemDiagnostic(allRecords);
    },

    renderItemDiagnostic(records) {
        const container = document.getElementById('lb-item-analysis');
        if (!container) return;

        container.innerHTML = MASTER_QUESTIONS.map(q => {
            let attempts = 0;
            let correct = 0;
            records.forEach(r => {
                try {
                    const map = JSON.parse(r.answersJson || "{}");
                    if (map[q.id]) {
                        attempts += 1;
                        if (map[q.id].isCorrect) correct += 1;
                    }
                } catch (e) {}
            });
            const pct = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
            const statText = attempts > 0
                ? `${correct}/${attempts} (${pct}%)`
                : `<span class="text-slate-400 font-normal">Siap Diuji</span>`;

            return `
                <div class="edu-panel p-2.5 space-y-1.5 text-xs hover:border-blue-300 transition-colors">
                    <div class="flex items-center justify-between font-mono">
                        <span class="font-bold text-slate-800 text-[11px] truncate" title="${q.topic}">#${q.id} • ${q.topic}</span>
                        <span class="text-slate-700 text-[11px] tabular-nums font-semibold shrink-0 ml-2">${statText}</span>
                    </div>
                    <div class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500 ${attempts === 0 ? 'bg-slate-300' : pct >= 75 ? 'bg-emerald-600' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}" style="width: ${attempts === 0 ? 0 : pct}%"></div>
                    </div>
                </div>
            `;
        }).join('');

        if (window.lucide) lucide.createIcons();
    }
};

if (typeof module !== 'undefined') {
    module.exports = { LeaderboardModule };
}
