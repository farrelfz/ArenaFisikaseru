// ==========================================================================
// VECTORARENA - MODUL ALUR UJIAN SISWA (EXAM CONTROLLER)
// ==========================================================================

const ExamModule = {
    _isSubmitting: false,

    init() {
        this._bindAntiCheat();
        this._bindQuestionProtection();
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
        // Beralih tab / sembunyikan jendela = pelanggaran integritas + soal disamarkan.
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this._setQuestionBlur(true);
                this._recordViolation();
            } else {
                this._setQuestionBlur(false);
            }
        });
        // Kehilangan fokus (buka aplikasi/jendela lain, split-screen) → samarkan soal.
        window.addEventListener('blur', () => {
            if (State.activeSession && State.activeSession.startTimeMs > 0) this._setQuestionBlur(true);
        });
        window.addEventListener('focus', () => this._setQuestionBlur(false));
    },

    // Proteksi anti-salin/klik-kanan/cetak + injeksi watermark identitas.
    // Berfungsi hanya ketika layar ujian terbuka, supaya halaman lain
    // (lobby/review/guru) tidak ikut terkunci.
    _bindQuestionProtection() {
        if (this._protectionBound) return;
        this._protectionBound = true;

        const style = document.createElement('style');
        style.id = 'exam-protection-style';
        style.textContent = [
            '#exam-question-panel { position: relative; overflow: hidden; }',
            '#exam-question-panel .exam-watermark { position:absolute; inset:0; z-index:12; pointer-events:none; background-repeat:repeat; }',
            '#exam-question-panel.exam-focus-lost #q-stem-text,',
            '#exam-question-panel.exam-focus-lost #q-diagram-container,',
            '#exam-question-panel.exam-focus-lost #q-options-container,',
            '#exam-question-panel.exam-focus-lost #q-topic-badge,',
            '#exam-question-panel.exam-focus-lost #q-difficulty-badge,',
            '#exam-question-panel.exam-focus-lost #q-status-badge { filter: blur(7px); pointer-events:none; user-select:none; }',
            '#exam-focus-overlay { position:absolute; inset:0; z-index:30; display:none; align-items:center; justify-content:center; background:rgba(255,255,255,0.94); padding:24px; text-align:center; }',
            '#exam-question-panel.exam-focus-lost #exam-focus-overlay { display:flex; }'
        ].join('\n');
        document.head.appendChild(style);

        const examActive = () => {
            const screen = document.getElementById('screen-active-exam');
            return !!(screen && !screen.classList.contains('hidden') &&
                State.activeSession && State.activeSession.startTimeMs > 0);
        };

        // Blokir salin / potong / klik-kanan / pilih-teks / tempel saat ujian.
        ['copy', 'cut', 'contextmenu', 'selectstart', 'paste', 'dragstart'].forEach((evt) => {
            document.addEventListener(evt, (e) => {
                if (!examActive()) return;
                e.preventDefault();
                if (evt !== 'selectstart' && evt !== 'dragstart') this._recordViolation();
            });
        });

        // Cetak: buramkan konten + hitung (Ctrl+P diblokir di bawah; menu File>Print dihitung di sini).
        window.addEventListener('beforeprint', () => {
            if (!examActive()) return;
            this._recordViolation();
            this._setQuestionBlur(true);
        });
        window.addEventListener('afterprint', () => this._setQuestionBlur(false));

        // Pintasan papan klip / cetak / simpan.
        document.addEventListener('keydown', (e) => {
            if (!examActive()) return;
            const k = (e.key || '').toLowerCase();
            const mod = e.ctrlKey || e.metaKey;
            if (mod && (k === 'c' || k === 'x' || k === 'v' || k === 'a' || k === 'p' || k === 's')) {
                e.preventDefault();
                this._recordViolation();
            } else if (e.key === 'PrintScreen') {
                this._recordViolation();
            }
        });

        // Wadah watermark (di bawah konten) + overlay peringatan fokus (di atas).
        const panel = document.getElementById('exam-question-panel');
        if (panel) {
            const wm = document.createElement('div');
            wm.className = 'exam-watermark';
            panel.insertBefore(wm, panel.firstChild);

            const overlay = document.createElement('div');
            overlay.id = 'exam-focus-overlay';
            overlay.innerHTML = '<div><i data-lucide="eye-off" class="w-6 h-6 mx-auto text-rose-500"></i><p class="mt-2 text-sm font-bold text-slate-800">Layar tidak difokus</p><p class="mt-1 text-xs text-slate-500">Konten soal disamarkan. Setiap meninggalkan layar ujian dihitung sebagai pelanggaran integritas.</p></div>';
            panel.insertBefore(overlay, wm);
        }
    },

    // Catat satu pelanggaran integritas (tab switch / salin / klik-kanan / cetak)
    // ke penghitung yang sama (tabSwitches) lalu perbarui indikator di HUD.
    _recordViolation() {
        if (!State.activeSession || !State.activeSession.startTimeMs || this._isSubmitting) return;
        State.activeSession.tabSwitches = (State.activeSession.tabSwitches || 0) + 1;
        this.saveActiveSession();
        const cheatCount = document.getElementById('exam-hud-cheat-count');
        if (cheatCount) {
            const st = this._getAntiCheatStatus(State.activeSession.tabSwitches);
            cheatCount.textContent = st.statusLabel;
            cheatCount.className = st.badgeClass;
        }
    },

    // Samarkan / tampilkan kembali konten soal saat jendela kehilangan fokus.
    _setQuestionBlur(blur) {
        const panel = document.getElementById('exam-question-panel');
        if (!panel) return;
        if (blur) panel.classList.add('exam-focus-lost');
        else panel.classList.remove('exam-focus-lost');
    },

    // Bangun ulang watermark identitas (nama + kelas + absen) yang dibakar di
    // seluruh kartu soal. Jejak ini membuat screenshot/foto layar apa pun
    // langsung telusur ke pemiliknya — pencegah kebocoran soal terkuat.
    _updateWatermark() {
        const wm = document.querySelector('#exam-question-panel .exam-watermark');
        if (!wm) return;
        const name = String((State.activeSession && State.activeSession.name) || '').trim();
        const className = String((State.activeSession && State.activeSession.className) || '').trim().toUpperCase();
        const absen = parseInt((State.activeSession && State.activeSession.absen), 10) || 1;
        if (!name) { wm.style.backgroundImage = 'none'; return; }

        const line1 = name;
        const line2 = className + ' • #' + String(absen).padStart(2, '0');
        const svg =
            "<svg xmlns='http://www.w3.org/2000/svg' width='380' height='210'>" +
            "<text x='50%' y='44%' font-size='16' font-family='Arial, sans-serif' font-weight='700' fill='rgba(79,70,229,0.15)' text-anchor='middle' transform='rotate(-30 190 100)'>" + line1 + "</text>" +
            "<text x='50%' y='62%' font-size='13' font-family='Arial, sans-serif' font-weight='700' fill='rgba(190,18,60,0.16)' text-anchor='middle' transform='rotate(-30 190 100)'>" + line2 + "</text>" +
            "</svg>";
        wm.style.backgroundImage = "url('data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg) + "')";
    },

    _getAntiCheatStatus(switches) {
        const count = Number(switches) || 0;
        if (count === 0) {
            return { statusLabel: '0x • Fokus Penuh', badgeClass: 'text-emerald-700 font-bold tabular-nums' };
        } else if (count === 1) {
            return { statusLabel: '1x • Dispersi Ringan', badgeClass: 'text-teal-700 font-bold tabular-nums' };
        } else if (count === 2) {
            return { statusLabel: '2x • Fluktuasi', badgeClass: 'text-amber-700 font-bold tabular-nums' };
        } else if (count <= 4) {
            return { statusLabel: `${count}x • Defleksi Lintasan`, badgeClass: 'text-orange-700 font-bold tabular-nums' };
        } else {
            return { statusLabel: `${count}x • Diskontinuitas`, badgeClass: 'text-rose-700 font-bold tabular-nums animate-pulse' };
        }
    },

    setMode(modeId) {
        const mode = CONFIG.MODES.find(m => m.id === modeId);
        if (!mode) return;
        State.currentMode = modeId;
        localStorage.setItem(CONFIG.STORAGE_KEYS.GAME_MODE, modeId);

        // Sorot kartu mode aktif di lobi (tema terang).
        document.querySelectorAll('.game-mode-card').forEach(btn => {
            const isActive = btn.dataset.mode === modeId;
            btn.classList.toggle('border-indigo-500', isActive);
            btn.classList.toggle('bg-indigo-50', isActive);
            btn.classList.toggle('ring-2', isActive);
            btn.classList.toggle('ring-indigo-500/30', isActive);
            btn.classList.toggle('border-slate-200', !isActive);
            btn.classList.toggle('bg-white', !isActive);
            btn.classList.toggle('hover:border-indigo-300', !isActive);
            btn.setAttribute('aria-pressed', String(isActive));
        });

        const activeModeName = document.getElementById('lobby-active-mode-name');
        const activeModeDesc = document.getElementById('lobby-active-mode-desc');
        if (activeModeName) activeModeName.textContent = mode.name;
        if (activeModeDesc) {
            activeModeDesc.textContent = `${mode.questions} Soal • Durasi ${Math.round(mode.durationSeconds / 60)} Menit`;
        }

        // Ringkasan spesifikasi mengikuti mode yang dipilih.
        const specTotal = document.getElementById('spec-total-questions');
        const specDuration = document.getElementById('spec-duration');
        if (specTotal) specTotal.textContent = `${mode.questions} Butir PG`;
        if (specDuration) specDuration.textContent = `${Math.round(mode.durationSeconds / 60)} Menit`;
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

        const cheatPill = document.getElementById('exam-hud-cheat-pill');
        const cheatCount = document.getElementById('exam-hud-cheat-count');
        if (cheatPill && cheatCount) {
            cheatPill.classList.remove('hidden');
            const st = this._getAntiCheatStatus(0);
            cheatCount.textContent = st.statusLabel;
            cheatCount.className = st.badgeClass;
        }

        this._updateWatermark();
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
        const totalEl = document.getElementById('q-total-count');
        if (totalEl) totalEl.textContent = `/ ${total}`;
        document.getElementById('q-topic-badge').textContent = q.topic || q.zoneName || `Topik ${q.zoneId}`;

        // Render Lencana Tingkat Kesulitan (1 Mudah – 4 Tantangan)
        const diffBadge = document.getElementById('q-difficulty-badge');
        if (diffBadge) {
            const diffLabel = (typeof Utils !== 'undefined' && Utils.difficultyLabel)
                ? Utils.difficultyLabel(q.difficulty)
                : 'SEDANG';
            diffBadge.textContent = diffLabel;
            diffBadge.className = diffLabel === 'MUDAH'
                ? "edu-badge edu-badge-green font-mono text-[10px]"
                : diffLabel === 'SEDANG'
                ? "edu-badge edu-badge-amber font-mono text-[10px]"
                : diffLabel === 'SULIT'
                ? "edu-badge edu-badge-rose font-mono text-[10px]"
                : "edu-badge edu-badge-purple font-mono text-[10px]";
        }

        // Render Prompt Soal dengan Mini-TeX
        const stemEl = document.getElementById('q-stem-text');
        stemEl.innerHTML = Utils.renderMiniTeX(q.question);

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
                <div onclick="ExamModule.selectOption(${optIdx})" class="exam-option-card group p-3.5 sm:p-4 flex items-start justify-between gap-3 ${isSelected ? 'selected' : ''}">
                    <div class="flex items-start gap-3.5 min-w-0">
                        <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 transition ${isSelected ? 'bg-indigo-800 text-white shadow-sm' : 'bg-slate-100 text-slate-700 border border-slate-300 group-hover:border-indigo-400 group-hover:bg-indigo-50'}">
                            ${optionLetters[optIdx]}
                        </div>
                        <div class="text-sm text-slate-900 pt-0.5 leading-relaxed font-medium">
                            ${Utils.renderMiniTeX(optText)}
                        </div>
                    </div>
                    <span class="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${isSelected ? 'bg-indigo-100 text-indigo-900 border border-indigo-300' : 'bg-slate-50 text-slate-400 border border-slate-200 group-hover:text-indigo-600'} shrink-0 ml-2">
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

    _updateAnsweredCount() {
        if (!State.activeSession || !State.activeSession.questions) return;
        const total = State.activeSession.questions.length || CONFIG.TOTAL_QUESTIONS;
        const answeredCount = Object.keys(State.activeSession.selectedAnswers || {}).length;
        const doubtCount = Object.keys(State.activeSession.doubtFlags || {}).filter(k => State.activeSession.doubtFlags[k]).length;
        const unansweredCount = Math.max(0, total - answeredCount);

        const hudEl = document.getElementById('exam-hud-answered');
        if (hudEl) hudEl.textContent = `${answeredCount} / ${total}`;

        const progressBar = document.getElementById('exam-progress-bar');
        if (progressBar && progressBar.style) {
            const pct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
            progressBar.style.width = `${pct}%`;
        }

        const palAns = document.getElementById('pal-stat-answered');
        const palDoubt = document.getElementById('pal-stat-doubt');
        const palUnans = document.getElementById('pal-stat-unanswered');
        if (palAns) palAns.textContent = answeredCount;
        if (palDoubt) palDoubt.textContent = doubtCount;
        if (palUnans) palUnans.textContent = unansweredCount;
    },

    openSubmitModal() {
        const total = State.activeSession.questions ? State.activeSession.questions.length : CONFIG.TOTAL_QUESTIONS;
        const answeredCount = Object.keys(State.activeSession.selectedAnswers).length;
        const unanswered = total - answeredCount;
        const summaryEl = document.getElementById('modal-submit-summary');

        if (unanswered > 0) {
            summaryEl.innerHTML = `Anda telah menjawab <strong class="text-slate-900">${answeredCount} dari ${total} butir soal</strong> (masih terdapat <strong class="text-amber-700">${unanswered} butir soal belum dijawab</strong>). Yakin ingin menyelesaikan sekarang?`;
        } else {
            summaryEl.innerHTML = `Seluruh <strong class="text-emerald-700">${total} butir soal telah dijawab lengkap</strong>. Sesi pengerjaan akan diselesaikan dan skor evaluasi langsung dihitung secara deterministik.`;
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
        const ipDisplay = document.getElementById('header-ip-display');

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
            if (ipDot) ipDot.className = "w-2 h-2 rounded-full bg-amber-500 animate-pulse";
            if (ipText) {
                ipText.textContent = "Sesi Selesai (Terkunci)";
                ipText.className = "font-medium text-amber-600";
            }
        } else {
            if (lockedBanner) lockedBanner.classList.add('hidden');
            const formInputs = document.querySelectorAll('#exam-start-form input, #exam-start-form select, #btn-start-exam');
            formInputs.forEach(el => el.disabled = false);
            if (ipDot) ipDot.className = "w-2 h-2 rounded-full bg-emerald-500";
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
        document.getElementById('review-student-meta').textContent = `${record.className} • No. Absen ${record.absen} • Mode ${record.mode || 'Ranked'}`;

        document.getElementById('review-academic-grade').textContent = record.academicGrade;
        document.getElementById('review-correct-count').textContent = `${record.correctCount}`;
        const correctTotalEl = document.getElementById('review-correct-total');
        if (correctTotalEl) correctTotalEl.textContent = `Dari ${record.totalQuestions || CONFIG.TOTAL_QUESTIONS} butir soal`;
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
                <div class="edu-card p-5 space-y-3.5 border-l-4 ${isCorrect ? 'border-l-emerald-600' : 'border-l-rose-500'}">
                    <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div class="flex items-center gap-2">
                            <span class="font-mono font-bold text-xs px-2 py-0.5 rounded ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                                Soal #${idx + 1}
                            </span>
                            <span class="text-xs font-semibold text-slate-700">${q.topic || q.zoneName || `Topik ${q.zoneId}`}</span>
                        </div>
                        <span class="text-xs font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}">
                            ${isCorrect ? '✓ Jawaban Tepat (+3.000)' : '✕ Belum Tepat'}
                        </span>
                    </div>

                    <div class="text-sm text-slate-800 leading-relaxed font-medium">
                        ${Utils.renderMiniTeX(q.question || q.questionText)}
                    </div>

                    ${q.diagram && q.diagram.type ? `
                        <div id="review-diagram-${q.id}" class="p-2 bg-slate-50 rounded border border-slate-200 flex justify-center"></div>
                    ` : ''}

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div class="p-2.5 rounded bg-slate-50 border border-slate-200">
                            <div class="text-slate-500 font-semibold mb-0.5">Pilihan Anda:</div>
                            <div class="font-medium ${isCorrect ? 'text-emerald-800' : 'text-rose-800'}">${Utils.renderMiniTeX(detail.chosenText) || '(Kosong)'}</div>
                        </div>
                        <div class="p-2.5 rounded bg-emerald-50 border border-emerald-200">
                            <div class="text-emerald-700 font-semibold mb-0.5">Kunci Jawaban yang Benar:</div>
                            <div class="font-medium text-emerald-950">${Utils.renderMiniTeX(detail.correctText || correctOptionText)}</div>
                        </div>
                    </div>

                    <div class="p-3 rounded-md bg-indigo-50/60 border border-indigo-200 text-xs text-slate-700 space-y-1">
                        <div class="font-bold text-indigo-900 flex items-center gap-1.5">
                            <i data-lucide="info" class="w-3.5 h-3.5 text-indigo-700"></i>
                            <span>Penjelasan Fisika & Pembahasan:</span>
                        </div>
                        <p class="leading-relaxed text-slate-700">${Utils.renderMiniTeX(q.explanation)}</p>
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
        const curated = (typeof CURATED_25_QUESTIONS !== 'undefined' && CURATED_25_QUESTIONS.length === 25)
            ? CURATED_25_QUESTIONS
            : null;
        const bank = (typeof QUESTIONS_BANK !== 'undefined' && QUESTIONS_BANK.length > 0)
            ? QUESTIONS_BANK
            : null;
        const isRanked = modeObj.id === 'ranked';

        // Ujian resmi memakai 25 butir terkurasi; mode latihan memakai bank 240
        // soal agar jumlah butir sesuai spesifikasi tiap mode.
        let pool = (isRanked && curated) ? [...curated] : (bank ? [...bank] : (curated ? [...curated] : []));

        if (!isRanked) {
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
        }

        // Ujian resmi mempertahankan urutan kurasi; mode latihan diacak.
        const ordered = (isRanked && curated) ? pool : Utils.shuffle(pool);
        const selected = ordered.slice(0, modeObj.questions);

        return selected.map(q => {
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
        const timerEl = document.getElementById('exam-global-timer');
        if (!timerEl) return;
        timerEl.textContent = Utils.formatTime(remSec);

        if (remSec <= 300) {
            timerEl.className = "font-mono text-lg font-bold text-rose-600 animate-pulse tabular-nums";
        } else if (remSec <= 900) {
            timerEl.className = "font-mono text-lg font-bold text-amber-600 tabular-nums";
        } else {
            timerEl.className = "font-mono text-lg font-bold text-slate-900 tabular-nums";
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
            const modeObj = CONFIG.MODES.find(m => m.id === State.activeSession.mode);
            document.getElementById('exam-hud-mode').textContent = modeObj ? modeObj.name : (State.activeSession.mode || 'Ranked');

            const cheatPill = document.getElementById('exam-hud-cheat-pill');
            const cheatCount = document.getElementById('exam-hud-cheat-count');
            if (cheatPill && cheatCount) {
                cheatPill.classList.remove('hidden');
                const st = this._getAntiCheatStatus(State.activeSession.tabSwitches || 0);
                cheatCount.textContent = st.statusLabel;
                cheatCount.className = st.badgeClass;
            }

            this._updateWatermark();
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
        this._setQuestionBlur(false);
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
