// ==========================================================================
// HYDROARENA SMAN 78 - MODUL INTEGRASI SPREADSHEET & SINKRONISASI HASIL
// ==========================================================================

const SpreadsheetService = {
    async sync(showNotification = false) {
        let fetchedRows = [];
        let isConnected = false;

        const webhookUrl = localStorage.getItem(CONFIG.STORAGE_KEYS.WEBHOOK) || CONFIG.DEFAULT_WEBHOOK_URL;

        // 1. Prioritas Utama: Ambil langsung dari Google Apps Script Web App (pasti hanya murid, skip bank soal)
        if (webhookUrl && webhookUrl.startsWith("http")) {
            try {
                const res = await fetch(webhookUrl, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();

                    // Sinkronisasi status ujian global dari server jika ada
                    if (data && typeof data.examIsOpen === 'boolean') {
                        const previousStatus = State.examConfig.isOpen;
                        State.examConfig.isOpen = data.examIsOpen;
                        if (typeof data.allowReview === 'boolean') {
                            State.examConfig.allowReview = data.allowReview;
                        }
                        State.save();
                        App.applyExamConfigUI();

                        // Beri notifikasi langsung jika ujian baru saja dibuka oleh Guru
                        if (!previousStatus && data.examIsOpen) {
                            Utils.showToast("🟢 Pendaftaran Ujian telah RESMI DIBUKA oleh Guru! Silakan lengkapi identitas untuk memulai.", true);
                        }
                    }

                    if (data && Array.isArray(data.rows) && data.rows.length > 0) {
                        fetchedRows = data.rows.map((rowCells, idx) => {
                            return this._parseGvizRow(rowCells, idx);
                        }).filter(Boolean);
                        isConnected = true;
                    } else if (data && data.status === 'active') {
                        // Terhubung dengan sukses ke Apps Script tapi data murid di spreadsheet masih kosong
                        isConnected = true;
                    }
                }
            } catch (err) {
                console.warn("Apps Script Web App GET tidak merespons, mencoba GVIZ:", err);
            }
        }

        // 2. Fallback: Ambil data via Google Visualization API (JSONP format)
        if (!isConnected) {
            try {
                const res = await fetch(CONFIG.SPREADSHEET_GVIZ_URL, { cache: 'no-store' });
                if (res.ok) {
                    const text = await res.text();
                    const jsonStart = text.indexOf('{');
                    const jsonEnd = text.lastIndexOf('}') + 1;
                    if (jsonStart >= 0 && jsonEnd > jsonStart) {
                        const parsed = JSON.parse(text.substring(jsonStart, jsonEnd));
                        if (parsed.table && parsed.table.rows) {
                            fetchedRows = parsed.table.rows.map((r, idx) => {
                                const cells = r.c.map(cell => (cell ? cell.v : ''));
                                return this._parseGvizRow(cells, idx);
                            }).filter(Boolean);
                            isConnected = true;
                        }
                    }
                }
            } catch (e) {
                console.warn("GVIZ API tidak merespons, mencoba fallback CSV:", e);
            }
        }

        // 3. Fallback baca via CSV jika GVIZ gagal
        if (!isConnected) {
            try {
                const res = await fetch(CONFIG.SPREADSHEET_CSV_URL, { cache: 'no-store' });
                if (res.ok) {
                    const csvText = await res.text();
                    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
                    if (lines.length > 1) {
                        fetchedRows = lines.slice(1).map((line, idx) => {
                            const cells = this._parseCsvLine(line);
                            return this._parseCsvRow(cells, idx);
                        }).filter(Boolean);
                        isConnected = true;
                    }
                }
            } catch (e) {
                console.warn("Fallback CSV juga tidak merespons:", e);
            }
        }

        this._updateConnectionIndicator(isConnected);

        // 3. Gabungkan data spreadsheet ke State dengan sanitasi ketat (mencegah format usang 35 soal)
        if (fetchedRows.length > 0) {
            fetchedRows.forEach(remoteRec => {
                const sanitized = State.sanitizeRecord(remoteRec);
                if (!sanitized) return;
                const existingIdx = State.leaderboardRecords.findIndex(
                    l => l.ip === sanitized.ip || (l.name === sanitized.name && l.className === sanitized.className && l.absen === sanitized.absen)
                );
                if (existingIdx >= 0) {
                    State.leaderboardRecords[existingIdx] = sanitized;
                } else {
                    State.leaderboardRecords.push(sanitized);
                }
                State.ipLockRegistry[sanitized.ip] = sanitized;
            });
            State.save();
        }

        if (showNotification) {
            if (isConnected) {
                Utils.showToast(`Berhasil sinkronisasi dengan Google Spreadsheet (${fetchedRows.length} data diterima).`);
            } else {
                Utils.showToast("Menggunakan data cache lokal (koneksi Spreadsheet offline).", false);
            }
        }

        return isConnected;
    },

    async pushRecord(record) {
        // Simpan langsung ke lokal
        const existingIdx = State.leaderboardRecords.findIndex(r => r.ip === record.ip);
        if (existingIdx >= 0) State.leaderboardRecords[existingIdx] = record;
        else State.leaderboardRecords.push(record);

        State.ipLockRegistry[record.ip] = record;
        State.save();

        // Kirim ke Google Apps Script Webhook jika dikonfigurasi (Local Override atau Default System Webhook)
        const webhookUrl = localStorage.getItem(CONFIG.STORAGE_KEYS.WEBHOOK) || CONFIG.DEFAULT_WEBHOOK_URL;
        if (webhookUrl && webhookUrl.startsWith("http")) {
            try {
                await fetch(webhookUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record)
                });
                Utils.showToast("Hasil ujian berhasil dikirim dan tersimpan di Google Spreadsheet!");
            } catch (err) {
                console.error("Gagal mengirim ke Webhook Apps Script:", err);
                Utils.showToast("Tersimpan di lokal. Gagal menghubungi Apps Script otomatis.", false);
            }
        } else {
            Utils.showToast("Hasil ujian disimpan di penyimpanan lokal perangkat.");
        }
    },

    _updateConnectionIndicator(isConnected) {
        const dot = document.getElementById('lobby-sheet-dot');
        const text = document.getElementById('lobby-sheet-status');
        if (dot && text) {
            if (isConnected) {
                dot.className = "w-2 h-2 rounded-full bg-emerald-500 animate-pulse";
                text.textContent = "Terhubung ke Google Spreadsheet";
                text.className = "text-emerald-700 font-medium";
            } else {
                dot.className = "w-2 h-2 rounded-full bg-slate-400";
                text.textContent = "Mode Mandiri (Database Lokal)";
                text.className = "text-slate-500 font-medium";
            }
        }
    },

    _parseGvizRow(cells, idx) {
        if (!cells || cells.length < 5) return null;

        // Deteksi format resmi tabel: Col 0 = No. Absen & Col 1 = Nama Siswa
        const col0Num = parseInt(cells[0], 10);
        const isNewFormat = !isNaN(col0Num) && col0Num >= 1 && col0Num <= 50 && typeof cells[1] === 'string' && isNaN(cells[1]);

        if (isNewFormat) {
            const absen = col0Num;
            const name = String(cells[1] || "Peserta").trim();
            const className = String(cells[2] || "XI A").trim();

            // Saring ketat: Baris WAJIB kelas resmi (XI A-XI F), BUKAN kode soal Q01-Q25, dan BUKAN tester
            if (!CONFIG.CLASSES.includes(className) || /^Q\d+$/i.test(name) || !name || name.length < 2 || name === "Peserta" || /tester|penguji/i.test(name)) {
                return null;
            }

            const grade = parseFloat(cells[3]) || 0;
            const totalScore = parseInt(cells[5], 10) || 0;
            const correctCount = parseInt(cells[6], 10) || 0;
            const durStr = String(cells[9] || "0m 0s");
            let durationSec = 1800;
            const mMatch = durStr.match(/(\d+)m/);
            const sMatch = durStr.match(/(\d+)s/);
            if (mMatch) durationSec = parseInt(mMatch[1], 10) * 60 + (sMatch ? parseInt(sMatch[1], 10) : 0);
            const ip = String(cells[12] || `remote_${idx}`).trim();

            return {
                id: `gviz_res_${idx}_${Date.now()}`,
                timestamp: cells[11] || new Date().toISOString(),
                ip,
                name,
                className,
                absen,
                correctCount,
                academicGrade: grade,
                durationSec,
                totalScore,
                tabSwitches: String(cells[10] || '').includes('Pindah Tab') ? parseInt(cells[10], 10) : 0,
                answersJson: "{}"
            };
        }

        const legName = String(cells[2] || "").trim();
        const legClass = String(cells[3] || "").trim();
        if (!CONFIG.CLASSES.includes(legClass) || /^Q\d+$/i.test(legName) || !legName || legName.length < 2 || legName === "Peserta" || /tester|penguji/i.test(legName)) {
            return null;
        }

        return {
            id: `gviz_${idx}_${Date.now()}`,
            timestamp: cells[0] || new Date().toISOString(),
            ip: String(cells[1] || `remote_${idx}`).trim(),
            name: legName,
            className: legClass,
            absen: parseInt(cells[4], 10) || 1,
            correctCount: parseInt(cells[5], 10) || 0,
            academicGrade: parseFloat(cells[6]) || 0,
            durationSec: parseInt(cells[7], 10) || 0,
            baseScore: parseInt(cells[8], 10) || 0,
            speedBonus: parseInt(cells[9], 10) || 0,
            totalScore: parseInt(cells[10], 10) || 0,
            tabSwitches: parseInt(cells[11], 10) || 0,
            answersJson: cells[12] ? String(cells[12]) : "{}"
        };
    },

    _parseCsvLine(line) {
        const result = [];
        let insideQuotes = false;
        let current = "";
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                result.push(current.trim());
                current = "";
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result.map(s => s.replace(/^"|"$/g, '').trim());
    },

    _parseCsvRow(cells, idx) {
        if (!cells || cells.length < 5) return null;
        const col0Num = parseInt(cells[0], 10);
        const isNewFormat = !isNaN(col0Num) && col0Num >= 1 && col0Num <= 50 && typeof cells[1] === 'string' && isNaN(cells[1]);

        if (isNewFormat) {
            const absen = col0Num;
            const name = String(cells[1] || "Peserta").trim();
            const className = String(cells[2] || "XI A").trim();

            // Saring ketat: Baris WAJIB kelas resmi (XI A-XI F), BUKAN kode soal Q01-Q25, dan BUKAN tester
            if (!CONFIG.CLASSES.includes(className) || /^Q\d+$/i.test(name) || !name || name.length < 2 || name === "Peserta" || /tester|penguji/i.test(name)) {
                return null;
            }

            const grade = parseFloat(cells[3]) || 0;
            const totalScore = parseInt(cells[5], 10) || 0;
            const correctCount = parseInt(cells[6], 10) || 0;
            const durStr = String(cells[9] || "0m 0s");
            let durationSec = 1800;
            const mMatch = durStr.match(/(\d+)m/);
            const sMatch = durStr.match(/(\d+)s/);
            if (mMatch) durationSec = parseInt(mMatch[1], 10) * 60 + (sMatch ? parseInt(sMatch[1], 10) : 0);
            const ip = String(cells[12] || "").trim();

            return {
                id: `csv_res_${idx}_${Date.now()}`,
                timestamp: cells[11] || new Date().toISOString(),
                ip,
                name,
                className,
                absen,
                correctCount,
                academicGrade: grade,
                durationSec,
                totalScore,
                tabSwitches: String(cells[10] || '').includes('Pindah Tab') ? parseInt(cells[10], 10) : 0,
                answersJson: "{}"
            };
        }

        const legCsvName = String(cells[2] || "").trim();
        const legCsvClass = String(cells[3] || "").trim();
        if (!CONFIG.CLASSES.includes(legCsvClass) || /^Q\d+$/i.test(legCsvName) || !legCsvName || legCsvName.length < 2 || legCsvName === "Peserta" || /tester|penguji/i.test(legCsvName)) {
            return null;
        }

        return {
            id: `csv_${idx}_${Date.now()}`,
            timestamp: cells[0] || new Date().toISOString(),
            ip: String(cells[1] || "").trim(),
            name: legCsvName,
            className: legCsvClass,
            absen: parseInt(cells[4], 10) || 1,
            correctCount: parseInt(cells[5], 10) || 0,
            academicGrade: parseFloat(cells[6]) || 0,
            durationSec: parseInt(cells[7], 10) || 0,
            baseScore: parseInt(cells[8], 10) || 0,
            speedBonus: parseInt(cells[9], 10) || 0,
            totalScore: parseInt(cells[10], 10) || 0,
            tabSwitches: parseInt(cells[11], 10) || 0,
            answersJson: cells[12] || "{}"
        };
    }
};

if (typeof module !== 'undefined') {
    module.exports = { SpreadsheetService };
}
