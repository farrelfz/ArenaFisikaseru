/**
 * Integration tests for the Vector Arena server.
 * These exercise the real HTTP + WebSocket stack on an ephemeral port.
 */

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, cp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createApp, ROOT, safeResolve } from '../../server/server.js';
import { scoreAttempt, gradeAnswer, BASE_POINTS } from '../../server/scoring.js';
import { pickQuestions, MODES, toPublicQuestion } from '../../server/handlers.js';

let app;
let base;
let dataDir;
const PIN = '975310';

before(async () => {
  dataDir = await mkdtemp(path.join(tmpdir(), 'va-test-'));
  await cp(path.join(ROOT, 'data', 'questions.json'), path.join(dataDir, 'questions.json'));
  app = await createApp({ dataDir, teacherPin: PIN });
  await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${app.server.address().port}`;
});

after(async () => {
  app.close();
  await new Promise((resolve) => app.server.close(resolve));
  await rm(dataDir, { recursive: true, force: true });
});

const json = async (res) => ({ status: res.status, body: await res.json() });

test('health reports the loaded bank', async () => {
  const { status, body } = await json(await fetch(`${base}/api/health`));
  assert.equal(status, 200);
  assert.equal(body.bankQuestions, 240);
});

test('public bank never leaks answers', async () => {
  const { body } = await json(await fetch(`${base}/api/bank`));
  for (const q of body.questions) {
    assert.equal(q.correctAnswer, undefined, `${q.id} leaked correctAnswer`);
    assert.equal(q.explanation, undefined, `${q.id} leaked explanation`);
    assert.equal(q.verification, undefined, `${q.id} leaked verification`);
  }
});

test('matching questions hide the pairing and provide shuffled choices', async () => {
  const { body } = await json(await fetch(`${base}/api/bank`));
  const matching = body.questions.filter((q) => q.type === 'matching');
  assert.ok(matching.length > 0);
  for (const q of matching) {
    assert.ok(q.pairs.every((p) => Object.keys(p).length === 1 && p.left));
    assert.ok(Array.isArray(q.choices) && q.choices.length >= 3);
  }
});

test('attempt grading is authoritative and reveals answers only after submit', async () => {
  const start = await json(
    await fetch(`${base}/api/attempt/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'sprint', name: 'Siswa Uji', seed: 'seed-1' }),
    }),
  );
  assert.equal(start.status, 200);
  assert.equal(start.body.questions.length, 10);
  assert.equal(start.body.questions[0].correctAnswer, undefined);

  const bank = JSON.parse(await readFile(path.join(dataDir, 'questions.json'), 'utf8'));
  const answers = {};
  for (const q of start.body.questions) {
    answers[q.id] = bank.questions.find((b) => b.id === q.id).correctAnswer;
  }
  const submit = await json(
    await fetch(`${base}/api/attempt/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId: start.body.attemptId, mode: 'sprint', name: 'Siswa Uji', seed: 'seed-1', answers }),
    }),
  );
  assert.equal(submit.status, 200);
  assert.equal(submit.body.correctCount, 10);
  assert.equal(submit.body.accuracyMultiplier, 1);
  assert.ok(submit.body.speedBonus <= submit.body.basePoints * 0.1 + 1);
  assert.ok(submit.body.details.every((d) => d.explanation && d.explanation.length > 0));

  // Replay must return the same stored result, not award points twice.
  const replay = await json(
    await fetch(`${base}/api/attempt/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId: start.body.attemptId, mode: 'sprint', name: 'Siswa Uji', seed: 'seed-1', answers }),
    }),
  );
  assert.equal(replay.status, 200);
  assert.deepEqual(replay.body, submit.body);
});

test('attempt with unknown id is rejected', async () => {
  const res = await json(
    await fetch(`${base}/api/attempt/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId: 'nope', mode: 'sprint', answers: {} }),
    }),
  );
  assert.equal(res.status, 404);
});

test('invalid student names are rejected', async () => {
  for (const name of ['a', '<script>alert(1)</script>', 'Nama'.repeat(20)]) {
    const res = await json(
      await fetch(`${base}/api/attempt/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'sprint', name }),
      }),
    );
    assert.equal(res.status, 400, `name ${name} should be rejected`);
  }
});

test('path traversal is blocked', async () => {
  for (const bad of ['/../package.json', '/..%2fpackage.json', '/server/server.js', '/data/questions.json']) {
    const res = await fetch(base + bad);
    assert.ok([400, 404].includes(res.status), `${bad} returned ${res.status}`);
    const text = await res.text();
    assert.ok(!text.includes('createApp'), `${bad} served server source`);
  }
});

