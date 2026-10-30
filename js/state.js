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
    isAdminTriggered: false, // Terbuka lewat ?admin=1 atau 3x klik logo
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
                    this.leaderboardRecords = parsed
                        .map(r => this.sanitizeRecord(r))
                        .filter(r => r && CONFIG.CLASSES.includes(r.className) && !/^Q\d+$/i.test(r.name));
                }
            }

            // Jika leaderboard kosong atau data lama kotor, isi dengan data sample 10 siswa resmi
            if (!this.leaderboardRecords || this.leaderboardRecords.length === 0) {
                this.leaderboardRecords = [
                    { name: "Ahmad Rayhan Kusuma", className: "XI C", absen: 5, correctCount: 25, academicGrade: 100, durationSec: 1650, baseScore: 25000, speedBonus: 4167, totalScore: 29167, tabSwitches: 0, ip: "103.119.67.5" },
                    { name: "Daffa Ibnu Hafidz", className: "XI E", absen: 11, correctCount: 25, academicGrade: 100, durationSec: 1780, baseScore: 25000, speedBonus: 4022, totalScore: 29022, tabSwitches: 0, ip: "103.119.69.11" },
                    { name: "Clarissa Aurelia Putri", className: "XI D", absen: 19, correctCount: 24, academicGrade: 96, durationSec: 1820, baseScore: 24000, speedBonus: 3812, totalScore: 27812, tabSwitches: 0, ip: "103.119.68.19" },
                    { name: "Rizky Dwi Pratama", className: "XI B", absen: 7, correctCount: 24, academicGrade: 96, durationSec: 1950, baseScore: 24000, speedBonus: 3627, totalScore: 27627, tabSwitches: 0, ip: "103.119.66.7" },
                    { name: "Annisa Nabila Rahma", className: "XI A", absen: 14, correctCount: 23, academicGrade: 92, durationSec: 1620, baseScore: 23000, speedBonus: 3939, totalScore: 26939, tabSwitches: 0, ip: "103.119.65.14" },
                    { name: "Siti Sarah Nurhaliza", className: "XI B", absen: 21, correctCount: 23, academicGrade: 92, durationSec: 1750, baseScore: 23000, speedBonus: 3762, totalScore: 26762, tabSwitches: 0, ip: "103.119.66.21" },
                    { name: "Kayla Salsabila Azka", className: "XI F", absen: 16, correctCount: 23, academicGrade: 92, durationSec: 1890, baseScore: 23000, speedBonus: 3571, totalScore: 26571, tabSwitches: 0, ip: "103.119.70.16" },
                    { name: "Muhammad Zaidan Al-Farisi", className: "XI A", absen: 3, correctCount: 22, academicGrade: 88, durationSec: 1540, baseScore: 22000, speedBonus: 3894, totalScore: 25894, tabSwitches: 0, ip: "103.119.65.3" },
                    { name: "Fathia Zahra Azzahra", className: "XI C", absen: 18, correctCount: 22, academicGrade: 88, durationSec: 1700, baseScore: 22000, speedBonus: 3677, totalScore: 25677, tabSwitches: 0, ip: "103.119.67.18" },
                    { name: "Bima Arya Wicaksana", className: "XI D", absen: 8, correctCount: 21, academicGrade: 84, durationSec: 1600, baseScore: 21000, speedBonus: 3624, totalScore: 24624, tabSwitches: 0, ip: "103.119.68.8" }
                ];
            }

            const rawIp = localStorage.getItem(CONFIG.STORAGE_KEYS.IP_MAP);
            if (rawIp) {
                const parsedIp = JSON.parse(rawIp);
                const cleanIpMap = {};
                Object.keys(parsedIp || {}).forEach(k => {
                    const rec = this.sanitizeRecord(parsedIp[k]);
                    if (rec && CONFIG.CLASSES.includes(rec.className) && !/^Q\d+$/i.test(rec.name)) {
                        cleanIpMap[k] = rec;
                    }
                });
                this.ipLockRegistry = cleanIpMap;
            }

            const savedWebhook = localStorage.getItem(CONFIG.STORAGE_KEYS.WEBHOOK) || CONFIG.DEFAULT_WEBHOOK_URL;
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
