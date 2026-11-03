// ==========================================================================
// VECTORARENA - PEMBANTU UTILITY & DETEKSI SISTEM
// ==========================================================================

const Utils = {
    // Format Angka Indonesia (cth: 75.000)
    formatNumber(num) {
        if (num === null || num === undefined || isNaN(num)) return "0";
        return Number(num).toLocaleString('id-ID');
    },

    // Format Desimal (cth: 85,5)
    formatDecimal(num, fractionDigits = 1) {
        if (num === null || num === undefined || isNaN(num)) return "0,0";
        return Number(num).toLocaleString('id-ID', {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits
        });
    },

    // Format Detik ke MM:SS
    formatTime(seconds) {
        const sec = Math.max(0, Math.floor(seconds));
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },

    // Pengacakan Array Menggunakan Algoritma Fisher-Yates
    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    // Pengacakan Deterministik dengan Seed
    shuffleWithSeed(array, seed) {
        const arr = [...array];
        let h = 0;
        for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) | 0;
        for (let i = arr.length - 1; i > 0; i--) {
            h = (h * 1103515245 + 12345) & 0x7fffffff;
            const j = h % (i + 1);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    // Label tingkat kesulitan. Bank soal menyimpan difficulty sebagai angka
    // (1–4); fungsi ini menerima angka ATAU string apa pun yang mungkin datang
    // dari data lama, sehingga pemanggil tidak pernah memicu TypeError.
    difficultyLabel(level) {
        const key = Number(level);
        if (CONFIG.DIFFICULTY_LABELS && CONFIG.DIFFICULTY_LABELS[key]) {
            return CONFIG.DIFFICULTY_LABELS[key];
        }
        if (typeof level === 'string' && level.trim()) return level.trim().toUpperCase();
        return 'SEDANG';
    },

    // Escape HTML untuk Keamanan dari XSS
    escapeHtml(text) {
        if (!text) return "";
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    // Mini Renderer TeX Sederhana (Offline, Aman dari XSS)
    renderMiniTeX(text) {
        if (!text) return "";
        let t = this.escapeHtml(text);
        // Pecahan: \frac{a}{b} -> <sup>a</sup>&frasl;<sub>b</sub>
        t = t.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span class="inline-block text-center align-middle mx-1"><span class="block border-b border-current pb-0.5">$1</span><span class="block pt-0.5">$2</span></span>');
        // Akar: \sqrt{x} atau \sqrt[n]{x}
        t = t.replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '&radic;<sup>$1</sup>($2)');
        t = t.replace(/\\sqrt\{([^}]+)\}/g, '&radic;($1)');
        // Pangkat: ^2 atau ^{abc}
        t = t.replace(/\^{([^}]+)\}/g, '<sup>$1</sup>');
        t = t.replace(/\^([0-9a-zA-Z+-]+)/g, '<sup>$1</sup>');
        // Subskrip: _0 atau _{abc}
        t = t.replace(/_\{([^}]+)\}/g, '<sub>$1</sub>');
        t = t.replace(/_([0-9a-zA-Z+-]+)/g, '<sub>$1</sub>');
        // Simbol Fisika & Matematika Umum
        t = t.replace(/\\theta/g, '&theta;');
        t = t.replace(/\\alpha/g, '&alpha;');
        t = t.replace(/\\beta/g, '&beta;');
        t = t.replace(/\\Delta/g, '&Delta;');
        t = t.replace(/\\times/g, '&times;');
        t = t.replace(/\\approx/g, '&asymp;');
        t = t.replace(/\\pm/g, '&plusmn;');
        t = t.replace(/\\leq/g, '&le;');
        t = t.replace(/\\geq/g, '&ge;');
        t = t.replace(/\\vec\{([^}]+)\}/g, '<span class="border-t border-current pt-0.2">$1&#8407;</span>');
        return t;
    },

    // Tampilkan Toast Notifikasi Elegan
    showToast(msg, isSuccess = true) {
        const toast = document.getElementById('va-toast');
        const text = document.getElementById('va-toast-text');
        const dot = document.getElementById('va-toast-dot');
        if (!toast || !text) return;

        text.textContent = msg;
        if (dot) {
            dot.className = isSuccess 
                ? "w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-sm" 
                : "w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0 shadow-sm";
        }

        toast.classList.remove('hidden');
        toast.classList.add('flex');
        clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => {
            toast.classList.add('hidden');
            toast.classList.remove('flex');
        }, 3600);
    },

    // Deteksi IP Klien Otomatis
    async detectIp() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);
            const resp = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
            clearTimeout(timeoutId);
            if (resp.ok) {
                const data = await resp.json();
                State.clientIpAddress = data.ip || '127.0.0.1';
            } else {
                State.clientIpAddress = '127.0.0.1';
            }
        } catch (e) {
            State.clientIpAddress = '127.0.0.1 (Lokal)';
        }
        return State.clientIpAddress;
    },

    // Debounce Helper
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
};
