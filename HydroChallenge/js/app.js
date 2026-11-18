// ==========================================================================
// HYDRO CHALLENGE — ENTRYPOINT APLIKASI
// ==========================================================================

const App = {
    init() {
        if (typeof lucide !== 'undefined') lucide.createIcons();
        State.load();
        this.bindDynamicConfigToUI();
        ExamModule.init();
        this.renderAllViews();
        ExamModule.restoreActiveSession();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    switchView(viewName) {
        const views = ['exam', 'leaderboard'];
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
        if (typeof lucide !== 'undefined') lucide.createIcons();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    bindDynamicConfigToUI() {
        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        setText('spec-total-questions', `${CONFIG.TOTAL_QUESTIONS} Butir PG`);
        setText('spec-duration', `${CONFIG.DURATION_MINUTES} Menit`);
        setText('spec-base-points', `${Utils.formatNumber(CONFIG.BASE_POINTS_PER_QUESTION)}/Soal`);
        setText('spec-max-bonus', `Maks +${Utils.formatNumber(CONFIG.MAX_SPEED_BONUS)}`);
        setText('spec-coverage-badge', `${CONFIG.TOTAL_QUESTIONS} Soal Terkurasi`);
        setText('q-total-count', `/ ${CONFIG.TOTAL_QUESTIONS}`);
        setText('review-correct-total', `Dari ${CONFIG.TOTAL_QUESTIONS} butir soal`);
        setText('lb-item-analysis-title', `Ketuntasan ${CONFIG.TOTAL_QUESTIONS} butir (#Q01–#Q${String(CONFIG.TOTAL_QUESTIONS).padStart(2, '0')})`);

        const heroDesc = document.getElementById('hero-duration-desc');
        if (heroDesc) {
            heroDesc.innerHTML = `Challenge kompetitif <strong>Fisika Kelas XI</strong> ini berisi <strong>${CONFIG.TOTAL_QUESTIONS} butir soal pilihan ganda terkurasi</strong> dengan alokasi waktu <strong>${CONFIG.DURATION_TEXT}</strong>. Seluruh soal berfokus pada <strong>pipa horizontal menyempit</strong>, <strong>tabung venturi</strong>, <strong>manometer</strong>, dan <strong>penyemprot cairan</strong>. Peringkat ditentukan oleh ketepatan jawaban dan efisiensi waktu.`;
        }

        const hudAnswered = document.getElementById('exam-hud-answered');
        if (hudAnswered && (!State.activeSession.questions || !State.activeSession.questions.length)) {
            hudAnswered.textContent = `0 / ${CONFIG.TOTAL_QUESTIONS}`;
        }

        const timerEl = document.getElementById('exam-global-timer');
        if (timerEl && !State.activeSession.timerInterval) {
            timerEl.textContent = Utils.formatTime(CONFIG.EXAM_DURATION_SECONDS);
        }
    },

    renderAllViews() {
        LeaderboardModule.render();
    }
};

window.addEventListener('DOMContentLoaded', () => {
    App.init();
});
