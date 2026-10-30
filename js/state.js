// ==========================================================================
// HYDROARENA SMAN 78 - MANAJEMEN STATE SISTEM (CENTRAL STATE)
// ==========================================================================

const State = {
    // Alamat IP Klien
    clientIpAddress: "Mendeteksi...",

    // Data Peringkat & Kunci IP
    leaderboardRecords: [],
    ipLockRegistry: {},

    // Sesi Ujian Murid yang Sedang Berjalan
    activeSession: {
        name: "",
        className: "XI A",
        absen: 1,
        ip: "",
        startTimeMs: 0,
        remainingSeconds: CONFIG.EXAM_DURATION_SECONDS,
        timerInterval: null,
        questions: [],
        currentIndex: 0,
        selectedAnswers: {},
        doubtFlags: {},
        tabSwitches: 0
    },

    // Sesi Guru Administrator
    isTeacherLoggedIn: false,
    activeAdminSubTab: 'ctrl',

    // Konfigurasi Dinamis Ujian
    examConfig: {
        isOpen: true,
        allowReview: true
    },

    // Record yang sedang dibuka di Mode Review
    currentReviewRecord: null,

    // Fungsi Pembersih & Penyelaras Data (Mencegah Angka Hardcode / Data Usang 35 Soal)
    sanitizeRecord(r) {
        if (!r) return null;
        let correctCount = Number(r.correctCount) || 0;

        // Jika data lama dari era 35 butir soal, sesuaikan secara proporsional ke 25 butir
        if (correctCount > CONFIG.TOTAL_QUESTIONS) {
            correctCount = Math.min(CONFIG.TOTAL_QUESTIONS, Math.round((correctCount / 35) * CONFIG.TOTAL_QUESTIONS));
        }

        const durationSec = Math.min(CONFIG.EXAM_DURATION_SECONDS, Math.max(1, Number(r.durationSec) || 1800));
        const remSec = Math.max(0, CONFIG.EXAM_DURATION_SECONDS - durationSec);
        const academicGrade = Number(((correctCount / CONFIG.TOTAL_QUESTIONS) * 100).toFixed(1));
        const baseScore = correctCount * CONFIG.BASE_POINTS_PER_QUESTION;
        const accuracyRatio = correctCount / CONFIG.TOTAL_QUESTIONS;
        const speedBonus = Math.round(accuracyRatio * (remSec / CONFIG.EXAM_DURATION_SECONDS) * CONFIG.MAX_SPEED_BONUS);
        const totalScore = baseScore + speedBonus;

        return {
            ...r,
            correctCount,
            academicGrade,
            durationSec,
            baseScore,
            speedBonus,
            totalScore
        };
    },

    // Persistence Functions
    load() {
        try {
            const rawRec = localStorage.getItem(CONFIG.STORAGE_KEYS.RECORDS);
            if (rawRec) {
                const parsed = JSON.parse(rawRec);
                if (Array.isArray(parsed)) {
                    this.leaderboardRecords = parsed.map(r => this.sanitizeRecord(r)).filter(Boolean);
                }
            }

            const rawIp = localStorage.getItem(CONFIG.STORAGE_KEYS.IP_MAP);
            if (rawIp) {
                const parsedIp = JSON.parse(rawIp);
                const cleanIpMap = {};
                Object.keys(parsedIp || {}).forEach(k => {
                    cleanIpMap[k] = this.sanitizeRecord(parsedIp[k]);
                });
                this.ipLockRegistry = cleanIpMap;
            }

            const savedWebhook = localStorage.getItem(CONFIG.STORAGE_KEYS.WEBHOOK);
            if (savedWebhook) {
                const el = document.getElementById('input-webhook-url');
                if (el) el.value = savedWebhook;
            }

            const savedConfig = localStorage.getItem(CONFIG.STORAGE_KEYS.EXAM_CONFIG);
            if (savedConfig) {
                this.examConfig = Object.assign(this.examConfig, JSON.parse(savedConfig));
            }

            const teacherSession = sessionStorage.getItem(CONFIG.STORAGE_KEYS.TEACHER_SESSION);
            if (teacherSession === '1') {
                this.isTeacherLoggedIn = true;
            }
        } catch (e) {
            console.error("Gagal membaca LocalStorage:", e);
        }
    },

    save() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.RECORDS, JSON.stringify(this.leaderboardRecords));
            localStorage.setItem(CONFIG.STORAGE_KEYS.IP_MAP, JSON.stringify(this.ipLockRegistry));
            localStorage.setItem(CONFIG.STORAGE_KEYS.EXAM_CONFIG, JSON.stringify(this.examConfig));
        } catch (e) {
            console.error("Gagal menyimpan ke LocalStorage:", e);
        }
    },

    findRecordByIp(ip) {
        if (!ip || ip === "Mendeteksi...") return null;
        if (this.ipLockRegistry[ip]) return this.ipLockRegistry[ip];
        return this.leaderboardRecords.find(r => String(r.ip).trim() === String(ip).trim()) || null;
    }
};

if (typeof module !== 'undefined') {
    module.exports = { State };
}
