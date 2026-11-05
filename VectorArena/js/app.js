// ==========================================================================
// VECTORARENA - ENTRYPOINT APLIKASI UTAMA (MAIN APP ROUTER)
// ==========================================================================

const App = {
    async init() {
        if (window.lucide) lucide.createIcons();
        State.load();
        this._bindHiddenAdminTriggers();
        ExamModule.init();

        this.applyExamConfigUI();
        TeacherAdminModule.updateAuthUI();
        this.renderAllViews();

        // Simpan / Muat Mode Terakhir
        const savedMode = localStorage.getItem(CONFIG.STORAGE_KEYS.GAME_MODE) || 'ranked';
        ExamModule.setMode(savedMode);

        await Utils.detectIp();
        ExamModule.checkAndEnforceIpLockUI();

        // Pulihkan sesi ujian jika halaman ter-refresh saat aktif
        ExamModule.restoreActiveSession();

        this._bindEvents();
        if (window.lucide) lucide.createIcons();

        // Sinkronkan status ujian + indikator koneksi ke webhook (non-blocking).
        this.syncWithSpreadsheet();
        this._startLobbyPolling();
    },

    // Pemicu tersembunyi: ?admin=1, #admin, atau 3x klik logo aplikasi.
    _bindHiddenAdminTriggers() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('admin') === '1' || window.location.hash === '#admin') {
                State.isAdminTriggered = true;
                TeacherAdminModule.updateAuthUI();
            }
        } catch (e) {}

        let clickCount = 0;
        let clickTimer = null;
        const brandEl = document.getElementById('app-main-logo') || document.getElementById('app-header-brand');
        if (brandEl) {
            brandEl.addEventListener('click', () => {
                clickCount++;
                clearTimeout(clickTimer);
                if (clickCount >= 3) {
                    clickCount = 0;
                    State.isAdminTriggered = true;
                    TeacherAdminModule.updateAuthUI();
                    TeacherAdminModule.openLoginModal();
                    Utils.showToast("Akses Guru terdeteksi. Silakan masukkan PIN.", true);
                } else {
                    clickTimer = setTimeout(() => { clickCount = 0; }, 1200);
                }
            });
        }
    },

    // Polling ringan agar status ujian dari spreadsheet ikut tersinkron tanpa
    // mengganggu siswa yang sedang mengerjakan atau guru yang sedang mengedit.
    _startLobbyPolling() {
        clearInterval(this._lobbyPollInterval);
        this._lobbyPollInterval = setInterval(async () => {
            const activeExamScreen = document.getElementById('screen-active-exam');
            if (activeExamScreen && !activeExamScreen.classList.contains('hidden')) return;
            if (State.isTeacherLoggedIn) return;
            if (typeof SpreadsheetService === 'undefined' || !SpreadsheetService.isConfigured()) return;

            const changed = await SpreadsheetService.sync(false);
            if (changed) {
                this.applyExamConfigUI();
                TeacherAdminModule.updateExamConfigUI();
                this.renderAllViews();
            }
        }, 12000);
    },

    // Cermin status konfigurasi ujian ke elemen antarmuka siswa: pil status di
    // header, banner peringatan di lobi, dan kunci tombol mulai.
    applyExamConfigUI() {
        const isOpen = State.examConfig.isOpen;
        const totalRecords = State.leaderboardRecords.length;

        const pill = document.getElementById('header-exam-status-pill');
        const dot = document.getElementById('header-exam-status-dot');
        const text = document.getElementById('header-exam-status-text');
        const navTabExam = document.getElementById('nav-tab-exam');
        const studyGuide = document.getElementById('lobby-study-guide-card');
        const startForm = document.getElementById('exam-start-form');
        const finishedBanner = document.getElementById('lb-exam-finished-banner');

        if (isOpen) {
            if (navTabExam) navTabExam.classList.remove('hidden');
            if (finishedBanner) finishedBanner.classList.add('hidden');
            if (startForm) startForm.classList.remove('hidden');

            if (pill) pill.className = "hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shrink-0";
            if (dot) dot.className = "w-2 h-2 rounded-full bg-emerald-500 animate-pulse";
            if (text) text.textContent = "Ujian Buka";
        } else {
            if (totalRecords > 0) {
                // Ujian selesai: siswa tidak perlu melihat tab ujian lagi.
                if (navTabExam) {
                    if (!State.isTeacherLoggedIn && !State.isAdminTriggered) navTabExam.classList.add('hidden');
                    else navTabExam.classList.remove('hidden');
                }
                if (finishedBanner) finishedBanner.classList.remove('hidden');
                if (startForm) startForm.classList.add('hidden');

                const viewExam = document.getElementById('view-exam');
                if (viewExam && !viewExam.classList.contains('hidden') && !State.isTeacherLoggedIn && !State.isAdminTriggered) {
                    this.switchView('leaderboard');
                }
            } else {
                // Belum ada nilai: sembunyikan formulir, tampilkan kisi-kisi.
                if (navTabExam) navTabExam.classList.remove('hidden');
                if (finishedBanner) finishedBanner.classList.add('hidden');
                if (startForm) startForm.classList.add('hidden');
            }

            if (pill) pill.className = "hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 shrink-0";
            if (dot) dot.className = "w-2 h-2 rounded-full bg-rose-500";
            if (text) text.textContent = totalRecords > 0 ? "Ujian Ditutup" : "Ujian Ditutup (Belum Dibuka)";
        }

        // Kartu kisi-kisi selalu tersedia sebagai bahan belajar mandiri.
        if (studyGuide) studyGuide.classList.remove('hidden');

        const banner = document.getElementById('exam-closed-banner');
        if (banner) banner.classList.toggle('hidden', isOpen);

        const startBtn = document.getElementById('btn-start-exam');
        if (startBtn) {
            startBtn.disabled = !isOpen;
            startBtn.classList.toggle('opacity-50', !isOpen);
            startBtn.classList.toggle('cursor-not-allowed', !isOpen);
        }

        // Sinkronisasi kontrol di Panel Guru.
        const ctrlDesc = document.getElementById('ctrl-exam-status-desc');
        const btnToggleExam = document.getElementById('btn-toggle-exam-status');
        const metricStatus = document.getElementById('metric-exam-status-text');

        if (ctrlDesc && btnToggleExam && metricStatus) {
            const isAuto = State.examConfig.overrideMode === 'auto';
            if (isOpen) {
                ctrlDesc.textContent = isAuto
                    ? "Status: TERBUKA OTOMATIS (Akses penuh manual, belum ditutup oleh Guru)."
                    : "Status: DIBUKA MANUAL oleh Guru.";
                btnToggleExam.textContent = "Paksa Tutup Pendaftaran";
                btnToggleExam.className = "edu-btn-secondary px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border-rose-200";
                metricStatus.textContent = "TERBUKA";
                metricStatus.className = "text-lg font-mono font-bold text-emerald-700";
            } else {
                ctrlDesc.textContent = isAuto
                    ? "Status: DITUTUP OTOMATIS (Sesuai konfigurasi server)."
                    : "Status: DITUTUP MANUAL oleh Guru.";
                btnToggleExam.textContent = "Paksa Buka Pendaftaran";
                btnToggleExam.className = "edu-btn-primary px-4 py-2 text-xs font-semibold";
                metricStatus.textContent = "DITUTUP";
                metricStatus.className = "text-lg font-mono font-bold text-rose-700";
            }
        }

        const btnToggleReview = document.getElementById('btn-toggle-review-status');
        const reviewDesc = document.getElementById('ctrl-review-status-desc');
        if (btnToggleReview && reviewDesc) {
            const isAutoReview = State.examConfig.overrideReviewMode === 'auto';
            if (State.examConfig.allowReview) {
                reviewDesc.textContent = isAutoReview
                    ? "Status: DIBUKA OTOMATIS (Pembahasan & kunci tersedia untuk siswa)."
                    : "Status: DIBUKA MANUAL oleh Guru.";
                btnToggleReview.textContent = "Paksa Kunci Pembahasan";
                btnToggleReview.className = "edu-btn-secondary px-3.5 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 border-amber-200";
            } else {
                reviewDesc.textContent = isAutoReview
                    ? "Status: DIKUNCI OTOMATIS (Menunggu sesi kelas selesai)."
                    : "Status: DIKUNCI MANUAL oleh Guru.";
                btnToggleReview.textContent = "Paksa Buka Pembahasan";
                btnToggleReview.className = "edu-btn-primary px-3.5 py-2 text-xs font-semibold";
            }
        }
    },

    // Tanya server (bila webhook diatur) lalu sesuaikan status lokal. Kegagalan
    // tidak menghentikan aplikasi — mode mandiri tetap berjalan.
    async syncWithSpreadsheet() {
        if (typeof SpreadsheetService === 'undefined') return;

        SpreadsheetService.updateConnectionIndicator(false);
        if (!SpreadsheetService.isConfigured()) return;

        const changed = await SpreadsheetService.syncExamConfig(false);
        if (changed) {
            this.applyExamConfigUI();
            TeacherAdminModule.updateExamConfigUI();
        }
    },

    switchView(viewName) {
        // Panel guru hanya terbuka untuk guru terautentikasi atau mode admin
        // yang sengaja dipicu (?admin=1 / 3x klik logo).
        if (viewName === 'sheet' && !State.isTeacherLoggedIn && !State.isAdminTriggered) {
            viewName = 'exam';
        }

        // Ujian yang sudah selesai (ditutup + ada nilai) dialihkan ke klasemen.
        if (viewName === 'exam' && !State.examConfig.isOpen && State.leaderboardRecords.length > 0 && !State.isTeacherLoggedIn && !State.isAdminTriggered) {
            viewName = 'leaderboard';
        }

        const views = ['exam', 'leaderboard', 'sheet'];
        views.forEach(v => {
            const sectionEl = document.getElementById(`view-${v}`);
            const tabBtn = document.getElementById(`nav-tab-${v}`);
            if (v === viewName) {
                if (sectionEl) sectionEl.classList.remove('hidden');
                if (tabBtn) {
                    // Jangan menimpa className: kelas `hidden` dikelola oleh
                    // updateAuthUI/applyExamConfigUI dan harus tetap dihormati.
                    tabBtn.classList.add('bg-indigo-900', 'text-white', 'shadow-sm', 'font-bold');
                    tabBtn.classList.remove('text-slate-600', 'hover:text-slate-900', 'font-semibold');
                }
            } else {
                if (sectionEl) sectionEl.classList.add('hidden');
                if (tabBtn) {
                    tabBtn.classList.remove('bg-indigo-900', 'text-white', 'shadow-sm', 'font-bold');
                    tabBtn.classList.add('text-slate-600', 'hover:text-slate-900', 'font-semibold');
                }
            }
        });

        if (viewName === 'leaderboard') {
            LeaderboardModule.renderAll();
        }
        if (viewName === 'sheet') {
            TeacherAdminModule.updateAuthUI();
            TeacherAdminModule.renderPanel();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (window.lucide) lucide.createIcons();
    },

    renderAllViews() {
        LeaderboardModule.renderAll();
        if (State.isTeacherLoggedIn) {
            TeacherAdminModule.renderPanel();
        }
    },

    _bindEvents() {
        // Form Submit Mulai Ujian
        const startForm = document.getElementById('exam-start-form');
        if (startForm) {
            startForm.addEventListener('submit', (e) => ExamModule.start(e));
        }

        // Navigasi Filter Kelas di Klasemen
        const filterClass = document.getElementById('filter-lb-class') || document.getElementById('lb-class-filter');
        if (filterClass) {
            filterClass.addEventListener('change', () => LeaderboardModule.renderFullTable());
        }

        const filterSearch = document.getElementById('filter-lb-search') || document.getElementById('lb-search-input');
        if (filterSearch) {
            filterSearch.addEventListener('input', Utils.debounce(() => LeaderboardModule.renderFullTable(), 250));
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    App.init();
});