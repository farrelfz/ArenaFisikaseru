/**
 * Vector Arena — HTTP + WebSocket handlers.
 *
 * Route table is registered at construction so server.js can do plain exact
 * matching; the few parameterised routes are pattern-matched by the caller.
 *
 * Important invariant: **no endpoint that a student can reach ever returns
 * `correctAnswer`, `explanation` or `verification`** before the attempt is
 * submitted. The public question projection lives in `toPublicQuestion`.
 */

import { randomUUID, timingSafeEqual } from 'node:crypto';
import { createHash } from 'node:crypto';

const ZONES = [
  { id: 1, name: 'Vector Fundamentals', code: 'VF', target: 25 },
  { id: 2, name: 'Vector Representation', code: 'VR', target: 25 },
  { id: 3, name: 'Vector Operations', code: 'VO', target: 35 },
  { id: 4, name: 'Geometrical Vector Methods', code: 'GV', target: 35 },
  { id: 5, name: 'Vector Components', code: 'VC', target: 40 },
  { id: 6, name: 'GVA — Gerak Vertikal ke Atas', code: 'GVA', target: 30 },
  { id: 7, name: 'GVB — Gerak Vertikal ke Bawah', code: 'GVB', target: 25 },
  { id: 8, name: 'GJB — Gerak Jatuh Bebas', code: 'GJB', target: 25 },
];

export const MODES = [
  { id: 'sprint', name: 'Sprint Konsep', description: '10 soal pilihan ganda, waktu 6 menit.', questions: 10, durationSeconds: 360, types: ['mc', 'true_false'] },
  { id: 'duel', name: 'Duel Vektor', description: 'Dua pemain bergantian menjawab soal komponen.', questions: 12, durationSeconds: 480, types: ['mc', 'numeric'] },
  { id: 'ranked', name: 'Ujian Zona', description: 'Seluruh soal satu zona, waktu 20 menit.', questions: 40, durationSeconds: 1200, types: null },
  { id: 'race', name: 'Balapan Gravitasi', description: 'Realtime head-to-head GVA/GVB/GJB.', questions: 10, durationSeconds: 300, types: ['mc', 'numeric'], realtime: true },
  { id: 'campaign', name: 'Kampanye 8 Zona', description: 'Perjalanan menyeluruh dengan progres tersimpan.', questions: 40, durationSeconds: 2400, types: null },
];

const PUBLIC_QUESTION_FIELDS = [
  'id',
  'zoneId',
  'zoneName',
  'subtopic',
  'difficulty',
  'basePoints',
  'type',
  'questionText',
  'options',
  'pairs',
  'items',
  'unit',
  'diagram',
  'estimatedTime',
];

export function toPublicQuestion(q) {
  const out = {};
  for (const field of PUBLIC_QUESTION_FIELDS) {
    if (q[field] !== undefined) out[field] = q[field];
  }
  // Matching questions must not leak the pairing through array order.
  if (out.type === 'matching') {
    const rights = [...new Set(out.pairs.map((p) => p.right))];
    out.pairs = out.pairs.map((p) => ({ left: p.left }));
    out.choices = shuffleDeterministic(rights, out.id);
  }
  return out;
}

function shuffleDeterministic(list, seed) {
  const out = [...list];
  let h = 0;
  for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) | 0;
  for (let i = out.length - 1; i > 0; i -= 1) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */
