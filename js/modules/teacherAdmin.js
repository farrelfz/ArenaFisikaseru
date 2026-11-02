// ==========================================================================
// HYDROARENA SMAN 78 - MODUL ADMINISTRATOR UTAMA (GURU CONTROLLER)
// ==========================================================================

const TeacherAdminModule = {
    getTeacherPin() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.TEACHER_PIN) || CONFIG.DEFAULT_TEACHER_PIN;
    },

    verifyPin(inputPin) {
        return String(inputPin).trim() === String(this.getTeacherPin()).trim();
    },

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
        lucide.createIcons();
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

    handleGateLogin(e) {
        if (e) e.preventDefault();
        const pinVal = document.getElementById('input-gate-pin').value.trim();
        const errEl = document.getElementById('gate-error-msg');

        if (this.verifyPin(pinVal)) {
            State.isTeacherLoggedIn = true;
            sessionStorage.setItem(CONFIG.STORAGE_KEYS.TEACHER_SESSION, '1');
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
        const pinVal = document.getElementById('input-modal-pin').value.trim();
        const errEl = document.getElementById('modal-teacher-error');

        if (this.verifyPin(pinVal)) {
            State.isTeacherLoggedIn = true;
            sessionStorage.setItem(CONFIG.STORAGE_KEYS.TEACHER_SESSION, '1');
            this.closeLoginModal();
            this.updateAuthUI();
            App.switchView('sheet');
            Utils.showToast("Autentikasi Administrator Berhasil. Membuka Panel Guru.");
        } else {
            if (errEl) {
                errEl.textContent = "Kode login salah. Periksa kembali PIN Anda.";
                errEl.classList.remove('hidden');
            }
        }
    },

    logout() {
        State.isTeacherLoggedIn = false;
        State.isAdminTriggered = false;
        sessionStorage.removeItem(CONFIG.STORAGE_KEYS.TEACHER_SESSION);
        this.updateAuthUI();
        App.switchView('exam');
        Utils.showToast("Sesi Administrator Guru telah ditutup & dikunci.");
    },

    changePin(e) {
        if (e) e.preventDefault();
        const curPin = document.getElementById('input-current-pin').value.trim();
        const newPin = document.getElementById('input-new-pin').value.trim();
        const confPin = document.getElementById('input-confirm-pin').value.trim();
        const msgEl = document.getElementById('change-pin-msg');

        if (!this.verifyPin(curPin)) {
            msgEl.textContent = "Kode sandi saat ini tidak cocok.";
            msgEl.className = "text-xs text-rose-600 font-semibold";
            msgEl.classList.remove('hidden');
            return;
        }

        if (newPin.length < 4) {
            msgEl.textContent = "Kode sandi baru minimal 4 karakter.";
            msgEl.className = "text-xs text-rose-600 font-semibold";
            msgEl.classList.remove('hidden');
            return;
        }

        if (newPin !== confPin) {
            msgEl.textContent = "Konfirmasi kode sandi baru tidak sama.";
            msgEl.className = "text-xs text-rose-600 font-semibold";
            msgEl.classList.remove('hidden');
            return;
        }

        localStorage.setItem(CONFIG.STORAGE_KEYS.TEACHER_PIN, newPin);
        msgEl.textContent = "Kode sandi Administrator Guru berhasil diperbarui.";
        msgEl.className = "text-xs text-emerald-700 font-semibold";
        msgEl.classList.remove('hidden');

        document.getElementById('input-current-pin').value = "";
        document.getElementById('input-new-pin').value = "";
        document.getElementById('input-confirm-pin').value = "";
        Utils.showToast("Kode login Guru berhasil diganti.");
    },

    updateAuthUI() {
        const triggerBtn = document.getElementById('header-btn-login-trigger');
        const adminBadge = document.getElementById('header-badge-admin-active');
        const gateCard = document.getElementById('teacher-gate-card');
        const adminWorkspace = document.getElementById('teacher-unlocked-workspace');
        const navAdminIcon = document.getElementById('nav-admin-icon');
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
            if (navAdminIcon) {
                navAdminIcon.setAttribute('data-lucide', 'shield-check');
                navAdminIcon.className = "w-3.5 h-3.5 text-emerald-600";
            }
            this.renderPanel();
        } else {
            if (adminBadge) {
                adminBadge.classList.add('hidden');
                adminBadge.classList.remove('flex');
            }
            if (gateCard) gateCard.classList.remove('hidden');
            if (adminWorkspace) adminWorkspace.classList.add('hidden');
            if (navAdminIcon) {
                navAdminIcon.setAttribute('data-lucide', 'lock');
                navAdminIcon.className = "w-3.5 h-3.5 text-amber-600";
            }

            // Sembunyikan tombol & tab dari siswa kecuali mode admin terpicu (?admin=1 atau 3x klik logo)
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
        lucide.createIcons();
    },

    switchSubTab(subTabName) {
        State.activeAdminSubTab = subTabName;
        const tabs = ['ctrl', 'students', 'stats', 'config'];
        tabs.forEach(t => {
            const btn = document.getElementById(`admin-subtab-btn-${t}`);
            const content = document.getElementById(`admin-subtab-content-${t}`);
            if (t === subTabName) {
                if (btn) btn.className = "px-3 py-1.5 rounded-md font-bold bg-blue-800 text-white shadow-sm transition";
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
        }
        lucide.createIcons();
    },

    async toggleExamStatus() {
        const willOpen = !State.examConfig.isOpen;
        State.examConfig.isOpen = willOpen;
        State.save();
        App.applyExamConfigUI();
        Utils.showToast(`Status Ujian diubah: ${willOpen ? 'DIBUKA MANUAL' : 'DITUTUP MANUAL'}`);

        // Broadcast langsung ke Google Spreadsheet Webhook via GET query parameter (Bebas CORS!)
        const webhookUrl = localStorage.getItem(CONFIG.STORAGE_KEYS.WEBHOOK) || CONFIG.DEFAULT_WEBHOOK_URL;
        if (webhookUrl && webhookUrl.startsWith("http")) {
            try {
                const target = `${webhookUrl}?action=setExamConfig&isOpen=${willOpen}`;
                await fetch(target, { cache: 'no-store' });
            } catch (err) {
                console.warn("Gagal sinkronisasi status ujian ke server:", err);
            }
        }
    },

    async resetToAutoSchedule() {
        State.examConfig.overrideMode = 'auto';
        State.save();
        App.applyExamConfigUI();
        Utils.showToast("Pengaturan ujian dikembalikan ke JADWAL OTOMATIS (Rabu 06:30 s.d. Jumat 16:00 WIB).", true);

        const webhookUrl = localStorage.getItem(CONFIG.STORAGE_KEYS.WEBHOOK) || CONFIG.DEFAULT_WEBHOOK_URL;
        if (webhookUrl && webhookUrl.startsWith("http")) {
            try {
                const target = `${webhookUrl}?action=setExamConfig&override=auto`;
                await fetch(target, { cache: 'no-store' });
            } catch (err) {
                console.warn("Gagal sinkronisasi mode jadwal otomatis ke server:", err);
            }
        }
    },

    async toggleReviewStatus() {
        const willAllow = !State.examConfig.allowReview;
        State.examConfig.allowReview = willAllow;
        State.save();
        App.applyExamConfigUI();
        Utils.showToast(`Mode Pembahasan diubah: ${willAllow ? 'DIIZINKAN MANUAL' : 'DIKUNCI MANUAL'}`);

        // Broadcast langsung ke Google Spreadsheet Webhook via GET query parameter (Bebas CORS!)
        const webhookUrl = localStorage.getItem(CONFIG.STORAGE_KEYS.WEBHOOK) || CONFIG.DEFAULT_WEBHOOK_URL;
        if (webhookUrl && webhookUrl.startsWith("http")) {
            try {
                const target = `${webhookUrl}?action=setExamConfig&allowReview=${willAllow}`;
                await fetch(target, { cache: 'no-store' });
            } catch (err) {
                console.warn("Gagal sinkronisasi mode pembahasan ke server:", err);
            }
        }
    },

    async resetReviewToAutoSchedule() {
        State.examConfig.overrideReviewMode = 'auto';
        State.save();
        App.applyExamConfigUI();
        Utils.showToast("Kunci jawaban dikembalikan ke JADWAL OTOMATIS: Terbuka hari Jumat jam 16:00 WIB setelah ujian selesai.", true);

        const webhookUrl = localStorage.getItem(CONFIG.STORAGE_KEYS.WEBHOOK) || CONFIG.DEFAULT_WEBHOOK_URL;
        if (webhookUrl && webhookUrl.startsWith("http")) {
            try {
                const target = `${webhookUrl}?action=setExamConfig&overrideReview=auto`;
                await fetch(target, { cache: 'no-store' });
            } catch (err) {
                console.warn("Gagal sinkronisasi jadwal otomatis kunci jawaban ke server:", err);
            }
        }
    },

    renderPanel() {
        const total = State.leaderboardRecords.length;
        const totalEl = document.getElementById('metric-total-students');
        const avgEl = document.getElementById('metric-avg-grade');
        const highEl = document.getElementById('metric-highest-score');
        const highStudentEl = document.getElementById('metric-highest-student');
        const badgeCount = document.getElementById('admin-badge-student-count');

        if (totalEl) totalEl.textContent = total;
        if (badgeCount) badgeCount.textContent = total;

        if (total > 0) {
            const sumGrades = State.leaderboardRecords.reduce((acc, r) => acc + (Number(r.academicGrade) || 0), 0);
            const avg = (sumGrades / total).toFixed(1);
            if (avgEl) avgEl.textContent = avg;

            const sorted = [...State.leaderboardRecords].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
            const top = sorted[0];
            if (highEl) highEl.textContent = Utils.formatNumber(top.totalScore);
            if (highStudentEl) highStudentEl.textContent = `${top.name} (${top.className})`;
        } else {
            if (avgEl) avgEl.textContent = "0.0";
            if (highEl) highEl.textContent = "0";
            if (highStudentEl) highStudentEl.textContent = "Belum ada peserta";
        }

        App.applyExamConfigUI();
        if (State.activeAdminSubTab === 'students') this.renderStudentManagementTable();
        if (State.activeAdminSubTab === 'stats') {
            this.renderClassRecapTable();
            this.renderHardestQuestionsList();
        }
        if (State.activeAdminSubTab === 'config') {
            this.updateWebhookBadge();
        }
    },

    renderStudentManagementTable() {
        const classFilter = (document.getElementById('admin-student-class-filter')?.value) || 'ALL';
        const searchQuery = ((document.getElementById('admin-student-search')?.value) || '').toLowerCase().trim();
        const tbody = document.getElementById('admin-students-table-body');
        const totalBadge = document.getElementById('admin-table-total-count');
        if (!tbody) return;

        let filtered = State.leaderboardRecords.filter(r => {
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
            const isIpLocked = !!State.ipLockRegistry[r.ip];
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
                    <td class="py-3 px-3 text-right font-mono font-bold text-blue-900">
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
        lucide.createIcons();
    },

    unlockStudentIp(ip, studentName) {
        delete State.ipLockRegistry[ip];
        State.leaderboardRecords = State.leaderboardRecords.filter(r => r.ip !== ip);
        State.save();
        App.renderAllViews();
        Utils.showToast(`Kunci IP untuk ${studentName} (${ip}) dibuka. Siswa dapat mengulang ujian.`);
    },

    deleteStudentRecord(recordId, studentName) {
        State.leaderboardRecords = State.leaderboardRecords.filter(r => r.id !== recordId);
        State.save();
        App.renderAllViews();
        Utils.showToast(`Data peserta ${studentName} telah dihapus.`);
    },

    renderClassRecapTable() {
        const tbody = document.getElementById('admin-class-recap-body');
        if (!tbody) return;

        tbody.innerHTML = CONFIG.CLASSES.map(c => {
            const inClass = State.leaderboardRecords.filter(r => r.className === c);
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
                    <td class="py-2.5 px-3 text-right font-mono font-bold text-blue-900">
                        ${Utils.formatNumber(maxScore)}
                    </td>
                </tr>
            `;
        }).join('');
    },

    renderHardestQuestionsList() {
        const container = document.getElementById('admin-diagnostic-hardest-list');
        if (!container) return;

        const stats = MASTER_QUESTIONS.map(q => {
            let attempts = 0;
            let correct = 0;
            State.leaderboardRecords.forEach(r => {
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
                    <div class="flex items-center justify-between font-mono">
                        <span class="font-bold text-slate-800">#${q.id} • ${q.topic}</span>
                        <span class="font-bold tabular-nums ${q.pct < 50 ? 'text-rose-600' : q.pct < 70 ? 'text-amber-600' : 'text-emerald-600'}">${q.pct}% Benar</span>
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

    seedSampleData() {
        // Menggunakan data 10 simulasi siswa (5 Gemini 3.8 Flash + 5 DeepSeek V4.1 Flash)
        let samples = [];
        try {
            // Cek apakah ada file simulated_10_students.json
            if (typeof SIMULATED_10_STUDENTS !== 'undefined') {
                samples = SIMULATED_10_STUDENTS;
            }
        } catch (e) {}

        if (!samples || samples.length === 0) {
            // Default 10 data siswa (5 Gemini + 5 DeepSeek) lintas rombel XI A - XI F
            samples = [
                { name: "Muhammad Zaidan Al-Farisi", className: "XI A", absen: 3, correct: 22, durationSec: 1550, model: "ag/gemini-3.8-flash" },
                { name: "Annisa Nabila Rahma", className: "XI A", absen: 14, correct: 23, durationSec: 1800, model: "ag/gemini-3.8-flash" },
                { name: "Rizky Dwi Pratama", className: "XI B", absen: 7, correct: 24, durationSec: 2100, model: "ag/gemini-3.8-flash" },
                { name: "Siti Sarah Nurhaliza", className: "XI B", absen: 21, correct: 23, durationSec: 1680, model: "ag/gemini-3.8-flash" },
                { name: "Ahmad Rayhan Kusuma", className: "XI C", absen: 5, correct: 25, durationSec: 1950, model: "ag/gemini-3.8-flash" },
                { name: "Fathia Zahra Azzahra", className: "XI C", absen: 18, correct: 22, durationSec: 1820, model: "ID/deepseek-v4.1-flash" },
                { name: "Bima Arya Wicaksana", className: "XI D", absen: 8, correct: 22, durationSec: 1620, model: "ID/deepseek-v4.1-flash" },
                { name: "Clarissa Aurelia Putri", className: "XI D", absen: 19, correct: 24, durationSec: 2200, model: "ID/deepseek-v4.1-flash" },
                { name: "Daffa Ibnu Hafidz", className: "XI E", absen: 11, correct: 25, durationSec: 1750, model: "ID/deepseek-v4.1-flash" },
                { name: "Kayla Salsabila Azka", className: "XI F", absen: 16, correct: 23, durationSec: 2050, model: "ID/deepseek-v4.1-flash" }
            ];
        }

        // Hapus data lama dan gantikan dengan 10 data siswa simulasi baru
        State.leaderboardRecords = [];
        State.ipLockRegistry = {};

        samples.forEach(s => {
            const detailMap = {};
            MASTER_QUESTIONS.forEach((q, idx) => {
                const isCorr = idx < s.correct;
                detailMap[q.id] = {
                    isCorrect: isCorr,
                    chosenText: isCorr ? q.options[q.correctIndex] : q.options[(q.correctIndex + 1) % 5],
                    correctText: q.options[q.correctIndex]
                };
            });

            const remSec = CONFIG.EXAM_DURATION_SECONDS - s.durationSec;
            const baseScore = s.correct * CONFIG.BASE_POINTS_PER_QUESTION;
            const speedBonus = Math.round((s.correct / CONFIG.TOTAL_QUESTIONS) * (remSec / CONFIG.EXAM_DURATION_SECONDS) * CONFIG.MAX_SPEED_BONUS);

            const rec = {
                id: `sim_${s.className.replace(/\s+/g, '')}_${s.absen}`,
                timestamp: new Date().toISOString(),
                ip: `103.119.${s.className.charCodeAt(3)}.${s.absen}`,
                name: s.name,
                className: s.className,
                absen: s.absen,
                correctCount: s.correct,
                academicGrade: Number(((s.correct / CONFIG.TOTAL_QUESTIONS) * 100).toFixed(1)),
                durationSec: s.durationSec,
                baseScore: baseScore,
                speedBonus: speedBonus,
                totalScore: baseScore + speedBonus,
                tabSwitches: 0,
                modelUsed: s.model,
                answersJson: JSON.stringify(detailMap)
            };

            State.leaderboardRecords.push(rec);
            State.ipLockRegistry[rec.ip] = rec;
        });

        // Urutkan default per kelas lalu absen
        State.leaderboardRecords.sort((a,b) => {
            if (a.className !== b.className) return a.className.localeCompare(b.className);
            return a.absen - b.absen;
        });

        State.save();
        App.renderAllViews();

        // REVERSE ENGINEERING FIX: Kirim otomatis seluruh record ini ke Google Apps Script jika webhook terpasang
        const webhookUrl = localStorage.getItem(CONFIG.STORAGE_KEYS.WEBHOOK);
        if (webhookUrl && webhookUrl.startsWith("http")) {
            Utils.showToast("Mengirim 10 data simulasi ke Google Spreadsheet...");
            (async () => {
                let sentCount = 0;
                for (const rec of State.leaderboardRecords) {
                    try {
                        await fetch(webhookUrl, {
                            method: 'POST',
                            mode: 'no-cors',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(rec)
                        });
                        sentCount++;
                    } catch (err) {
                        console.error("Gagal push record:", rec.name, err);
                    }
                }
                Utils.showToast(`${sentCount} data siswa berhasil terkirim ke Google Spreadsheet!`);
            })();
        } else {
            Utils.showToast("10 Data simulasi dimuat di browser. Webhook Apps Script belum diisi di tab Integrasi & Sandi.", false);
        }
    },

    unlockMyTeacherIp() {
        delete State.ipLockRegistry[State.clientIpAddress];
        State.leaderboardRecords = State.leaderboardRecords.filter(r => r.ip !== State.clientIpAddress);
        State.save();
        ExamModule.clearActiveSession();
        App.renderAllViews();
        ExamModule.checkAndEnforceIpLockUI();
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
        ExamModule.clearActiveSession();
        App.renderAllViews();
        ExamModule.checkAndEnforceIpLockUI();
        Utils.showToast("Data klasemen lokal telah berhasil dibersihkan.");
    },

    saveWebhookUrl() {
        const val = document.getElementById('input-webhook-url').value.trim();
        localStorage.setItem(CONFIG.STORAGE_KEYS.WEBHOOK, val);
        this.updateWebhookBadge();
        Utils.showToast("URL Web App Google Apps Script berhasil disimpan.");
        if (val.startsWith("http") && State.leaderboardRecords.length > 0) {
            this.syncAllToSpreadsheet();
        }
    },

    updateWebhookBadge() {
        const badge = document.getElementById('webhook-status-badge');
        const url = localStorage.getItem(CONFIG.STORAGE_KEYS.WEBHOOK) || '';
        if (badge) {
            if (url.startsWith('http') && url.includes('/exec')) {
                badge.className = "edu-badge edu-badge-green text-[10px]";
                badge.textContent = "Terhubung (/exec)";
            } else {
                badge.className = "edu-badge edu-badge-amber text-[10px]";
                badge.textContent = "Belum Terpasang";
            }
        }
    },

    async syncAllToSpreadsheet() {
        const webhookUrl = localStorage.getItem(CONFIG.STORAGE_KEYS.WEBHOOK);
        if (!webhookUrl || !webhookUrl.startsWith("http")) {
            Utils.showToast("Masukkan URL Web App Apps Script (/exec) terlebih dahulu!", false);
            return;
        }

        if (State.leaderboardRecords.length === 0) {
            Utils.showToast("Tidak ada data murid lokal untuk dikirim.", false);
            return;
        }

        Utils.showToast(`Mengirim ${State.leaderboardRecords.length} data murid ke Google Spreadsheet...`);
        let success = 0;
        for (const rec of State.leaderboardRecords) {
            try {
                await fetch(webhookUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(rec)
                });
                success++;
            } catch (e) {
                console.error("Gagal sync record:", rec.name, e);
            }
        }
        Utils.showToast(`Selesai! ${success} data murid terkirim ke spreadsheet Anda.`);
    },

    copyAppsScriptCode() {
        const code = document.getElementById('apps-script-code').innerText;
        navigator.clipboard.writeText(code).then(() => {
            Utils.showToast("Kode Google Apps Script disalin ke clipboard.");
        }).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = code;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            Utils.showToast("Kode Google Apps Script disalin ke clipboard.");
        });
    },

    exportCsv() {
        const sorted = LeaderboardModule.getSortedRecords("ALL");
        if (sorted.length === 0) {
            Utils.showToast("Belum ada data nilai peserta untuk diunduh.", false);
            return;
        }

        const headers = [
            "Peringkat", "Timestamp", "IP_Address", "Nama_Lengkap",
            "Kelas", "No_Absen", "Benar_Dari_25", "Nilai_Akademik",
            "Durasi_Detik", "Skor_Dasar", "Bonus_Kecepatan", "Total_Skor", "Pelanggaran_Tab"
        ];

        const rows = sorted.map((r, idx) => [
            idx + 1,
            `"${r.timestamp || ''}"`,
            `"${r.ip || ''}"`,
            `"${(r.name || '').replace(/"/g, '""')}"`,
            `"${r.className || ''}"`,
            r.absen || 1,
            r.correctCount || 0,
            r.academicGrade || 0,
            r.durationSec || 0,
            r.baseScore || 0,
            r.speedBonus || 0,
            r.totalScore || 0,
            r.tabSwitches || 0
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Rekap_Nilai_Fisika_Fluida_SMAN78_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

if (typeof module !== 'undefined') {
    module.exports = { TeacherAdminModule };
}
