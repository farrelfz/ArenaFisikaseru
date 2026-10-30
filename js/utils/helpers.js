// ==========================================================================
// HYDROARENA SMAN 78 - FUNGSI UTILITAS & PENDUKUNG (FORMAT, TOAST, ESCAPE)
// ==========================================================================

const Utils = {
    escapeHtml(str) {
        if (!str) return "";
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
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
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
        }, 3600);
    },

    async detectIp() {
        const endpoints = [
            'https://api.ipify.org?format=json',
            'https://api64.ipify.org?format=json',
            'https://ipapi.co/json/'
        ];

        let detected = "";
        for (const url of endpoints) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 3500);
                const res = await fetch(url, { signal: controller.signal });
                clearTimeout(timeout);
                if (res.ok) {
                    const data = await res.json();
                    if (data.ip) {
                        detected = String(data.ip).trim();
                        break;
                    }
                }
            } catch (e) {}
        }

        if (!detected) {
            let saved = localStorage.getItem(CONFIG.STORAGE_KEYS.FALLBACK_IP);
            if (!saved) {
                const s1 = 103, s2 = 119;
                const s3 = Math.floor(20 + Math.random() * 200);
                const s4 = Math.floor(10 + Math.random() * 230);
                saved = `${s1}.${s2}.${s3}.${s4}`;
                localStorage.setItem(CONFIG.STORAGE_KEYS.FALLBACK_IP, saved);
            }
            detected = saved;
        }

        State.clientIpAddress = detected;
        const displayEl = document.getElementById('header-ip-display');
        if (displayEl) displayEl.textContent = detected;
        return detected;
    }
};

if (typeof module !== 'undefined') {
    module.exports = { Utils };
}
