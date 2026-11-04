/**
 * Uji pembalikan (rollback) saklar status ujian di panel guru.
 *
 * Guru mengubah status dari perangkatnya; siswa hanya melihatnya bila server
 * menerima perubahan itu. Bila webhook sudah diatur tetapi server menolak atau
 * tidak menjawab, saklar harus kembali ke nilai semula. Tanpa ini, guru bisa
 * melihat "TERBUKA (AKTIF)" di layarnya padahal siswa masih terkunci.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** examConfig dengan semantik getter/setter yang sama seperti js/state.js. */
function makeExamConfig() {
  return {
    _isOpen: true,
    overrideMode: 'auto',
    _allowReview: true,
    overrideReviewMode: 'auto',
    get isOpen() {
      if (this.overrideMode === 'manual_open') return true;
      if (this.overrideMode === 'manual_closed') return false;
      return this._isOpen;
    },
    set isOpen(val) {
      this._isOpen = !!val;
      this.overrideMode = val ? 'manual_open' : 'manual_closed';
    },
    get allowReview() {
      if (this.overrideReviewMode === 'manual_allowed') return true;
      if (this.overrideReviewMode === 'manual_locked') return false;
      return this._allowReview;
    },
    set allowReview(val) {
      this._allowReview = !!val;
      this.overrideReviewMode = val ? 'manual_allowed' : 'manual_locked';
    }
  };
}

/**
 * Muat teacherAdmin.js dengan SpreadsheetService palsu.
 * `serverAccepts` menentukan jawaban setExamConfig; `configured` meniru ada
 * atau tidaknya webhook.
 */
function loadModule({ configured = true, serverAccepts = true } = {}) {
  const toasts = [];
  const calls = [];

  const sandbox = {
    module: { exports: {} },
    console,
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    document: { getElementById: () => null },
    CONFIG: { STORAGE_KEYS: { TEACHER_PIN: 'pin', WEBHOOK: 'wh' }, DEFAULT_TEACHER_PIN: '000000' },
    State: { examConfig: makeExamConfig(), save() {} },
    Utils: {
      showToast: (msg) => toasts.push(msg),
      escapeHtml: (t) => String(t)
    },
    SpreadsheetService: {
      isConfigured: () => configured,
      getWebhookUrl: () => (configured ? 'https://script.google.com/macros/s/x/exec' : ''),
      async setExamConfig(patch) {
        calls.push(patch);
        return serverAccepts;
      },
      updateConnectionIndicator() {}
    }
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(
    fs.readFileSync(path.join(ROOT, 'js', 'modules', 'teacherAdmin.js'), 'utf8'),
    sandbox,
    { filename: 'teacherAdmin.js' }
  );

  return { mod: sandbox.module.exports.TeacherAdminModule, state: sandbox.State, toasts, calls };
}

test('server menerima: status baru bertahan', async () => {
  const { mod, state, calls } = loadModule({ serverAccepts: true });

  await mod.toggleExamOpen();

  assert.equal(state.examConfig.isOpen, false, 'saklar tetap pada nilai baru');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].isOpen, false);
});

test('server menolak: status dikembalikan (rollback)', async () => {
  const { mod, state, toasts } = loadModule({ serverAccepts: false });

  await mod.toggleExamOpen();

  assert.equal(state.examConfig.isOpen, true, 'kembali ke nilai semula');
  assert.match(toasts.join(' | '), /dikembalikan|dibalik|Gagal/i);
});

test('rollback juga berlaku untuk saklar kunci pembahasan', async () => {
  const { mod, state } = loadModule({ serverAccepts: false });

  await mod.toggleAllowReview();

  assert.equal(state.examConfig.allowReview, true, 'kembali ke nilai semula');
});

test('mode mandiri (webhook kosong): tidak ada pembalikan, tidak ada kiriman', async () => {
  const { mod, state, calls } = loadModule({ configured: false });

  await mod.toggleExamOpen();

  assert.equal(state.examConfig.isOpen, false, 'perubahan lokal tetap berlaku');
  assert.equal(calls.length, 0, 'tidak ada panggilan server');
});
