// ==========================================================================
// HYDROARENA SMAN 78 - MODUL INTEGRASI SPREADSHEET & SINKRONISASI HASIL
// ==========================================================================

const SpreadsheetService = {
    async sync(showNotification = false) {
        let fetchedRows = [];
        let isConnected = false;

        // 1. Ambil data via Google Visualization API (JSONP format)
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

        // 2. Fallback baca via CSV jika GVIZ gagal
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

        // 3. Gabungkan data spreadsheet ke State
        if (fetchedRows.length > 0) {
            fetchedRows.forEach(remoteRec => {
                const existingIdx = State.leaderboardRecords.findIndex(
                    l => l.ip === remoteRec.ip || (l.name === remoteRec.name && l.className === remoteRec.className && l.absen === remoteRec.absen)
                );
                if (existingIdx >= 0) {
                    State.leaderboardRecords[existingIdx] = remoteRec;
                } else {
                    State.leaderboardRecords.push(remoteRec);
                }
                State.ipLockRegistry[remoteRec.ip] = remoteRec;
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

        // Kirim ke Google Apps Script Webhook jika dikonfigurasi
        const webhookUrl = localStorage.getItem(CONFIG.STORAGE_KEYS.WEBHOOK);
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
        return {
            id: `gviz_${idx}_${Date.now()}`,
            timestamp: cells[0] || new Date().toISOString(),
            ip: String(cells[1] || `remote_${idx}`).trim(),
            name: String(cells[2] || "Peserta").trim(),
            className: String(cells[3] || "XI A").trim(),
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
        return {
            id: `csv_${idx}_${Date.now()}`,
            timestamp: cells[0] || new Date().toISOString(),
            ip: String(cells[1] || "").trim(),
            name: String(cells[2] || "Peserta").trim(),
            className: String(cells[3] || "XI A").trim(),
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
