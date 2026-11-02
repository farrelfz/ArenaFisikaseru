// ==========================================================================
// HYDROARENA SMAN 78 - KONFIGURASI GLOBAL SISTEM EVALUASI FISIKA
// ==========================================================================

const CONFIG = {
    // Google Spreadsheet Integration
    SPREADSHEET_ID: '1hFypaFplnQggt2Nva6Apt4lPHJ66S3kQTXWoDmDlQSg',
    get SPREADSHEET_EDIT_URL() {
        return `https://docs.google.com/spreadsheets/d/${this.SPREADSHEET_ID}/edit?usp=sharing`;
    },
    get SPREADSHEET_GVIZ_URL() {
        return `https://docs.google.com/spreadsheets/d/${this.SPREADSHEET_ID}/gviz/tq?tqx=out:json`;
    },
    get SPREADSHEET_CSV_URL() {
        return `https://docs.google.com/spreadsheets/d/${this.SPREADSHEET_ID}/export?format=csv`;
    },

    // URL Webhook Google Apps Script Default (Otomatis dipakai di semua gawai siswa)
    DEFAULT_WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycbx5WaAPsS8-JLzo9id6HB3ogoUV0wPoqgn_jcz3h9RuuRy5wFn5C_BRA3dreH_JrbbMIw/exec',

    // Standar Evaluasi Akademik
    EXAM_DURATION_SECONDS: 5400, // 1 Jam 30 Menit (90 Menit)
    TOTAL_QUESTIONS: 25,
    BASE_POINTS_PER_QUESTION: 3000, // 25 × 3.000 = 75.000 Pts (Skor Dasar Akurasi)
    MAX_SPEED_BONUS: 25000,         // Maksimum Bonus Kecepatan = 25.000 Pts (Total Skor Puncak = 100.000 Pts)
    ACADEMIC_KKM: 75.0,
    CLASSES: ['XI A', 'XI B', 'XI C', 'XI D', 'XI E', 'XI F'],

    // Jadwal Pelaksanaan Ujian Resmi (WIB / Asia/Jakarta)
    // Terbuka otomatis hari Rabu jam 06:30 WIB s.d. Jumat jam 16:00 WIB
    SCHEDULE: {
        ENABLED: true,
        OPEN_DAY_NAME: 'Rabu',
        OPEN_HOUR_TEXT: '06:30 WIB',
        CLOSE_DAY_NAME: 'Jumat',
        CLOSE_HOUR_TEXT: '16:00 WIB',
        LABEL: 'Rabu 06:30 WIB s.d. Jumat 16:00 WIB'
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
    get MAX_TOTAL_SCORE() {
        return (this.TOTAL_QUESTIONS * this.BASE_POINTS_PER_QUESTION) + this.MAX_SPEED_BONUS;
    },
    get MIN_CORRECT_FOR_KKM() {
        return Math.ceil((this.ACADEMIC_KKM / 100) * this.TOTAL_QUESTIONS);
    },

    // Storage Keys (LocalStorage & SessionStorage)
    STORAGE_KEYS: {
        RECORDS: 'hydroarena_78_records_v5_live',
        IP_MAP: 'hydroarena_78_ip_locks_v5_live',
        WEBHOOK: 'hydroarena_78_webhook_url_v5_live',
        TEACHER_PIN: 'hydroarena_78_teacher_pin_v5_live',
        EXAM_CONFIG: 'hydroarena_78_exam_config_v5_live',
        TEACHER_SESSION: 'hydroarena_78_teacher_session_v5_live',
        FALLBACK_IP: 'hydroarena_78_device_ip_v5_live',
        ACTIVE_SESSION: 'hydroarena_78_active_exam_session_v5_live'
    },

    // Default Passcode Guru Administrator
    DEFAULT_TEACHER_PIN: 'GURU78'
};

if (typeof module !== 'undefined') {
    module.exports = { CONFIG };
}
