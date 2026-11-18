// ==========================================================================
// HYDRO CHALLENGE — MANAJEMEN STATE LOKAL (TANPA SPREADSHEET)
// ==========================================================================

const State = {
    leaderboardRecords: [],
    currentReviewRecord: null,

    activeSession: {
        name: "",
        className: "XI A",
        absen: 1,
        startTimeMs: 0,
        remainingSeconds: CONFIG.EXAM_DURATION_SECONDS,
        timerInterval: null,
        questions: [],
        currentIndex: 0,
        selectedAnswers: {},
        doubtFlags: {},
        tabSwitches: 0
    },

    sanitizeRecord(r) {
        if (!r) return null;
        const correctCount = Math.max(0, Math.min(CONFIG.TOTAL_QUESTIONS, Number(r.correctCount) || 0));
        const durationSec = Math.min(CONFIG.EXAM_DURATION_SECONDS, Math.max(1, Number(r.durationSec) || CONFIG.EXAM_DURATION_SECONDS));
        const remainingSec = Math.max(0, CONFIG.EXAM_DURATION_SECONDS - durationSec);
        const academicGrade = Number(((correctCount / CONFIG.TOTAL_QUESTIONS) * 100).toFixed(1));
        const baseScore = correctCount * CONFIG.BASE_POINTS_PER_QUESTION;
        const accuracyRatio = correctCount / CONFIG.TOTAL_QUESTIONS;
        const speedBonus = Math.round(accuracyRatio * (remainingSec / CONFIG.EXAM_DURATION_SECONDS) * CONFIG.MAX_SPEED_BONUS);
        const totalScore = baseScore + speedBonus;

        return {
            ...r,
            correctCount,
            academicGrade,
            durationSec,
            baseScore,
            speedBonus,
            totalScore,
            tabSwitches: Number(r.tabSwitches) || 0
        };
    },

    load() {
        try {
            const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.RECORDS);
            if (!raw) {
                this.leaderboardRecords = [];
                return;
            }
            const parsed = JSON.parse(raw);
            this.leaderboardRecords = Array.isArray(parsed)
                ? parsed.map(r => this.sanitizeRecord(r)).filter(r => r && r.name && CONFIG.CLASSES.includes(r.className))
                : [];
        } catch (e) {
            console.error("Gagal membaca data lokal:", e);
            this.leaderboardRecords = [];
        }
    },

    save() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.RECORDS, JSON.stringify(this.leaderboardRecords));
        } catch (e) {
            console.error("Gagal menyimpan data lokal:", e);
            Utils.showToast("Penyimpanan lokal penuh. Data terakhir tidak dapat disimpan.", false);
        }
    },

    addRecord(record) {
        const clean = this.sanitizeRecord(record);
        if (!clean) return null;
        this.leaderboardRecords.push(clean);
        this.save();
        return clean;
    },

    // Satu siswa (nama + kelas) hanya tampil sekali di klasemen dengan skor terbaiknya.
    getDedupedRecords() {
        const best = new Map();
        this.leaderboardRecords.forEach(r => {
            const key = `${String(r.name).trim().toLowerCase()}|${r.className}`;
            const prev = best.get(key);
            if (!prev) {
                best.set(key, r);
                return;
            }
            const better = (r.totalScore > prev.totalScore) ||
                (r.totalScore === prev.totalScore && r.academicGrade > prev.academicGrade) ||
                (r.totalScore === prev.totalScore && r.academicGrade === prev.academicGrade && r.durationSec < prev.durationSec);
            if (better) best.set(key, r);
        });
        return Array.from(best.values());
    },

    clearRecords() {
        this.leaderboardRecords = [];
        try {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.RECORDS);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.ACTIVE_SESSION);
        } catch (e) {}
    }
};

if (typeof module !== 'undefined') {
    module.exports = { State };
}
