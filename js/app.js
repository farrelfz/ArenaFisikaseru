// ==========================================================================
// HYDROARENA SMAN 78 - ENTRYPOINT APLIKASI (MAIN APP ROUTER & BOOTSTRAP)
// ==========================================================================

const App = {
    async init() {
        lucide.createIcons();
        State.load();
        this.bindDynamicConfigToUI();
        this._bindHiddenAdminTriggers();
        ExamModule.init();

        this.applyExamConfigUI();
        TeacherAdminModule.updateAuthUI();

        this.renderAllViews();

        await Utils.detectIp();
        ExamModule.checkAndEnforceIpLockUI();

        // Pulihkan sesi ujian siswa jika sebelumnya ter-refresh / HP mati / peramban tertutup
        ExamModule.restoreActiveSession();

        await SpreadsheetService.sync(false);
        this.renderAllViews();
        this._startLobbyPolling();
        lucide.createIcons();
    },

    _startLobbyPolling() {
        clearInterval(this._lobbyPollInterval);
        this._lobbyPollInterval = setInterval(async () => {
            // Jangan lakukan polling jika siswa sedang aktif mengerjakan lembar soal
            const activeExamScreen = document.getElementById('screen-active-exam');
            if (activeExamScreen && !activeExamScreen.classList.contains('hidden')) return;

            // Jangan polling jika sesi guru sedang aktif mengedit konfigurasi
            if (State.isTeacherLoggedIn) return;

            await SpreadsheetService.sync(false);
        }, 12000); // Polling otomatis setiap 12 detik
    },

    _bindHiddenAdminTriggers() {
        // 1. Deteksi URL Rahasia (?admin=1 atau #admin)
        try {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('admin') === '1' || window.location.hash === '#admin') {
                State.isAdminTriggered = true;
                TeacherAdminModule.updateAuthUI();
            }
        } catch (e) {}

        // 2. Easter Egg Rahasia: Klik Logo 3x berturut-turut untuk membuka akses Guru
        let clickCount = 0;
        let clickTimer = null;
        const brandEl = document.getElementById('app-header-brand');
        if (brandEl) {
            brandEl.addEventListener('click', (e) => {
                clickCount++;
                clearTimeout(clickTimer);
                if (clickCount >= 3) {
                    clickCount = 0;
                    State.isAdminTriggered = true;
                    TeacherAdminModule.updateAuthUI();
                    TeacherAdminModule.openLoginModal();
                    Utils.showToast("Akses Guru terdeteksi. Silakan masukkan PIN.", true);
                } else {
                    clickTimer = setTimeout(() => {
                        clickCount = 0;
                    }, 1200);
                }
            });
        }
    },

    switchView(viewName) {
        // Cegah siswa mengakses tab panel guru jika belum terautentikasi dan mode admin tidak terpicu
        if (viewName === 'sheet' && !State.isTeacherLoggedIn && !State.isAdminTriggered) {
            viewName = 'exam';
        }

        // Jika ujian sudah selesai (tertutup dan sudah ada nilai) dan bukan guru, cegah akses tab ujian
        if (viewName === 'exam' && !State.examConfig.isOpen && State.leaderboardRecords.length > 0 && !State.isTeacherLoggedIn && !State.isAdminTriggered) {
            viewName = 'leaderboard';
        }

        const views = ['exam', 'leaderboard', 'sheet'];
        views.forEach(v => {
            const sectionEl = document.getElementById(`view-${v}`);
            const tabBtn = document.getElementById(`nav-tab-${v}`);
            if (v === viewName) {
                if (sectionEl) sectionEl.classList.remove('hidden');
                if (tabBtn) tabBtn.className = "px-3 sm:px-3.5 py-1.5 rounded-md text-xs font-bold transition-all bg-blue-800 text-white shadow-sm flex items-center justify-center gap-1.5 flex-1 sm:flex-none";
            } else {
                if (sectionEl) sectionEl.classList.add('hidden');
                if (tabBtn) tabBtn.className = "px-3 sm:px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 flex-1 sm:flex-none";
            }
        });

        if (viewName === 'leaderboard') LeaderboardModule.renderFullTable();
        if (viewName === 'sheet') {
            TeacherAdminModule.updateAuthUI();
            TeacherAdminModule.renderPanel();
        }
        lucide.createIcons();
    },

    applyExamConfigUI() {
        const closedBanner = document.getElementById('exam-closed-banner');
        const startBtn = document.getElementById('btn-start-exam');
        const statusDot = document.getElementById('header-exam-status-dot');
        const statusText = document.getElementById('header-exam-status-text');
        const statusPill = document.getElementById('header-exam-status-pill');
        const navTabExam = document.getElementById('nav-tab-exam');
        const studyGuide = document.getElementById('lobby-study-guide-card');
        const examStartForm = document.getElementById('exam-start-form');
        const finBanner = document.getElementById('lb-exam-finished-banner');

        const totalRecords = State.leaderboardRecords.length;

        if (State.examConfig.isOpen) {
            // KONDISI A: UJIAN DIBUKA
            if (navTabExam) navTabExam.classList.remove('hidden');
            if (closedBanner) closedBanner.classList.add('hidden');
            if (studyGuide) studyGuide.classList.add('hidden');
            if (examStartForm) examStartForm.classList.remove('hidden');
            if (finBanner) finBanner.classList.add('hidden');

            if (startBtn) {
                startBtn.disabled = false;
                startBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
            if (statusDot) statusDot.className = "w-2 h-2 rounded-full bg-emerald-500 animate-pulse";
            if (statusText) statusText.textContent = "Ujian Buka (s.d. Jumat 16:00)";
            if (statusPill) statusPill.className = "hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800";
        } else {
            // KONDISI B: UJIAN DITUTUP
            if (totalRecords > 0) {
                // KONDISI B2: UJIAN SELESAI (SUDAH ADA NILAI / DATA TERISI)
                if (!State.isTeacherLoggedIn && !State.isAdminTriggered) {
                    if (navTabExam) navTabExam.classList.add('hidden');
                } else {
                    if (navTabExam) navTabExam.classList.remove('hidden');
                }

                if (finBanner) finBanner.classList.remove('hidden');

                // Alihkan ke klasemen akhir jika murid sedang di tab ujian
                const viewExam = document.getElementById('view-exam');
                if (viewExam && !viewExam.classList.contains('hidden') && !State.isTeacherLoggedIn && !State.isAdminTriggered) {
                    this.switchView('leaderboard');
                }
            } else {
                // KONDISI B1: SEBELUM UJIAN DIMULAI (BELUM ADA DATA)
                if (navTabExam) navTabExam.classList.remove('hidden');
                if (finBanner) finBanner.classList.add('hidden');

                if (studyGuide) studyGuide.classList.remove('hidden');
                if (examStartForm) examStartForm.classList.add('hidden');
            }

            if (startBtn) {
                startBtn.disabled = true;
                startBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
            if (statusDot) statusDot.className = "w-2 h-2 rounded-full bg-rose-500";
            if (statusText) statusText.textContent = totalRecords > 0 ? "Ujian Ditutup" : "Buka Rabu 06:30 WIB";
            if (statusPill) statusPill.className = "hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800";
        }

        // Sinkronisasi tombol di Panel Guru
        const ctrlDesc = document.getElementById('ctrl-exam-status-desc');
        const btnToggleExam = document.getElementById('btn-toggle-exam-status');
        const metricStatus = document.getElementById('metric-exam-status-text');

        if (ctrlDesc && btnToggleExam && metricStatus) {
            const isAuto = State.examConfig.overrideMode === 'auto';
            if (State.examConfig.isOpen) {
                ctrlDesc.textContent = isAuto
                    ? "Status: TERBUKA OTOMATIS (Sesuai jadwal: Rabu 06:30 s.d. Jumat 16:00 WIB)."
                    : "Status: DIBUKA MANUAL oleh Guru (Mengabaikan jadwal otomatis).";
                btnToggleExam.textContent = "Paksa Tutup Pendaftaran";
                btnToggleExam.className = "edu-btn-secondary px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border-rose-200";
                metricStatus.textContent = "TERBUKA";
                metricStatus.className = "text-lg font-mono font-bold text-emerald-700";
            } else {
                ctrlDesc.textContent = isAuto
                    ? "Status: DITUTUP OTOMATIS (Akan terbuka otomatis hari Rabu jam 06:30 WIB s.d. Jumat 16:00 WIB)."
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
            if (State.examConfig.allowReview) {
                reviewDesc.textContent = "Status saat ini: Siswa DIIZINKAN membuka kunci jawaban & pembahasan setelah submit.";
                btnToggleReview.textContent = "Kunci Pembahasan";
                btnToggleReview.className = "edu-btn-secondary px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 border-amber-200";
            } else {
                reviewDesc.textContent = "Status saat ini: Pembahasan DIKUNCI. Siswa hanya dapat melihat skor tanpa bocoran kunci jawaban.";
                btnToggleReview.textContent = "Izinkan Pembahasan";
                btnToggleReview.className = "edu-btn-primary px-4 py-2 text-xs font-semibold";
            }
        }
    },

    bindDynamicConfigToUI() {
        const elSpecQuestions = document.getElementById('spec-total-questions');
        if (elSpecQuestions) elSpecQuestions.textContent = `${CONFIG.TOTAL_QUESTIONS} Butir PG`;

        const elSpecDuration = document.getElementById('spec-duration');
        if (elSpecDuration) elSpecDuration.textContent = `${CONFIG.DURATION_MINUTES} Menit`;

        const elSpecPoints = document.getElementById('spec-base-points');
        if (elSpecPoints) elSpecPoints.textContent = `${Utils.formatNumber(CONFIG.BASE_POINTS_PER_QUESTION)}/Soal`;

        const elSpecBonus = document.getElementById('spec-max-bonus');
        if (elSpecBonus) elSpecBonus.textContent = `Maks +${Utils.formatNumber(CONFIG.MAX_SPEED_BONUS)}`;

        const elCoverageBadge = document.getElementById('spec-coverage-badge');
        if (elCoverageBadge) elCoverageBadge.textContent = `${CONFIG.TOTAL_QUESTIONS} Soal Terkurasi`;

        const elHeroDesc = document.getElementById('hero-duration-desc');
        if (elHeroDesc) {
            elHeroDesc.innerHTML = `Instrumen evaluasi kompetitif mata pelajaran <strong>Fisika Kelas XI</strong> terdiri atas <strong>${CONFIG.TOTAL_QUESTIONS} butir soal pilihan ganda terkurasi</strong> dengan alokasi waktu <strong>${CONFIG.DURATION_TEXT}</strong>. Peringkat ditentukan berdasarkan ketepatan jawaban dan efisiensi waktu pengerjaan.`;
        }

        const elHudAnswered = document.getElementById('exam-hud-answered');
        if (elHudAnswered && (!State.activeSession.questions || !State.activeSession.questions.length)) {
            elHudAnswered.textContent = `0 / ${CONFIG.TOTAL_QUESTIONS}`;
        }

        const elGlobalTimer = document.getElementById('exam-global-timer');
        if (elGlobalTimer && !State.activeSession.timerInterval) {
            elGlobalTimer.textContent = Utils.formatTime(CONFIG.EXAM_DURATION_SECONDS);
        }

        const elQTotal = document.getElementById('q-total-count');
        if (elQTotal) elQTotal.textContent = `/ ${CONFIG.TOTAL_QUESTIONS}`;

        const elReviewCorrectTotal = document.getElementById('review-correct-total');
        if (elReviewCorrectTotal) elReviewCorrectTotal.textContent = `Dari ${CONFIG.TOTAL_QUESTIONS} butir soal`;

        const elItemAnalysisTitle = document.getElementById('lb-item-analysis-title');
        if (elItemAnalysisTitle) elItemAnalysisTitle.textContent = `Ketuntasan ${CONFIG.TOTAL_QUESTIONS} butir (#Q01–#Q${String(CONFIG.TOTAL_QUESTIONS).padStart(2, '0')})`;
    },

    renderAllViews() {
        LeaderboardModule.render();
        if (State.isTeacherLoggedIn) {
            TeacherAdminModule.renderPanel();
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    App.init();
});
