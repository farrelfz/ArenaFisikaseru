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
    DEFAULT_WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycbyKGf8MKKo8A-dRwsZpfmN2ZHUE-js7dZj78ttKsNe2O_1HmiHFPW-PZkNIJ7ilp3wTrg/exec',

    // Standar Evaluasi Akademik
    EXAM_DURATION_SECONDS: 5400, // 1 Jam 30 Menit (90 Menit)
    TOTAL_QUESTIONS: 25,
    BASE_POINTS_PER_QUESTION: 1000,
    MAX_SPEED_BONUS: 6000,
    ACADEMIC_KKM: 75.0,
    CLASSES: ['XI A', 'XI B', 'XI C', 'XI D', 'XI E', 'XI F'],

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
        RECORDS: 'hydroarena_78_records_v4_edu',
        IP_MAP: 'hydroarena_78_ip_locks_v4_edu',
        WEBHOOK: 'hydroarena_78_webhook_url_v4_edu',
        TEACHER_PIN: 'hydroarena_78_teacher_pin_v4_edu',
        EXAM_CONFIG: 'hydroarena_78_exam_config_v4_edu',
        TEACHER_SESSION: 'hydroarena_78_teacher_session_v4_edu',
        FALLBACK_IP: 'hydroarena_78_device_ip_v4_edu'
    },

    // Default Passcode Guru Administrator
    DEFAULT_TEACHER_PIN: 'GURU78'
};

if (typeof module !== 'undefined') {
    module.exports = { CONFIG };
}
