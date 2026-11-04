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

        // Sinkronisasi dengan Google Spreadsheet (auto-sync: hapus data lokal yang tidak ada di server)
        if (typeof SpreadsheetService !== 'undefined') {
            await SpreadsheetService.sync(false);
            LeaderboardModule.renderAll();
            ExamModule.checkAndEnforceIpLockUI();
            this._startLobbyPolling();
        }

        this._bindEvents();
        if (window.lucide) lucide.createIcons();
    },

    _startLobbyPolling() {
        clearInterval(this._lobbyPollInterval);
        this._lobbyPollInterval = setInterval(async () => {
            const activeExamScreen = document.getElementById('screen-active-exam');
            if (activeExamScreen && !activeExamScreen.classList.contains('hidden')) return;
            if (State.isTeacherLoggedIn) return;
            if (typeof SpreadsheetService !== 'undefined') {
                await SpreadsheetService.sync(false);
            }
        }, 12000); // Polling otomatis setiap 12 detik
    },

    switchView(viewName) {
        // Cegah siswa mengakses tab panel guru jika belum terautentikasi
        if (viewName === 'sheet' && !State.isTeacherLoggedIn) {
            TeacherAdminModule.openLoginModal();
            return;
        }

        const views = ['exam', 'leaderboard', 'sheet'];
        views.forEach(v => {
            const sectionEl = document.getElementById(`view-${v}`);
            const tabBtn = document.getElementById(`nav-tab-${v}`);
            if (v === viewName) {
                if (sectionEl) sectionEl.classList.remove('hidden');
                if (tabBtn) {
                    tabBtn.className = "px-3 sm:px-3.5 py-1.5 rounded-md text-xs font-bold transition-all bg-indigo-900 text-white shadow-sm flex items-center justify-center gap-1.5 flex-1 sm:flex-none";
                }
            } else {
                if (sectionEl) sectionEl.classList.add('hidden');
                if (tabBtn) {
                    tabBtn.className = "px-3 sm:px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 flex-1 sm:flex-none";
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

        // 3x Klik Logo untuk Membuka Portal Guru Tersembunyi
        const logoEl = document.getElementById('app-main-logo') || document.getElementById('app-header-brand');
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
