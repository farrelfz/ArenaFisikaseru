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
        this.applyExamConfigUI();

        await Utils.detectIp();
        ExamModule.checkAndEnforceIpLockUI();

        // Pulihkan sesi ujian jika halaman ter-refresh saat aktif
        ExamModule.restoreActiveSession();

        this._bindEvents();
        if (window.lucide) lucide.createIcons();

        // Sinkronkan status ujian + indikator koneksi ke webhook (non-blocking).
        this.syncWithSpreadsheet();
    },

    // Cermin status konfigurasi ujian ke elemen antarmuka siswa: pil status di
    // header, banner peringatan di lobi, dan kunci tombol mulai.
    applyExamConfigUI() {
        const isOpen = State.examConfig.isOpen;

        const pill = document.getElementById('header-exam-status-pill');
        const dot = document.getElementById('header-exam-status-dot');
        const text = document.getElementById('header-exam-status-text');

        if (pill) {
            pill.className = isOpen
                ? "hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shrink-0"
                : "hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 shrink-0";
        }
        if (dot) {
            dot.className = isOpen
                ? "w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                : "w-2 h-2 rounded-full bg-rose-500";
        }
        if (text) text.textContent = isOpen ? 'Ujian Buka' : 'Ujian Ditutup';

        const banner = document.getElementById('exam-closed-banner');
        if (banner) banner.classList.toggle('hidden', isOpen);

        const startBtn = document.getElementById('btn-start-exam');
        if (startBtn) {
            startBtn.disabled = !isOpen;
            startBtn.classList.toggle('opacity-50', !isOpen);
            startBtn.classList.toggle('cursor-not-allowed', !isOpen);
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
