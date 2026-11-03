// ==========================================================================
// VECTORARENA - MODUL INTEGRASI GOOGLE SPREADSHEET & SINKRONISASI HASIL
// Webhook backend: VectorArena/apps-script/Code.gs
// ==========================================================================

const SpreadsheetService = {
    // Menaikkan angka ini setiap kali guru mengubah status dari perangkat ini
    // sendiri; dipakai untuk menolak hasil tarikan server yang sudah basi.
    _localConfigRevision: 0,

    // Ambil URL webhook: pengaturan guru (localStorage) menang atas bawaan.
    getWebhookUrl() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.WEBHOOK) || CONFIG.DEFAULT_WEBHOOK_URL || '';
    },

    isConfigured() {
        const url = this.getWebhookUrl();
        return typeof url === 'string' && url.startsWith('http');
    },

    // Body JSON dikirim sebagai text/plain supaya tidak memicu preflight CORS
    // Apps Script. Mode default (bukan 'no-cors') supaya respons tetap terbaca:
    // dengan 'no-cors' respons menjadi opaque dan status "skipped"/"error"
    // dari server tidak akan pernah terlihat.
    //
    // Batas waktu dipasang supaya halaman tidak menggantung selamanya bila
    // server tidak merespons; nilai siswa tetap aman di perangkat.
    async _post(payload, timeoutMs = 15000) {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

        try {
            const response = await fetch(this.getWebhookUrl(), {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload),
                ...(controller ? { signal: controller.signal } : {})
            });

            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch (err) {
                throw new Error('Respons server bukan JSON (periksa akses deployment "Anyone").');
            }
        } catch (err) {
            if (err && err.name === 'AbortError') {
                throw new Error('Server tidak merespons dalam ' + Math.round(timeoutMs / 1000) + ' detik.');
            }
            throw err;
        } finally {
            if (timer) clearTimeout(timer);
        }
    },

    // Uji koneksi dari panel guru.
    async testConnection() {
        if (!this.isConfigured()) {
            return { ok: false, message: 'URL webhook belum diisi.' };
        }
        try {
            const data = await this._post({ action: 'ping' });
            if (data && data.status === 'ok') {
                return {
                    ok: true,
                    message: `Terhubung ke "${data.spreadsheet || 'spreadsheet'}" (${data.totalSheets ?? '?'} sheet).`
                };
            }
            return { ok: false, message: (data && data.message) || 'Server tidak mengenali permintaan ping.' };
        } catch (err) {
            return { ok: false, message: err.message || String(err) };
        }
    },

    // Kirim satu hasil ujian. Mengembalikan objek hasil agar pemanggil bisa
    // membedakan tersimpan / ditolak sebagai duplikat / gagal.
    async pushRecord(record, timeoutMs) {
        if (!this.isConfigured()) {
            return { status: 'local', message: 'Hasil disimpan di perangkat (webhook belum diatur).' };
        }
        try {
            const data = await this._post(record, timeoutMs);
            return data || { status: 'error', message: 'Respons kosong dari server.' };
        } catch (err) {
            return { status: 'error', message: err.message || String(err) };
        }
    },

    // Sinkronkan status ujian & pembahasan dari server.
    //
    // Penjaga balapan: permintaan GET butuh waktu, dan selama itu guru bisa
    // mengubah status dari panel di perangkat ini. Bila ada aksi lokal yang
    // terjadi setelah permintaan dikirim, hasil tarikan diabaikan supaya
    // keputusan guru yang lebih baru tidak tertimpa data server yang sudah basi.
    async syncExamConfig(showNotification = false) {
        if (!this.isConfigured()) return false;

        const revisionAtSend = this._localConfigRevision;

        try {
            const response = await fetch(this.getWebhookUrl(), { cache: 'no-store' });
            if (!response.ok) return false;

            const data = await response.json();
            let changed = false;

            const superseded = this._localConfigRevision !== revisionAtSend;

            if (!superseded && data && typeof data.examIsOpen === 'boolean') {
                if (State.examConfig.isOpen !== data.examIsOpen) changed = true;
                State.examConfig._isOpen = data.examIsOpen;
                State.examConfig.overrideMode = data.examIsOpen ? 'manual_open' : 'manual_closed';
            }
            if (!superseded && data && typeof data.allowReview === 'boolean') {
                if (State.examConfig.allowReview !== data.allowReview) changed = true;
                State.examConfig._allowReview = data.allowReview;
                State.examConfig.overrideReviewMode = data.allowReview ? 'manual_allowed' : 'manual_locked';
            }

            State.save();

            if (typeof App !== 'undefined' && App.applyExamConfigUI) App.applyExamConfigUI();

            if (showNotification && typeof Utils !== 'undefined') {
                Utils.showToast(
                    data.status === 'active'
                        ? `Sinkronisasi server berhasil (${data.totalRecords ?? 0} catatan).`
                        : 'Server merespons, tetapi statusnya tidak dikenal.'
                );
            }

            this.updateConnectionIndicator(true);
            return changed;
        } catch (err) {
            console.warn('Gagal sinkronisasi dari Apps Script:', err);
            this.updateConnectionIndicator(false);
            if (showNotification && typeof Utils !== 'undefined') {
                Utils.showToast('Gagal menghubungi server. Mode mandiri (data lokal) tetap berjalan.', false);
            }
            return false;
        }
    },

    // Ubah status ujian / pembahasan di server (dipakai panel guru).
    async setExamConfig(patch, showNotification = false) {
        // Tandai bahwa pengaturan di perangkat ini baru saja berubah, supaya
        // tarikan server yang sedang berjalan tidak menimpanya.
        this._localConfigRevision += 1;

        if (!this.isConfigured()) {
            if (showNotification && typeof Utils !== 'undefined') {
                Utils.showToast('Webhook belum diatur: pengaturan hanya berlaku di perangkat ini.', false);
            }
            return false;
        }

        try {
            const data = await this._post(Object.assign({ action: 'setExamConfig' }, patch));
            const ok = data && data.status === 'ok';

            if (ok) {
                if (typeof data.examIsOpen === 'boolean') {
                    State.examConfig._isOpen = data.examIsOpen;
                    State.examConfig.overrideMode = patch.overrideMode === 'auto'
                        ? 'auto'
                        : (data.examIsOpen ? 'manual_open' : 'manual_closed');
                }
                if (typeof data.allowReview === 'boolean') {
                    State.examConfig._allowReview = data.allowReview;
                    State.examConfig.overrideReviewMode = data.allowReview ? 'manual_allowed' : 'manual_locked';
                }
                State.save();
                if (typeof App !== 'undefined' && App.applyExamConfigUI) App.applyExamConfigUI();
            }

            if (showNotification && typeof Utils !== 'undefined') {
                Utils.showToast(ok
                    ? 'Status ujian tersinkron ke server.'
                    : ((data && data.message) || 'Server menolak perubahan status.'), ok);
            }
            return ok;
        } catch (err) {
            if (showNotification && typeof Utils !== 'undefined') {
                Utils.showToast('Gagal menyinkron status ke server: ' + (err.message || err), false);
            }
            return false;
        }
    },

    updateConnectionIndicator(isConnected) {
        const dot = document.getElementById('lobby-sheet-dot');
        const text = document.getElementById('lobby-sheet-status');
        if (!dot || !text) return;

        if (isConnected) {
            dot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
            text.textContent = 'Terhubung ke Google Spreadsheet';
            text.className = 'text-emerald-700 font-medium';
        } else {
            dot.className = 'w-2 h-2 rounded-full bg-slate-400';
            text.textContent = this.isConfigured() ? 'Mode Mandiri (Server tidak terjangkau)' : 'Mode Mandiri (Database Lokal)';
            text.className = 'text-slate-500 font-medium';
        }
    }
};

if (typeof module !== 'undefined') {
    module.exports = { SpreadsheetService };
}