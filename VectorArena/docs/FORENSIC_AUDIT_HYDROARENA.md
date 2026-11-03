# FORENSIC AUDIT: HYDROARENA & ARCHITECTURAL BLUEPRINT FOR VECTOR ARENA

## 1. Executive Summary
HydroArena is an in-browser competitive physics assessment portal built for SMAN 78 Jakarta focusing on Fluid Mechanics (Statics & Dynamics). It operates as a static client-side application leveraging `localStorage`, indexed tab switching detection, dynamic speed/accuracy scoring, and optional synchronization via Google Apps Script (GAS) and Google Visualization (GVIZ) API to Google Sheets.

Vector Arena adapts and expands this architecture into a comprehensive, multi-arena physics competition and learning platform focusing on:
1. Zone 1: Vector Fundamentals
2. Zone 2: Vector Representation
3. Zone 3: Vector Operations
4. Zone 4: Geometrical Vector Methods
5. Zone 5: Vector Components
6. Zone 6: GVA (Gerak Vertikal ke Atas)
7. Zone 7: GVB (Gerak Vertikal ke Bawah)
8. Zone 8: GJB (Gerak Jatuh Bebas)

---

## 2. HydroArena Forensic Audit Findings

### 2.1 Repository Structure
```
HydroArena/
├── index.html            # Monolithic entrypoint (161 KB) with inline modals & screen containers
├── package.json          # Node scripts for static serving & syntax checking
├── css/style.css         # Custom animations, tier styles, typography (10.4 KB)
├── js/
│   ├── config.js         # Configuration constants, storage keys, time boundaries (3.1 KB)
│   ├── state.js          # In-memory reactive state and localStorage manager (7.5 KB)
│   ├── app.js            # App bootstrap, view router, polling daemon (13.6 KB)
│   ├── utils/helpers.js  # Formatting, sanitization, toast, IP detection (4.8 KB)
│   ├── data/
│   │   ├── questions.js  # Static array of 25 fluid mechanics questions (37.2 KB)
│   │   └── diagrams.js   # Embedded SVG diagram strings (25.1 KB)
│   └── modules/
│       ├── exam.js           # Exam controller, anti-cheat, keyboard nav, palette (36.2 KB)
│       ├── leaderboard.js    # Podium, sorting, tiering, fair-play badges (40.2 KB)
│       ├── teacherAdmin.js   # PIN auth, question item analysis, student export (33.3 KB)
│       └── spreadsheet.js    # Webhook POST & GVIZ JSONP fetch (14.7 KB)
├── scripts/              # Simulation scripts for 10 & 25 students, GAS backend script
└── docs/                 # System architecture & access roles documentation
```

### 2.2 Framework & Component Architecture
- **Framework:** Vanilla JavaScript (ES6+), HTML5, Tailwind CSS via CDN, Lucide Icons CDN.
- **Architectural Pattern:** Modular Revealing Module / Object-Literal pattern (`State`, `App`, `ExamModule`, `LeaderboardModule`, `TeacherAdminModule`, `SpreadsheetService`, `Utils`).
- **State Management:** Single central `State` object persisted into `localStorage` with JSON serialization.
- **Router:** Single Page Application (SPA) driven by toggling the CSS `hidden` class across `#screen-lobby`, `#screen-active-exam`, and `#screen-review`.

### 2.3 Backend, API & Database Architecture
- **Serverless/Client-Side Only:** No dedicated Node/Express/Python backend required for base operation.
- **Persistence:** Primary persistence is `localStorage` on client devices.
- **Multi-Device Sync:** Google Apps Script Web App functioning as a serverless REST endpoint (`GET` to fetch student rows & exam status, `POST` to append exam submissions to Google Sheets).
- **Secondary Sync:** Google Visualization API (GVIZ) for read-only JSONP fallback when Apps Script quota is exhausted.

