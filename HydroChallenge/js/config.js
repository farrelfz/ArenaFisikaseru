// ==========================================================================
// HYDRO CHALLENGE — KONFIGURASI GLOBAL
// Fokus materi: Persamaan Kontinuitas, Asas Bernoulli pada pipa menyempit,
// Tabung Venturi, Manometer, dan Penyemprot Cairan (Atomizer).
// Penyimpanan data 100% lokal (localStorage) — tanpa spreadsheet.
// ==========================================================================

const CONFIG = {
    VERSION: '1.0.0',
    CHALLENGE_NAME: 'Hydro Challenge',
    SUBTITLE: 'Venturi & Penyemprot Cairan',

    // Standar Challenge
    EXAM_DURATION_SECONDS: 1200, // 20 Menit (challenge singkat)
    TOTAL_QUESTIONS: 15,
    BASE_POINTS_PER_QUESTION: 5000, // 15 × 5.000 = 75.000 poin akurasi
    MAX_SPEED_BONUS: 25000,         // Total skor puncak = 100.000 poin
    ACADEMIC_KKM: 75.0,
    CLASSES: ['XI A', 'XI B', 'XI C', 'XI D', 'XI E', 'XI F'],

    // Storage Keys (LocalStorage)
    STORAGE_KEYS: {
        RECORDS: 'hydrochallenge_records_v1',
        ACTIVE_SESSION: 'hydrochallenge_active_session_v1'
    },

    // Helper Dinamis
    get DURATION_MINUTES() {
        return Math.floor(this.EXAM_DURATION_SECONDS / 60);
    },
    get DURATION_TEXT() {
        const hrs = Math.floor(this.EXAM_DURATION_SECONDS / 3600);
        const mins = Math.floor((this.EXAM_DURATION_SECONDS % 3600) / 60);
        if (hrs === 0) return `${mins} Menit`;
        return `${this.DURATION_MINUTES} Menit (${hrs} Jam${mins > 0 ? ' ' + mins + ' Menit' : ''})`;
    },
    get MAX_TOTAL_SCORE() {
        return (this.TOTAL_QUESTIONS * this.BASE_POINTS_PER_QUESTION) + this.MAX_SPEED_BONUS;
    },
    get MIN_CORRECT_FOR_KKM() {
        return Math.ceil((this.ACADEMIC_KKM / 100) * this.TOTAL_QUESTIONS);
    }
};

if (typeof module !== 'undefined') {
    module.exports = { CONFIG };
}
