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

    // ------------------------------------------------------------------
    // GERBANG AUTENTIKASI
    // ------------------------------------------------------------------

    togglePasswordVisibility(inputId, iconId) {
        const input = document.getElementById(inputId);
        const icon = document.getElementById(iconId);
        if (!input || !icon) return;

        if (input.type === 'password') {
            input.type = 'text';
            icon.setAttribute('data-lucide', 'eye-off');
        } else {
            input.type = 'password';
            icon.setAttribute('data-lucide', 'eye');
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    openLoginModal() {
        if (State.isTeacherLoggedIn) {
            this.updateAuthUI();
            this.openAdminDashboard();
            return;
        }

        State.isAdminTriggered = true;

        if (typeof App !== 'undefined' && App.switchView) {
            App.switchView('sheet');
        } else {
            if (document.getElementById('screen-lobby')) document.getElementById('screen-lobby').classList.add('hidden');
            if (document.getElementById('screen-active-exam')) document.getElementById('screen-active-exam').classList.add('hidden');
            if (document.getElementById('screen-review')) document.getElementById('screen-review').classList.add('hidden');
            const dash = document.getElementById('view-sheet');
            if (dash) dash.classList.remove('hidden');
        }

        const gate = document.getElementById('teacher-gate-card');
        const workspace = document.getElementById('teacher-unlocked-workspace');
        if (gate) gate.classList.remove('hidden');
        if (workspace) workspace.classList.add('hidden');

        const err = document.getElementById('gate-error-msg');
        const input = document.getElementById('input-gate-pin');
        if (err) err.classList.add('hidden');
        if (input) {
            input.value = "";
            setTimeout(() => input.focus(), 50);
        }
    },

    // Kompatibilitas: dulu modal login terpisah. Sekarang gerbang PIN berada
    // langsung di dalam view-sheet, jadi cukup bersihkan pesan galat.
    closeLoginModal() {
        const err = document.getElementById('gate-error-msg');
        if (err) err.classList.add('hidden');
        const modal = document.getElementById('modal-teacher-login');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    handleGateLogin(e) {
        if (e) e.preventDefault();
        const input = document.getElementById('input-gate-pin');
        const pinVal = input ? input.value.trim() : '';
        const errEl = document.getElementById('gate-error-msg');

        if (this.verifyPin(pinVal)) {
            State.isTeacherLoggedIn = true;
            State.isAdminTriggered = true;
            try { sessionStorage.setItem(CONFIG.STORAGE_KEYS.TEACHER_SESSION, '1'); } catch (err) {}
            if (errEl) errEl.classList.add('hidden');
            this.updateAuthUI();
            Utils.showToast("Autentikasi Guru Administrator Berhasil. Selamat bertugas!");
        } else {
            if (errEl) {
                errEl.textContent = "Kode sandi administrator salah. Silakan coba kembali.";
                errEl.classList.remove('hidden');
            }
        }
    },

    handleModalLogin(e) {
        if (e) e.preventDefault();

        // Bila markup lama (modal) tidak ada, arahkan ke gerbang PIN baru.
        const modalInput = document.getElementById('input-modal-pin');
        if (!modalInput) {
            return this.handleGateLogin(e);
        }

        const pinVal = modalInput.value.trim();
        const errEl = document.getElementById('modal-teacher-error');

        if (this.verifyPin(pinVal)) {
            State.isTeacherLoggedIn = true;
            State.isAdminTriggered = true;
            try { sessionStorage.setItem(CONFIG.STORAGE_KEYS.TEACHER_SESSION, '1'); } catch (err) {}
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
        State.isAdminTriggered = false;
        try { sessionStorage.removeItem(CONFIG.STORAGE_KEYS.TEACHER_SESSION); } catch (err) {}
        const input = document.getElementById('input-gate-pin');
        if (input) input.value = "";
        const err = document.getElementById('gate-error-msg');
        if (err) err.classList.add('hidden');
        this.updateAuthUI();
        this.closeAdminDashboard();
        Utils.showToast("Sesi Administrator Guru telah ditutup & dikunci.");
    },

    changePin(e) {
        if (e) e.preventDefault();
        const curEl = document.getElementById('input-current-pin');
        const newEl = document.getElementById('input-new-pin');
        const confEl = document.getElementById('input-confirm-pin');
        const msgEl = document.getElementById('change-pin-msg');
        if (!curEl || !newEl || !confEl) return;

        const curPin = curEl.value.trim();
        const newPin = newEl.value.trim();
        const confPin = confEl.value.trim();

        if (!this.verifyPin(curPin)) {
            if (msgEl) {
                msgEl.textContent = "Kode sandi saat ini tidak cocok.";
                msgEl.className = "text-xs text-rose-600 font-semibold";
                msgEl.classList.remove('hidden');
            }
            return;
        }

        if (newPin.length < 4) {
            if (msgEl) {
                msgEl.textContent = "Kode sandi baru minimal 4 karakter.";
                msgEl.className = "text-xs text-rose-600 font-semibold";
                msgEl.classList.remove('hidden');
            }
            return;
        }

        if (newPin !== confPin) {
            if (msgEl) {
                msgEl.textContent = "Konfirmasi kode sandi baru tidak sama.";
                msgEl.className = "text-xs text-rose-600 font-semibold";
                msgEl.classList.remove('hidden');
            }
            return;
        }

        localStorage.setItem(CONFIG.STORAGE_KEYS.TEACHER_PIN, newPin);
        if (msgEl) {
            msgEl.textContent = "Kode sandi Administrator Guru berhasil diperbarui.";
            msgEl.className = "text-xs text-emerald-700 font-semibold";
            msgEl.classList.remove('hidden');
        }

        curEl.value = "";
        newEl.value = "";
        confEl.value = "";
        Utils.showToast("Kode login Guru berhasil diganti.");
    },

    updateAuthUI() {
        const triggerBtn = document.getElementById('header-btn-login-trigger');
        const adminBadge = document.getElementById('header-badge-admin-active');
        const gateCard = document.getElementById('teacher-gate-card');
        const adminWorkspace = document.getElementById('teacher-unlocked-workspace');
        const navTabSheet = document.getElementById('nav-tab-sheet');

        if (State.isTeacherLoggedIn) {
            if (triggerBtn) triggerBtn.classList.add('hidden');
            if (adminBadge) {
                adminBadge.classList.remove('hidden');
                adminBadge.classList.add('flex');
            }
            if (gateCard) gateCard.classList.add('hidden');
            if (adminWorkspace) adminWorkspace.classList.remove('hidden');
            if (navTabSheet) {
                navTabSheet.classList.remove('hidden');
                navTabSheet.classList.add('flex');
            }
            this.renderPanel();
        } else {
            if (adminBadge) {
                adminBadge.classList.add('hidden');
                adminBadge.classList.remove('flex');
            }
            if (gateCard) gateCard.classList.remove('hidden');
            if (adminWorkspace) adminWorkspace.classList.add('hidden');

            // Sembunyikan tombol & tab dari siswa kecuali mode admin terpicu.
            if (State.isAdminTriggered) {
                if (triggerBtn) triggerBtn.classList.remove('hidden');
                if (navTabSheet) {
                    navTabSheet.classList.remove('hidden');
                    navTabSheet.classList.add('flex');
                }
            } else {
                if (triggerBtn) triggerBtn.classList.add('hidden');
                if (navTabSheet) {
                    navTabSheet.classList.add('hidden');
                    navTabSheet.classList.remove('flex');
                }
            }
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    openAdminDashboard() {
        if (!State.isTeacherLoggedIn) {
            this.openLoginModal();
            return;
        }

        if (typeof App !== 'undefined' && App.switchView) {
            App.switchView('sheet');
        } else {
            if (document.getElementById('screen-lobby')) document.getElementById('screen-lobby').classList.add('hidden');
            if (document.getElementById('screen-active-exam')) document.getElementById('screen-active-exam').classList.add('hidden');
            if (document.getElementById('screen-review')) document.getElementById('screen-review').classList.add('hidden');
            const dash = document.getElementById('view-sheet');
            if (dash) dash.classList.remove('hidden');
        }
        this.renderPanel();
    },

    closeAdminDashboard() {
        if (typeof App !== 'undefined' && App.switchView) {
            App.switchView('exam');
        } else {
            const dash = document.getElementById('view-sheet');
            if (dash) dash.classList.add('hidden');
            if (document.getElementById('screen-lobby')) document.getElementById('screen-lobby').classList.remove('hidden');
        }
        if (typeof LeaderboardModule !== 'undefined') LeaderboardModule.renderAll();
    },

    switchSubTab(subTabName) {
        State.activeAdminSubTab = subTabName;
        const tabs = ['ctrl', 'students', 'stats', 'config'];
        tabs.forEach(t => {
            const btn = document.getElementById(`admin-subtab-btn-${t}`);
            const content = document.getElementById(`admin-subtab-content-${t}`);
            if (!btn && !content) return;
            if (t === subTabName) {
                if (btn) btn.className = "px-3 py-1.5 rounded-md font-bold bg-indigo-900 text-white shadow-sm transition";
                if (content) content.classList.remove('hidden');
            } else {
                if (btn) btn.className = "px-3 py-1.5 rounded-md font-medium text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5";
                if (content) content.classList.add('hidden');
            }
        });

        if (subTabName === 'students') this.renderStudentManagementTable();
        if (subTabName === 'stats') {
            this.renderClassRecapTable();
            this.renderHardestQuestionsList();
            this.renderAdminBankList();
        }
        if (subTabName === 'config') this.updateWebhookBadge();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    // ------------------------------------------------------------------
    // SAKLAR STATUS UJIAN
    // ------------------------------------------------------------------

    // Alias gaya HydroArena.
    toggleExamStatus() {
        return this.toggleExamOpen();
    },

    toggleReviewStatus() {
        return this.toggleAllowReview();
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

        const examDesc = document.getElementById('ctrl-exam-status-desc');
        const reviewDesc = document.getElementById('ctrl-review-status-desc');
        const metricExam = document.getElementById('metric-exam-status-text');
        const btnToggleExam = document.getElementById('btn-toggle-exam-status');
        const btnToggleReview = document.getElementById('btn-toggle-review-status');

        if (examDesc) {
            examDesc.textContent = State.examConfig.isOpen
                ? 'Status saat ini: Pendaftaran TERBUKA.'
                : 'Status saat ini: Pendaftaran DITUTUP.';
        }
        if (reviewDesc) {
            reviewDesc.textContent = State.examConfig.allowReview
                ? 'Status: DIBUKA untuk siswa.'
                : 'Status: DIKUNCI untuk siswa.';
        }
        if (metricExam) {
            metricExam.textContent = State.examConfig.isOpen ? 'TERBUKA' : 'DITUTUP';
            metricExam.className = State.examConfig.isOpen
                ? "text-lg font-mono font-bold text-emerald-700"
                : "text-lg font-mono font-bold text-rose-700";
        }
        const adminExamBadge = document.getElementById('admin-exam-status-badge');
        if (adminExamBadge) {
            adminExamBadge.textContent = State.examConfig.isOpen ? 'TERBUKA (AKTIF)' : 'TERTUTUP (NONAKTIF)';
            adminExamBadge.className = State.examConfig.isOpen
                ? 'edu-badge edu-badge-green text-[10px]'
                : 'edu-badge edu-badge-rose text-[10px]';
        }
        if (btnToggleExam) {
            btnToggleExam.textContent = State.examConfig.isOpen ? "Tutup Pendaftaran" : "Buka Pendaftaran";
            btnToggleExam.className = State.examConfig.isOpen
                ? "edu-btn-secondary px-3.5 py-2 text-xs font-semibold shrink-0 text-rose-700 border-rose-200"
                : "edu-btn-secondary px-3.5 py-2 text-xs font-semibold shrink-0 text-emerald-700 border-emerald-200";
        }
        if (btnToggleReview) {
            btnToggleReview.textContent = State.examConfig.allowReview ? "Kunci Pembahasan" : "Izinkan Pembahasan";
            btnToggleReview.className = State.examConfig.allowReview
                ? "edu-btn-secondary px-3.5 py-2 text-xs font-semibold shrink-0 text-amber-700 border-amber-200"
                : "edu-btn-secondary px-3.5 py-2 text-xs font-semibold shrink-0 text-emerald-700 border-emerald-200";
        }
    },

    // Alias lama: beberapa pemanggil memakai nama renderAdminStats.
    renderAdminStats() {
        this.renderPanel();
    },

    // ------------------------------------------------------------------
    // RINGKASAN METRIK
    // ------------------------------------------------------------------

    renderPanel() {
        const records = (typeof State !== 'undefined' && Array.isArray(State.leaderboardRecords)) ? State.leaderboardRecords : [];
        const total = records.length;
        const totalEl = document.getElementById('metric-total-students');
        const avgEl = document.getElementById('metric-avg-grade');
        const highEl = document.getElementById('metric-highest-score');
        const highStudentEl = document.getElementById('metric-highest-student');
        const badgeCount = document.getElementById('admin-badge-student-count');

        if (totalEl) totalEl.textContent = total;
        if (badgeCount) badgeCount.textContent = total;

        if (total > 0) {
            const sumGrades = records.reduce((acc, r) => acc + (Number(r.academicGrade) || 0), 0);
            if (avgEl) avgEl.textContent = (sumGrades / total).toFixed(1);

            const sorted = [...records].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
            const top = sorted[0];
            if (highEl) highEl.textContent = Utils.formatNumber(top.totalScore);
            if (highStudentEl) highStudentEl.textContent = `${top.name} (${top.className})`;
        } else {
            if (avgEl) avgEl.textContent = "0.0";
            if (highEl) highEl.textContent = "0";
            if (highStudentEl) highStudentEl.textContent = "Belum ada peserta";
        }

        if (typeof App !== 'undefined' && App.applyExamConfigUI) App.applyExamConfigUI();

        if (State.activeAdminSubTab === 'students') this.renderStudentManagementTable();
        if (State.activeAdminSubTab === 'stats') {
            this.renderClassRecapTable();
            this.renderHardestQuestionsList();
            this.renderAdminBankList();
        }
        if (State.activeAdminSubTab === 'config') this.updateWebhookBadge();
    },

    // ------------------------------------------------------------------
    // MANAJEMEN SISWA
    // ------------------------------------------------------------------

    renderStudentManagementTable() {
        const classFilterEl = document.getElementById('admin-student-class-filter');
        const searchEl = document.getElementById('admin-student-search');
        const classFilter = (classFilterEl && classFilterEl.value) || 'ALL';
        const searchQuery = ((searchEl && searchEl.value) || '').toLowerCase().trim();
        const tbody = document.getElementById('admin-students-table-body');
        const totalBadge = document.getElementById('admin-table-total-count');
        if (!tbody) return;

        const records = Array.isArray(State.leaderboardRecords) ? State.leaderboardRecords : [];
        const filtered = records.filter(r => {
            const matchClass = classFilter === 'ALL' || r.className === classFilter;
            const matchSearch = !searchQuery ||
                (r.name && r.name.toLowerCase().includes(searchQuery)) ||
                (r.className && r.className.toLowerCase().includes(searchQuery)) ||
                (r.ip && String(r.ip).toLowerCase().includes(searchQuery)) ||
                (String(r.absen) === searchQuery);
            return matchClass && matchSearch;
        });

        if (totalBadge) totalBadge.textContent = `${filtered.length} Siswa`;

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="py-8 text-center text-slate-500 bg-slate-50 text-xs">
                        Tidak ditemukan data siswa yang cocok dengan filter.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map((r, idx) => {
            const isIpLocked = !!(State.ipLockRegistry && State.ipLockRegistry[r.ip]);
            const cheatCount = r.tabSwitches || 0;

            return `
                <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100 text-xs">
                    <td class="py-3 px-3 font-mono text-slate-500 font-semibold">${idx + 1}</td>
                    <td class="py-3 px-3 font-bold text-slate-900">${Utils.escapeHtml(r.name)}</td>
                    <td class="py-3 px-3 text-center font-mono">
                        <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-semibold">${Utils.escapeHtml(r.className)}</span>
                        <span class="text-slate-500 ml-1">#${String(r.absen).padStart(2, '0')}</span>
                    </td>
                    <td class="py-3 px-3 text-center font-mono text-[11px] text-slate-600">
                        <span>${Utils.escapeHtml(r.ip)}</span>
                        <span class="ml-1 text-[10px] font-semibold ${isIpLocked ? 'text-amber-700' : 'text-slate-400'}">(${isIpLocked ? 'Terkunci' : 'Bebas'})</span>
                    </td>
                    <td class="py-3 px-3 text-center font-mono">
                        <span class="text-emerald-700 font-bold">${r.correctCount}/${CONFIG.TOTAL_QUESTIONS}</span>
                        <span class="text-slate-600 ml-1">(${r.academicGrade})</span>
                    </td>
                    <td class="py-3 px-3 text-right font-mono font-bold text-indigo-900">
                        ${Utils.formatNumber(r.totalScore)}
                    </td>
                    <td class="py-3 px-3 text-center font-mono text-[11px]">
                        <span class="${cheatCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}">${cheatCount} switch</span>
                    </td>
                    <td class="py-3 px-3 text-center">
                        <div class="inline-flex items-center gap-1.5">
                            <button type="button" onclick="TeacherAdminModule.unlockStudentIp('${Utils.escapeHtml(r.ip)}', '${Utils.escapeHtml(r.name)}')" class="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-[11px] font-semibold transition flex items-center gap-1" title="Buka kunci IP siswa ini">
                                <i data-lucide="unlock" class="w-3 h-3 text-amber-700"></i>
                                <span>Buka IP</span>
                            </button>
                            <button type="button" onclick="TeacherAdminModule.deleteStudentRecord('${Utils.escapeHtml(r.id)}', '${Utils.escapeHtml(r.name)}')" class="px-2 py-1 rounded bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-500 hover:text-rose-600 text-[11px] transition" title="Hapus record siswa">
                                <i data-lucide="trash" class="w-3 h-3"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    unlockStudentIp(ip, studentName) {
        delete State.ipLockRegistry[ip];
        State.leaderboardRecords = State.leaderboardRecords.filter(r => r.ip !== ip);
        State.save();
        this._renderAllViews();
        Utils.showToast(`Kunci IP untuk ${studentName} (${ip}) dibuka. Siswa dapat mengulang ujian.`);
    },

    deleteStudentRecord(recordId, studentName) {
        State.leaderboardRecords = State.leaderboardRecords.filter(r => r.id !== recordId);
        State.save();
        this._renderAllViews();
        Utils.showToast(`Data peserta ${studentName} telah dihapus.`);
    },

    _renderAllViews() {
        if (typeof App !== 'undefined' && App.renderAllViews) {
            App.renderAllViews();
            return;
        }
        if (typeof LeaderboardModule !== 'undefined') LeaderboardModule.renderAll();
        this.renderPanel();
    },

    // ------------------------------------------------------------------
    // REKAP & ANALISIS
    // ------------------------------------------------------------------

    renderClassRecapTable() {
        const tbody = document.getElementById('admin-class-recap-body');
        if (!tbody) return;

        const records = Array.isArray(State.leaderboardRecords) ? State.leaderboardRecords : [];

        tbody.innerHTML = CONFIG.CLASSES.map(c => {
            const inClass = records.filter(r => r.className === c);
            const count = inClass.length;
            let avg = "0.0";
            let passed = 0;
            let maxScore = 0;

            if (count > 0) {
                const sum = inClass.reduce((acc, r) => acc + (Number(r.academicGrade) || 0), 0);
                avg = (sum / count).toFixed(1);
                passed = inClass.filter(r => (Number(r.academicGrade) || 0) >= CONFIG.ACADEMIC_KKM).length;
                maxScore = Math.max(...inClass.map(r => r.totalScore || 0));
            }

            const passPct = count > 0 ? Math.round((passed / count) * 100) : 0;

            return `
                <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100 text-xs">
                    <td class="py-2.5 px-3 font-bold text-slate-900 font-mono">${c}</td>
                    <td class="py-2.5 px-3 text-center font-mono text-slate-700">${count} siswa</td>
                    <td class="py-2.5 px-3 text-center font-mono font-bold ${Number(avg) >= CONFIG.ACADEMIC_KKM ? 'text-emerald-700' : 'text-amber-700'}">${avg}</td>
                    <td class="py-2.5 px-3 text-center font-mono text-slate-700">
                        ${passed}/${count} <span class="text-slate-500 text-[11px]">(${passPct}%)</span>
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono font-bold text-indigo-900">
                        ${Utils.formatNumber(maxScore)}
                    </td>
                </tr>
            `;
        }).join('');
    },

    renderHardestQuestionsList() {
        const container = document.getElementById('admin-diagnostic-hardest-list');
        if (!container) return;

        const source = (typeof CURATED_25_QUESTIONS !== 'undefined' && CURATED_25_QUESTIONS.length > 0)
            ? CURATED_25_QUESTIONS
            : ((typeof QUESTIONS_BANK !== 'undefined') ? QUESTIONS_BANK : []);
        const records = Array.isArray(State.leaderboardRecords) ? State.leaderboardRecords : [];

        const stats = source.map(q => {
            let attempts = 0;
            let correct = 0;
            records.forEach(r => {
                try {
                    const detail = JSON.parse(r.answersJson || "{}");
                    if (detail[q.id]) {
                        attempts += 1;
                        if (detail[q.id].isCorrect) correct += 1;
                    }
                } catch (e) {}
            });
            const pct = attempts > 0 ? Math.round((correct / attempts) * 100) : 100;
            return { ...q, attempts, correct, pct };
        });

        const hardest = [...stats].sort((a, b) => a.pct - b.pct).slice(0, 8);

        container.innerHTML = hardest.map(q => {
            return `
                <div class="edu-panel p-3 space-y-1 text-xs">
                    <div class="flex items-center justify-between font-mono gap-2">
                        <span class="font-bold text-slate-800 truncate">#${q.id} • ${q.zoneName || q.topic || '-'}</span>
                        <span class="font-bold tabular-nums shrink-0 ${q.pct < 50 ? 'text-rose-600' : q.pct < 70 ? 'text-amber-600' : 'text-emerald-600'}">${q.pct}% Benar</span>
                    </div>
                    <div class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div class="h-full ${q.pct >= 70 ? 'bg-emerald-600' : q.pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}" style="width: ${q.pct}%"></div>
                    </div>
                    <div class="text-[11px] text-slate-500 flex justify-between font-medium">
                        <span>Benar: ${q.correct} dari ${q.attempts} peserta</span>
                        <span>Tingkat: ${q.pct < 50 ? 'Sukar' : q.pct < 75 ? 'Sedang' : 'Mudah'}</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderAdminBankList() {
        const container = document.getElementById('admin-bank-list-tbody');
        if (!container) return;

        const bank = (typeof QUESTIONS_BANK !== 'undefined' && QUESTIONS_BANK.length > 0)
            ? QUESTIONS_BANK
            : ((typeof CURATED_25_QUESTIONS !== 'undefined') ? CURATED_25_QUESTIONS : []);

        const DIFFICULTY_STYLE = {
            1: 'bg-emerald-50 text-emerald-800 border-emerald-300',
            2: 'bg-amber-50 text-amber-800 border-amber-300',
            3: 'bg-rose-50 text-rose-800 border-rose-300',
            4: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-300'
        };

        container.innerHTML = bank.map((q) => {
            const stem = q.question || q.questionText || '';
            const answer = q.correctAnswer !== undefined
                ? q.correctAnswer
                : ((q.options && q.correctIndex !== undefined) ? q.options[q.correctIndex] : '-');
            const level = Number(q.difficulty);
            const style = DIFFICULTY_STYLE[level] || 'bg-slate-100 text-slate-700 border-slate-300';

            return `
                <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs">
                    <td class="p-3 font-mono font-bold text-slate-600">#${Utils.escapeHtml(q.id)}</td>
                    <td class="p-3 text-slate-700">Zona ${Utils.escapeHtml(String(q.zoneId))} • ${Utils.escapeHtml(q.subtopic || q.bloom || q.zoneName || '-')}</td>
                    <td class="p-3 text-slate-900 font-medium truncate max-w-xs">${Utils.escapeHtml(stem.slice(0, 70))}${stem.length > 70 ? '…' : ''}</td>
                    <td class="p-3 font-mono text-center">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${style}">${Utils.escapeHtml(Utils.difficultyLabel(q.difficulty))}</span>
                    </td>
                    <td class="p-3 text-emerald-700 font-mono font-bold">${Utils.escapeHtml(answer)}</td>
                    <td class="p-3 text-center">
                        <span class="px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-800 border border-indigo-200">
                            PUBLISHED
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    },

    // ------------------------------------------------------------------
    // DATA SIMULASI & PEMBERSIHAN
    // ------------------------------------------------------------------

    seedSampleData() {
        const samples = [
            { name: "Muhammad Zaidan Al-Farisi", className: "X A", absen: 3, correct: 22, durationSec: 1550 },
            { name: "Annisa Nabila Rahma", className: "X B", absen: 14, correct: 23, durationSec: 1800 },
            { name: "Rizky Dwi Pratama", className: "X C", absen: 7, correct: 24, durationSec: 2100 },
            { name: "Siti Sarah Nurhaliza", className: "X D", absen: 21, correct: 23, durationSec: 1680 },
            { name: "Ahmad Rayhan Kusuma", className: "X E", absen: 5, correct: 25, durationSec: 1950 },
            { name: "Fathia Zahra Azzahra", className: "X F", absen: 18, correct: 22, durationSec: 1820 },
            { name: "Bima Arya Wicaksana", className: "X G", absen: 8, correct: 22, durationSec: 1620 },
            { name: "Clarissa Aurelia Putri", className: "X H", absen: 19, correct: 24, durationSec: 2200 },
            { name: "Daffa Ibnu Hafidz", className: "X I", absen: 11, correct: 25, durationSec: 1750 },
            { name: "Kayla Salsabila Azka", className: "X K", absen: 16, correct: 23, durationSec: 2050 }
        ];

        const source = (typeof CURATED_25_QUESTIONS !== 'undefined' && CURATED_25_QUESTIONS.length > 0)
            ? CURATED_25_QUESTIONS
            : ((typeof QUESTIONS_BANK !== 'undefined') ? QUESTIONS_BANK.slice(0, CONFIG.TOTAL_QUESTIONS) : []);

        State.leaderboardRecords = [];
        State.ipLockRegistry = {};

        samples.forEach(s => {
            const detailMap = {};
            source.forEach((q, idx) => {
                const isCorr = idx < s.correct;
                const options = q.options || [];
                const correctText = q.correctAnswer !== undefined
                    ? q.correctAnswer
                    : (q.correctIndex !== undefined ? options[q.correctIndex] : (options[0] || ''));
                const correctIdx = options.indexOf(correctText);
                const wrongText = options.length > 1
                    ? options[(correctIdx + 1) % options.length]
                    : correctText;
                detailMap[q.id] = {
                    isCorrect: isCorr,
                    chosenText: isCorr ? correctText : wrongText,
                    correctText
                };
            });

            const remSec = CONFIG.EXAM_DURATION_SECONDS - s.durationSec;
            const baseScore = s.correct * CONFIG.BASE_POINTS_PER_QUESTION;
            const speedBonus = Math.round((s.correct / CONFIG.TOTAL_QUESTIONS) * (remSec / CONFIG.EXAM_DURATION_SECONDS) * CONFIG.MAX_SPEED_BONUS);

            const rec = {
                id: `sim_${s.className.replace(/\s+/g, '')}_${s.absen}`,
                timestamp: new Date().toISOString(),
                ip: `103.119.${s.className.charCodeAt(2)}.${s.absen}`,
                name: s.name,
                className: s.className,
                absen: s.absen,
                mode: 'ranked',
                totalQuestions: CONFIG.TOTAL_QUESTIONS,
                correctCount: s.correct,
                academicGrade: Number(((s.correct / CONFIG.TOTAL_QUESTIONS) * 100).toFixed(1)),
                durationSec: s.durationSec,
                baseScore: baseScore,
                speedBonus: speedBonus,
                totalScore: baseScore + speedBonus,
                tabSwitches: 0,
                answersJson: JSON.stringify(detailMap)
            };

            State.leaderboardRecords.push(rec);
            State.ipLockRegistry[rec.ip] = rec;
        });

        State.leaderboardRecords.sort((a, b) => {
            if (a.className !== b.className) return a.className.localeCompare(b.className);
            return a.absen - b.absen;
        });

        State.save();
        this._renderAllViews();
        Utils.showToast("10 data simulasi dimuat di browser (belum dikirim ke spreadsheet).", true);
    },

    unlockMyTeacherIp() {
        delete State.ipLockRegistry[State.clientIpAddress];
        State.leaderboardRecords = State.leaderboardRecords.filter(r => r.ip !== State.clientIpAddress);
        State.save();
        if (typeof ExamModule !== 'undefined') {
            ExamModule.clearActiveSession();
            ExamModule.checkAndEnforceIpLockUI();
        }
        this._renderAllViews();
        Utils.showToast(`Kunci IP perangkat pengawas (${State.clientIpAddress}) telah dibuka kembali.`);
    },

    openResetDataModal() {
        const m = document.getElementById('modal-confirm-reset');
        if (m) {
            m.classList.remove('hidden');
            m.classList.add('flex');
        }
    },

    closeResetDataModal() {
        const m = document.getElementById('modal-confirm-reset');
        if (m) {
            m.classList.add('hidden');
            m.classList.remove('flex');
        }
    },

    confirmResetAllData() {
        this.closeResetDataModal();
        State.leaderboardRecords = [];
        State.ipLockRegistry = {};
        State.save();
        if (typeof ExamModule !== 'undefined') {
            ExamModule.clearActiveSession();
            ExamModule.checkAndEnforceIpLockUI();
        }
        this._renderAllViews();
        Utils.showToast("Data klasemen lokal telah berhasil dibersihkan.");
    },

    // Kompatibilitas: tombol lama memakai confirm() bawaan browser.
    clearAllRecords() {
        if (typeof confirm === 'function' && !confirm("PERINGATAN: Apakah Anda yakin ingin mereset seluruh data riwayat ujian dan klasemen siswa? Tindakan ini tidak dapat dibatalkan.")) {
            return;
        }
        this.confirmResetAllData();
    },

    // ------------------------------------------------------------------
    // WEBHOOK GOOGLE SPREADSHEET (backend: VectorArena/apps-script/Code.gs)
    // ------------------------------------------------------------------

    renderWebhookUI() {
        if (typeof SpreadsheetService === 'undefined') return;

        const url = SpreadsheetService.getWebhookUrl();
        const input = document.getElementById('input-webhook-url');
        const hint = document.getElementById('admin-webhook-hint');

        // Jangan timpa apa yang sedang diketik guru.
        if (input && document.activeElement !== input) input.value = url;

        this.updateWebhookBadge();

        if (hint) {
            hint.textContent = url
                ? 'Status ujian dibuka/ditutup juga dikirim ke server, sehingga berlaku untuk semua perangkat siswa.'
                : 'Nilai siswa tersimpan lokal walau webhook kosong. Isi webhook supaya hasil masuk ke Google Spreadsheet.';
        }
    },

    updateWebhookBadge() {
        const badge = document.getElementById('webhook-status-badge');
        const adminBadge = document.getElementById('admin-webhook-badge');
        if (!badge && !adminBadge) return;

        let url = '';
        if (typeof SpreadsheetService !== 'undefined') {
            url = SpreadsheetService.getWebhookUrl();
        } else {
            url = localStorage.getItem(CONFIG.STORAGE_KEYS.WEBHOOK) || CONFIG.DEFAULT_WEBHOOK_URL || '';
        }

        if (url && this._isAllowedWebhookUrl(url)) {
            if (badge) {
                badge.className = "edu-badge edu-badge-green text-[10px]";
                badge.textContent = "Terhubung (/exec)";
            }
            if (adminBadge) {
                adminBadge.className = "edu-badge edu-badge-green text-[10px]";
                adminBadge.textContent = "Terpasang";
            }
        } else if (url) {
            if (badge) {
                badge.className = "edu-badge edu-badge-rose text-[10px]";
                badge.textContent = "Periksa URL";
            }
            if (adminBadge) {
                adminBadge.className = "edu-badge edu-badge-rose text-[10px]";
                adminBadge.textContent = "Periksa URL";
            }
        } else {
            if (badge) {
                badge.className = "edu-badge edu-badge-amber text-[10px]";
                badge.textContent = "Belum Terpasang";
            }
            if (adminBadge) {
                adminBadge.className = "edu-badge edu-badge-amber text-[10px]";
                adminBadge.textContent = "Belum Terpasang";
            }
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

        // Mengosongkan kolom tidak mematikan integrasi bila config.js membawa
        // URL bawaan: getWebhookUrl() akan memakai bawaan itu. Pesannya harus
        // jujur soal apa yang sebenarnya terjadi.
        if (url) {
            Utils.showToast('URL webhook disimpan di perangkat ini.');
        } else if (CONFIG.DEFAULT_WEBHOOK_URL) {
            Utils.showToast('Kolom dikosongkan: aplikasi memakai URL bawaan dari config.js.');
        } else {
            Utils.showToast('URL webhook dikosongkan. Aplikasi kembali ke mode mandiri (data lokal).');
        }
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
        Utils.showToast(CONFIG.DEFAULT_WEBHOOK_URL
            ? 'URL kembali ke bawaan dari config.js.'
            : 'URL webhook dihapus. Aplikasi kembali ke mode mandiri (data lokal).');
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

    async syncAllToSpreadsheet() {
        if (typeof SpreadsheetService === 'undefined') {
            Utils.showToast("Layanan spreadsheet tidak tersedia.", false);
            return;
        }
        const webhookUrl = SpreadsheetService.getWebhookUrl();
        if (!webhookUrl || !webhookUrl.startsWith("http")) {
            Utils.showToast("Masukkan URL Web App Apps Script (/exec) terlebih dahulu!", false);
            return;
        }

        const records = Array.isArray(State.leaderboardRecords) ? State.leaderboardRecords : [];
        if (records.length === 0) {
            Utils.showToast("Tidak ada data murid lokal untuk dikirim.", false);
            return;
        }

        Utils.showToast(`Mengirim ${records.length} data murid ke Google Spreadsheet...`);
        let success = 0;
        for (const rec of records) {
            try {
                const result = await SpreadsheetService.pushRecord(rec);
                if (result && result.status === 'ok') success++;
            } catch (e) {
                console.error("Gagal sync record:", rec.name, e);
            }
        }
        Utils.showToast(`Selesai! ${success} data murid terkirim ke spreadsheet Anda.`);
    },

    // ------------------------------------------------------------------
    // EKSPOR
    // ------------------------------------------------------------------

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
    },

    printReport() {
        window.print();
    }
};

if (typeof module !== 'undefined') {
    module.exports = { TeacherAdminModule };
}