### 2.4 Authentication, Room Lifecycle & Multiplayer Mechanism
- **Student Auth:** Zero password; identity validated by Name, Class (XI A–F), Absen Number (1–40), and IP lock registry.
- **Teacher Auth:** Session-based PIN (`CONFIG.DEFAULT_TEACHER_PIN` or custom `localStorage` pin), with modal and gate triggers (including a hidden 3-click logo Easter egg).
- **Multiplayer/Synchronization Model:** Asynchronous competitive leaderboard. HydroArena does not use WebSockets; it uses periodic polling (12s interval in lobby) against the centralized Google Sheet.
- **Scoring & Ranking:**
  - Base Score = `correctCount * BASE_POINTS_PER_QUESTION` (75,000 max base)
  - Speed Bonus = `(correctCount / totalQuestions) * (remainingSeconds / durationSeconds) * MAX_SPEED_BONUS` (25,000 max bonus)
  - Total Points = 100,000 max.
  - Academic Grade = `(correctCount / totalQuestions) * 100` (KKM = 75.0)

### 2.5 Strengths to Reuse Directly
1. **Double Shuffling Algorithm:** Fisher-Yates shuffle on questions and on option choices per session with correct index tracking.
2. **Anti-Cheat Monitoring:** Page visibility and focus tracking (`visibilitychange` / `window.onblur`) logging tab switches with qualitative integrity tiers (*Aliran Tunak*, *Riak Fluktuasi*, *Olakan Vortiks*, *Kavitasi Kritis*, *Separasi Ekstrem*).
3. **Session Recovery:** Active session auto-save on answer change and interval tick, auto-resuming upon device restart or accidental refresh.
4. **Keyboard Accessibility:** Option selection via numeric (1-5) and alphabetic (A-E) keys, doubt toggling (R), and arrow key navigation.
5. **Class Breakdown & Item Analysis:** Teacher analytics calculating difficulty index ($P$), discrimination index ($D$), and option distribution.

### 2.6 Technical Debt & Limitations in HydroArena
1. **Single Game Mode:** Only supports fixed 25-question classic linear exam. No duel, no survival, no team, no topic-focused practice mode.
2. **Fixed Subject Scope:** Hardcoded for 25 questions in Fluid Mechanics.
3. **Monolithic DOM:** Everything rendered in a single massive HTML file making expansion error-prone.
4. **Purely Static SVGs:** Visual assets in HydroArena are hardcoded SVG strings; parameters cannot be dynamically adjusted.
5. **No Client-Side Question Bank Filtering:** Cannot filter by difficulty, zone, or topic dynamically.
6. **No Automated Physics Unit/Dimensional Validation:** Answers and questions were statically hand-crafted without an algorithmic verification engine.

---

## 3. Feature Parity & Evolution Matrix

| Feature Dimension | HydroArena SMAN 78 | Vector Arena (Target Architecture) |
|---|---|---|
| **Domain** | Fluid Statics & Dynamics (Kelas XI) | Vector Physics & 1D Vertical Kinematics (GVA, GVB, GJB) |
| **Question Bank Size** | 25 Fixed Questions | **240 Validated Questions** across 8 Zones (30/zone average) |
| **Game Modes** | 1 (Classic Timed Exam) | **5 Modes:** Classic Arena, Duel Arena, Team Arena, Survival Arena, Training Arena |
| **Visualizations** | Static SVG Strings | **Dynamic Interactive SVG Engines** (Vector Canvas, Kinematic Projector) |
| **Verification Engine** | None (Static) | **Deterministic Physics Verification Engine** (SymPy/NumPy-grade test suite) |
| **Question Types** | Multiple Choice Only (5 options) | MC, Multiple Select, Numerical, Diagram, Multi-step |
| **Scoring Engine** | 75k Base + 25k Speed | Transparent tiered scoring: Level 1 (100), Level 2 (200), Level 3 (300), Level 4 (500) + speed bonus (≤10%) |
| **Teacher Admin** | Single PIN, view submissions, basic edit | Full Question Bank Manager (Draft, Review, Approved), Import/Export, Real-time Simulator |
| **Integrity Checks** | Tab switch count | Multi-level anti-cheat + answer hash validation + time-interval delta validation |
| **Test Coverage** | None (only script simulations) | Automated Vitest/Node test suite + Python physics verification suite |

---

## 4. Architectural Design for Vector Arena
Vector Arena will be structured cleanly into modular ES modules and clean CSS, retaining full zero-build portability while delivering full production-grade capabilities.
