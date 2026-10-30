// ==========================================================================
// HYDROARENA SMAN 78 - ENTRYPOINT APLIKASI (MAIN APP ROUTER & BOOTSTRAP)
// ==========================================================================

const App = {
    async init() {
        lucide.createIcons();
        State.load();
        this.bindDynamicConfigToUI();
        ExamModule.init();

        this.applyExamConfigUI();
        TeacherAdminModule.updateAuthUI();

        this.renderAllViews();

        await Utils.detectIp();
        ExamModule.checkAndEnforceIpLockUI();

        await SpreadsheetService.sync(false);
        this.renderAllViews();
        lucide.createIcons();
    },

    switchView(viewName) {
        const views = ['exam', 'leaderboard', 'sheet'];
        views.forEach(v => {
            const sectionEl = document.getElementById(`view-${v}`);
            const tabBtn = document.getElementById(`nav-tab-${v}`);
            if (v === viewName) {
                if (sectionEl) sectionEl.classList.remove('hidden');
                if (tabBtn) tabBtn.className = "px-3.5 py-1.5 rounded-md text-xs font-bold transition-all bg-blue-800 text-white shadow-sm flex items-center gap-1.5";
            } else {
                if (sectionEl) sectionEl.classList.add('hidden');
                if (tabBtn) tabBtn.className = "px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all text-slate-600 hover:text-slate-900 flex items-center gap-1.5";
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

        if (State.examConfig.isOpen) {
            if (closedBanner) closedBanner.classList.add('hidden');
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
            if (statusDot) statusDot.className = "w-2 h-2 rounded-full bg-emerald-500 animate-pulse";
            if (statusText) statusText.textContent = "Ujian Buka";
            if (statusPill) statusPill.className = "hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800";
        } else {
            if (closedBanner) closedBanner.classList.remove('hidden');
            if (startBtn) {
                startBtn.disabled = true;
                startBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
            if (statusDot) statusDot.className = "w-2 h-2 rounded-full bg-rose-500";
            if (statusText) statusText.textContent = "Pendaftaran Ditutup";
            if (statusPill) statusPill.className = "hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800";
        }

        // Sinkronisasi tombol di Panel Guru
        const ctrlDesc = document.getElementById('ctrl-exam-status-desc');
        const btnToggleExam = document.getElementById('btn-toggle-exam-status');
        const metricStatus = document.getElementById('metric-exam-status-text');

        if (ctrlDesc && btnToggleExam && metricStatus) {
            if (State.examConfig.isOpen) {
                ctrlDesc.textContent = "Status saat ini: Pendaftaran TERBUKA. Seluruh siswa kelas XI dapat memulai pengerjaan ujian.";
                btnToggleExam.textContent = "Tutup Pendaftaran Ujian";
                btnToggleExam.className = "edu-btn-secondary px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border-rose-200";
                metricStatus.textContent = "TERBUKA";
                metricStatus.className = "text-lg font-mono font-bold text-emerald-700";
            } else {
                ctrlDesc.textContent = "Status saat ini: Pendaftaran DITUTUP. Siswa baru tidak dapat mengakses lembar soal.";
                btnToggleExam.textContent = "Buka Pendaftaran Ujian";
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
