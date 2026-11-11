// ==========================================================================
// VECTORARENA - MODUL KLASEMEN & GAMIFIKASI KOMPETISI FISIKA VEKTOR
// ==========================================================================

const LeaderboardModule = {
    renderAll() {
        this.renderStats();
        this.renderLobbyTop5();
        this.renderPodiumTop3();
        this.renderTop10();
        this.renderClassBattle();
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
            return { name: "EINSTEIN", class: "tier-einstein", label: "Nilai 95 – 100", desc: "Kontribusi fundamental relativitas yang mengubah paradigma fisika modern" };
        } else if (g >= 85.0) {
            return { name: "NEWTON", class: "tier-newton", label: "Nilai 85 – 94", desc: "Hukum gerak dan gravitasi universal yang menjadi fondasi mekanika klasik" };
        } else if (g >= 75.0) {
            return { name: "MAXWELL", class: "tier-maxwell", label: "Nilai 75 – 84", desc: "Penyatuan listrik dan magnet menjadi teori elektromagnetik tuntas KKM" };
        } else if (g >= 60.0) {
            return { name: "GALILEO", class: "tier-galileo", label: "Nilai 60 – 74", desc: "Pelopor metode ilmiah dan kinematika gerak menuju ambang batas KKM" };
        } else {
            return { name: "ARCHIMEDES", class: "tier-archimedes", label: "Nilai < 60", desc: "Prinsip dasar statika fluida dan pengungkit dengan dominasi konsep dasar" };
        }
    },

    getFairPlayBadge(tabSwitches) {
        const sw = Number(tabSwitches) || 0;
        if (sw === 0) {
            return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200" title="Integritas Sempurna • 0x Pelanggaran">
                <i data-lucide="shield-check" class="w-3 h-3 text-emerald-600"></i>
                <span>🛡️ JUJUR (0x)</span>
            </span>`;
        } else if (sw === 1) {
            return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200" title="Kecurangan Ringan • 1x Pelanggaran">
                <i data-lucide="zap" class="w-3 h-3 text-teal-600"></i>
                <span>⚠️ KECURANGAN RINGAN (1x)</span>
            </span>`;
        } else if (sw === 2) {
            return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200" title="Terindikasi Kecurangan • 2x Pelanggaran">
                <i data-lucide="alert-circle" class="w-3 h-3 text-amber-600"></i>
                <span>⚠️ TERINDIKASI KECURANGAN (2x)</span>
            </span>`;
        } else if (sw <= 4) {
            return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-50 text-orange-800 border border-orange-200" title="Curang Berat • ${sw}x Pelanggaran">
                <i data-lucide="alert-triangle" class="w-3 h-3 text-orange-600"></i>
                <span>🚨 CURANG BERAT (${sw}x)</span>
            </span>`;
        } else {
            return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200" title="Curang Ekstrem • ${sw}x Pelanggaran">
                <i data-lucide="octagon-alert" class="w-3 h-3 text-rose-600"></i>
                <span>⛔ CURANG EKSTREM (${sw}x)</span>
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

    renderStats() {
        const records = State.leaderboardRecords;
        const countEl = document.getElementById('lb-stat-count');
        const avgEl = document.getElementById('lb-stat-avg');
        const topEl = document.getElementById('lb-stat-top');
        const passEl = document.getElementById('lb-stat-pass');
        const countBadge = document.getElementById('nav-participant-count');

        if (countBadge) countBadge.textContent = records.length;
        if (!countEl) return;

        if (records.length === 0) {
            countEl.textContent = "0 Siswa";
            if (avgEl) avgEl.textContent = "0.0 / 100";
            if (topEl) topEl.textContent = "0 Pts";
            if (passEl) passEl.textContent = "0% (0 Tuntas)";
            return;
        }

        countEl.textContent = `${records.length} Siswa`;
        const totalGrade = records.reduce((acc, r) => acc + (Number(r.academicGrade) || 0), 0);
        const avgGrade = (totalGrade / records.length).toFixed(1);
        if (avgEl) avgEl.textContent = `${avgGrade} / 100`;

        const maxScore = Math.max(...records.map(r => r.totalScore || 0));
        if (topEl) topEl.textContent = `${Utils.formatNumber(maxScore)} Pts`;

        const passed = records.filter(r => (Number(r.academicGrade) || 0) >= 75.0).length;
        const passPct = Math.round((passed / records.length) * 100);
        if (passEl) passEl.textContent = `${passPct}% (${passed} Tuntas)`;
    },

    renderLobbyTop5() {
        const container = document.getElementById('lobby-top5-list');
        if (!container) return;

        const sorted = this.getSortedRecords("ALL").slice(0, 5);

        if (sorted.length === 0) {
            container.innerHTML = `
                <div class="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
                    <i data-lucide="trophy" class="w-8 h-8 text-indigo-400 mx-auto"></i>
                    <p class="font-bold text-slate-700">Arena Kompetisi Terbuka</p>
                    <p class="text-[11px] text-slate-500">Jadilah yang pertama menuntaskan evaluasi untuk memimpin peringkat Podium!</p>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        container.innerHTML = sorted.map((r, idx) => {
            const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
            const tier = this.getTier(r.academicGrade);
            const initials = (r.name || "V").split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
            const avatarBg = idx === 0 ? "bg-amber-100 text-amber-800 border-amber-300 ring-2 ring-amber-200" :
                             idx === 1 ? "bg-slate-200 text-slate-800 border-slate-300" :
                             idx === 2 ? "bg-orange-100 text-orange-900 border-orange-300" :
                             "bg-indigo-50 text-indigo-900 border-indigo-200";

            return `
                <div class="p-3 rounded-lg bg-white border border-slate-200 shadow-sm hover:border-indigo-300 transition flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <span class="font-mono font-bold text-xs w-6 text-center shrink-0 text-slate-700">${medal}</span>
                        <div class="w-8 h-8 rounded-full ${avatarBg} border flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                            ${initials}
                        </div>
                        <div class="min-w-0">
                            <div class="text-xs font-bold text-slate-900 truncate">${Utils.escapeHtml(r.name)}</div>
                            <div class="text-[10px] text-slate-500 flex items-center gap-1.5 font-mono mt-0.5">
                                <span class="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold">${Utils.escapeHtml(r.className)}</span>
                                <span class="px-1.5 py-0.2 rounded font-bold ${tier.class}">${tier.name}</span>
                            </div>
                        </div>
                    </div>
                    <div class="text-right shrink-0">
                        <div class="text-xs font-mono font-bold text-indigo-950">${Utils.formatNumber(r.totalScore)} Pts</div>
                        <div class="text-[10px] text-emerald-700 font-semibold font-mono">${r.correctCount || 0}/${r.totalQuestions || CONFIG.TOTAL_QUESTIONS} Benar</div>
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

        const buildCard = (r, rank) => {
            if (!r) {
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
                                <div class="text-[10px] text-amber-700 font-normal">Tier Einstein • Jujur</div>
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
                                <p class="text-[11px] text-slate-500 max-w-[190px] mx-auto leading-relaxed">Tuntaskan seluruh butir soal dengan efisiensi waktu tinggi.</p>
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

            const tier = this.getTier(r.academicGrade);
            const initials = (r.name || "V").split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
            const mins = Math.floor((r.durationSec || 0) / 60);
            const secs = (r.durationSec || 0) % 60;
            const fairPlay = this.getFairPlayBadge(r.tabSwitches);

            let cardClass = rank === 1 ? "podium-card-gold min-h-[295px] pt-8 -mt-2 sm:-mt-4 shadow-xl" :
                            rank === 2 ? "podium-card-silver min-h-[265px] pt-7 mt-3 shadow-md" :
                            "podium-card-bronze min-h-[255px] pt-7 mt-3 shadow-md";

            let crownEl = rank === 1 ? `
                <div class="absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-100 text-amber-950 shadow-lg ring-4 ring-white animate-bounce" title="Juara 1 Emas">
                    <i data-lucide="crown" class="w-6 h-6 fill-amber-950"></i>
                </div>
            ` : rank === 2 ? `
                <div class="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-800 shadow-md ring-4 ring-white" title="Juara 2">
                    <span class="text-sm">🥈</span>
                </div>
            ` : `
                <div class="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-orange-200 text-orange-950 shadow-md ring-4 ring-white" title="Juara 3">
                    <span class="text-sm">🥉</span>
                </div>
            `;

            let badgeText = rank === 1 ? "👑 JUARA 1 EMAS" : rank === 2 ? "🥈 JUARA 2 PERAK" : "🥉 JUARA 3 PERUNGGU";
            let badgeBg = rank === 1 ? "bg-amber-100 text-amber-900 border-amber-300" :
                          rank === 2 ? "bg-slate-100 text-slate-800 border-slate-300" :
                          "bg-orange-100 text-orange-950 border-orange-300";

            return `
                <div class="edu-card p-5 rounded-xl ${cardClass} flex flex-col justify-between items-center text-center transition-transform hover:-translate-y-1 relative">
                    ${crownEl}
                    <div class="space-y-2 mt-2 w-full">
                        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${badgeBg} border inline-block">
                            ${badgeText}
                        </span>
                        <div class="w-12 h-12 rounded-full ${rank === 1 ? 'bg-amber-100 border-amber-300 text-amber-900 ring-2 ring-amber-200' : 'bg-slate-100 border-slate-300 text-slate-800'} border flex items-center justify-center font-bold text-sm mx-auto font-mono">
                            ${initials}
                        </div>
                        <h4 class="text-sm font-bold text-slate-900 truncate px-2" title="${Utils.escapeHtml(r.name)}">${Utils.escapeHtml(r.name)}</h4>
                        <div class="text-[11px] font-mono text-slate-600">
                            Kelas ${r.className} • Absen #${r.absen}
                        </div>
                    </div>

                    <div class="w-full mt-3 pt-2.5 border-t border-slate-200/80 space-y-1.5 text-xs font-mono">
                        <div class="flex items-center justify-between px-2">
                            <span class="text-slate-500">Total Skor:</span>
                            <span class="font-bold text-indigo-950 text-sm">${Utils.formatNumber(r.totalScore)} Pts</span>
                        </div>
                        <div class="flex items-center justify-between px-2">
                            <span class="text-slate-500">Nilai:</span>
                            <span class="font-bold text-emerald-700">${r.academicGrade} (${r.correctCount || 0} Benar)</span>
                        </div>
                        <div class="flex items-center justify-between px-2">
                            <span class="text-slate-500">Durasi:</span>
                            <span class="text-slate-700 font-semibold">${mins}m ${secs}s</span>
                        </div>
                        <div class="pt-1 flex items-center justify-center">
                            ${fairPlay}
                        </div>
                    </div>
                </div>
            `;
        };

        container.innerHTML = `
            <div class="order-2 md:order-1">${buildCard(rank2, 2)}</div>
            <div class="order-1 md:order-2">${buildCard(rank1, 1)}</div>
            <div class="order-3 md:order-3">${buildCard(rank3, 3)}</div>
        `;

        if (window.lucide) lucide.createIcons();
    },

    renderTop10() {
        const container = document.getElementById('lb-top10-container');
        if (!container) return;

        const list = this.getSortedRecords("ALL").slice(0, 10);
        let html = '';

        for (let i = 0; i < 10; i++) {
            const r = list[i] || null;
            const rank = i + 1;

            if (r) {
                const tier = this.getTier(r.academicGrade);
                const mins = Math.floor((r.durationSec || 0) / 60);
                const secs = (r.durationSec || 0) % 60;
                const initials = (r.name || "V").split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

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
                    rankBadge = `<span class="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-indigo-900/80 text-indigo-300 border border-indigo-600/50">🎖️ #${rank}</span>`;
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
                                        <span class="px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300 font-bold border border-slate-700">${Utils.escapeHtml(r.className)}</span>
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
                            <span>Kelas X A – X K</span>
                            <span class="text-indigo-400 font-semibold">Siap Berlaga</span>
                        </div>
                    </div>
                `;
            }
        }

        container.innerHTML = html;
        if (window.lucide) lucide.createIcons();
    },

    renderClassBattle() {
        const container = document.getElementById('lb-class-battle-container');
        if (!container) return;

        const classes = (typeof CONFIG !== 'undefined' && CONFIG.CLASSES)
            ? CONFIG.CLASSES
            : ['X A', 'X B', 'X C', 'X D', 'X E', 'X F', 'X G', 'X H', 'X I', 'X J', 'X K'];
        const records = State.leaderboardRecords;

        const stats = classes.map(c => {
            const cRecs = records.filter(r => r.className === c);
            const count = cRecs.length;
            const avgScore = count > 0 ? Math.round(cRecs.reduce((acc, r) => acc + (r.totalScore || 0), 0) / count) : 0;
            const avgGrade = count > 0 ? (cRecs.reduce((acc, r) => acc + (Number(r.academicGrade) || 0), 0) / count).toFixed(1) : "0.0";
            return { className: c, count, avgScore, avgGrade };
        }).sort((a, b) => b.avgScore - a.avgScore);

        container.innerHTML = stats.map((s, idx) => {
            const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
            return `
                <div class="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                        <span class="font-mono font-bold text-xs w-5 text-center text-slate-600">${medal}</span>
                        <div>
                            <div class="text-xs font-bold text-slate-900">${s.className}</div>
                            <div class="text-[10px] text-slate-500 font-mono">${s.count} Siswa Terkumpul</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs font-mono font-bold text-indigo-950">${Utils.formatNumber(s.avgScore)} Pts</div>
                        <div class="text-[10px] text-slate-500 font-mono">Rerata ${s.avgGrade}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderFullTable() {
        const tbody = document.getElementById('lb-full-table-body') || document.getElementById('lb-table-body');
        if (!tbody) return;

        const classSelect = document.getElementById('filter-lb-class') || document.getElementById('lb-class-filter');
        const searchInput = document.getElementById('filter-lb-search') || document.getElementById('lb-search-input');
        const countBadge = document.getElementById('lb-table-count-badge');
        const footerCount = document.getElementById('lb-footer-total-count');

        const classFilter = classSelect ? classSelect.value : "ALL";
        const searchVal = searchInput ? searchInput.value : "";
        const sorted = this.getSortedRecords(classFilter, searchVal);

        if (countBadge) countBadge.textContent = classFilter === "ALL" ? "Semua Siswa" : `Kelas ${classFilter}`;
        if (footerCount) footerCount.textContent = `${sorted.length} Siswa`;

        if (sorted.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="p-8 text-center text-xs text-slate-400 bg-white">
                        Tidak ada data peringkat yang cocok dengan kriteria pencarian.
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
                <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition text-xs">
                    <td class="py-3 px-3.5 font-mono font-bold text-center text-slate-700">#${idx + 1}</td>
                    <td class="py-3 px-3.5 font-medium text-slate-900">
                        <div class="font-bold text-slate-900">${Utils.escapeHtml(r.name)}</div>
                        <div class="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                            <span>Absen #${r.absen}</span>
                        </div>
                    </td>
                    <td class="py-3 px-3 font-mono text-center font-bold text-slate-800">${r.className}</td>
                    <td class="py-3 px-3 text-center">
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${tier.class}">${tier.name}</span>
                    </td>
                    <td class="py-3 px-3 font-mono text-center font-bold text-indigo-900">${r.academicGrade}</td>
                    <td class="py-3 px-3 font-mono text-center text-emerald-700 font-semibold">${r.correctCount || 0}/${r.totalQuestions || CONFIG.TOTAL_QUESTIONS}</td>
                    <td class="py-3 px-3 font-mono text-center text-slate-600">${mins}m ${secs}s</td>
                    <td class="py-3 px-3.5 font-mono text-right font-bold text-indigo-950 text-sm">
                        ${Utils.formatNumber(r.totalScore)}
                        <span class="block text-[10px] font-normal text-slate-500">${fairPlay}</span>
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
