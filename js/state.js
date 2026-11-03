// ==========================================================================
// VECTORARENA - MANAJEMEN STATE SISTEM (CENTRAL STATE)
// ==========================================================================

const State = {
    // Alamat IP Klien
    clientIpAddress: "Mendeteksi...",

    // Mode Game Aktif
    currentMode: 'ranked',

    // Data Peringkat & Kunci IP
    leaderboardRecords: [],
    ipLockRegistry: {},

    // Sesi Ujian Murid yang Sedang Berjalan
    activeSession: {
        name: "",
        className: "X A",
        absen: 1,
        mode: "ranked",
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
    isAdminTriggered: false, // Terbuka lewat ?admin=1 atau 3x klik logo
    activeAdminSubTab: 'ctrl',

    // Konfigurasi Dinamis Ujian
    examConfig: {
        _isOpen: true,
        overrideMode: 'auto', // 'auto' | 'manual_open' | 'manual_closed'
        _allowReview: true,
        overrideReviewMode: 'auto', // 'auto' | 'manual_allowed' | 'manual_locked'
        get isOpen() {
            if (this.overrideMode === 'manual_open') return true;
            if (this.overrideMode === 'manual_closed') return false;
            return this._isOpen;
        },
        set isOpen(val) {
            this._isOpen = !!val;
            this.overrideMode = val ? 'manual_open' : 'manual_closed';
        },
        get allowReview() {
            if (this.overrideReviewMode === 'manual_allowed') return true;
            if (this.overrideReviewMode === 'manual_locked') return false;
            return this._allowReview;
        },
        set allowReview(val) {
            this._allowReview = !!val;
            this.overrideReviewMode = val ? 'manual_allowed' : 'manual_locked';
        }
    },

    // Record yang sedang dibuka di Mode Review
    currentReviewRecord: null,

    // Fungsi Pembersih & Penyelaras Data
    sanitizeRecord(r) {
        if (!r) return null;
        const totalQ = Number(r.totalQuestions) || CONFIG.TOTAL_QUESTIONS;
        let correctCount = Math.min(totalQ, Math.max(0, Number(r.correctCount) || 0));

        const maxDuration = r.mode && CONFIG.MODES.find(m => m.id === r.mode)
            ? CONFIG.MODES.find(m => m.id === r.mode).durationSeconds
            : CONFIG.EXAM_DURATION_SECONDS;

        const durationSec = Math.min(maxDuration, Math.max(1, Number(r.durationSec) || 60));
        const remSec = Math.max(0, maxDuration - durationSec);
        const academicGrade = Number(((correctCount / totalQ) * 100).toFixed(1));
        const baseScore = correctCount * CONFIG.BASE_POINTS_PER_QUESTION;
        const accuracyRatio = correctCount / totalQ;
        const speedBonus = Math.round(accuracyRatio * (remSec / maxDuration) * CONFIG.MAX_SPEED_BONUS);
        const totalScore = baseScore + speedBonus;

        return {
            ...r,
            totalQuestions: totalQ,
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
                    this.leaderboardRecords = parsed
                        .map(r => this.sanitizeRecord(r))
                        .filter(r => r && CONFIG.CLASSES.includes(r.className) && !/^Q\d+$/i.test(r.name) && !/tester|penguji/i.test(r.name));
                }
            } else {
                this.leaderboardRecords = [];
            }

            const rawIp = localStorage.getItem(CONFIG.STORAGE_KEYS.IP_MAP);
            if (rawIp) {
                const parsedIp = JSON.parse(rawIp);
                const cleanIpMap = {};
                Object.keys(parsedIp || {}).forEach(k => {
                    const rec = this.sanitizeRecord(parsedIp[k]);
                    if (rec && CONFIG.CLASSES.includes(rec.className) && !/^Q\d+$/i.test(rec.name) && !/tester|penguji/i.test(rec.name)) {
                        cleanIpMap[k] = rec;
                    }
                });
                this.ipLockRegistry = cleanIpMap;
            } else {
                this.ipLockRegistry = {};
            }

            const savedWebhook = localStorage.getItem(CONFIG.STORAGE_KEYS.WEBHOOK) || CONFIG.DEFAULT_WEBHOOK_URL;
            if (savedWebhook) {
                const el = document.getElementById('input-webhook-url');
                if (el) el.value = savedWebhook;
            }

            const savedConfig = localStorage.getItem(CONFIG.STORAGE_KEYS.EXAM_CONFIG);
            if (savedConfig) {
                try {
                    const parsed = JSON.parse(savedConfig);
                    if (parsed.overrideMode) this.examConfig.overrideMode = parsed.overrideMode;
                    if (parsed.overrideReviewMode) this.examConfig.overrideReviewMode = parsed.overrideReviewMode;
                    else if (parsed.allowReview !== undefined) this.examConfig.allowReview = parsed.allowReview;
                } catch (e) {}
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
            localStorage.setItem(CONFIG.STORAGE_KEYS.EXAM_CONFIG, JSON.stringify({
                overrideMode: this.examConfig.overrideMode,
                overrideReviewMode: this.examConfig.overrideReviewMode,
                allowReview: this.examConfig.allowReview
            }));
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
