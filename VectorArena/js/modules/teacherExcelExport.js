// ==========================================================================
// VECTORARENA - MULTI-TAB EXCEL EXPORT MODULE (.XLSX)
// Berkas Spreadsheet multi-tab profesional:
// Tab 1   : Rekap Semua Siswa (Klasemen Umum)
// Tab 2-12: Rekap per Rombel (X A s.d. X K)
// Tab 13  : Bank Soal & Kunci (25 Soal Fisika Vektor)
// SheetJS dimuat dinamis dari CDN agar tidak menambah beban muat awal.
// ==========================================================================

const TeacherExcelExport = {
    async exportToExcel() {
        const sorted = LeaderboardModule.getSortedRecords("ALL");
        if (sorted.length === 0) {
            Utils.showToast("Belum ada data nilai peserta untuk diunduh.", false);
            return;
        }

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
            "Status KKM", "Nomor Soal Salah",
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
            (typeof State !== 'undefined' && State.statusKKMFor)
                ? State.statusKKMFor(r)
                : ((r.academicGrade >= (CONFIG.ACADEMIC_KKM || 75)) ? 'TUNTAS' : 'REMEDIAL'),
            (typeof State !== 'undefined' && State.wrongNumbersFor)
                ? State.wrongNumbersFor(r)
                : 'Sempurna (0 Salah)',
            r.durationSec || 0,
            r.baseScore || 0,
            r.speedBonus || 0,
            r.totalScore || 0,
            r.tabSwitches || 0
        ];

        // 1. Tab Utama: Rekap Semua Siswa
        const allRows = [
            ["KLASEMEN UMUM REKAP NILAI UJIAN FISIKA VEKTOR & KINEMATIKA - SMAN 78 JAKARTA"],
            [`Total Peserta: ${sorted.length} Siswa | Diexport pada: ${new Date().toLocaleString('id-ID')}`],
            [],
            headers,
            ...sorted.map((r, idx) => mapRecordToRow(r, idx))
        ];
        const wsAll = XLSX.utils.aoa_to_sheet(allRows);
        XLSX.utils.book_append_sheet(wb, wsAll, "Semua Siswa");

        // 2. Tab per Rombel Kelas (X A - X K)
        const classes = [...CONFIG.CLASSES];
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

        // 3. Tab Bank Soal & Kunci Jawaban (25 Soal Terkurasi)
        const bank = (typeof CURATED_25_QUESTIONS !== 'undefined' && Array.isArray(CURATED_25_QUESTIONS))
            ? CURATED_25_QUESTIONS
            : [];
        if (bank.length > 0) {
            const qHeaders = ["No", "ID Soal", "Topik / Submateri", "Pertanyaan", "Opsi A", "Opsi B", "Opsi C", "Opsi D", "Opsi E", "Kunci Jawaban (Opsi)", "Pembahasan"];
            const qRows = [
                ["BANK SOAL & KUNCI JAWABAN RESMI - FISIKA VEKTOR & KINEMATIKA SMAN 78 JAKARTA"],
                [`Total: ${bank.length} Soal Pilihan Ganda Berstandar UTBK / Kumer`],
                [],
                qHeaders,
                ...bank.map((q, idx) => {
                    const options = Array.isArray(q.options) ? q.options : [];
                    const answerKey = q.correctKey
                        || (q.correctAnswer !== undefined ? ['A', 'B', 'C', 'D', 'E'][options.indexOf(q.correctAnswer)] : '')
                        || '';
                    return [
                        q.no || idx + 1,
                        q.id || `Q${idx + 1}`,
                        q.zoneName || q.topic || 'Vektor',
                        q.question || q.questionText || '',
                        options[0] || '',
                        options[1] || '',
                        options[2] || '',
                        options[3] || '',
                        options[4] || '',
                        answerKey,
                        q.explanation || ''
                    ];
                })
            ];
            const wsQuestions = XLSX.utils.aoa_to_sheet(qRows);
            XLSX.utils.book_append_sheet(wb, wsQuestions, "Bank Soal & Kunci");
        }

        const filename = `Rekap_Nilai_VectorArena_SMAN78_${new Date().toISOString().slice(0, 10)}.xlsx`;
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