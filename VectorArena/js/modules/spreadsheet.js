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

    // Terapkan status ujian / pembahasan dari server ke State lokal.
    // Dipakai bersama oleh syncExamConfig() dan sync() agar tidak ada duplikasi.
    _applyExamStateFromServer(data) {
        if (data && typeof data.examIsOpen === 'boolean') {
            State.examConfig._isOpen = data.examIsOpen;
            State.examConfig.overrideMode = data.examIsOpen ? 'manual_open' : 'manual_closed';
        }
        if (data && typeof data.allowReview === 'boolean') {
            State.examConfig._allowReview = data.allowReview;
            State.examConfig.overrideReviewMode = data.allowReview ? 'manual_allowed' : 'manual_locked';
        }
    },

    // Sinkronkan penuh dari server: status ujian + SELURUH record hasil ujian
    // siswa (semua kelas, termasuk data yang dikumpulkan dari perangkat lain).
    // Tanpa ini, klasemen dan rekap panel guru hanya menampilkan data yang
    // dikumpulkan dari perangkat itu sendiri — spreadsheet dan website akan
    // selalu berbeda antar perangkat.
    async sync(showNotification = false) {
        if (!this.isConfigured()) return false;

        const revisionAtSend = this._localConfigRevision;

        let data = null;              // payload webhook GET (status + records + examState)
        let webhookOk = false;        // webhook GET sukses & JSON terbaca
        let webhookHadRecords = false; // webhook mengirim records (otoritatif)

        // 1. Prioritas utama: webhook GET dari Apps Script.
        try {
            const response = await fetch(this.getWebhookUrl(), { cache: 'no-store' });
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }
            data = await response.json();
            webhookOk = true;
        } catch (err) {
            console.warn('Gagal sinkronisasi dari Apps Script (GET):', err);
            data = null;
        }

        // Normalisasi payload webhook: backend baru mengirim `records` (objek
        // rowToRecord_), backend lama mengirim `rows` (array sel mentah). Keduanya
        // OTORITATIF (mencakup semua kelas) — berbeda dengan fallback GVIZ/CSV
        // yang parsial (hanya sheet pertama) dan karenanya tidak boleh dipakai
        // sebagai dasar rekonsiliasi.
        const serverRecords = data ? this._normalizeServerRecords(data) : null;
        webhookHadRecords = Array.isArray(serverRecords);

        let changed = false;
        const superseded = this._localConfigRevision !== revisionAtSend;

        const applyExamState = () => {
            if (!superseded && data && (typeof data.examIsOpen === 'boolean' || typeof data.allowReview === 'boolean')) {
                const previousOpen = State.examConfig.isOpen;
                this._applyExamStateFromServer(data);
                State.save();
                if (previousOpen !== data.examIsOpen) {
                    changed = true;
                    if (data.examIsOpen && showNotification && typeof Utils !== 'undefined') {
                        Utils.showToast('🟢 Pendaftaran Ujian telah RESMI DIBUKA oleh Guru! Silakan lengkapi identitas untuk memulai.', true);
                    }
                }
            }
        };

        applyExamState();

        // 2. Gabungkan record server ke State lokal.
        if (!superseded) {
            if (webhookHadRecords) {
                changed = this._mergeServerRecords(serverRecords) || changed;
            } else {
                // Fallback publik (GVIZ/CSV) bila webhook tidak mengirim records.
                // Catatan: fallback hanya membaca sheet pertama, jadi rekonsiliasi
                // destruktif TIDAK dijalankan dari sumber ini.
                const fallback = await this._fetchRowsFallback();
                if (Array.isArray(fallback)) {
                    changed = this._mergeServerRecords(fallback) || changed;
                }
            }
        }

        // 3. Rekonsiliasi kunci identitas — HANYA dari data webhook penuh (semua
        //    kelas), agar record kelas lain tidak ikut terhapus oleh fallback
        //    GVIZ/CSV yang parsial.
        if (!superseded && webhookHadRecords && data && data.status === 'active') {
            changed = this._reconcileWithServer(serverRecords) || changed;
        }

        if (typeof App !== 'undefined' && App.applyExamConfigUI) App.applyExamConfigUI();

        if (webhookOk) {
            this.updateConnectionIndicator(true);
            if (showNotification && data && data.status === 'active') {
                Utils.showToast(`Sinkronisasi server berhasil (${data.totalRecords ?? 0} catatan).`);
            }
        } else {
            this.updateConnectionIndicator(false);
            if (showNotification && typeof Utils !== 'undefined') {
                Utils.showToast('Gagal menghubungi server. Mode mandiri (data lokal) tetap berjalan.', false);
            }
        }

        return changed;
    },

    // Normalisasi payload webhook ke array record server. Backend Apps Script
    // SEBELUM redeploy mengembalikan `rows` (array sel mentah per baris); SETELAH
    // redeploy menambahkan `records` (objek rowToRecord_). Fallback GVIZ/CSV
    // ditangani terpisah di _fetchRowsFallback (bukan lewat fungsi ini).
    _normalizeServerRecords(data) {
        if (!data || typeof data !== 'object') return null;
        if (Array.isArray(data.records)) return data.records;
        if (Array.isArray(data.rows)) {
            return data.rows.map((row) => this._parseSheetRow(row)).filter(Boolean);
        }
        return null;
    },

    // Gabungkan record dari server ke State.leaderboardRecords & kunci IP.
    // Identitas siswa = NAMA + KELAS + ABSEN (bukan IP, karena satu sekolah
    // berbagi IP NAT). Record lokal yang identitasnya sama dipertahankan as-is:
    // versi lokal memuat detail jawaban per soal (answersJson) yang tidak
    // dimiliki snapshot server; record dari perangkat lain ditambahkan.
    _mergeServerRecords(serverRecords) {
        const identityKey = (r) => [
            String(r.name).trim().toLowerCase(),
            String(r.className).trim().toUpperCase(),
            String(parseInt(r.absen, 10))
        ].join('|||');

        const existingIndices = new Map();
        State.leaderboardRecords.forEach((r, i) => existingIndices.set(identityKey(r), i));
        let changed = 0;

        serverRecords.forEach((raw) => {
            const rec = this._serverRecordToRecord(raw);
            if (!rec) return;
            const key = identityKey(rec);

            if (existingIndices.has(key)) {
                // Record lokal (yang memuat answersJson lengkap) dipertahankan,
                // namun diperkaya statusKKM/wrongNumbers otoritatif dari server.
                const local = State.leaderboardRecords[existingIndices.get(key)];
                if (!local) return;
                let enriched = false;
                if (rec.statusKKM && !local.statusKKM) { local.statusKKM = rec.statusKKM; enriched = true; }
                if (rec.wrongNumbers && !local.wrongNumbers) { local.wrongNumbers = rec.wrongNumbers; enriched = true; }
                if (enriched) changed++;
                return;
            }

            const sanitized = State.sanitizeRecord(rec);
            if (!sanitized) return;
            State.leaderboardRecords.push(sanitized);
            if (sanitized.ip) State.ipLockRegistry[String(sanitized.ip).trim()] = sanitized;
            existingIndices.set(key, State.leaderboardRecords.length - 1);
            changed++;
        });

        if (changed > 0) {
            State.leaderboardRecords.sort((a, b) => {
                if (a.className !== b.className) return a.className.localeCompare(b.className);
                return (parseInt(a.absen, 10) || 0) - (parseInt(b.absen, 10) || 0);
            });
            State.save();
        }

        if (changed > 0) {
            console.log(`[Spreadsheet Sync] ${changed} record baru/pemerkayaan ditarik dari Google Spreadsheet.`);
        }
        return changed > 0;
    },

    // Konversi satu baris record server (bentuk rowToRecord_ di Code.gs) ke
    // bentuk record klien. Baris uji/soal/sampah ditolak; kelas wajib resmi.
    _serverRecordToRecord(rec) {
        if (!rec || typeof rec !== 'object') return null;

        const absen = parseInt(rec.absen, 10);
        const name = String(rec.name || '').trim().replace(/\s+/g, ' ');
        const className = String(rec.className || '').trim();

        if (isNaN(absen) || absen < 1 || absen > 50) return null;
        if (name.length < 2 || name === 'Peserta' || /^Q\d+$/i.test(name) || /tester|penguji|#NUM!/i.test(name)) return null;
        if (!CONFIG.CLASSES.includes(className)) return null;

        const correctCount = Math.max(0, parseInt(rec.correctCount, 10) || 0);
        const academicGrade = Number(rec.academicGrade) || 0;
        const totalScore = parseInt(rec.totalScore, 10) || 0;
        const statusKKM = String(rec.statusKKM || '').trim();
        const wrongNumbers = String(rec.wrongNumbers || '').trim();
        const durationSec = this._parseDurationLabel(rec.durationLabel !== undefined ? rec.durationLabel : rec.durationSec);
        const tabSwitches = this._parseIntegrityTabs(rec.integrity !== undefined ? rec.integrity : rec.tabSwitches);

        return {
            id: `remote_${className.replace(/\s+/g, '')}_${absen}`,
            timestamp: String(rec.timestamp || ''),
            ip: String(rec.ip || '').trim(),
            name,
            className,
            absen,
            mode: 'ranked',
            totalQuestions: CONFIG.TOTAL_QUESTIONS,
            correctCount,
            academicGrade,
            totalScore,
            statusKKM,
            wrongNumbers,
            durationSec,
            tabSwitches,
            answersJson: '{}'
        };
    },

    // "46m 58s" / "0m 12s" / detik mentah -> detik. Gagal parse -> durasi penuh.
    _parseDurationLabel(label) {
        const s = String(label || '');
        const mMatch = s.match(/(\d+)\s*m/);
        const sMatch = s.match(/(\d+)\s*s/);
        if (mMatch) {
            const min = parseInt(mMatch[1], 10) || 0;
            const sec = sMatch ? (parseInt(sMatch[1], 10) || 0) : 0;
            const total = min * 60 + sec;
            return total > 0 ? total : CONFIG.EXAM_DURATION_SECONDS;
        }
        const asNum = parseInt(s, 10);
        return (!isNaN(asNum) && asNum > 0) ? asNum : CONFIG.EXAM_DURATION_SECONDS;
    },

    // "Level 4: CURANG BERAT (4x Tab)" -> 4. Tanpa indikasi "Tab" -> 0.
    _parseIntegrityTabs(label) {
        const s = String(label || '');
        const m = s.match(/(\d+)\s*x\s*tab/i);
        if (m) return parseInt(m[1], 10) || 0;
        return (s.toLowerCase().indexOf('tab') !== -1) ? (parseInt(s, 10) || 0) : 0;
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

    // Kirim satu hasil ujian dengan retry + verifikasi read-back. Mengembalikan
    // objek hasil agar pemanggil bisa membedakan tersimpan / ditolak / gagal.
    // Bila semua percobaan gagal, record diantrekan ke pending queue yang akan
    // dicoba ulang otomatis saat boot / polling berkala berikutnya.
    async pushRecord(record, timeoutMs) {
        if (!this.isConfigured()) {
            return { status: 'local', message: 'Hasil disimpan di perangkat (webhook belum diatur).' };
        }

        const outcome = await this._sendRecordWithRetry(record, timeoutMs);
        if (outcome.sent) {
            return {
                status: outcome.status === 'skipped' ? 'skipped' : 'ok',
                message: outcome.message || (outcome.status === 'skipped' ? 'Duplikat (sudah tersimpan di server).' : 'Hasil tersimpan di Google Spreadsheet.'),
                ...outcome
            };
        }

        // Gagal dikirim: antrekan supaya tidak hilang & dicoba ulang otomatis.
        this.enqueuePending(record);
        return { status: 'error', message: (outcome.reason || outcome.message) || 'Gagal mengirim ke Spreadsheet.', pending: true };
    },

    // =========================================================================
    // PENGIRIMAN TERVERIFIKASI (ANTI DATA-HILANG)
    // =========================================================================
    // Berbeda dengan HydroArena (respons POST opaque no-cors), backend VectorArena
    // membalas text/plain yang TIDAK memicu preflight sehingga respons TERBACA.
    // Karena itu status 'ok'/'skipped' dari respons POST langsung menjadi bukti
    // terminal. READ-BACK (GET) hanya dipakai sebagai fallback bila respons POST
    // ambigu atau gagal total.
    async _sendRecordWithRetry(record, timeoutMs) {
        const attempts = (CONFIG.SYNC_RETRY && CONFIG.SYNC_RETRY.MAX_ATTEMPTS) || 5;
        const baseDelay = (CONFIG.SYNC_RETRY && CONFIG.SYNC_RETRY.BASE_DELAY_MS) || 1200;
        const reqTimeout = timeoutMs || (CONFIG.SYNC_RETRY && CONFIG.SYNC_RETRY.REQUEST_TIMEOUT_MS) || 20000;

        let lastError = '';
        for (let attempt = 1; attempt <= attempts; attempt++) {
            try {
                const data = await this._post(record, reqTimeout);
                if (data && (data.status === 'ok' || data.status === 'skipped')) {
                    return { sent: true, status: data.status, message: data.message };
                }
                lastError = (data && data.message) || 'respons server tidak dikenali';
            } catch (err) {
                lastError = err.message || String(err);
            }

            // Fallback READ-BACK bila respons POST ambigu/gagal.
            try {
                await new Promise(r => setTimeout(r, 700));
                const verified = await this._verifyRecordPersisted(record, reqTimeout);
                if (verified) return { sent: true, status: 'verified' };
            } catch (e) { /* read-back gagal, lanjut retry */ }

            if (attempt < attempts) {
                await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, attempt - 1)));
            }
        }

        console.warn('Gagal memverifikasi penyimpanan record ke Spreadsheet setelah ' + attempts + ' percobaan:', lastError);
        return { sent: false, status: 'error', reason: lastError };
    },

    // GET dengan batas waktu (AbortController) supaya verifikasi read-back tidak
    // menggantung selamanya bila server tidak merespons. Mengembalikan Response.
    async _fetchWithTimeout(url, timeoutMs) {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
        try {
            return await fetch(url, {
                cache: 'no-store',
                ...(controller ? { signal: controller.signal } : {})
            });
        } finally {
            if (timer) clearTimeout(timer);
        }
    },

    // Membaca ulang data server dan memastikan baris (nama + kelas + absen) ada.
    // Sumber: webhook GET (record rowToRecord_), lalu fallback GVIZ/CSV publik.
    async _verifyRecordPersisted(record, timeoutMs = 20000) {
        const targetName = String(record.name || '').trim().toLowerCase();
        const targetClass = String(record.className || '').trim().toUpperCase();
        const targetAbsen = parseInt(record.absen, 10);

        // 1. Webhook GET (paling akurat & cepat).
        if (this.isConfigured()) {
            try {
                const res = await this._fetchWithTimeout(this.getWebhookUrl(), timeoutMs);
                if (res.ok) {
                    const data = await res.json();
                    const records = this._normalizeServerRecords(data);
                    if (Array.isArray(records)) {
                        return records.some(r =>
                            String(r.name || '').trim().toLowerCase() === targetName &&
                            String(r.className || '').trim().toUpperCase() === targetClass &&
                            parseInt(r.absen, 10) === targetAbsen
                        );
                    }
                }
            } catch (e) { /* lanjut fallback publik */ }
        }

        // 2. Fallback GVIZ (hanya bila SPREADSHEET_ID terisi).
        if (CONFIG.SPREADSHEET_ID) {
            try {
                const res = await this._fetchWithTimeout(CONFIG.SPREADSHEET_GVIZ_URL, timeoutMs);
                if (res.ok) {
                    const text = await res.text();
                    const jsonStart = text.indexOf('{');
                    const jsonEnd = text.lastIndexOf('}') + 1;
                    if (jsonStart >= 0 && jsonEnd > jsonStart) {
                        const parsed = JSON.parse(text.substring(jsonStart, jsonEnd));
                        if (parsed.table && parsed.table.rows) {
                            const found = parsed.table.rows.some((r) => {
                                const cells = r.c.map(cell => (cell ? cell.v : ''));
                                const rec = this._serverRecordToRecord(this._parseSheetRow(cells));
                                return rec && rec.name.toLowerCase() === targetName &&
                                    rec.className === targetClass && rec.absen === targetAbsen;
                            });
                            if (found) return true;
                        }
                    }
                }
            } catch (e) { /* lanjut CSV */ }
        }

        // 3. Fallback CSV.
        if (CONFIG.SPREADSHEET_ID) {
            try {
                const res = await this._fetchWithTimeout(CONFIG.SPREADSHEET_CSV_URL, timeoutMs);
                if (res.ok) {
                    const csvText = await res.text();
                    const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
                    for (let i = 1; i < lines.length; i++) {
                        const rec = this._serverRecordToRecord(this._parseSheetRow(this._parseCsvLine(lines[i])));
                        if (rec && rec.name.toLowerCase() === targetName &&
                            rec.className === targetClass && rec.absen === targetAbsen) return true;
                    }
                }
            } catch (e) { /* verifikasi gagal → anggap belum tersimpan */ }
        }

        return false;
    },

    // =========================================================================
    // ANTREAN PENDING (PERSISTEN DI LOCALSTORAGE)
    // =========================================================================
    _getPendingQueue() {
        try {
            const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.PENDING_SYNC);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) { return []; }
    },

    _setPendingQueue(queue) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.PENDING_SYNC, JSON.stringify(queue));
        } catch (e) {}
    },

    enqueuePending(record) {
        const queue = this._getPendingQueue();
        const key = `${record.name}|||${record.className}|||${record.absen}`;
        const exists = queue.some(r =>
            `${r.name}|||${r.className}|||${r.absen}` === key || (r.id && r.id === record.id)
        );
        if (!exists) {
            queue.push(record);
            this._setPendingQueue(queue);
        }
    },

    // Mengirim ulang semua record yang masih tertahan. Dipanggil saat boot,
    // polling berkala, dan setelah guru membuka panel.
    async flushPendingQueue() {
        const queue = this._getPendingQueue();
        if (queue.length === 0) return { flushed: 0, remaining: 0 };

        if (!this.isConfigured()) return { flushed: 0, remaining: queue.length };

        const stillPending = [];
        let flushed = 0;
        for (const rec of queue) {
            const outcome = await this._sendRecordWithRetry(rec);
            if (outcome.sent) flushed++;
            else stillPending.push(rec);
        }
        this._setPendingQueue(stillPending);
        if (flushed > 0) {
            console.log(`[Pending Sync] ${flushed} record tertahan berhasil dikirim ulang ke Spreadsheet.`);
        }
        return { flushed, remaining: stillPending.length };
    },

    getPendingCount() {
        return this._getPendingQueue().length;
    },

    // =========================================================================
    // REKONSILIASI KUNCI IDENTITAS (mencegah siswa terkunci permanen)
    // =========================================================================
    // Kunci identitas = nama|||KELAS|||absen (BUKAN IP, karena satu sekolah
    // berbagi IP NAT). Record lokal yang identitasnya tidak ada di server dihapus
    // — KECUALI record yang: masih tertahan di antrean pending, belum punya IP
    // (placeholder), atau masih muda (jendela submit in-flight).
    _reconcileWithServer(serverRecords) {
        const identityKey = (r) => [
            String(r.name || '').trim().toLowerCase(),
            String(r.className || '').trim().toUpperCase(),
            String(parseInt(r.absen, 10) || '')
        ].join('|||');

        const serverKeys = new Set(
            serverRecords
                .filter(r => CONFIG.CLASSES.includes(String(r.className || '').trim().toUpperCase()))
                .map(r => identityKey(r))
        );
        const pendingKeys = new Set(this._getPendingQueue().map(identityKey));

        const IN_FLIGHT_WINDOW_MS = 180 * 1000; // > siklus retry maksimal (~2 menit)
        const now = Date.now();

        const isPlaceholderIp = (ip) => {
            const s = String(ip || '').trim();
            return s === '' || s === '0.0.0.0' || s === 'Mendeteksi...' || s === '0';
        };

        const beforeCount = State.leaderboardRecords.length;

        State.leaderboardRecords = State.leaderboardRecords.filter(rec => {
            const key = identityKey(rec);
            if (serverKeys.has(key)) return true;
            if (pendingKeys.has(key)) return true;
            if (isPlaceholderIp(rec.ip)) return true;
            const ts = rec.timestamp ? new Date(rec.timestamp).getTime() : 0;
            if (ts && (now - ts) < IN_FLIGHT_WINDOW_MS) return true;
            return false;
        });

        // Bersihkan ipLockRegistry dari identitas yang tidak lagi ada di server.
        Object.keys(State.ipLockRegistry).forEach(ip => {
            const rec = State.ipLockRegistry[ip];
            if (!rec) { delete State.ipLockRegistry[ip]; return; }
            const key = identityKey(rec);
            if (serverKeys.has(key)) return;
            if (pendingKeys.has(key)) return;
            if (isPlaceholderIp(ip)) return;
            delete State.ipLockRegistry[ip];
        });

        if (beforeCount !== State.leaderboardRecords.length) {
            console.log(`[Reconcile] ${beforeCount - State.leaderboardRecords.length} record lokal dihapus (tidak ada di server).`);
            State.save();
            return true;
        }
        return false;
    },

    // =========================================================================
    // FALLBACK PEMBACAAN PUBLIK (GVIZ / CSV)
    // =========================================================================
    // Hanya aktif bila CONFIG.SPREADSHEET_ID terisi. Bila script ditempel
    // langsung di spreadsheet (bound-script), SPREADSHEET_ID sengaja kosong —
    // webhook GET dari Apps Script sudah cukup, dan fallback ini dilewati.
    _parseSheetRow(cells) {
        if (!cells || cells.length < 5) return null;
        return {
            absen: parseInt(cells[0], 10),
            name: String(cells[1] || '').trim(),
            className: String(cells[2] || '').trim(),
            academicGrade: Number(cells[3]) || 0,
            statusKKM: String(cells[4] || '').trim(),
            totalScore: parseInt(cells[5], 10) || 0,
            correctCount: parseInt(cells[6], 10) || 0,
            wrongCount: parseInt(cells[7], 10) || 0,
            wrongNumbers: String(cells[8] || '').trim(),
            durationLabel: String(cells[9] || '').trim(),
            integrity: String(cells[10] || '').trim(),
            timestamp: String(cells[11] || '').trim(),
            ip: String(cells[12] || '').trim()
        };
    },

    _parseCsvLine(line) {
        const result = [];
        let insideQuotes = false;
        let current = '';
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result.map(s => s.replace(/^"|"$/g, '').trim());
    },

    async _fetchRowsFallback() {
        if (!CONFIG.SPREADSHEET_ID) return null;

        // 1. GVIZ
        try {
            const res = await fetch(CONFIG.SPREADSHEET_GVIZ_URL, { cache: 'no-store' });
            if (res.ok) {
                const text = await res.text();
                const jsonStart = text.indexOf('{');
                const jsonEnd = text.lastIndexOf('}') + 1;
                if (jsonStart >= 0 && jsonEnd > jsonStart) {
                    const parsed = JSON.parse(text.substring(jsonStart, jsonEnd));
                    if (parsed.table && parsed.table.rows) {
                        const rows = parsed.table.rows
                            .map(r => this._parseSheetRow(r.c.map(cell => (cell ? cell.v : ''))))
                            .filter(Boolean);
                        if (rows.length > 0) return rows;
                    }
                }
            }
        } catch (e) { console.warn('Fallback GVIZ gagal:', e); }

        // 2. CSV
        try {
            const res = await fetch(CONFIG.SPREADSHEET_CSV_URL, { cache: 'no-store' });
            if (res.ok) {
                const csvText = await res.text();
                const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
                const rows = lines.slice(1)
                    .map(line => this._parseSheetRow(this._parseCsvLine(line)))
                    .filter(Boolean);
                if (rows.length > 0) return rows;
            }
        } catch (e) { console.warn('Fallback CSV gagal:', e); }

        return null;
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