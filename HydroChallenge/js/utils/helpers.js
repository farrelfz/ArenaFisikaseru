// ==========================================================================
// HYDRO CHALLENGE — UTILITAS (FORMAT, SHUFFLE, TOAST)
// ==========================================================================

const Utils = {
    escapeHtml(str) {
        if (str === null || str === undefined) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    },

    formatNumber(num) {
        return Number(num || 0).toLocaleString('id-ID');
    },

    formatTime(seconds) {
        const s = Math.max(0, Math.floor(seconds));
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    },

    shuffleArray(arr) {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    },

    showToast(msg, isSuccess = true) {
        const toast = document.getElementById('edu-toast');
        const text = document.getElementById('edu-toast-text');
        const dot = document.getElementById('edu-toast-dot');
        if (!toast || !text) return;

        text.textContent = msg;
        if (dot) {
            dot.className = isSuccess
                ? "w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"
                : "w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0";
        }

        toast.classList.remove('hidden');
        toast.classList.add('flex');
        clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => {
            toast.classList.add('hidden');
            toast.classList.remove('flex');
        }, 3800);
    }
};

if (typeof module !== 'undefined') {
    module.exports = { Utils };
}
