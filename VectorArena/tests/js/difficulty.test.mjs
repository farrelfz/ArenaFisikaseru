/**
 * Regresi untuk bug tampilan soal: bank soal menyimpan `difficulty` sebagai
 * ANGKA, sementara pemanggil lama memakai `q.difficulty.toUpperCase()` yang
 * melempar TypeError dan membuat soal tidak pernah muncul ke siswa.
 *
 * Uji ini mengunci kontrak: label selalu berupa string, apa pun tipe masukannya,
 * dan seluruh bank tetap memakai skema difficulty numerik 1–4 seperti server.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const read = (...parts) => fs.readFileSync(path.join(ROOT, ...parts), 'utf8');

function loadContext() {
  const sandbox = { module: { exports: {} }, console };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);

  vm.runInContext(read('js', 'config.js'), sandbox, { filename: 'config.js' });
  vm.runInContext(read('js', 'utils', 'helpers.js'), sandbox, { filename: 'helpers.js' });

  return sandbox;
}

function readBank(sandbox, file, name) {
  vm.runInContext(read(file), sandbox, { filename: file });
  return vm.runInContext(name, sandbox);
}

test('label kesulitan tersedia untuk setiap tingkat 1–4', () => {
  const sandbox = loadContext();
  const Utils = vm.runInContext('Utils', sandbox);

  assert.equal(Utils.difficultyLabel(1), 'MUDAH');
  assert.equal(Utils.difficultyLabel(2), 'SEDANG');
  assert.equal(Utils.difficultyLabel(3), 'SULIT');
  assert.equal(Utils.difficultyLabel(4), 'TANTANGAN');
});

test('label tetap berupa string untuk masukan angka, string, dan kosong', () => {
  const sandbox = loadContext();
  const Utils = vm.runInContext('Utils', sandbox);

  const cases = [1, 2, 3, 4, '2', 'easy', '', null, undefined, NaN, {}];
  for (const input of cases) {
    const label = Utils.difficultyLabel(input);
    assert.equal(typeof label, 'string', `input ${String(input)} harus menghasilkan string`);
    assert.ok(label.length > 0, `input ${String(input)} tidak boleh kosong`);
  }
});

test('setiap soal di bank 25 butir dapat dirender tanpa melempar', () => {
  const sandbox = loadContext();
  const Utils = vm.runInContext('Utils', sandbox);
  const bank = readBank(sandbox, 'js/data/curated_25.js', 'CURATED_25_QUESTIONS');

  assert.equal(bank.length, 25);
  for (const q of bank) {
    assert.equal(typeof q.difficulty, 'number', `${q.id} harus memakai difficulty numerik`);
    assert.doesNotThrow(() => Utils.difficultyLabel(q.difficulty), `${q.id} gagal dirender`);
    assert.doesNotThrow(() => Utils.renderMiniTeX(q.question), `${q.id} gagal dirender sebagai TeX`);
  }
});

test('seluruh bank soal (340) memakai difficulty numerik 1–4 sesuai skema server', () => {
  const sandbox = loadContext();
  const bank = readBank(sandbox, 'js/data/questions.js', 'QUESTIONS_BANK');

  assert.equal(bank.length, 340);
  for (const q of bank) {
    const level = Number(q.difficulty);
    assert.ok(Number.isInteger(level) && level >= 1 && level <= 4, `difficulty ${q.id} tidak valid`);
  }
});

test('teks soal yang memuat tanda < dan > tetap aman dirender sebagai teks', () => {
  const sandbox = loadContext();
  const Utils = vm.runInContext('Utils', sandbox);
  const bank = readBank(sandbox, 'js/data/curated_25.js', 'CURATED_25_QUESTIONS');

  // Kumpulkan seluruh teks yang benar-benar dirender ke layar review.
  const rendered = [];
  for (const q of bank) {
    for (const field of [q.question, q.explanation, q.correctAnswer]) {
      if (typeof field === 'string' && /[<>]/.test(field)) rendered.push({ id: q.id, text: field });
    }
  }
  assert.ok(rendered.length > 0, 'harus ada teks bertanda < atau > sebagai bahan uji');

  for (const { id, text } of rendered) {
    const html = Utils.renderMiniTeX(text);
    assert.ok(!html.includes('<script'), `escape bocor pada ${id}`);
    // Setelah escape, tag yang tersisa hanya tag TeX yang dihasilkan renderer.
    const stripped = html.replace(/<\/?(sup|sub|span|b|i|em|strong)\b[^>]*>/g, '');
    assert.ok(!/[<>]/.test(stripped), `escape bocor pada ${id}: ${stripped.slice(0, 80)}`);
  }
});