test('safeResolve keeps every path inside the root', () => {
  for (const p of ['/index.html', '/js/app.js', '/css/style.css']) {
    const resolved = safeResolve(ROOT, p);
    assert.ok(resolved.startsWith(ROOT));
  }
  assert.equal(safeResolve(ROOT, '/../../etc/passwd'), null);
});

test('teacher endpoints require a token', async () => {
  const res = await json(await fetch(`${base}/api/teacher/questions`));
  assert.equal(res.status, 401);
});

test('wrong teacher PIN is rejected', async () => {
  const res = await json(
    await fetch(`${base}/api/teacher/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '000000' }),
    }),
  );
  assert.equal(res.status, 401);
});

test('teacher workflow enforces legal transitions only', async () => {
  const login = await json(
    await fetch(`${base}/api/teacher/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: PIN }),
    }),
  );
  assert.equal(login.status, 200);
  const auth = { Authorization: `Bearer ${login.body.token}`, 'Content-Type': 'application/json' };

  const draft = {
    zoneId: 3,
    difficulty: 2,
    type: 'mc',
    questionText: 'Hasil penjumlahan vektor 3 satuan ke timur dan 4 satuan ke utara adalah …',
    options: ['7 satuan', '5 satuan', '1 satuan', '12 satuan'],
    correctAnswer: '5 satuan',
    explanation: 'Resultan tegak lurus dihitung dengan Pythagoras: akar dari 9 + 16 sama dengan 5 satuan.',
    unit: 'satuan',
  };
  const created = await json(await fetch(`${base}/api/teacher/questions`, { method: 'POST', headers: auth, body: JSON.stringify(draft) }));
  assert.equal(created.status, 201);
  assert.equal(created.body.status, 'DRAFT');

  // DRAFT → APPROVED is illegal.
  const illegal = await json(
    await fetch(`${base}/api/teacher/questions/${created.body.id}/transition`, {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ to: 'APPROVED' }),
    }),
  );
  assert.equal(illegal.status, 409);

  const path4 = ['VALIDATION', 'REVIEW', 'APPROVED', 'PUBLISHED'];
  for (const to of path4) {
    const r = await json(
      await fetch(`${base}/api/teacher/questions/${created.body.id}/transition`, {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ to }),
      }),
    );
    assert.equal(r.status, 200, `transition to ${to} failed`);
    assert.equal(r.body.status, to);
  }

  const after = await json(await fetch(`${base}/api/teacher/questions`, { headers: auth }));
  const stored = after.body.questions.find((q) => q.id === created.body.id);
  assert.equal(stored.history.length, 5);
  assert.deepEqual(stored.history.map((h) => h.status), ['DRAFT', ...path4]);

  // Published questions are immutable.
  const edit = await fetch(`${base}/api/teacher/questions/${created.body.id}`, {
    method: 'PUT',
    headers: auth,
    body: JSON.stringify({ questionText: 'diubah setelah publish — seharusnya ditolak' }),
  });
  assert.equal(edit.status, 409);
});

