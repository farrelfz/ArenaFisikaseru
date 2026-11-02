// ==========================================================================
// HYDROARENA SMAN 78 - MODUL ALUR UJIAN SISWA (EXAM CONTROLLER)
// ==========================================================================

const ExamModule = {
    _isSubmitting: false,

    init() {
        this._bindAntiCheat();
        this._bindKeyboardNavigation();
        this._bindBeforeUnload();
    },

    _bindBeforeUnload() {
        window.addEventListener('beforeunload', (e) => {
            if (State.activeSession && State.activeSession.startTimeMs > 0 && State.activeSession.remainingSeconds > 0 && !this._isSubmitting) {
                e.preventDefault();
                e.returnValue = 'Ujian sedang berlangsung! Progres jawaban Anda telah disimpan otomatis di perangkat.';
                return e.returnValue;
            }
        });
    },

    _bindKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const screen = document.getElementById('screen-active-exam');
            if (!screen || screen.classList.contains('hidden')) return;

            // Jangan tangkap jika sedang mengetik di input modal atau form
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) return;

            const key = e.key.toLowerCase();
            if (key === 'a' || key === '1') this.selectOption(0);
            else if (key === 'b' || key === '2') this.selectOption(1);
            else if (key === 'c' || key === '3') this.selectOption(2);
            else if (key === 'd' || key === '4') this.selectOption(3);
            else if (key === 'e' || key === '5') this.selectOption(4);
            else if (key === 'r') this.toggleDoubt();
            else if (e.key === 'ArrowLeft') this.navigate(-1);
            else if (e.key === 'ArrowRight') this.navigate(1);
        });
    },

    start(e) {
        if (e) e.preventDefault();

        // 1. Verifikasi Status Ujian dari Guru
        if (!State.examConfig.isOpen) {
            Utils.showToast("Pendaftaran ujian saat ini sedang DITUTUP oleh Guru / Administrator.", false);
            return;
        }

        // 2. Verifikasi Kunci IP Siswa
        const existingRecord = State.findRecordByIp(State.clientIpAddress);
        if (existingRecord) {
            this.checkAndEnforceIpLockUI();
            Utils.showToast("Alamat IP Anda sudah tercatat menyelesaikan ujian ini.", false);
            this.openLockedReviewMode();
            return;
        }

        // 3. Validasi Form Identitas
        const nameVal = document.getElementById('input-name').value.trim();
        const classVal = document.getElementById('input-class').value;
        const absenVal = parseInt(document.getElementById('input-absen').value, 10);

        if (!nameVal || !classVal || isNaN(absenVal) || absenVal < 1 || absenVal > 40) {
            Utils.showToast("Harap lengkapi Nama Lengkap, Kelas (XI A–F), dan No. Absen (1–40).", false);
            return;
        }

        // 4. Inisialisasi Sesi Ujian (Acak Soal & Opsi Pilihan)
        State.activeSession = {
            name: nameVal,
            className: classVal,
            absen: absenVal,
            ip: State.clientIpAddress,
            startTimeMs: Date.now(),
            remainingSeconds: CONFIG.EXAM_DURATION_SECONDS,
            timerInterval: null,
            questions: this._buildShuffledQuestions(),
            currentIndex: 0,
            selectedAnswers: {},
            doubtFlags: {},
            tabSwitches: 0
        };

        this.saveActiveSession();

        // 5. Alihkan Tampilan ke Layar Ujian
        document.getElementById('screen-lobby').classList.add('hidden');
        document.getElementById('screen-review').classList.add('hidden');
        document.getElementById('screen-active-exam').classList.remove('hidden');

        document.getElementById('exam-hud-name').textContent = State.activeSession.name;
        document.getElementById('exam-hud-class').textContent = `${State.activeSession.className} • #${String(State.activeSession.absen).padStart(2, '0')}`;
        document.getElementById('exam-hud-ip').textContent = `Sesi Aktif • Terverifikasi`;

        const cheatPill = document.getElementById('exam-hud-cheat-pill');
        const cheatCount = document.getElementById('exam-hud-cheat-count');
        if (cheatPill && cheatCount) {
            cheatPill.classList.remove('hidden');
            cheatCount.textContent = "0 Pelanggaran";
            cheatCount.className = "text-emerald-700 font-bold tabular-nums";
        }

        this._startTimer();
        this.renderQuestion(0);
        this.renderPalette();
    },

    renderQuestion(index) {
        if (!State.activeSession.questions || !State.activeSession.questions[index]) return;
        State.activeSession.currentIndex = index;
        const q = State.activeSession.questions[index];

        document.getElementById('q-current-number').textContent = index + 1;
        document.getElementById('q-topic-badge').textContent = q.topic;
        document.getElementById('q-stem-text').innerHTML = q.question;

        const isDoubt = !!State.activeSession.doubtFlags[index];
        const isAnswered = State.activeSession.selectedAnswers[index] !== undefined;
        const statusBadge = document.getElementById('q-status-badge');
        if (statusBadge) {
            if (isDoubt) {
                statusBadge.className = "edu-badge font-mono text-[10px] bg-amber-50 text-amber-800 border-amber-300 font-bold";
                statusBadge.textContent = "Ditandai Ragu";
            } else if (isAnswered) {
                statusBadge.className = "edu-badge font-mono text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300 font-bold";
                statusBadge.textContent = "Sudah Dijawab";
            } else {
                statusBadge.className = "edu-badge font-mono text-[10px] bg-slate-100 text-slate-600 border-slate-200";
                statusBadge.textContent = "Belum Dijawab";
            }
        }

        const diagramBox = document.getElementById('q-diagram-container');
        if (q.diagram) {
            diagramBox.innerHTML = q.diagram;
            diagramBox.classList.remove('hidden');
        } else {
            diagramBox.innerHTML = "";
            diagramBox.classList.add('hidden');
        }

        // Render Opsi Jawaban Interaktif & Ergonomis
        const optionsContainer = document.getElementById('q-options-container');
        const optionLetters = ['A', 'B', 'C', 'D', 'E'];
        const selectedIdx = State.activeSession.selectedAnswers[index];

        optionsContainer.innerHTML = q.options.map((optText, optIdx) => {
            const isSelected = selectedIdx === optIdx;
            return `
                <div onclick="ExamModule.selectOption(${optIdx})" class="exam-option-card group p-3.5 sm:p-4 flex items-start justify-between gap-3 ${isSelected ? 'selected' : ''}">
                    <div class="flex items-start gap-3.5 min-w-0">
                        <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 transition ${isSelected ? 'bg-blue-800 text-white shadow-sm' : 'bg-slate-100 text-slate-700 border border-slate-300 group-hover:border-blue-400 group-hover:bg-blue-50'}">
                            ${optionLetters[optIdx]}
                        </div>
                        <div class="text-sm text-slate-900 pt-0.5 leading-relaxed font-medium">
                            ${optText}
                        </div>
                    </div>
                    <span class="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${isSelected ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-slate-50 text-slate-400 border border-slate-200 group-hover:text-blue-600'} shrink-0 ml-2">
                        [${optionLetters[optIdx]}]
                    </span>
                </div>
            `;
        }).join('');

        // Tombol Ragu-Ragu
        const doubtBtn = document.getElementById('btn-doubt-toggle');
        if (doubtBtn) {
            if (isDoubt) {
                doubtBtn.className = "px-3.5 py-2 text-xs font-semibold rounded-md border border-amber-300 bg-amber-50 text-amber-800 flex items-center gap-1.5";
                doubtBtn.innerHTML = `<i data-lucide="check-square" class="w-3.5 h-3.5 text-amber-600"></i><span>Ditandai Ragu-Ragu</span>`;
            } else {
                doubtBtn.className = "edu-btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5";
                doubtBtn.innerHTML = `<i data-lucide="square" class="w-3.5 h-3.5 text-slate-400"></i><span>Tandai Ragu-Ragu</span>`;
            }
        }

        // Navigasi Prev/Next
        const prevBtn = document.getElementById('btn-prev-question');
        const nextBtn = document.getElementById('btn-next-question');
        if (prevBtn) prevBtn.disabled = index === 0;
        if (nextBtn) {
            if (index === CONFIG.TOTAL_QUESTIONS - 1) {
                nextBtn.innerHTML = `<span>Review Akhir</span><i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>`;
            } else {
                nextBtn.innerHTML = `<span>Soal Berikutnya</span><i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>`;
            }
        }

        this.renderPalette();
        this._updateAnsweredCount();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    selectOption(optIdx) {
        const curIdx = State.activeSession.currentIndex;
        State.activeSession.selectedAnswers[curIdx] = optIdx;
        this.renderQuestion(curIdx);
        this._updateAnsweredCount();
        this.saveActiveSession();
    },

    toggleDoubt() {
        const curIdx = State.activeSession.currentIndex;
        State.activeSession.doubtFlags[curIdx] = !State.activeSession.doubtFlags[curIdx];
        this.renderQuestion(curIdx);
        this.saveActiveSession();
    },

    navigate(delta) {
        const newIdx = State.activeSession.currentIndex + delta;
        if (newIdx >= 0 && newIdx < CONFIG.TOTAL_QUESTIONS) {
            this.renderQuestion(newIdx);
            this.saveActiveSession();
        } else if (newIdx >= CONFIG.TOTAL_QUESTIONS) {
            this.openSubmitModal();
        }
    },

    renderPalette() {
        const grid = document.getElementById('exam-palette-grid');
        if (!grid || !State.activeSession.questions) return;

        grid.innerHTML = State.activeSession.questions.map((_, idx) => {
            const isCurrent = State.activeSession.currentIndex === idx;
            const isAnswered = State.activeSession.selectedAnswers[idx] !== undefined;
            const isDoubt = !!State.activeSession.doubtFlags[idx];

            let stateClass = "";
            if (isDoubt) stateClass = "doubt";
            else if (isAnswered) stateClass = "answered";
            if (isCurrent) stateClass += " active";

            return `
                <button type="button" onclick="ExamModule.renderQuestion(${idx})" class="palette-btn ${stateClass}" title="Soal #${idx + 1}">
                    ${idx + 1}
                </button>
            `;
        }).join('');
    },

    openSubmitModal() {
        const answeredCount = Object.keys(State.activeSession.selectedAnswers).length;
        const unanswered = CONFIG.TOTAL_QUESTIONS - answeredCount;
        const summaryEl = document.getElementById('modal-submit-summary');

        if (unanswered > 0) {
            summaryEl.innerHTML = `Anda telah menjawab <strong>${answeredCount} dari ${CONFIG.TOTAL_QUESTIONS} butir soal</strong> (masih terdapat <strong class="text-amber-700">${unanswered} butir soal belum dijawab</strong>). Yakin ingin menyelesaikan ujian sekarang? Sesi ujian gawai Anda akan langsung diselesaikan dan hasil evaluasi dikirimkan.`;
        } else {
            summaryEl.innerHTML = `Seluruh <strong>${CONFIG.TOTAL_QUESTIONS} butir soal telah dijawab lengkap</strong>. Setelah dikumpulkan, sesi ujian gawai Anda akan diselesaikan dan hasil evaluasi langsung dikirimkan ke sistem.`;
        }

        document.getElementById('modal-submit-exam').classList.remove('hidden');
        document.getElementById('modal-submit-exam').classList.add('flex');
    },

    closeSubmitModal() {
        const m = document.getElementById('modal-submit-exam');
        if (m) {
            m.classList.add('hidden');
            m.classList.remove('flex');
        }
    },

    async finalizeSubmit() {
        this.closeSubmitModal();
        clearInterval(State.activeSession.timerInterval);
        this._isSubmitting = true;
        this.clearActiveSession();

        const durationSec = Math.max(1, CONFIG.EXAM_DURATION_SECONDS - State.activeSession.remainingSeconds);
        const remainingSec = Math.max(0, State.activeSession.remainingSeconds);

        let correctCount = 0;
        const perQuestionDetail = {};

        State.activeSession.questions.forEach((q, idx) => {
            const chosenIdx = State.activeSession.selectedAnswers[idx];
            const isCorrect = chosenIdx === q.correctIndex;
            if (isCorrect) correctCount += 1;

            perQuestionDetail[q.id] = {
                isCorrect,
                chosenText: chosenIdx !== undefined ? q.options[chosenIdx] : null,
                correctText: q.options[q.correctIndex]
            };
        });

        // Skor Kompetitif Edukasi (Skala Puncak 100.000):
        // Skor Dasar = 3.000 / nomor benar (Maks 75.000)
        // Bonus Kecepatan = proporsional terhadap ketelitian & sisa waktu (Maks 25.000)
        const baseScore = correctCount * CONFIG.BASE_POINTS_PER_QUESTION;
        const accuracyRatio = correctCount / CONFIG.TOTAL_QUESTIONS;
        const speedBonus = Math.round(accuracyRatio * (remainingSec / CONFIG.EXAM_DURATION_SECONDS) * CONFIG.MAX_SPEED_BONUS);
        const totalScore = baseScore + speedBonus;
        const academicGrade = Number(((correctCount / CONFIG.TOTAL_QUESTIONS) * 100).toFixed(1));

        const completedRecord = {
            id: `sman78_${State.activeSession.className.replace(/\s+/g, '')}_${State.activeSession.absen}_${Date.now()}`,
            timestamp: new Date().toISOString(),
            ip: State.activeSession.ip,
            name: State.activeSession.name,
            className: State.activeSession.className,
            absen: State.activeSession.absen,
            correctCount,
            academicGrade,
            durationSec,
            baseScore,
            speedBonus,
            totalScore,
            tabSwitches: State.activeSession.tabSwitches || 0,
            answersJson: JSON.stringify(perQuestionDetail)
        };

        await SpreadsheetService.pushRecord(completedRecord);
        this.checkAndEnforceIpLockUI();
        this.openReviewScreen(completedRecord);
        this._isSubmitting = false;
    },

    checkAndEnforceIpLockUI() {
        const lockedRecord = State.findRecordByIp(State.clientIpAddress);
        const lockedBanner = document.getElementById('ip-locked-banner');
        const ipDot = document.getElementById('ip-status-dot');
        const ipText = document.getElementById('ip-status-text');

        if (lockedRecord) {
            if (lockedBanner) lockedBanner.classList.remove('hidden');
            document.getElementById('locked-ip-text').textContent = State.clientIpAddress;
            document.getElementById('locked-student-name').textContent = lockedRecord.name;
            document.getElementById('locked-student-class').textContent = lockedRecord.className;
            document.getElementById('locked-student-absen').textContent = lockedRecord.absen;
            document.getElementById('locked-student-score').textContent = Utils.formatNumber(lockedRecord.totalScore);

            const formInputs = document.querySelectorAll('#exam-start-form input, #exam-start-form select, #btn-start-exam');
            formInputs.forEach(el => el.disabled = true);
            if (ipDot) ipDot.className = "w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse";
            if (ipText) {
                ipText.textContent = "Sesi Selesai (Terkunci)";
                ipText.className = "font-medium text-amber-700";
            }
        } else {
            if (lockedBanner) lockedBanner.classList.add('hidden');
            const formInputs = document.querySelectorAll('#exam-start-form input, #exam-start-form select, #btn-start-exam');
            formInputs.forEach(el => el.disabled = false);
            if (ipDot) ipDot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500";
            if (ipText) {
                ipText.textContent = "Sistem Siap";
                ipText.className = "font-medium text-slate-700";
            }
        }
    },

    openLockedReviewMode() {
        const lockedRec = State.findRecordByIp(State.clientIpAddress);
        if (!lockedRec) {
            Utils.showToast("Belum ada data pengerjaan yang tercatat untuk IP ini.", false);
            return;
        }
        this.openReviewScreen(lockedRec);
    },

    openReviewScreen(record) {
        State.currentReviewRecord = record;

        document.getElementById('screen-lobby').classList.add('hidden');
        document.getElementById('screen-active-exam').classList.add('hidden');
        document.getElementById('screen-review').classList.remove('hidden');

        document.getElementById('review-student-name').textContent = record.name;
        document.getElementById('review-student-meta').textContent = `${record.className} • No. Absen ${record.absen}`;

        document.getElementById('review-academic-grade').textContent = record.academicGrade;
        document.getElementById('review-correct-count').textContent = `${record.correctCount} / ${CONFIG.TOTAL_QUESTIONS}`;
        document.getElementById('review-base-score').textContent = Utils.formatNumber(record.baseScore);
        document.getElementById('review-speed-bonus').textContent = `+${Utils.formatNumber(record.speedBonus)}`;
        document.getElementById('review-total-score').textContent = Utils.formatNumber(record.totalScore);

        const durationMins = Math.floor((record.durationSec || 0) / 60);
        const durationSecs = (record.durationSec || 0) % 60;
        document.getElementById('review-duration-text').textContent = `${durationMins}m ${durationSecs}s`;

        const kkmStatus = document.getElementById('review-kkm-status');
        if (record.academicGrade >= CONFIG.ACADEMIC_KKM) {
            kkmStatus.className = "edu-badge edu-badge-green font-semibold";
            kkmStatus.textContent = "Tuntas KKM (≥75)";
        } else {
            kkmStatus.className = "edu-badge edu-badge-amber font-semibold";
            kkmStatus.textContent = "Remedial (<75)";
        }

        this._renderReviewQuestions(record);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    backToLobbyFromReview() {
        document.getElementById('screen-review').classList.add('hidden');
        document.getElementById('screen-lobby').classList.remove('hidden');
        this.checkAndEnforceIpLockUI();
    },

    _renderReviewQuestions(record) {
        const container = document.getElementById('review-questions-list');
        const lockedNotice = document.getElementById('review-locked-notice');

        // Jika Guru mengunci pembahasan
        if (!State.examConfig.allowReview && !State.isTeacherLoggedIn) {
            container.innerHTML = "";
            if (lockedNotice) lockedNotice.classList.remove('hidden');
            return;
        }

        if (lockedNotice) lockedNotice.classList.add('hidden');

        let answersMap = {};
        try {
            answersMap = JSON.parse(record.answersJson || "{}");
        } catch (e) {}

        container.innerHTML = MASTER_QUESTIONS.map((q, idx) => {
            const detail = answersMap[q.id] || { isCorrect: false, chosenText: "(Tidak dijawab)", correctText: q.options[q.correctIndex] };
            const isCorrect = detail.isCorrect;

            return `
                <div class="edu-card p-5 space-y-3.5 border-l-4 ${isCorrect ? 'border-l-emerald-600' : 'border-l-rose-500'}">
                    <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div class="flex items-center gap-2">
                            <span class="font-mono font-bold text-xs px-2 py-0.5 rounded ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                                Soal #${idx + 1}
                            </span>
                            <span class="text-xs font-semibold text-slate-700">${q.topic}</span>
                        </div>
                        <span class="text-xs font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}">
                            ${isCorrect ? '✓ Jawaban Tepat (+1.000)' : '✕ Belum Tepat'}
                        </span>
                    </div>

                    <div class="text-sm text-slate-800 leading-relaxed font-medium">
                        ${q.question}
                    </div>

                    ${q.diagram ? `<div class="p-2 bg-slate-50 rounded border border-slate-200 flex justify-center">${q.diagram}</div>` : ''}

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div class="p-2.5 rounded bg-slate-50 border border-slate-200">
                            <div class="text-slate-500 font-semibold mb-0.5">Jawaban Siswa:</div>
                            <div class="font-medium ${isCorrect ? 'text-emerald-800' : 'text-rose-800'}">${detail.chosenText || '(Kosong)'}</div>
                        </div>
                        <div class="p-2.5 rounded bg-emerald-50 border border-emerald-200">
                            <div class="text-emerald-700 font-semibold mb-0.5">Kunci Jawaban yang Benar:</div>
                            <div class="font-medium text-emerald-950">${detail.correctText}</div>
                        </div>
                    </div>

                    <div class="p-3 rounded-md bg-blue-50/60 border border-blue-200 text-xs text-slate-700 space-y-1">
                        <div class="font-bold text-blue-900 flex items-center gap-1.5">
                            <i data-lucide="info" class="w-3.5 h-3.5 text-blue-700"></i>
                            <span>Penjelasan Fisika & Pembahasan:</span>
                        </div>
                        <p class="leading-relaxed text-slate-700">${q.explanation}</p>
                    </div>
                </div>
            `;
        }).join('');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    _buildShuffledQuestions() {
        const shuffledQuestions = Utils.shuffleArray(MASTER_QUESTIONS);
        return shuffledQuestions.map(q => {
            const optObjs = q.options.map((text, idx) => ({
                text,
                isCorrect: idx === q.correctIndex
            }));
            const shuffledOpts = Utils.shuffleArray(optObjs);
            const newCorrectIdx = shuffledOpts.findIndex(o => o.isCorrect);
            return {
                ...q,
                options: shuffledOpts.map(o => o.text),
                correctIndex: newCorrectIdx
            };
        });
    },

    _startTimer() {
        clearInterval(State.activeSession.timerInterval);

        // Sinkronisasi waktu presisi berbasis selisih jam dinding nyata (wall-clock timestamp delta)
        // Mencegah perlambatan/kecurangan timer saat layar ponsel mati atau tab throttling aktif
        const syncTime = () => {
            if (!State.activeSession || !State.activeSession.startTimeMs) return;
            const elapsedSec = Math.floor((Date.now() - State.activeSession.startTimeMs) / 1000);
            State.activeSession.remainingSeconds = Math.max(0, CONFIG.EXAM_DURATION_SECONDS - elapsedSec);
            this._updateTimerDisplay(State.activeSession.remainingSeconds);

            if (State.activeSession.remainingSeconds <= 0) {
                clearInterval(State.activeSession.timerInterval);
                Utils.showToast("Alokasi waktu ujian telah habis! Mengumpulkan jawaban otomatis.");
                this.finalizeSubmit();
            }
        };

        syncTime();
        State.activeSession.timerInterval = setInterval(syncTime, 1000);
    },

    saveActiveSession() {
        if (!State.activeSession || !State.activeSession.startTimeMs || State.activeSession.startTimeMs === 0) return;
        try {
            const payload = {
                name: State.activeSession.name,
                className: State.activeSession.className,
                absen: State.activeSession.absen,
                ip: State.activeSession.ip,
                startTimeMs: State.activeSession.startTimeMs,
                questions: State.activeSession.questions,
                currentIndex: State.activeSession.currentIndex,
                selectedAnswers: State.activeSession.selectedAnswers,
                doubtFlags: State.activeSession.doubtFlags,
                tabSwitches: State.activeSession.tabSwitches
            };
            localStorage.setItem(CONFIG.STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(payload));
        } catch (e) {
            console.error("Gagal auto-save sesi aktif:", e);
        }
    },

    clearActiveSession() {
        try {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.ACTIVE_SESSION);
        } catch (e) {}
    },

    restoreActiveSession() {
        try {
            const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.ACTIVE_SESSION);
            if (!raw) return false;
            const session = JSON.parse(raw);
            if (!session || !session.startTimeMs || !session.questions || session.questions.length === 0) {
                this.clearActiveSession();
                return false;
            }

            // Jika perangkat sudah tercatat pernah mengumpulkan ujian, batalkan pemulihan
            const lockedRecord = State.findRecordByIp(State.clientIpAddress);
            if (lockedRecord) {
                this.clearActiveSession();
                return false;
            }

            // Hitung sisa waktu presisi jam dinding (wall-clock delta)
            const elapsedSec = Math.floor((Date.now() - session.startTimeMs) / 1000);
            const remainingSec = CONFIG.EXAM_DURATION_SECONDS - elapsedSec;

            State.activeSession = {
                name: session.name || "Peserta",
                className: session.className || "XI A",
                absen: session.absen || 1,
                ip: session.ip || State.clientIpAddress,
                startTimeMs: session.startTimeMs,
                remainingSeconds: Math.max(0, remainingSec),
                timerInterval: null,
                questions: session.questions,
                currentIndex: session.currentIndex || 0,
                selectedAnswers: session.selectedAnswers || {},
                doubtFlags: session.doubtFlags || {},
                tabSwitches: session.tabSwitches || 0
            };

            // Jika waktu telah habis saat perangkat mati atau peramban ditutup
            if (remainingSec <= 0) {
                Utils.showToast("Waktu ujian telah habis saat sesi tidak aktif. Mengumpulkan jawaban otomatis...", false);
                this.finalizeSubmit();
                return true;
            }

            // Pulihkan tampilan ke ruang pengerjaan ujian
            document.getElementById('screen-lobby').classList.add('hidden');
            document.getElementById('screen-review').classList.add('hidden');
            document.getElementById('screen-active-exam').classList.remove('hidden');

            document.getElementById('exam-hud-name').textContent = State.activeSession.name;
            document.getElementById('exam-hud-class').textContent = `${State.activeSession.className} • #${String(State.activeSession.absen).padStart(2, '0')}`;
            document.getElementById('exam-hud-ip').textContent = `Sesi Dipulihkan Otomatis`;

            const cheatPill = document.getElementById('exam-hud-cheat-pill');
            const cheatCount = document.getElementById('exam-hud-cheat-count');
            if (cheatPill && cheatCount) {
                cheatPill.classList.remove('hidden');
                cheatCount.textContent = `${State.activeSession.tabSwitches} Pelanggaran`;
            }

            this._startTimer();
            this.renderQuestion(State.activeSession.currentIndex);
            this.renderPalette();
            this._updateAnsweredCount();
            Utils.showToast("Sesi ujian Anda berhasil dipulihkan secara otomatis. Melanjutkan pengerjaan...", true);
            return true;
        } catch (e) {
            console.error("Gagal memulihkan sesi aktif:", e);
            this.clearActiveSession();
            return false;
        }
    },

    _updateTimerDisplay(seconds) {
        const timerEl = document.getElementById('exam-global-timer');
        if (!timerEl) return;
        timerEl.textContent = Utils.formatTime(seconds);

        if (seconds <= 300) {
            timerEl.className = "font-mono text-lg font-bold text-rose-600 animate-pulse";
        } else if (seconds <= 900) {
            timerEl.className = "font-mono text-lg font-bold text-amber-600";
        } else {
            timerEl.className = "font-mono text-lg font-bold text-slate-900";
        }
    },

    _updateAnsweredCount() {
        if (!State.activeSession || !State.activeSession.questions) return;
        const total = CONFIG.TOTAL_QUESTIONS;
        const answeredCount = Object.keys(State.activeSession.selectedAnswers || {}).length;
        const doubtCount = Object.keys(State.activeSession.doubtFlags || {}).filter(k => State.activeSession.doubtFlags[k]).length;
        const unansweredCount = Math.max(0, total - answeredCount);

        const hudEl = document.getElementById('exam-hud-answered');
        if (hudEl) hudEl.textContent = `${answeredCount} / ${total}`;

        const progressBar = document.getElementById('exam-progress-bar');
        if (progressBar && progressBar.style) {
            const pct = Math.round((answeredCount / total) * 100);
            progressBar.style.width = `${pct}%`;
        }

        const palAns = document.getElementById('pal-stat-answered');
        const palDoubt = document.getElementById('pal-stat-doubt');
        const palUnans = document.getElementById('pal-stat-unanswered');
        if (palAns) palAns.textContent = answeredCount;
        if (palDoubt) palDoubt.textContent = doubtCount;
        if (palUnans) palUnans.textContent = unansweredCount;
    },

    _bindAntiCheat() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && State.activeSession && State.activeSession.startTimeMs > 0 && State.activeSession.remainingSeconds > 0) {
                State.activeSession.tabSwitches = (State.activeSession.tabSwitches || 0) + 1;
                this.saveActiveSession();
                const sw = State.activeSession.tabSwitches;
                const cheatCountEl = document.getElementById('exam-hud-cheat-count');
                
                let warningText = "";
                let badgeClass = "text-emerald-700 font-bold tabular-nums";
                let statusLabel = `${sw}x Tab`;

                if (sw === 1) {
                    badgeClass = "text-blue-600 font-bold tabular-nums";
                    statusLabel = "1x Tab (Toleransi Ringan)";
                    warningText = "ℹ️ Peringatan Integritas: Terdeteksi 1x meninggalkan jendela ujian (Toleransi Ringan). Harap tetap berada pada lembar soal.";
                } else if (sw === 2) {
                    badgeClass = "text-amber-600 font-bold tabular-nums";
                    statusLabel = "2x Tab (Waspada)";
                    warningText = "⚠️ Peringatan Pengawas: Terdeteksi 2x berpindah tab (Waspada). Pengawas ruang memantau aktivitas Anda.";
                } else if (sw >= 3 && sw <= 4) {
                    badgeClass = "text-orange-600 font-bold tabular-nums";
                    statusLabel = `${sw}x Tab (Peringatan)`;
                    warningText = `🚨 Pelanggaran Integritas: Terdeteksi ${sw}x meninggalkan ujian. Sesi Anda masuk pemantauan ketat!`;
                } else {
                    badgeClass = "text-rose-600 font-bold tabular-nums animate-pulse";
                    statusLabel = `${sw}x Tab (Pelanggaran Berat)`;
                    warningText = `⛔ Pelanggaran Berat: Terdeteksi ${sw}x meninggalkan ujian! Catatan pelanggaran terekam di laporan pengawas.`;
                }

                if (cheatCountEl) {
                    cheatCountEl.textContent = statusLabel;
                    cheatCountEl.className = badgeClass;
                }
                Utils.showToast(warningText, sw <= 1);
            }
        });
    }
};

if (typeof module !== 'undefined') {
    module.exports = { ExamModule };
}
