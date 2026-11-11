// ==========================================================================
// VECTORARENA - KONFIGURASI GLOBAL SISTEM EVALUASI & GAMIFIKASI FISIKA
// ==========================================================================

const CONFIG = {
    VERSION: '1.0.1',
    APP_NAME: 'VectorArena',
    APP_SUBTITLE: 'Evaluasi Kompetitif Vektor & Kinematika Gerak Vertikal',

    // Kurikulum & Zona (8 Zona Pembelajaran Fisika)
    ZONES: [
        { id: 1, name: 'Vector Fundamentals', code: 'VF', target: 25, icon: 'compass' },
        { id: 2, name: 'Vector Representation', code: 'VR', target: 25, icon: 'grid' },
        { id: 3, name: 'Vector Operations', code: 'VO', target: 35, icon: 'plus-circle' },
        { id: 4, name: 'Geometrical Vector Methods', code: 'GV', target: 35, icon: 'triangle' },
        { id: 5, name: 'Vector Components', code: 'VC', target: 40, icon: 'maximize-2' },
        { id: 6, name: 'GVA — Gerak Vertikal ke Atas', code: 'GVA', target: 30, icon: 'arrow-up-circle' },
        { id: 7, name: 'GVB — Gerak Vertikal ke Bawah', code: 'GVB', target: 25, icon: 'arrow-down-circle' },
        { id: 8, name: 'GJB — Gerak Jatuh Bebas', code: 'GJB', target: 25, icon: 'chevrons-down' },
        { id: 9, name: 'GLB — Gerak Lurus Beraturan', code: 'GLB', target: 50, icon: 'move-right' },
        { id: 10, name: 'GLBB — Gerak Lurus Berubah Beraturan', code: 'GLBB', target: 50, icon: 'activity' }
    ],

    // Mode Permainan
    MODES: [
        { id: 'sprint', name: 'Sprint Vektor', questions: 10, durationSeconds: 360, desc: '10 soal pilihan cepat 6 menit' },
        { id: 'duel', name: 'Duel Komponen', questions: 15, durationSeconds: 600, desc: '15 soal komponen analitis 10 menit' },
        { id: 'ranked', name: 'Ujian Komprehensif', questions: 25, durationSeconds: 5400, desc: 'Evaluasi penuh 25 butir (90 menit)' },
        { id: 'race', name: 'Gravitasi Bertingkat', questions: 12, durationSeconds: 480, desc: 'Tantangan GVA/GVB/GJB bertahap' },
        { id: 'campaign', name: 'Ekspedisi 8 Zona', questions: 24, durationSeconds: 1800, desc: 'Petualangan 3 butir dari tiap zona' }
    ],

    // Google Spreadsheet Integration (Dapat dikonfigurasi melalui panel guru)
    SPREADSHEET_ID: '1EjFRurV6b7iBd9ILSIXO8Dr7Nf6S8wrq0T92PHjC5tQ', // Opsional: isi jika script standalone. Jika script ditempel di Extensions > Apps Script pada sheet, biarkan kosong.
    get SPREADSHEET_EDIT_URL() {
        return this.SPREADSHEET_ID ? `https://docs.google.com/spreadsheets/d/${this.SPREADSHEET_ID}/edit?usp=sharing` : '';
    },
    get SPREADSHEET_GVIZ_URL() {
        return this.SPREADSHEET_ID ? `https://docs.google.com/spreadsheets/d/${this.SPREADSHEET_ID}/gviz/tq?tqx=out:json` : '';
    },
    get SPREADSHEET_CSV_URL() {
        return this.SPREADSHEET_ID ? `https://docs.google.com/spreadsheets/d/${this.SPREADSHEET_ID}/export?format=csv` : '';
    },

    // URL Webhook Google Apps Script Default (Otomatis dipakai bila terkonfigurasi)
    DEFAULT_WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycbwPvQY_pL7Eq5fCDhTrxNbqxAvGqFYYoxahsuK9R9FgyjkIN0FjUHYUa7LZAtdW-V2q/exec',

    // Standar Evaluasi Akademik
    EXAM_DURATION_SECONDS: 5400, // 90 Menit untuk Ranked / Ujian Penuh
    TOTAL_QUESTIONS: 25,
    BASE_POINTS_PER_QUESTION: 3000, // 25 × 3.000 = 75.000 Pts
    MAX_SPEED_BONUS: 25000,         // Maksimum Bonus Kecepatan = 25.000 Pts (Puncak = 100.000 Pts)
    ACADEMIC_KKM: 75.0,
    CLASSES: ['X A', 'X B', 'X C', 'X D', 'X E', 'X F', 'X G', 'X H', 'X I', 'X J', 'X K'],

    // Kontrol Status Akses Ujian (Manual oleh Guru / Selalu Terbuka jika tidak ditutup manual)
    SCHEDULE: {
        ENABLED: false, // Tidak ada jadwal otomatis
        LABEL: 'Akses Penuh Manual (Dikontrol oleh Guru)'
    },

    // Bank soal menyimpan tingkat kesulitan sebagai ANGKA (1–4), mengikuti
    // skema penskoran server (server/scoring.js). Label di bawah ini hanya
    // untuk tampilan.
    DIFFICULTY_LABELS: {
        1: 'MUDAH',
        2: 'SEDANG',
        3: 'SULIT',
        4: 'TANTANGAN'
    },

    // Helper Dinamis (Menghindari Hardcode Angka di Template UI)
    get DURATION_MINUTES() {
        return Math.floor(this.EXAM_DURATION_SECONDS / 60);
    },
    get DURATION_TEXT() {
        const hrs = Math.floor(this.EXAM_DURATION_SECONDS / 3600);
        const mins = Math.floor((this.EXAM_DURATION_SECONDS % 3600) / 60);
        return `${this.DURATION_MINUTES} Menit (${hrs} Jam${mins > 0 ? ' ' + mins + ' Menit' : ''})`;
    },
    get MAX_POSSIBLE_SCORE() {
        return (this.TOTAL_QUESTIONS * this.BASE_POINTS_PER_QUESTION) + this.MAX_SPEED_BONUS;
    },
    get MAX_TOTAL_SCORE() {
        return this.MAX_POSSIBLE_SCORE;
    },
    get MIN_CORRECT_FOR_KKM() {
        return Math.ceil((this.ACADEMIC_KKM / 100) * this.TOTAL_QUESTIONS);
    },

    // Storage Keys (LocalStorage & SessionStorage)
    STORAGE_KEYS: {
        RECORDS: 'vectorarena_records_v1_live',
        IP_MAP: 'vectorarena_ip_locks_v1_live',
        WEBHOOK: 'vectorarena_webhook_url_v1_live',
        TEACHER_PIN: 'vectorarena_teacher_pin_v1_live',
        EXAM_CONFIG: 'vectorarena_exam_config_v1_live',
        TEACHER_SESSION: 'vectorarena_teacher_session_v1_live',
        FALLBACK_IP: 'vectorarena_device_ip_v1_live',
        ACTIVE_SESSION: 'vectorarena_active_exam_session_v1_live',
        GAME_MODE: 'vectorarena_selected_mode_v1',
        PENDING_SYNC: 'vectorarena_pending_sync_v1_live'
    },

    // Parameter Ketahanan Pengiriman ke Google Spreadsheet
    // (retry eksponensial + verifikasi read-back agar data siswa tidak hilang).
    SYNC_RETRY: {
        MAX_ATTEMPTS: 5,          // Maksimal percobaan per pengiriman
        BASE_DELAY_MS: 1200,      // Jeda awal antar percobaan (backoff eksponensial)
        REQUEST_TIMEOUT_MS: 20000 // Batas waktu satu permintaan fetch
    },

    // Default Passcode Guru Administrator
    DEFAULT_TEACHER_PIN: 'GURUX78'
};

if (typeof module !== 'undefined') {
    module.exports = { CONFIG };
}