test('teacher draft validation rejects duplicate options', async () => {
  const login = await json(
    await fetch(`${base}/api/teacher/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: PIN }),
    }),
  );
  const auth = { Authorization: `Bearer ${login.body.token}`, 'Content-Type': 'application/json' };
  const res = await json(
    await fetch(`${base}/api/teacher/questions`, {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({
        zoneId: 1,
        difficulty: 1,
        type: 'mc',
        questionText: 'Soal dengan opsi duplikat untuk pengujian validasi server.',
        options: ['sama', 'sama', 'b', 'c'],
        correctAnswer: 'sama',
        explanation: 'Pembahasan cukup panjang untuk lolos validasi panjang minimum.',
      }),
    }),
  );
  assert.equal(res.status, 400);
  assert.ok(res.body.errors.some((e) => e.includes('duplikat')));
});

/* ---------------- pure scoring tests ---------------- */
test('scoring: base points follow difficulty', () => {
  const questions = [
    { id: 'a', type: 'mc', difficulty: 1, correctAnswer: 'x' },
    { id: 'b', type: 'mc', difficulty: 4, correctAnswer: 'y' },
  ];
  const r = scoreAttempt({
    questions,
    answers: { a: 'x', b: 'y' },
    startedAt: 0,
    submittedAt: 1000,
    durationSeconds: 100,
  });
  assert.equal(r.basePoints, BASE_POINTS[1] + BASE_POINTS[4]);
  assert.equal(r.totalScore, r.basePoints + r.speedBonus);
});

test('scoring: speed bonus is capped at 10% and needs full accuracy', () => {
  const questions = [
    { id: 'a', type: 'mc', difficulty: 1, correctAnswer: 'x' },
    { id: 'b', type: 'mc', difficulty: 1, correctAnswer: 'y' },
  ];
  const perfect = scoreAttempt({
    questions,
    answers: { a: 'x', b: 'y' },
    startedAt: 0,
    submittedAt: 0,
    durationSeconds: 100,
  });
  assert.equal(perfect.speedBonus, Math.round(200 * 1 * 0.1));

  const partial = scoreAttempt({
    questions,
    answers: { a: 'x', b: 'wrong' },
    startedAt: 0,
    submittedAt: 0,
    durationSeconds: 100,
  });
  assert.equal(partial.speedBonus, 0);
  assert.equal(partial.accuracyMultiplier, 0);
});

test('scoring: unanswered questions score zero', () => {
  const questions = [
    { id: 'a', type: 'mc', difficulty: 1, correctAnswer: 'x' },
    { id: 'b', type: 'mc', difficulty: 1, correctAnswer: 'y' },
  ];
  const r = scoreAttempt({ questions, answers: {}, startedAt: 0, submittedAt: 0, durationSeconds: 10 });
  assert.equal(r.correctCount, 0);
  assert.equal(r.answeredCount, 0);
  assert.equal(r.totalScore, 0);
});

test('grading handles every question type', () => {
  assert.deepEqual(gradeAnswer({ type: 'mc', correctAnswer: 'A' }, 'a'), { correct: true });
  assert.deepEqual(gradeAnswer({ type: 'true_false', correctAnswer: 'Benar' }, 'Benar'), { correct: true });
  assert.deepEqual(
    gradeAnswer({ type: 'multiple_select', correctAnswer: ['x', 'y'] }, ['y', 'x']),
    { correct: true },
  );
  assert.equal(gradeAnswer({ type: 'multiple_select', correctAnswer: ['x', 'y'] }, ['x']).correct, false);
  assert.equal(
    gradeAnswer({ type: 'matching', correctAnswer: { l1: 'r1', l2: 'r2' } }, { l1: 'r1', l2: 'r2' }).correct,
    true,
  );
  assert.equal(
    gradeAnswer({ type: 'matching', correctAnswer: { l1: 'r1', l2: 'r2' } }, { l1: 'r2', l2: 'r1' }).correct,
    false,
  );
  assert.equal(gradeAnswer({ type: 'ordering', correctAnswer: ['a', 'b', 'c'] }, ['a', 'b', 'c']).correct, true);
  assert.equal(gradeAnswer({ type: 'ordering', correctAnswer: ['a', 'b', 'c'] }, ['b', 'a', 'c']).correct, false);
  assert.equal(gradeAnswer({ type: 'numeric', correctAnswer: '5,00' }, 5).correct, true);
  assert.equal(gradeAnswer({ type: 'numeric', correctAnswer: '5,00' }, '4.98').correct, true);
  assert.equal(gradeAnswer({ type: 'numeric', correctAnswer: '5,00' }, '5.5').correct, false);
});

test('question selection is deterministic per seed and respects mode filters', async () => {
  const bank = JSON.parse(await readFile(path.join(dataDir, 'questions.json'), 'utf8'));
  const sprint = MODES.find((m) => m.id === 'sprint');
  const a = pickQuestions(bank, sprint, 'fixed').map((q) => q.id);
  const b = pickQuestions(bank, sprint, 'fixed').map((q) => q.id);
  assert.deepEqual(a, b);
  assert.equal(a.length, 10);
  const pool = new Map(bank.questions.map((q) => [q.id, q]));
  assert.ok(a.every((id) => sprint.types.includes(pool.get(id).type)));

  const ranked = MODES.find((m) => m.id === 'ranked');
  const zone6 = pickQuestions(bank, ranked, 'fixed', 6);
  assert.ok(zone6.every((q) => q.zoneId === 6));
});

test('toPublicQuestion strips solutions for every type', () => {
  const q = {
    id: 'X',
    type: 'numeric',
    correctAnswer: '5',
    explanation: 'secret',
    verification: { fn: 'x' },
    questionText: 't',
    options: [],
    pairs: [],
    items: [],
  };
  const pub = toPublicQuestion(q);
  assert.equal(pub.correctAnswer, undefined);
  assert.equal(pub.explanation, undefined);
  assert.equal(pub.verification, undefined);
});