function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function sanitizeName(value, max = 40) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (trimmed.length < 2 || trimmed.length > max) return null;
  // Letters (incl. Latin-1 accented), digits, space, dot, hyphen, apostrophe.
  if (!/^[\p{L}\p{N} .'\-]+$/u.test(trimmed)) return null;
  return trimmed;
}

function safeEqualText(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Pick questions deterministically for a mode + seed. */
export function pickQuestions(bank, mode, seed, zoneId = null) {
  const all = (bank?.questions || []).filter((q) => (zoneId ? q.zoneId === zoneId : true));
  const pool = mode.types ? all.filter((q) => mode.types.includes(q.type)) : all;
  const ordered = shuffleDeterministic(pool, `${mode.id}:${seed}`);
  return ordered.slice(0, Math.min(mode.questions, ordered.length));
}

export class Handler {
  constructor({ store, readJsonBody, clock, teacherPin }) {
    this.store = store;
    this.readJsonBody = readJsonBody;
    this.clock = clock;
    this.teacherPin = String(teacherPin);
    this.tokens = new Map(); // token -> { expiresAt }
    this.attemptTimers = new Map(); // attemptId -> startedAt (server clock)
  }

  register(routes) {
    const r = (method, path, fn) => routes.set(`${method} ${path}`, [path, (ctx) => fn(ctx)]);

    r('GET', '/api/health', (ctx) => this.health(ctx));
    r('GET', '/api/bank', (ctx) => this.bank(ctx));
    r('GET', '/api/modes', (ctx) => sendJson(ctx.res, 200, { modes: MODES, zones: ZONES }));
    r('POST', '/api/attempt/start', (ctx) => this.startAttempt(ctx));
    r('POST', '/api/attempt/submit', (ctx) => this.submitAttempt(ctx));
    r('GET', '/api/leaderboard', (ctx) => this.leaderboard(ctx));
    r('GET', '/api/analytics', (ctx) => this.analytics(ctx));
    r('POST', '/api/teacher/login', (ctx) => this.teacherLogin(ctx));
    r('POST', '/api/teacher/logout', (ctx) => this.teacherLogout(ctx));
    r('GET', '/api/teacher/questions', (ctx) => this.teacherList(ctx));
    r('POST', '/api/teacher/questions', (ctx) => this.teacherCreate(ctx));
    r('GET', '/api/teacher/questions/:id', (ctx) => this.teacherGet(ctx));
    r('PUT', '/api/teacher/questions/:id', (ctx) => this.teacherUpdate(ctx));
    r('POST', '/api/teacher/questions/:id/transition', (ctx) => this.teacherTransition(ctx));
    r('GET', '/api/teacher/export', (ctx) => this.teacherExport(ctx));
    r('GET', '/api/teacher/audit', (ctx) => this.teacherAudit(ctx));
    r('POST', '/api/teacher/settings', (ctx) => this.teacherSettings(ctx));
  }

  /* ------------- public ------------- */
  health(ctx) {
    sendJson(ctx.res, 200, {
      ok: true,
      bankQuestions: this.store.bank?.questions?.length ?? 0,
      schemaVersion: this.store.data.schema?.version ?? 0,
      time: new Date(this.clock()).toISOString(),
    });
  }

  bank(ctx) {
    const bank = this.store.bank;
    if (!bank) return sendJson(ctx.res, 503, { error: 'bank not built — run scripts/build_bank.py' });
    const hash = createHash('sha256')
      .update(JSON.stringify(bank.questions.map((q) => q.id)))
      .digest('hex')
      .slice(0, 16);
    sendJson(ctx.res, 200, {
      schemaVersion: bank.schemaVersion,
      hash,
      zones: ZONES,
      questions: bank.questions.map(toPublicQuestion),
    });
  }

  leaderboard(ctx) {
    const limit = Math.min(100, Number(ctx.url.searchParams.get('limit') || 25));
    const rows = [...this.store.data.leaderboard]
      .sort((a, b) => b.totalScore - a.totalScore || a.elapsedSeconds - b.elapsedSeconds)
      .slice(0, limit);
    sendJson(ctx.res, 200, { leaderboard: rows });
  }

  analytics(ctx) {
    const attempts = Object.values(this.store.data.attempts);
    const byZone = {};
    const byItem = {};
    for (const attempt of attempts) {
      for (const d of attempt.details || []) {
        const zone = String(d.zoneId);
        byZone[zone] ||= { attempts: 0, correct: 0 };
        byZone[zone].attempts += 1;
        byZone[zone].correct += d.correct ? 1 : 0;
        byItem[d.questionId] ||= { attempts: 0, correct: 0, difficulty: d.difficulty };
        byItem[d.questionId].attempts += 1;
        byItem[d.questionId].correct += d.correct ? 1 : 0;
      }
    }
    const items = Object.entries(byItem).map(([id, v]) => ({
      questionId: id,
      attempts: v.attempts,
      pValue: v.attempts ? Math.round((v.correct / v.attempts) * 100) / 100 : 0,
      index: `${id}`,
    }));
    // Discrimination (D) needs at least ~10 attempts per item to be meaningful;
    // below that we report null rather than a number that would be noise.
    for (const item of items) {
      const group = attempts.filter((a) => (a.details || []).some((d) => d.questionId === item.questionId));
      if (group.length < 10) {
        item.discrimination = null;
        continue;
      }
      const sorted = [...group].sort((a, b) => b.accuracy - a.accuracy);
      const third = Math.max(1, Math.floor(sorted.length / 3));
      const upper = sorted.slice(0, third);
      const lower = sorted.slice(-third);
      const p = (arr) => {
        let c = 0;
        let n = 0;
        for (const a of arr) {
          const d = (a.details || []).find((x) => x.questionId === item.questionId);
          if (!d) continue;
          n += 1;
          c += d.correct ? 1 : 0;
        }
        return n ? c / n : 0;
      };
      item.discrimination = Math.round((p(upper) - p(lower)) * 100) / 100;
    }
    const zones = ZONES.map((z) => ({
      ...z,
      attempts: byZone[z.id]?.attempts ?? 0,
      pValue: byZone[z.id]?.attempts
        ? Math.round((byZone[z.id].correct / byZone[z.id].attempts) * 100) / 100
        : null,
    }));
    sendJson(ctx.res, 200, {
      totalAttempts: attempts.length,
      zones,
      items: items.sort((a, b) => a.pValue - b.pValue).slice(0, 50),
      settings: this.store.data.settings,
    });
  }

  /* ------------- attempts ------------- */
  async startAttempt(ctx) {
    const body = await this.readJsonBody(ctx.req);
    const mode = MODES.find((m) => m.id === body.mode);
    if (!mode) return sendJson(ctx.res, 400, { error: 'unknown mode' });
    const name = sanitizeName(body.name);
    if (!name) return sendJson(ctx.res, 400, { error: 'nama tidak valid (2–40 karakter huruf/angka)' });
    if (!this.store.data.settings.examOpen) {
      return sendJson(ctx.res, 403, { error: 'ujian sedang ditutup oleh guru' });
    }
    const zoneId = body.zoneId ? Number(body.zoneId) : null;
    if (zoneId !== null && !ZONES.some((z) => z.id === zoneId)) {
      return sendJson(ctx.res, 400, { error: 'zona tidak dikenal' });
    }

    const seed = body.seed ? String(body.seed).slice(0, 64) : randomUUID();
    const questions = pickQuestions(this.store.bank, mode, seed, zoneId);
    if (!questions.length) return sendJson(ctx.res, 503, { error: 'tidak ada soal untuk mode ini' });

    const id = randomUUID();
    this.attemptTimers.set(id, this.clock());
    sendJson(ctx.res, 200, {
      attemptId: id,
      mode: mode.id,
      durationSeconds: mode.durationSeconds,
      serverTime: this.clock(),
      questions: questions.map(toPublicQuestion),
    });
  }

  async submitAttempt(ctx) {
    const body = await this.readJsonBody(ctx.req);
    const attemptId = String(body.attemptId || '');
    if (this.store.data.attempts[attemptId]) {
      // Idempotent replay: return the stored result, never re-score.
      return sendJson(ctx.res, 200, this.store.data.attempts[attemptId].result);
    }
    const startedAt = this.attemptTimers.get(attemptId);
    if (!startedAt) return sendJson(ctx.res, 404, { error: 'attempt tidak dikenal atau sudah dikumpulkan' });
    this.attemptTimers.delete(attemptId);

    const mode = MODES.find((m) => m.id === body.mode);
    if (!mode) return sendJson(ctx.res, 400, { error: 'unknown mode' });
    const name = sanitizeName(body.name);
    if (!name) return sendJson(ctx.res, 400, { error: 'nama tidak valid' });

    // Re-derive the question set from the same deterministic seed so the server
    // grades against the exact questions the client was given.
    const seed = String(body.seed || '');
    const zoneId = body.zoneId ? Number(body.zoneId) : null;
    const questions = pickQuestions(this.store.bank, mode, seed, zoneId);
    if (!questions.length) return sendJson(ctx.res, 503, { error: 'bank tidak tersedia' });

    const submittedAt = this.clock();
    const { scoreAttempt } = await import('./scoring.js');
    const result = scoreAttempt({
      questions,
      answers: body.answers || {},
      startedAt,
      submittedAt,
      durationSeconds: mode.durationSeconds,
    });

    const record = {
      id: attemptId,
      name,
      mode: mode.id,
      zoneId,
      startedAt: new Date(startedAt).toISOString(),
      submittedAt: new Date(submittedAt).toISOString(),
      score: result.totalScore,
      accuracy: result.accuracy,
      result,
      details: result.details.map((d, i) => ({
        ...d,
        zoneId: questions[i].zoneId,
        difficulty: questions[i].difficulty,
        // Explanations are only revealed after submission — that is the point.
        explanation: questions[i].explanation,
        formula: questions[i].formula,
        steps: questions[i].calculationSteps,
      })),
    };

    this.store.data.attempts[attemptId] = record;
    this.store.data.leaderboard.push({
      id: attemptId,
      name,
      mode: mode.id,
      zoneId,
      totalScore: result.totalScore,
      accuracy: result.accuracy,
      elapsedSeconds: result.elapsedSeconds,
      at: record.submittedAt,
    });
    await Promise.all([this.store.persist('attempts'), this.store.persist('leaderboard')]);
    result.details = record.details;
    sendJson(ctx.res, 200, result);
  }

  /* ------------- teacher auth ------------- */
  issueToken() {
    const token = randomUUID() + randomUUID().replace(/-/g, '');
    this.tokens.set(token, { expiresAt: this.clock() + 1000 * 60 * 60 * 8 });
    return token;
  }

  auth(ctx) {
    const header = ctx.req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const entry = this.tokens.get(token);
    if (!entry || entry.expiresAt < this.clock()) return null;
    return token;
  }

  async teacherLogin(ctx) {
    const body = await this.readJsonBody(ctx.req);
    const pin = String(body.pin ?? '');
    // Uniform failure message: never disclose whether the PIN length was wrong.
    if (!safeEqualText(pin, this.teacherPin)) {
      await this.store.audit({ event: 'teacher_login_failed', ip: ctx.req.socket.remoteAddress });
      await new Promise((resolve) => setTimeout(resolve, 350));
      return sendJson(ctx.res, 401, { error: 'PIN salah' });
    }
    const token = this.issueToken();
    await this.store.audit({ event: 'teacher_login', ip: ctx.req.socket.remoteAddress });
    sendJson(ctx.res, 200, { token, expiresInSeconds: 28800 });
  }

  async teacherLogout(ctx) {
    const token = this.auth(ctx);
    if (token) this.tokens.delete(token);
    sendJson(ctx.res, 200, { ok: true });
  }

  requireAuth(ctx) {
    if (!this.auth(ctx)) {
      sendJson(ctx.res, 401, { error: 'perlu login guru' });
      return false;
    }
    return true;
  }

  /* ------------- teacher question workflow ------------- */
  async teacherList(ctx) {
    if (!this.requireAuth(ctx)) return;
    sendJson(ctx.res, 200, {
      questions: this.store.data.teacherBank,
      workflow: ['DRAFT', 'VALIDATION', 'REVIEW', 'APPROVED', 'PUBLISHED'],
    });
  }

  async teacherGet(ctx) {
    if (!this.requireAuth(ctx)) return;
    const q = this.store.data.teacherBank.find((item) => item.id === ctx.params.id);
    if (!q) return sendJson(ctx.res, 404, { error: 'not found' });
    sendJson(ctx.res, 200, q);
  }

  async teacherCreate(ctx) {
    if (!this.requireAuth(ctx)) return;
    const body = await this.readJsonBody(ctx.req);
    const errors = validateDraft(body);
    if (errors.length) return sendJson(ctx.res, 400, { error: 'draft tidak valid', errors });
    const now = new Date(this.clock()).toISOString();
    const question = {
      id: `TCH-${randomUUID().slice(0, 8).toUpperCase()}`,
      ...body,
      status: 'DRAFT',
      version: 1,
      history: [{ version: 1, status: 'DRAFT', at: now, note: 'draft dibuat' }],
      createdAt: now,
      updatedAt: now,
      author: 'teacher',
    };
    this.store.data.teacherBank.push(question);
    await this.store.persist('teacherBank');
    await this.store.audit({ event: 'question_create', id: question.id });
    sendJson(ctx.res, 201, question);
  }

  async teacherUpdate(ctx) {
    if (!this.requireAuth(ctx)) return;
    const question = this.store.data.teacherBank.find((item) => item.id === ctx.params.id);
    if (!question) return sendJson(ctx.res, 404, { error: 'not found' });
    if (question.status === 'PUBLISHED') {
      return sendJson(ctx.res, 409, { error: 'soal PUBLISHED tidak dapat diubah; buat versi baru' });
    }
    const body = await this.readJsonBody(ctx.req);
    const merged = { ...question, ...body };
    const errors = validateDraft(merged);
    if (errors.length) return sendJson(ctx.res, 400, { error: 'draft tidak valid', errors });
    Object.assign(question, body, {
      version: question.version + 1,
      updatedAt: new Date(this.clock()).toISOString(),
    });
    await this.store.persist('teacherBank');
    await this.store.audit({ event: 'question_update', id: question.id, version: question.version });
    sendJson(ctx.res, 200, question);
  }

  async teacherTransition(ctx) {
    if (!this.requireAuth(ctx)) return;
    const question = this.store.data.teacherBank.find((item) => item.id === ctx.params.id);
    if (!question) return sendJson(ctx.res, 404, { error: 'not found' });
    const body = await this.readJsonBody(ctx.req);
    const to = String(body.to || '').toUpperCase();
    const allowed = {
      DRAFT: ['VALIDATION'],
      VALIDATION: ['DRAFT', 'REVIEW'],
      REVIEW: ['VALIDATION', 'APPROVED'],
      APPROVED: ['REVIEW', 'PUBLISHED'],
      PUBLISHED: [],
    };
    if (!(allowed[question.status] || []).includes(to)) {
      return sendJson(ctx.res, 409, {
        error: `transisi ${question.status} → ${to} tidak diizinkan`,
        allowed: allowed[question.status],
      });
    }
    const now = new Date(this.clock()).toISOString();
    question.status = to;
    question.version += 1;
    question.history.push({ version: question.version, status: to, at: now, note: String(body.note || '') });
    question.updatedAt = now;
    await this.store.persist('teacherBank');
    await this.store.audit({ event: 'question_transition', id: question.id, to });
    sendJson(ctx.res, 200, question);
  }

  async teacherExport(ctx) {
    if (!this.requireAuth(ctx)) return;
    const published = this.store.data.teacherBank.filter((q) => q.status === 'PUBLISHED');
    sendJson(ctx.res, 200, {
      exportedAt: new Date(this.clock()).toISOString(),
      count: published.length,
      questions: published,
    });
  }

  async teacherAudit(ctx) {
    if (!this.requireAuth(ctx)) return;
    sendJson(ctx.res, 200, { auditLog: this.store.data.auditLog.slice(-200).reverse() });
  }

  async teacherSettings(ctx) {
    if (!this.requireAuth(ctx)) return;
    const body = await this.readJsonBody(ctx.req);
    const next = { ...this.store.data.settings };
    if (typeof body.examOpen === 'boolean') next.examOpen = body.examOpen;
    if (Number.isInteger(body.examDurationSeconds) && body.examDurationSeconds >= 60 && body.examDurationSeconds <= 7200) {
      next.examDurationSeconds = body.examDurationSeconds;
    }
    if (Number.isInteger(body.attemptsPerStudent) && body.attemptsPerStudent >= 1 && body.attemptsPerStudent <= 20) {
      next.attemptsPerStudent = body.attemptsPerStudent;
    }
    this.store.data.settings = next;
    await this.store.persist('settings');
    await this.store.audit({ event: 'settings_change', settings: next });
    sendJson(ctx.res, 200, next);
  }

  /* ------------- realtime race ------------- */
  async handleRace(client, msg, rooms) {
    switch (msg.type) {
      case 'join': {
        const roomId = String(msg.roomId || '').slice(0, 24);
        const name = sanitizeName(msg.name);
        if (!roomId || !name) return client.send({ type: 'error', message: 'roomId dan nama diperlukan' });
        client.roomId = roomId;
        client.name = name;
        if (!rooms.has(roomId)) {
          const mode = MODES.find((m) => m.id === 'race');
          const seed = roomId;
          rooms.set(roomId, {
            id: roomId,
            seed,
            createdAt: this.clock(),
            players: new Map(),
            questions: pickQuestions(this.store.bank, mode, seed),
            index: 0,
            locked: false,
            scores: {},
          });
        }
        const room = rooms.get(roomId);
        room.players.set(client, { name, score: 0, streak: 0 });
        client.send({
          type: 'joined',
          roomId,
          total: room.questions.length,
          players: [...room.players.values()].map((p) => p.name),
        });
        this.broadcastRoom(room, {
          type: 'lobby',
          players: [...room.players.values()].map((p) => p.name),
        });
        if (room.players.size >= 2 && !room.locked) {
          room.locked = true;
          room.startedAt = this.clock();
          this.broadcastRoom(room, {
            type: 'start',
            question: toPublicQuestion(room.questions[0]),
            index: 0,
            total: room.questions.length,
          });
        }
        return;
      }
      case 'answer': {
        const room = rooms.get(client.roomId);
        if (!room || !room.locked) return client.send({ type: 'error', message: 'perlombaan belum dimulai' });
        const current = room.questions[room.index];
        if (!current) return;
        if (room.answeredBy) {
          // Someone already took this question; tell the late player who won.
          return client.send({ type: 'too-late', winner: room.answeredBy, index: room.index });
        }
        const { gradeAnswer } = await import('./scoring.js');
        const { correct } = gradeAnswer(current, msg.answer);
        const player = room.players.get(client);
        if (correct) {
          room.answeredBy = player.name;
          const points = 100 * (current.difficulty || 1);
          player.score += points;
          player.streak += 1;
          this.broadcastRoom(room, {
            type: 'round-result',
            index: room.index,
            winner: player.name,
            points,
            correct: true,
          });
          room.index += 1;
          room.answeredBy = null;
          if (room.index >= room.questions.length) {
            const standings = [...room.players.entries()]
              .map(([c, p]) => ({ name: p.name, score: p.score }))
              .sort((a, b) => b.score - a.score);
            this.broadcastRoom(room, { type: 'finished', standings });
            room.locked = false;
          } else {
            this.broadcastRoom(room, {
              type: 'next',
              question: toPublicQuestion(room.questions[room.index]),
              index: room.index,
              total: room.questions.length,
              scores: [...room.players.values()].map((p) => ({ name: p.name, score: p.score })),
            });
          }
        } else {
          player.streak = 0;
          client.send({ type: 'wrong', index: room.index });
        }
        return;
      }
      case 'ping':
        return client.send({ type: 'pong', t: msg.t });
      default:
        return client.send({ type: 'error', message: 'unknown message type' });
    }
  }

  broadcastRoom(room, payload) {
    for (const client of room.players.keys()) client.send(payload);
  }

  dropRaceClient(client, rooms) {
    const room = rooms.get(client.roomId);
    if (!room) return;
    room.players.delete(client);
    if (room.players.size === 0) {
      rooms.delete(room.id);
    } else {
      this.broadcastRoom(room, {
        type: 'lobby',
        players: [...room.players.values()].map((p) => p.name),
      });
    }
  }
}

/** Structural validation for a teacher-authored draft. */
export function validateDraft(q) {
  const errors = [];
  const types = ['mc', 'multiple_select', 'true_false', 'matching', 'ordering', 'numeric'];
  if (!types.includes(q.type)) errors.push('tipe soal tidak dikenal');
  if (!Number.isInteger(q.zoneId) || q.zoneId < 1 || q.zoneId > 8) errors.push('zoneId harus 1–8');
  if (!Number.isInteger(q.difficulty) || q.difficulty < 1 || q.difficulty > 4) errors.push('difficulty harus 1–4');
  if (typeof q.questionText !== 'string' || q.questionText.trim().length < 15) errors.push('teks soal terlalu pendek');
  if (typeof q.explanation !== 'string' || q.explanation.trim().length < 20) errors.push('pembahasan terlalu pendek');
  if (!q.correctAnswer) errors.push('jawaban benar wajib diisi');
  if (q.type === 'mc') {
    if (!Array.isArray(q.options) || q.options.length < 4) errors.push('mc butuh minimal 4 opsi');
    else {
      const set = new Set(q.options.map((o) => String(o).trim().toLowerCase()));
      if (set.size !== q.options.length) errors.push('opsi duplikat');
      if (!q.options.includes(q.correctAnswer)) errors.push('jawaban benar harus salah satu opsi');
    }
  }
  if (q.type === 'numeric' && !Number.isFinite(Number(String(q.correctAnswer).replace(',', '.')))) {
    errors.push('jawaban numerik tidak valid');
  }
  return errors;
}

export { ZONES, sendJson, sanitizeName };
