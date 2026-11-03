// ==========================================================================
// VECTORARENA - ENTRYPOINT APLIKASI UTAMA (MAIN APP ROUTER)
// ==========================================================================

const App = {
    async init() {
        if (window.lucide) lucide.createIcons();
        State.load();
        ExamModule.init();

        // Cek URL Param ?admin=1
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') === '1') {
            TeacherAdminModule.openLoginModal();
        }

        // Simpan / Muat Mode Terakhir
        const savedMode = localStorage.getItem(CONFIG.STORAGE_KEYS.GAME_MODE) || 'ranked';
        ExamModule.setMode(savedMode);

        TeacherAdminModule.updateAuthUI();
        TeacherAdminModule.updateExamConfigUI();
        LeaderboardModule.renderAll();

        await Utils.detectIp();
        ExamModule.checkAndEnforceIpLockUI();

        // Pulihkan sesi ujian jika halaman ter-refresh saat aktif
        ExamModule.restoreActiveSession();

        this._bindEvents();
        if (window.lucide) lucide.createIcons();
    },

    _bindEvents() {
        // Form Submit Mulai Ujian
        const startForm = document.getElementById('exam-start-form');
        if (startForm) {
            startForm.addEventListener('submit', (e) => ExamModule.start(e));
        }

        // Navigasi Filter Kelas di Klasemen
        const filterClass = document.getElementById('filter-lb-class');
        if (filterClass) {
            filterClass.addEventListener('change', () => LeaderboardModule.renderFullTable());
        }

        const filterSearch = document.getElementById('filter-lb-search');
        if (filterSearch) {
            filterSearch.addEventListener('input', Utils.debounce(() => LeaderboardModule.renderFullTable(), 250));
        }

        // 3x Klik Logo untuk Membuka Portal Guru Tersembunyi
        const logoEl = document.getElementById('app-main-logo');
        if (logoEl) {
            let logoClicks = 0;
            let logoTimer = null;
            logoEl.addEventListener('click', () => {
                logoClicks++;
                clearTimeout(logoTimer);
                logoTimer = setTimeout(() => { logoClicks = 0; }, 1000);
                if (logoClicks >= 3) {
                    logoClicks = 0;
                    TeacherAdminModule.openLoginModal();
                }
            });
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    App.init();
});
