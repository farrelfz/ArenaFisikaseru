// ==========================================================================
// HYDROARENA SMAN 78 - MULTI-TAB EXCEL EXPORT MODULE (.XLSX)
// Menggantikan format CSV dengan file Spreadsheet multi-tab profesional:
// Tab 1: Rekap Semua Siswa (Klasemen Umum)
// Tab 2-7: Rekap Kelas (XI A, XI B, XI C, XI D, XI E, XI F)
// Tab 8: Bank Soal & Kunci (25 Soal Fisika Fluida)
// ==========================================================================

const TeacherExcelExport = {
    async exportToExcel() {
        const sorted = LeaderboardModule.getSortedRecords("ALL");
        if (sorted.length === 0) {
            Utils.showToast("Belum ada data nilai peserta untuk diunduh.", false);
            return;
        }

        // Cek apakah SheetJS (xlsx) tersedia di global window, jika belum, load via CDN dynamically
        if (typeof XLSX === 'undefined') {
            await this._loadSheetJS();
        }

        if (typeof XLSX === 'undefined') {
            Utils.showToast("Gagal memuat pustaka XLSX. Silakan periksa koneksi internet.", false);
            return;
        }

        const wb = XLSX.utils.book_new();

        const headers = [
            "Peringkat", "Waktu Submit", "IP Address", "Nama Lengkap",
            "Kelas", "No Absen", "Benar (dari 25)", "Nilai Akademik (0-100)",
            "Durasi (Detik)", "Skor Dasar", "Bonus Kecepatan", "Total Skor", "Pelanggaran Tab"
        ];

        const mapRecordToRow = (r, idx) => [
            idx + 1,
            r.timestamp ? new Date(r.timestamp).toLocaleString('id-ID') : '',
            r.ip || '',
            r.name || '',
            r.className || '',
            r.absen || 1,
            r.correctCount || 0,
            r.academicGrade || 0,
            r.durationSec || 0,
            r.baseScore || 0,
            r.speedBonus || 0,
            r.totalScore || 0,
            r.tabSwitches || 0
        ];

        // 1. Tab Utama: Rekap Semua Siswa
        const allRows = [
            ["KLASEMEN UMUM REKAP NILAI UJIAN FISIKA FLUIDA - SMAN 78 JAKARTA"],
            [`Total Peserta: ${sorted.length} Siswa | Diexport pada: ${new Date().toLocaleString('id-ID')}`],
            [],
            headers,
            ...sorted.map((r, idx) => mapRecordToRow(r, idx))
        ];
        const wsAll = XLSX.utils.aoa_to_sheet(allRows);
        XLSX.utils.book_append_sheet(wb, wsAll, "Semua Siswa");

        // 2. Tab per Rombel Kelas (XI A - XI F)
        const classes = [...CONFIG.CLASSES]; // ["XI A", "XI B", "XI C", "XI D", "XI E", "XI F"]
        classes.forEach(cls => {
            const classRecords = sorted.filter(r => r.className === cls);
            const classRows = [
                [`REKAP NILAI KELAS ${cls} - SMAN 78 JAKARTA`],
                [`Jumlah Peserta: ${classRecords.length} Siswa`],
                [],
                headers,
                ...classRecords.map((r, idx) => mapRecordToRow(r, idx))
            ];
            const wsClass = XLSX.utils.aoa_to_sheet(classRows);
            XLSX.utils.book_append_sheet(wb, wsClass, cls);
        });

        // 3. Tab Bank Soal & Kunci Jawaban (25 Soal Silabus Inti)
        if (typeof MASTER_QUESTIONS !== 'undefined' && Array.isArray(MASTER_QUESTIONS)) {
            const qHeaders = ["No", "ID Soal", "Topik / Submateri", "Pertanyaan", "Opsi A", "Opsi B", "Opsi C", "Opsi D", "Kunci Jawaban (Opsi)", "Pembahasan"];
            const qRows = [
                ["BANK SOAL & KUNCI JAWABAN RESMI - FISIKA FLUIDA SMAN 78 JAKARTA"],
                ["Total: 25 Soal Pilihan Ganda Berstandar UTBK / Kumer"],
                [],
                qHeaders,
                ...MASTER_QUESTIONS.map((q, idx) => [
                    idx + 1,
                    q.id || `Q${idx+1}`,
                    q.topic || 'Fluida',
                    q.question || '',
                    q.options ? q.options[0] : '',
                    q.options ? q.options[1] : '',
                    q.options ? q.options[2] : '',
                    q.options ? q.options[3] : '',
                    q.correct !== undefined ? ['A', 'B', 'C', 'D'][q.correct] : '',
                    q.explanation || ''
                ])
            ];
            const wsQuestions = XLSX.utils.aoa_to_sheet(qRows);
            XLSX.utils.book_append_sheet(wb, wsQuestions, "Bank Soal & Kunci");
        }

        // Tulis file ke perangkat pengguna
        const filename = `HydroArena_Rekap_Nilai_MultiTab_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, filename);
        Utils.showToast("File Excel Multi-Tab (.xlsx) berhasil diunduh!");
    },

    async _loadSheetJS() {
        return new Promise((resolve) => {
            if (typeof XLSX !== 'undefined') {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
            script.onload = () => resolve();
            script.onerror = () => {
                console.warn("Gagal memuat SheetJS dari CDN utama, mencoba cdnjs alternatif...");
                const script2 = document.createElement('script');
                script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
                script2.onload = () => resolve();
                script2.onerror = () => resolve();
                document.head.appendChild(script2);
            };
            document.head.appendChild(script);
        });
    }
};

if (typeof module !== 'undefined') {
    module.exports = { TeacherExcelExport };
}
