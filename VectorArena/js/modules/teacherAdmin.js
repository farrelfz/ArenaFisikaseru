// ==========================================================================
// VECTORARENA - MODUL ADMINISTRATOR UTAMA (GURU CONTROLLER)
// ==========================================================================

const TeacherAdminModule = {
    getTeacherPin() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.TEACHER_PIN) || CONFIG.DEFAULT_TEACHER_PIN;
    },

    verifyPin(inputPin) {
        return String(inputPin).trim() === String(this.getTeacherPin()).trim();
    },

    openLoginModal() {
        const modal = document.getElementById('modal-teacher-login');
        const err = document.getElementById('modal-teacher-error');
        const input = document.getElementById('input-modal-pin');
        if (err) err.classList.add('hidden');
        if (input) input.value = "";
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(() => input && input.focus(), 50);
        }
    },

    closeLoginModal() {
        const modal = document.getElementById('modal-teacher-login');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    handleModalLogin(e) {
        if (e) e.preventDefault();
        const pinVal = document.getElementById('input-modal-pin').value.trim();
        const errEl = document.getElementById('modal-teacher-error');

        if (this.verifyPin(pinVal)) {
            State.isTeacherLoggedIn = true;
            sessionStorage.setItem(CONFIG.STORAGE_KEYS.TEACHER_SESSION, '1');
            this.closeLoginModal();
            this.updateAuthUI();
            this.openAdminDashboard();
            Utils.showToast("Autentikasi Guru Administrator Berhasil.");
        } else {
            if (errEl) {
                errEl.textContent = "PIN Verifikasi Guru tidak cocok! Coba kembali.";
                errEl.classList.remove('hidden');
            }
        }
    },

    logout() {
        State.isTeacherLoggedIn = false;
        sessionStorage.removeItem(CONFIG.STORAGE_KEYS.TEACHER_SESSION);
        this.updateAuthUI();
        this.closeAdminDashboard();
        Utils.showToast("Anda telah keluar dari Portal Guru.");
    },

    updateAuthUI() {
        const teacherBtn = document.getElementById('btn-teacher-portal');
        if (teacherBtn) {
            if (State.isTeacherLoggedIn) {
                teacherBtn.innerHTML = `<i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i><span class="text-xs font-semibold text-emerald-300">Portal Guru (Aktif)</span>`;
            } else {
                teacherBtn.innerHTML = `<i data-lucide="lock" class="w-4 h-4 text-slate-400"></i><span class="text-xs font-semibold text-slate-300">Portal Guru</span>`;
            }
            if (window.lucide) lucide.createIcons();
        }
    },

    openAdminDashboard() {
        if (!State.isTeacherLoggedIn) {
            this.openLoginModal();
            return;
        }

        if (typeof App !== 'undefined' && App.switchView) {
            App.switchView('sheet');
        } else {
            const dash = document.getElementById('screen-teacher-admin') || document.getElementById('view-sheet');
            if (dash) {
                if (document.getElementById('screen-lobby')) document.getElementById('screen-lobby').classList.add('hidden');
                if (document.getElementById('screen-active-exam')) document.getElementById('screen-active-exam').classList.add('hidden');
                if (document.getElementById('screen-review')) document.getElementById('screen-review').classList.add('hidden');
                dash.classList.remove('hidden');
                this.renderAdminStats();
                this.renderAdminBankList();
            }
        }
    },

    renderPanel() {
        this.renderAdminStats();
        this.renderAdminBankList();
    },

    closeAdminDashboard() {
        if (typeof App !== 'undefined' && App.switchView) {
            App.switchView('exam');
        } else {
            const dash = document.getElementById('screen-teacher-admin') || document.getElementById('view-sheet');
            if (dash) dash.classList.add('hidden');
            if (document.getElementById('screen-lobby')) document.getElementById('screen-lobby').classList.remove('hidden');
        }
        LeaderboardModule.renderAll();
    },

    switchSubTab(tab) {
        State.activeAdminSubTab = tab;
        document.querySelectorAll('.admin-subtab-btn').forEach(btn => {
            if (btn.dataset.tab === tab) {
                btn.className = "admin-subtab-btn px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white shadow-md";
            } else {
                btn.className = "admin-subtab-btn px-4 py-2 text-xs font-bold rounded-lg text-slate-400 hover:text-white hover:bg-slate-800";
            }
        });

        const panelCtrl = document.getElementById('admin-panel-ctrl');
        const panelBank = document.getElementById('admin-panel-bank');
        const panelSec = document.getElementById('admin-panel-sec');

        if (panelCtrl) panelCtrl.classList.toggle('hidden', tab !== 'ctrl');
        if (panelBank) panelBank.classList.toggle('hidden', tab !== 'bank');
        if (panelSec) panelSec.classList.toggle('hidden', tab !== 'sec');
    },

    renderAdminStats() {
        const totalSub = State.leaderboardRecords.length;
        const totalScoreSum = State.leaderboardRecords.reduce((acc, r) => acc + (r.totalScore || 0), 0);
        const avgScore = totalSub > 0 ? Math.round(totalScoreSum / totalSub) : 0;
        const passKkm = State.leaderboardRecords.filter(r => (r.academicGrade || 0) >= CONFIG.ACADEMIC_KKM).length;
        const passPercent = totalSub > 0 ? Math.round((passKkm / totalSub) * 100) : 0;

        const statSub = document.getElementById('admin-stat-submissions');
        const statAvg = document.getElementById('admin-stat-avg-score');
        const statPass = document.getElementById('admin-stat-pass-rate');

        if (statSub) statSub.textContent = totalSub;
        if (statAvg) statAvg.textContent = Utils.formatNumber(avgScore);
        if (statPass) statPass.textContent = `${passPercent}% (${passKkm} Siswa)`;
    },

    renderAdminBankList() {
        const container = document.getElementById('admin-bank-list-tbody');
        if (!container) return;

        // Bank ujian resmi (25 butir terkurasi); jatuh ke bank besar bila belum ada.
        const bank = (typeof CURATED_25_QUESTIONS !== 'undefined' && CURATED_25_QUESTIONS.length > 0)
            ? CURATED_25_QUESTIONS
            : QUESTIONS_BANK;

        const DIFFICULTY_STYLE = {
            1: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            2: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            3: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
            4: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30'
        };

        container.innerHTML = bank.slice(0, 50).map((q) => {
            const stem = q.question || q.questionText || '';
            const answer = q.correctAnswer !== undefined
                ? q.correctAnswer
                : ((q.options && q.correctIndex !== undefined) ? q.options[q.correctIndex] : '-');
            const level = Number(q.difficulty);
            const style = DIFFICULTY_STYLE[level] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';

            return `
                <tr class="border-b border-slate-800 hover:bg-slate-800/40 text-xs">
                    <td class="p-3 font-mono font-bold text-slate-300">#${Utils.escapeHtml(q.id)}</td>
                    <td class="p-3 text-slate-300">Zona ${Utils.escapeHtml(String(q.zoneId))} • ${Utils.escapeHtml(q.subtopic || q.bloom || q.zoneName || '-')}</td>
                    <td class="p-3 text-white font-medium truncate max-w-xs">${Utils.escapeHtml(stem.slice(0, 60))}${stem.length > 60 ? '…' : ''}</td>
                    <td class="p-3 font-mono text-center">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${style}">${Utils.escapeHtml(Utils.difficultyLabel(q.difficulty))}</span>
                    </td>
                    <td class="p-3 text-emerald-400 font-mono font-bold">${Utils.escapeHtml(answer)}</td>
                    <td class="p-3 text-center">
                        <span class="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            PUBLISHED
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    },

    toggleExamOpen() {
        return this._toggleConfig('isOpen');
    },

    toggleAllowReview() {
        return this._toggleConfig('allowReview');
    },

    // Ubah satu saklar status: terapkan segera ke layar (responsif), lalu
    // kirim ke server. Bila webhook sudah diatur tetapi server menolak/gagal,
    // saklar dikembalikan ke nilai semula supaya guru tidak melihat status
    // "TERBUKA" pada perangkatnya padahal siswa tidak menerimanya.
    // Dalam mode mandiri (webhook kosong) pembalikan tidak dilakukan karena
    // memang tidak ada perangkat lain yang perlu disinkronkan.
    async _toggleConfig(key) {
        const previous = State.examConfig[key];
        const next = !previous;
        State.examConfig[key] = next;
        State.save();
        this.updateExamConfigUI();

        const label = key === 'isOpen' ? 'Pendaftaran ujian' : 'Kunci jawaban & pembahasan';
        Utils.showToast(`${label} telah ${next ? 'DIBUKA' : 'DITUTUP'}.`);

        if (typeof App !== 'undefined' && App.applyExamConfigUI) App.applyExamConfigUI();
        if (typeof SpreadsheetService === 'undefined') return;

        if (!SpreadsheetService.isConfigured()) return;

        const ok = await SpreadsheetService.setExamConfig({ [key]: next });

        if (!ok) {
            // Server tidak menerima perubahan: batalkan supaya layar guru
            // tidak menampilkan status yang tidak dipegang siswa.
            State.examConfig[key] = previous;
            State.save();
            this.updateExamConfigUI();
            if (typeof App !== 'undefined' && App.applyExamConfigUI) App.applyExamConfigUI();
            Utils.showToast(`Gagal menyimpan status ke server. ${label} dikembalikan ke ${previous ? 'DIBUKA' : 'DITUTUP'}.`, false);
        }
    },

    updateExamConfigUI() {
        this.renderWebhookUI();
        const statusBadge = document.getElementById('admin-exam-status-badge');
        const reviewBadge = document.getElementById('admin-review-status-badge');
        const btnToggleExam = document.getElementById('btn-admin-toggle-exam');
        const btnToggleReview = document.getElementById('btn-admin-toggle-review');

        if (statusBadge) {
            statusBadge.className = State.examConfig.isOpen
                ? "px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40";
            statusBadge.textContent = State.examConfig.isOpen ? "TERBUKA (AKTIF)" : "TERTUTUP";
        }

        if (reviewBadge) {
            reviewBadge.className = State.examConfig.allowReview
                ? "px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40";
            reviewBadge.textContent = State.examConfig.allowReview ? "DIBUKA UNTUK SISWA" : "DIKUNCI";
        }

        if (btnToggleExam) {
            btnToggleExam.textContent = State.examConfig.isOpen ? "Tutup Pendaftaran" : "Buka Pendaftaran";
        }
        if (btnToggleReview) {
            btnToggleReview.textContent = State.examConfig.allowReview ? "Kunci Pembahasan" : "Izinkan Pembahasan";
        }
    },

    // ------------------------------------------------------------------
    // WEBHOOK GOOGLE SPREADSHEET (backend: VectorArena/apps-script/Code.gs)
    // ------------------------------------------------------------------

    renderWebhookUI() {
        if (typeof SpreadsheetService === 'undefined') return;

        const url = SpreadsheetService.getWebhookUrl();
        const input = document.getElementById('input-webhook-url');
        const badge = document.getElementById('admin-webhook-badge');
        const hint = document.getElementById('admin-webhook-hint');

        // Jangan timpa apa yang sedang diketik guru.
        if (input && document.activeElement !== input) input.value = url;

        if (badge) {
            badge.textContent = url ? (url.endsWith('/exec') ? 'Terpasang' : 'Periksa URL') : 'Belum diatur';
            badge.className = url ? 'edu-badge edu-badge-green' : 'edu-badge edu-badge-blue';
        }
        if (hint) {
            hint.textContent = url
                ? 'Status ujian dibuka/ditutup juga dikirim ke server, sehingga berlaku untuk semua perangkat siswa.'
                : 'Nilai siswa tersimpan lokal walau webhook kosong. Isi webhook supaya hasil masuk ke Google Spreadsheet.';
        }
    },

    saveWebhookUrl() {
        const input = document.getElementById('input-webhook-url');
        if (!input) return;
        const url = String(input.value || '').trim();

        if (url && !this._isAllowedWebhookUrl(url)) {
            Utils.showToast('URL tidak valid. Tempel URL Web App Apps Script (https://script.google.com/macros/s/.../exec).', false);
            return;
        }

        localStorage.setItem(CONFIG.STORAGE_KEYS.WEBHOOK, url);
        this.renderWebhookUI();
        Utils.showToast(url ? 'URL webhook disimpan di perangkat ini.' : 'URL webhook dikosongkan.');
    },

    // Hanya URL Apps Script resmi yang boleh disimpan, supaya nilai siswa tidak
    // bisa diarahkan ke server pihak ketiga. Pengecualian diberikan untuk
    // localhost/loopback karena itu satu-satunya alamat yang dipakai saat
    // pengujian lokal, dan tidak mungkin membocorkan data ke luar perangkat.
    _isAllowedWebhookUrl(url) {
        if (/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(\?|$)/.test(url)) return true;
        if (/^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?\//.test(url)) return true;
        return false;
    },

    clearWebhookUrl() {
        const input = document.getElementById('input-webhook-url');
        if (input) input.value = '';
        localStorage.removeItem(CONFIG.STORAGE_KEYS.WEBHOOK);
        this.renderWebhookUI();
        Utils.showToast('URL webhook dihapus. Aplikasi kembali ke mode mandiri (data lokal).');
    },

    async testWebhook() {
        if (typeof SpreadsheetService === 'undefined') return;
        const result = await SpreadsheetService.testConnection();
        Utils.showToast(result.message, result.ok);
        SpreadsheetService.updateConnectionIndicator(result.ok);
    },

    async syncFromServer() {
        if (typeof SpreadsheetService === 'undefined') return;
        const changed = await SpreadsheetService.syncExamConfig(true);
        if (changed) this.updateExamConfigUI();
    },

    clearAllRecords() {
        if (!confirm("PERINGATAN: Apakah Anda yakin ingin mereset seluruh data riwayat ujian dan klasemen siswa? Tindakan ini tidak dapat dibatalkan.")) {
            return;
        }
        State.leaderboardRecords = [];
        State.ipLockRegistry = {};
        State.save();
        this.renderAdminStats();
        LeaderboardModule.renderAll();
        ExamModule.checkAndEnforceIpLockUI();
        Utils.showToast("Seluruh riwayat pengerjaan siswa berhasil dibersihkan.");
    },

    exportCsv() {
        const sorted = (typeof LeaderboardModule !== 'undefined' && LeaderboardModule.getSortedRecords)
            ? LeaderboardModule.getSortedRecords('ALL')
            : (typeof State !== 'undefined' && State.getRecords ? State.getRecords() : []);

        if (!sorted || sorted.length === 0) {
            if (typeof Utils !== 'undefined' && Utils.showToast) {
                Utils.showToast('Belum ada data nilai peserta untuk diunduh.', false);
            } else {
                alert('Belum ada data nilai peserta untuk diunduh.');
            }
            return;
        }

        const headers = [
            'Peringkat', 'Timestamp', 'IP_Address', 'Nama_Lengkap',
            'Kelas', 'No_Absen', 'Benar_Dari_25', 'Nilai_Akademik',
            'Durasi_Detik', 'Skor_Dasar', 'Bonus_Kecepatan', 'Total_Skor', 'Pelanggaran_Tab'
        ];

        const rows = sorted.map((r, idx) => [
            idx + 1,
            `"${r.timestamp || ''}"`,
            `"${r.ip || ''}"`,
            `"${(r.name || '').replace(/"/g, '""')}"`,
            `"${r.className || ''}"`,
            r.absen || 0,
            r.correctCount !== undefined ? r.correctCount : 0,
            r.academicGrade !== undefined ? r.academicGrade : 0,
            r.durationSec !== undefined ? r.durationSec : 0,
            r.baseScore !== undefined ? r.baseScore : 0,
            r.speedBonus !== undefined ? r.speedBonus : 0,
            r.totalScore !== undefined ? r.totalScore : 0,
            r.tabSwitches !== undefined ? r.tabSwitches : 0
        ]);

        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateStr = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `Rekap_Nilai_VectorArena_SMAN78_${dateStr}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (typeof Utils !== 'undefined' && Utils.showToast) {
            Utils.showToast('Rekap nilai berhasil diunduh dalam format CSV.');
        }
    }
};

if (typeof module !== 'undefined') {
    module.exports = { TeacherAdminModule };
}
