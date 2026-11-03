/**
 * Vector Arena — authoritative scoring.
 *
 * Scoring contract (identical on client and server, but only the server's
 * result is stored):
 *
 *   basePoints   = Σ basePoints of each correctly answered question
 *                  (100 / 200 / 300 / 500 for difficulty 1..4)
 *   accuracy     = correctAnswers / totalAnswers        → multiplier 1 or 0
 *                  (multiplier 0 when the attempt is not a valid attempt,
 *                   e.g. every answer wrong, which collapses to 0 anyway)
 *   speedBonus   = round(basePoints × clamp(remainingRatio) × 0.10)
 *                  capped at 10 % of basePoints, and 0 if accuracy < 1
 *   totalScore   = basePoints + speedBonus
 *
 * The "accuracy multiplier 1/0" of the spec is implemented as: the bonus is
 * only awarded when accuracy is 1 (all answered correctly); otherwise 0.
 * Base points are never multiplied — a wrong answer simply earns nothing.
 */

export const BASE_POINTS = Object.freeze({ 1: 100, 2: 200, 3: 300, 4: 500 });
export const MAX_SPEED_BONUS_RATIO = 0.1;
/** Relative tolerance for numeric answers (0.5 %), with a floor near zero. */
export const RELATIVE_TOLERANCE = 0.005;
export const ABSOLUTE_TOLERANCE = 0.005;

const norm = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

/**
 * Grade a single answer.
 * @returns {{correct:boolean, detail?:string}}
 */
export function gradeAnswer(question, answer) {
  if (!question) return { correct: false, detail: 'unknown question' };
  switch (question.type) {
    case 'mc':
    case 'true_false': {
      if (typeof answer !== 'string') return { correct: false };
      return { correct: norm(answer) === norm(question.correctAnswer) };
    }
    case 'multiple_select': {
      const given = Array.isArray(answer) ? answer.map(norm).sort() : [];
      const want = [...question.correctAnswer].map(norm).sort();
      return {
        correct: given.length === want.length && given.every((v, i) => v === want[i]),
      };
    }
    case 'matching': {
      if (!answer || typeof answer !== 'object') return { correct: false };
      const want = question.correctAnswer;
      const keys = Object.keys(want);
      if (Object.keys(answer).length !== keys.length) return { correct: false };
      for (const key of keys) {
        if (norm(answer[key]) !== norm(want[key])) return { correct: false };
      }
      return { correct: true };
    }
    case 'ordering': {
      if (!Array.isArray(answer)) return { correct: false };
      const want = question.correctAnswer;
      if (answer.length !== want.length) return { correct: false };
      return { correct: answer.every((v, i) => norm(v) === norm(want[i])) };
    }
    case 'numeric': {
      const value = Number(String(answer).replace(',', '.').trim());
      if (!Number.isFinite(value)) return { correct: false };
      const target = Number(String(question.correctAnswer).replace(',', '.').trim());
      if (!Number.isFinite(target)) return { correct: false };
      // Tolerance is relative, with an absolute floor for values near zero.
      // A fixed absolute tolerance would be needlessly strict for large answers
      // (e.g. 450 m/s) and too loose for small ones (e.g. 0.02 s), so a student
      // who rounds a correct calculation to 3 significant figures is not
      // punished for display rounding.
      const declared = Number(question.tolerance);
      const tolerance = Number.isFinite(declared)
        ? declared
        : Math.max(RELATIVE_TOLERANCE * Math.abs(target), ABSOLUTE_TOLERANCE);
      return { correct: Math.abs(value - target) <= tolerance };
    }
    default:
      return { correct: false, detail: `unsupported type ${question.type}` };
  }
}

/**
 * Score a completed attempt from the question list, the raw answers, and the
 * timing information the server observed itself.
 */
export function scoreAttempt({ questions, answers, startedAt, submittedAt, durationSeconds }) {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const details = [];
  let basePoints = 0;
  let answered = 0;
  let correctCount = 0;

  for (const question of questions) {
    const raw = answers?.[question.id];
    const isAnswered =
      raw !== undefined &&
      raw !== null &&
      !(Array.isArray(raw) && raw.length === 0) &&
      !(typeof raw === 'object' && !Array.isArray(raw) && Object.keys(raw).length === 0) &&
      raw !== '';
    const { correct } = isAnswered ? gradeAnswer(byId.get(question.id), raw) : { correct: false };
    if (isAnswered) answered += 1;
    if (correct) {
      correctCount += 1;
      basePoints += BASE_POINTS[question.difficulty] ?? 100;
    }
    details.push({
      questionId: question.id,
      correct,
      answered: isAnswered,
      expected: question.correctAnswer,
      points: correct ? BASE_POINTS[question.difficulty] ?? 100 : 0,
    });
  }

  const accuracy = questions.length ? correctCount / questions.length : 0;
  const elapsed = Math.max(0, Math.round(((submittedAt - startedAt) / 1000) * 10) / 10);
  const remainingRatio = Math.max(0, Math.min(1, 1 - elapsed / Math.max(1, durationSeconds)));
  const accuracyMultiplier = correctCount === questions.length && questions.length > 0 ? 1 : 0;
  const speedBonus =
    accuracyMultiplier === 1
      ? Math.round(basePoints * remainingRatio * MAX_SPEED_BONUS_RATIO)
      : 0;

  return {
    basePoints,
    speedBonus,
    totalScore: basePoints + speedBonus,
    correctCount,
    answeredCount: answered,
    totalQuestions: questions.length,
    accuracy: Math.round(accuracy * 1000) / 10,
    accuracyMultiplier,
    remainingRatio: Math.round(remainingRatio * 1000) / 1000,
    elapsedSeconds: elapsed,
    details,
  };
}

/** Grade attached skill levels 1..5 from bank coverage + attempt accuracy. */
export function certificationLevel({ zonesCovered, accuracyPercent, attemptedQuestions, consistency }) {
  if (attemptedQuestions < 40) {
    return { level: 1, reason: 'Kurang dari 40 soal dikerjakan — level dasar.' };
  }
  const score = 0.55 * Math.min(1, accuracyPercent / 100) + 0.25 * Math.min(1, zonesCovered / 8) + 0.2 * Math.min(1, Math.max(0, consistency));
  if (score >= 0.93) return { level: 5, reason: 'Penguasaan menyeluruh dengan akurasi dan konsistensi tinggi.' };
  if (score >= 0.82) return { level: 4, reason: 'Penguasaan kuat di hampir seluruh zona.' };
  if (score >= 0.68) return { level: 3, reason: 'Penguasaan baik dengan beberapa zona masih lemah.' };
  if (score >= 0.5) return { level: 2, reason: 'Dasar terbentuk; perlu latihan pada zona lemah.' };
  return { level: 1, reason: 'Perlu penguatan konsep dasar.' };
}
