// ==========================================================================
// VECTORARENA - MODUL ALUR UJIAN SISWA (EXAM CONTROLLER)
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
                e.returnValue = 'Ujian/Sesi sedang berlangsung! Progres jawaban Anda telah disimpan otomatis di perangkat.';
                return e.returnValue;
            }
        });
    },

    _bindKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const screen = document.getElementById('screen-active-exam');
            if (!screen || screen.classList.contains('hidden')) return;

            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) return;
            const submitModal = document.getElementById('modal-submit-exam');
            if (submitModal && !submitModal.classList.contains('hidden')) return;

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

    _bindAntiCheat() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && State.activeSession && State.activeSession.startTimeMs > 0 && !this._isSubmitting) {
                State.activeSession.tabSwitches = (State.activeSession.tabSwitches || 0) + 1;
                this.saveActiveSession();
                const cheatCount = document.getElementById('exam-hud-cheat-count');
                if (cheatCount) {
                    const st = this._getAntiCheatStatus(State.activeSession.tabSwitches);
                    cheatCount.textContent = st.statusLabel;
                    cheatCount.className = st.badgeClass;
                }
            }
        });
    },

    _getAntiCheatStatus(switches) {
        if (!switches || switches <= 0) {
            return { statusLabel: '🛡️ Fokus Penuh (0x Tab)', badgeClass: 'font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' };
        } else if (switches === 1) {
            return { statusLabel: '⚡ Dispersi Ringan (1x Tab)', badgeClass: 'font-mono text-[11px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30' };
        } else if (switches === 2) {
            return { statusLabel: '⚠️ Fluktuasi (2x Tab)', badgeClass: 'font-mono text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30' };
        } else if (switches <= 4) {
            return { statusLabel: `🚨 Defleksi Lintasan (${switches}x Tab)`, badgeClass: 'font-mono text-[11px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30' };
        } else {
            return { statusLabel: `⛔ Diskontinuitas (${switches}x Tab)`, badgeClass: 'font-mono text-[11px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30' };
        }
    },

    setMode(modeId) {
        const mode = CONFIG.MODES.find(m => m.id === modeId);
        if (!mode) return;
        State.currentMode = modeId;
        localStorage.setItem(CONFIG.STORAGE_KEYS.GAME_MODE, modeId);

        // Update UI pill tab mode di lobby
        document.querySelectorAll('.game-mode-card').forEach(btn => {
            if (btn.dataset.mode === modeId) {
                btn.classList.add('border-indigo-500', 'bg-indigo-950/40', 'ring-2', 'ring-indigo-500/50');
                btn.classList.remove('border-slate-800', 'bg-slate-900/60');
            } else {
                btn.classList.remove('border-indigo-500', 'bg-indigo-950/40', 'ring-2', 'ring-indigo-500/50');
                btn.classList.add('border-slate-800', 'bg-slate-900/60');
            }
        });

        const activeModeName = document.getElementById('lobby-active-mode-name');
        const activeModeDesc = document.getElementById('lobby-active-mode-desc');
        if (activeModeName) activeModeName.textContent = mode.name;
        if (activeModeDesc) activeModeDesc.textContent = `${mode.questions} Soal • Durasi ${Math.round(mode.durationSeconds / 60)} Menit`;
    },

    start(e) {
        if (e) e.preventDefault();

        // 1. Verifikasi Status Ujian dari Guru
        if (!State.examConfig.isOpen) {
            Utils.showToast("Pendaftaran sesi saat ini sedang DITUTUP oleh Guru / Administrator.", false);
            return;
        }

        // 2. Verifikasi Kunci IP Siswa
        const existingRecord = State.findRecordByIp(State.clientIpAddress);
        if (existingRecord) {
            this.checkAndEnforceIpLockUI();
            Utils.showToast("Alamat IP Anda sudah tercatat menyelesaikan evaluasi ini.", false);
            this.openLockedReviewMode();
            return;
        }

        // 3. Validasi Form Identitas
        const nameVal = document.getElementById('input-name').value.trim();
        const classVal = document.getElementById('input-class').value;
        const absenVal = parseInt(document.getElementById('input-absen').value, 10);

        if (!nameVal || !classVal || isNaN(absenVal) || absenVal < 1 || absenVal > 40) {
            Utils.showToast("Harap lengkapi Nama Lengkap, Kelas (X A–K), dan No. Absen (1–40).", false);
            return;
        }

        const modeObj = CONFIG.MODES.find(m => m.id === State.currentMode) || CONFIG.MODES[2];
        const selectedQuestions = this._buildQuestionsForMode(modeObj);

        // 4. Inisialisasi Sesi Ujian
        State.activeSession = {
            name: nameVal,
            className: classVal,
            absen: absenVal,
            mode: modeObj.id,
            ip: State.clientIpAddress,
            startTimeMs: Date.now(),
            durationSeconds: modeObj.durationSeconds,
            remainingSeconds: modeObj.durationSeconds,
            timerInterval: null,
            questions: selectedQuestions,
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
        document.getElementById('exam-hud-mode').textContent = modeObj.name;

        const cheatCount = document.getElementById('exam-hud-cheat-count');
        if (cheatCount) {
            const st = this._getAntiCheatStatus(0);
            cheatCount.textContent = st.statusLabel;
            cheatCount.className = st.badgeClass;
        }

        this._startTimer();
        this.renderQuestion(0);
        this.renderPalette();
    },

    renderQuestion(index) {
        if (!State.activeSession.questions || !State.activeSession.questions[index]) return;
        State.activeSession.currentIndex = index;
        const q = State.activeSession.questions[index];
        const total = State.activeSession.questions.length;

        document.getElementById('q-current-number').textContent = index + 1;
        document.getElementById('q-total-number').textContent = total;
        document.getElementById('q-topic-badge').textContent = q.topic || q.zoneName || `Topik ${q.zoneId}`;

        // Tingkat kesulitan tersimpan sebagai angka (1–4) di bank soal, bukan
        // string; ambil label dari CONFIG dengan cadangan yang aman.
        const diffEl = document.getElementById('q-difficulty-badge');
        if (diffEl) {
            diffEl.textContent = Utils.difficultyLabel(q.difficulty);
        }

        // Render Prompt Soal dengan Mini-TeX
        const stemEl = document.getElementById('q-stem-text');
        stemEl.innerHTML = Utils.renderMiniTeX(q.question);

        const isDoubt = !!State.activeSession.doubtFlags[index];
        const isAnswered = State.activeSession.selectedAnswers[index] !== undefined;
        const statusBadge = document.getElementById('q-status-badge');
        if (statusBadge) {
            if (isDoubt) {
                statusBadge.className = "text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40";
                statusBadge.textContent = "Ditandai Ragu";
            } else if (isAnswered) {
                statusBadge.className = "text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
                statusBadge.textContent = "Sudah Dijawab";
            } else {
                statusBadge.className = "text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700";
                statusBadge.textContent = "Belum Dijawab";
            }
        }

        // Render Diagram Visual Fisika (SVG Murni)
        const diagramBox = document.getElementById('q-diagram-container');
        if (q.diagram && q.diagram.type) {
            diagramBox.classList.remove('hidden');
            Visualizers.render(q.diagram, 'q-diagram-container');
        } else {
            diagramBox.innerHTML = "";
            diagramBox.classList.add('hidden');
        }

        // Render Opsi Jawaban Pilihan Ganda
        const optionsContainer = document.getElementById('q-options-container');
        const optionLetters = ['A', 'B', 'C', 'D', 'E'];
        const selectedIdx = State.activeSession.selectedAnswers[index];

        optionsContainer.innerHTML = q.options.map((optText, optIdx) => {
            const isSelected = selectedIdx === optIdx;
            return `
                <div onclick="ExamModule.selectOption(${optIdx})" class="exam-option-card group p-3.5 sm:p-4 rounded-xl flex items-start justify-between gap-3 cursor-pointer transition border ${isSelected ? 'border-indigo-500 bg-indigo-950/60 ring-2 ring-indigo-500/40' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/50'}">
                    <div class="flex items-start gap-3.5 min-w-0">
                        <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 transition ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 border border-slate-700 group-hover:border-indigo-400'}">
                            ${optionLetters[optIdx]}
                        </div>
                        <div class="text-sm text-slate-200 pt-0.5 leading-relaxed font-medium">
                            ${Utils.renderMiniTeX(optText)}
                        </div>
                    </div>
                    <span class="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${isSelected ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'} shrink-0 ml-2">
                        [${optionLetters[optIdx]}]
                    </span>
                </div>
            `;
        }).join('');

        // Tombol Ragu-Ragu
        const doubtBtn = document.getElementById('btn-doubt-toggle');
        if (doubtBtn) {
            if (isDoubt) {
                doubtBtn.className = "px-3.5 py-2 text-xs font-semibold rounded-lg border border-amber-500/50 bg-amber-500/20 text-amber-300 flex items-center gap-1.5 shadow-sm";
                doubtBtn.innerHTML = `<i data-lucide="check-square" class="w-3.5 h-3.5 text-amber-400"></i><span>Ditandai Ragu-Ragu</span>`;
            } else {
                doubtBtn.className = "px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center gap-1.5";
                doubtBtn.innerHTML = `<i data-lucide="square" class="w-3.5 h-3.5 text-slate-400"></i><span>Tandai Ragu-Ragu</span>`;
            }
        }

        // Navigasi Prev/Next
        const prevBtn = document.getElementById('btn-prev-question');
        const nextBtn = document.getElementById('btn-next-question');
        if (prevBtn) prevBtn.disabled = index === 0;
        if (nextBtn) {
            if (index === total - 1) {
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
        const total = State.activeSession.questions.length;
        const newIdx = State.activeSession.currentIndex + delta;
        if (newIdx >= 0 && newIdx < total) {
            this.renderQuestion(newIdx);
            this.saveActiveSession();
        } else if (newIdx >= total) {
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

            let stateClass = "border border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500";
            if (isDoubt) stateClass = "border border-amber-500/80 bg-amber-500/20 text-amber-300 font-bold";
            else if (isAnswered) stateClass = "border border-emerald-500/80 bg-emerald-500/20 text-emerald-300 font-bold";
            if (isCurrent) stateClass += " ring-2 ring-indigo-500 scale-105";

            return `
                <button type="button" onclick="ExamModule.renderQuestion(${idx})" class="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition shadow-sm ${stateClass}" title="Soal #${idx + 1}">
                    ${idx + 1}
                </button>
            `;
        }).join('');
    },

    _updateAnsweredCount() {
        const total = State.activeSession.questions ? State.activeSession.questions.length : CONFIG.TOTAL_QUESTIONS;
        const answered = Object.keys(State.activeSession.selectedAnswers || {}).length;
        const answeredEl = document.getElementById('q-answered-count');
        if (answeredEl) answeredEl.textContent = `${answered} / ${total} Terjawab`;
    },

    openSubmitModal() {
        const total = State.activeSession.questions ? State.activeSession.questions.length : CONFIG.TOTAL_QUESTIONS;
        const answeredCount = Object.keys(State.activeSession.selectedAnswers).length;
        const unanswered = total - answeredCount;
        const summaryEl = document.getElementById('modal-submit-summary');

        if (unanswered > 0) {
            summaryEl.innerHTML = `Anda telah menjawab <strong class="text-white">${answeredCount} dari ${total} butir soal</strong> (masih terdapat <strong class="text-amber-400">${unanswered} butir soal belum dijawab</strong>). Yakin ingin menyelesaikan sekarang?`;
        } else {
            summaryEl.innerHTML = `Seluruh <strong class="text-emerald-400">${total} butir soal telah dijawab lengkap</strong>. Sesi pengerjaan akan diselesaikan dan skor evaluasi langsung dihitung secara deterministik.`;
        }

        const m = document.getElementById('modal-submit-exam');
        m.classList.remove('hidden');
        m.classList.add('flex');
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

        const modeObj = CONFIG.MODES.find(m => m.id === State.activeSession.mode) || CONFIG.MODES[2];
        const maxDuration = modeObj.durationSeconds;
        const durationSec = Math.max(1, maxDuration - State.activeSession.remainingSeconds);
        const remainingSec = Math.max(0, State.activeSession.remainingSeconds);
        const totalQ = State.activeSession.questions.length;

        let correctCount = 0;
        const perQuestionDetail = {};

        State.activeSession.questions.forEach((q, idx) => {
            const chosenIdx = State.activeSession.selectedAnswers[idx];
            let correctIdx = -1;
            if (q._v) {
                try {
                    const decoded = (typeof atob !== 'undefined') ? atob(q._v) : Buffer.from(q._v, 'base64').toString();
                    correctIdx = parseInt(decoded.split(':')[1], 10);
                } catch (e) {
                    correctIdx = q.correctIndex !== undefined ? q.correctIndex : -1;
                }
            } else if (q.correctIndex !== undefined) {
                correctIdx = q.correctIndex;
            }

            const isCorrect = chosenIdx !== undefined && chosenIdx === correctIdx;
            if (isCorrect) correctCount += 1;

            perQuestionDetail[q.id] = {
                isCorrect,
                chosenText: chosenIdx !== undefined ? q.options[chosenIdx] : null,
                correctText: correctIdx >= 0 && q.options[correctIdx] ? q.options[correctIdx] : ""
            };
        });

        // Rumus Skor Edukasi
        const baseScore = correctCount * CONFIG.BASE_POINTS_PER_QUESTION;
        const accuracyRatio = totalQ > 0 ? (correctCount / totalQ) : 0;
        const speedBonus = Math.round(accuracyRatio * (remainingSec / maxDuration) * CONFIG.MAX_SPEED_BONUS);
        const totalScore = baseScore + speedBonus;
        const academicGrade = Number(((correctCount / totalQ) * 100).toFixed(1));

        const completedRecord = {
            id: `va_${State.activeSession.className.replace(/\s+/g, '')}_${State.activeSession.absen}_${Date.now()}`,
            timestamp: new Date().toISOString(),
            ip: State.activeSession.ip,
            name: State.activeSession.name,
            className: State.activeSession.className,
            absen: State.activeSession.absen,
            mode: State.activeSession.mode,
            totalQuestions: totalQ,
            correctCount,
            academicGrade,
            durationSec,
            baseScore,
            speedBonus,
            totalScore,
            tabSwitches: State.activeSession.tabSwitches || 0,
            answersJson: JSON.stringify(perQuestionDetail)
        };

        // Simpan ke State & LocalStorage
        State.leaderboardRecords.push(completedRecord);
        State.ipLockRegistry[completedRecord.ip] = completedRecord;
        State.save();

        // Kirim ke Google Spreadsheet (webhook Apps Script VectorArena).
        this.submitToSpreadsheet(completedRecord);

        this.clearActiveSession();
        this.checkAndEnforceIpLockUI();
        LeaderboardModule.renderAll();
        this.openReviewScreen(completedRecord);
        this._isSubmitting = false;
    },

    // Kirim satu hasil ujian ke webhook. Non-blocking: UI tidak menunggu dan
    // nilai tetap tersimpan lokal apa pun hasil kirimannya.
    submitToSpreadsheet(record) {
        if (typeof SpreadsheetService === 'undefined') return;

        if (!SpreadsheetService.isConfigured()) {
            SpreadsheetService.updateConnectionIndicator(false);
            return;
        }

        SpreadsheetService.pushRecord(record).then((result) => {
            if (result && result.status === 'ok') {
                SpreadsheetService.updateConnectionIndicator(true);
                if (typeof Utils !== 'undefined') {
                    Utils.showToast('Hasil ujian tersimpan di Google Spreadsheet.');
                }
            } else if (result && result.status === 'skipped') {
                SpreadsheetService.updateConnectionIndicator(true);
                if (typeof Utils !== 'undefined') {
                    Utils.showToast('Server menolak kiriman: ' + result.message, false);
                }
            } else if (result && result.status === 'local') {
                SpreadsheetService.updateConnectionIndicator(false);
            } else {
                SpreadsheetService.updateConnectionIndicator(false);
                if (typeof Utils !== 'undefined') {
                    Utils.showToast('Gagal mengirim ke Spreadsheet. Nilai tetap tersimpan di perangkat.', false);
                }
            }
        });
    },

    checkAndEnforceIpLockUI() {
        const lockedRecord = State.findRecordByIp(State.clientIpAddress);
        const lockedBanner = document.getElementById('ip-locked-banner');
        const ipDot = document.getElementById('ip-status-dot');
        const ipText = document.getElementById('ip-status-text');

        if (lockedRecord) {
            if (lockedBanner) lockedBanner.classList.remove('hidden');
            const lockedName = document.getElementById('locked-student-name');
            const lockedClass = document.getElementById('locked-student-class');
            const lockedAbsen = document.getElementById('locked-student-absen');
            const lockedScore = document.getElementById('locked-student-score');
            if (lockedName) lockedName.textContent = lockedRecord.name;
            if (lockedClass) lockedClass.textContent = lockedRecord.className;
            if (lockedAbsen) lockedAbsen.textContent = lockedRecord.absen;
            if (lockedScore) lockedScore.textContent = Utils.formatNumber(lockedRecord.totalScore);

            const formInputs = document.querySelectorAll('#exam-start-form input, #exam-start-form select, #btn-start-exam');
            formInputs.forEach(el => el.disabled = true);
            if (ipDot) ipDot.className = "w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse";
            if (ipText) {
                ipText.textContent = "Sesi Selesai (Terkunci)";
                ipText.className = "font-medium text-amber-400";
            }
        } else {
            if (lockedBanner) lockedBanner.classList.add('hidden');
            const formInputs = document.querySelectorAll('#exam-start-form input, #exam-start-form select, #btn-start-exam');
            formInputs.forEach(el => el.disabled = false);
            if (ipDot) ipDot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500";
            if (ipText) {
                ipText.textContent = "Sistem Siap";
                ipText.className = "font-medium text-slate-300";
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
        document.getElementById('review-student-meta').textContent = `${record.className} • No. Absen ${record.absen} • Mode ${record.mode || 'Ranked'}`;

        document.getElementById('review-academic-grade').textContent = record.academicGrade;
        document.getElementById('review-correct-count').textContent = `${record.correctCount} / ${record.totalQuestions || CONFIG.TOTAL_QUESTIONS}`;
        document.getElementById('review-base-score').textContent = Utils.formatNumber(record.baseScore);
        document.getElementById('review-speed-bonus').textContent = `+${Utils.formatNumber(record.speedBonus)}`;
        document.getElementById('review-total-score').textContent = Utils.formatNumber(record.totalScore);

        const durationMins = Math.floor((record.durationSec || 0) / 60);
        const durationSecs = (record.durationSec || 0) % 60;
        document.getElementById('review-duration-text').textContent = `${durationMins}m ${durationSecs}s`;

        const kkmStatus = document.getElementById('review-kkm-status');
        if (record.academicGrade >= CONFIG.ACADEMIC_KKM) {
            kkmStatus.className = "px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
            kkmStatus.textContent = "Tuntas KKM (≥75)";
        } else {
            kkmStatus.className = "px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40";
            kkmStatus.textContent = "Remedial (<75)";
        }

        this._renderReviewQuestions(record);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    backToLobbyFromReview() {
        document.getElementById('screen-review').classList.add('hidden');
        document.getElementById('screen-lobby').classList.remove('hidden');
        this.checkAndEnforceIpLockUI();
        LeaderboardModule.renderAll();
    },

    _renderReviewQuestions(record) {
        const container = document.getElementById('review-questions-list');
        const lockedNotice = document.getElementById('review-locked-notice');

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

        const allKnownQuestions = (typeof CURATED_25_QUESTIONS !== 'undefined' && CURATED_25_QUESTIONS.length > 0)
            ? CURATED_25_QUESTIONS
            : QUESTIONS_BANK;

        const questionsToReview = allKnownQuestions.filter(q => answersMap[q.id] !== undefined);
        const reviewList = questionsToReview.length > 0 ? questionsToReview : allKnownQuestions.slice(0, record.totalQuestions || CONFIG.TOTAL_QUESTIONS);

        container.innerHTML = reviewList.map((q, idx) => {
            const correctOptionText = q.correctAnswer || (q.options && q.correctIndex !== undefined ? q.options[q.correctIndex] : "");
            const detail = answersMap[q.id] || { isCorrect: false, chosenText: "(Tidak dijawab)", correctText: correctOptionText };
            const isCorrect = detail.isCorrect;

            return `
                <div class="p-5 rounded-2xl bg-slate-900/80 border ${isCorrect ? 'border-emerald-500/40' : 'border-rose-500/40'} space-y-3.5 shadow-lg">
                    <div class="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div class="flex items-center gap-2">
                            <span class="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full ${isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">
                                Soal #${idx + 1}
                            </span>
                            <span class="text-xs font-semibold text-slate-300">${q.topic || q.zoneName || `Topik ${q.zoneId}`}</span>
                        </div>
                        <span class="text-xs font-bold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}">
                            ${isCorrect ? '✓ Jawaban Tepat (+3.000)' : '✕ Belum Tepat'}
                        </span>
                    </div>

                    <div class="text-sm text-slate-200 leading-relaxed font-medium">
                        ${Utils.renderMiniTeX(q.question || q.questionText)}
                    </div>

                    ${q.diagram && q.diagram.type ? `
                        <div id="review-diagram-${q.id}" class="flex justify-center"></div>
                    ` : ''}

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        <div class="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                            <div class="text-slate-400 font-semibold mb-0.5">Pilihan Anda:</div>
                            <div class="font-medium ${isCorrect ? 'text-emerald-300' : 'text-rose-300'}">${Utils.renderMiniTeX(detail.chosenText) || '(Kosong)'}</div>
                        </div>
                        <div class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                            <div class="text-emerald-400 font-semibold mb-0.5">Kunci Jawaban yang Benar:</div>
                            <div class="font-medium text-emerald-200">${Utils.renderMiniTeX(detail.correctText || correctOptionText)}</div>
                        </div>
                    </div>

                    <div class="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-300 space-y-1.5">
                        <div class="font-bold text-indigo-300 flex items-center gap-1.5">
                            <i data-lucide="info" class="w-3.5 h-3.5 text-indigo-400"></i>
                            <span>Penjelasan Fisika & Pembahasan:</span>
                        </div>
                        <p class="leading-relaxed text-slate-300">${Utils.renderMiniTeX(q.explanation)}</p>
                    </div>
                </div>
            `;
        }).join('');

        // Render diagram di review
        reviewList.forEach(q => {
            if (q.diagram && q.diagram.type) {
                Visualizers.render(q.diagram, `review-diagram-${q.id}`);
            }
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    _buildQuestionsForMode(modeObj) {
        // Jika CURATED_25_QUESTIONS tersedia, gunakan sebagai bank ujian 25 butir resmi
        let sourceBank = (typeof CURATED_25_QUESTIONS !== 'undefined' && CURATED_25_QUESTIONS.length === 25)
            ? CURATED_25_QUESTIONS
            : null;

        if (sourceBank) {
            return sourceBank.map(q => {
                const optObjs = q.options.map((text, idx) => ({
                    text,
                    isCorrect: (q.correctAnswer !== undefined) ? (text === q.correctAnswer) : (idx === q.correctIndex)
                }));
                const shuffledOpts = Utils.shuffle(optObjs);
                const newCorrectIdx = shuffledOpts.findIndex(o => o.isCorrect);
                const tokenStr = `${q.id}:${newCorrectIdx}:${CONFIG.BASE_POINTS_PER_QUESTION}`;
                const token = (typeof btoa !== 'undefined') ? btoa(tokenStr) : Buffer.from(tokenStr).toString('base64');
                return {
                    id: q.id,
                    zoneId: q.zoneId,
                    topic: q.zoneName || q.topic,
                    difficulty: q.difficulty,
                    question: q.question || q.questionText,
                    diagram: q.diagram,
                    options: shuffledOpts.map(o => o.text),
                    _v: token
                };
            });
        }

        let pool = [...QUESTIONS_BANK];
        if (modeObj.id === 'sprint') {
            // Bank 240 soal menyimpan difficulty sebagai angka (1 mudah – 4 sulit).
            pool = pool.filter(q => Number(q.difficulty) <= 2);
        } else if (modeObj.id === 'duel') {
            pool = pool.filter(q => q.zoneId === 5 || q.zoneId === 3);
        } else if (modeObj.id === 'race') {
            pool = pool.filter(q => q.zoneId === 6 || q.zoneId === 7 || q.zoneId === 8);
        } else if (modeObj.id === 'campaign') {
            const picked = [];
            for (let z = 1; z <= 8; z++) {
                const zQs = pool.filter(q => q.zoneId === z);
                picked.push(...Utils.shuffle(zQs).slice(0, 3));
            }
            pool = picked;
        }

        const shuffled = Utils.shuffle(pool).slice(0, modeObj.questions);
        return shuffled.map(q => {
            const optObjs = q.options.map((text, idx) => ({
                text,
                isCorrect: (q.correctAnswer !== undefined) ? (text === q.correctAnswer) : (idx === q.correctIndex)
            }));
            const shuffledOpts = Utils.shuffle(optObjs);
            const newCorrectIdx = shuffledOpts.findIndex(o => o.isCorrect);
            const tokenStr = `${q.id}:${newCorrectIdx}:${CONFIG.BASE_POINTS_PER_QUESTION}`;
            const token = (typeof btoa !== 'undefined') ? btoa(tokenStr) : Buffer.from(tokenStr).toString('base64');
            return {
                id: q.id,
                zoneId: q.zoneId,
                topic: q.topic || q.zoneName,
                difficulty: q.difficulty,
                question: q.question || q.questionText,
                diagram: q.diagram,
                options: shuffledOpts.map(o => o.text),
                _v: token
            };
        });
    },

    _startTimer() {
        clearInterval(State.activeSession.timerInterval);
        const syncTime = () => {
            if (!State.activeSession || !State.activeSession.startTimeMs) return;
            const elapsedSec = Math.floor((Date.now() - State.activeSession.startTimeMs) / 1000);
            const maxDuration = State.activeSession.durationSeconds || CONFIG.EXAM_DURATION_SECONDS;
            State.activeSession.remainingSeconds = Math.max(0, maxDuration - elapsedSec);
            this._updateTimerDisplay(State.activeSession.remainingSeconds);

            if (State.activeSession.remainingSeconds <= 0) {
                clearInterval(State.activeSession.timerInterval);
                Utils.showToast("Waktu ujian telah berakhir! Menyimpan evaluasi secara otomatis.");
                this.finalizeSubmit();
            }
        };

        syncTime();
        State.activeSession.timerInterval = setInterval(syncTime, 1000);
    },

    _updateTimerDisplay(remSec) {
        const timerEl = document.getElementById('exam-hud-timer');
        if (timerEl) {
            timerEl.textContent = Utils.formatTime(remSec);
            if (remSec < 300) {
                timerEl.className = "font-mono font-bold text-sm sm:text-base text-rose-400 animate-pulse";
            } else {
                timerEl.className = "font-mono font-bold text-sm sm:text-base text-indigo-300";
            }
        }
    },

    saveActiveSession() {
        if (!State.activeSession || !State.activeSession.startTimeMs) return;
        try {
            const payload = {
                name: State.activeSession.name,
                className: State.activeSession.className,
                absen: State.activeSession.absen,
                mode: State.activeSession.mode,
                ip: State.activeSession.ip,
                startTimeMs: State.activeSession.startTimeMs,
                durationSeconds: State.activeSession.durationSeconds,
                remainingSeconds: State.activeSession.remainingSeconds,
                questions: State.activeSession.questions,
                currentIndex: State.activeSession.currentIndex,
                selectedAnswers: State.activeSession.selectedAnswers,
                doubtFlags: State.activeSession.doubtFlags,
                tabSwitches: State.activeSession.tabSwitches
            };
            localStorage.setItem(CONFIG.STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(payload));
        } catch (e) {}
    },

    restoreActiveSession() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.ACTIVE_SESSION);
            if (!saved) return;
            const p = JSON.parse(saved);
            if (!p || !p.startTimeMs || !p.questions || p.questions.length === 0) return;

            const elapsedSec = Math.floor((Date.now() - p.startTimeMs) / 1000);
            const maxDuration = p.durationSeconds || CONFIG.EXAM_DURATION_SECONDS;
            if (elapsedSec >= maxDuration) {
                localStorage.removeItem(CONFIG.STORAGE_KEYS.ACTIVE_SESSION);
                return;
            }

            State.activeSession = {
                ...p,
                remainingSeconds: Math.max(0, maxDuration - elapsedSec),
                timerInterval: null
            };

            document.getElementById('screen-lobby').classList.add('hidden');
            document.getElementById('screen-review').classList.add('hidden');
            document.getElementById('screen-active-exam').classList.remove('hidden');

            document.getElementById('exam-hud-name').textContent = State.activeSession.name;
            document.getElementById('exam-hud-class').textContent = `${State.activeSession.className} • #${String(State.activeSession.absen).padStart(2, '0')}`;
            document.getElementById('exam-hud-mode').textContent = State.activeSession.mode || 'Ranked';

            this._startTimer();
            this.renderQuestion(State.activeSession.currentIndex || 0);
            this.renderPalette();
            Utils.showToast("Sesi evaluasi Anda berhasil dipulihkan otomatis.");
        } catch (e) {}
    },

    clearActiveSession() {
        if (State.activeSession && State.activeSession.timerInterval) {
            clearInterval(State.activeSession.timerInterval);
        }
        localStorage.removeItem(CONFIG.STORAGE_KEYS.ACTIVE_SESSION);
        State.activeSession = {
            name: "",
            className: "X A",
            absen: 1,
            mode: "ranked",
            ip: "",
            startTimeMs: 0,
            remainingSeconds: CONFIG.EXAM_DURATION_SECONDS,
            timerInterval: null,
            questions: [],
            currentIndex: 0,
            selectedAnswers: {},
            doubtFlags: {},
            tabSwitches: 0
        };
    }
};

if (typeof module !== 'undefined') {
    module.exports = { ExamModule };
}
