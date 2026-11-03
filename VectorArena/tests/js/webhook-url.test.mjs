/**
 * Uji penjagaan URL webhook di panel guru.
 *
 * Nilai siswa dikirim ke URL yang disimpan guru. Tanpa pembatasan, URL apa pun
 * bisa dipakai dan nilai siswa berpotensi dikirim ke server pihak ketiga.
 * Berkas ini mengunci aturannya: hanya URL Apps Script resmi (atau alamat
 * loopback untuk pengujian lokal) yang diterima.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FAKE_URL = 'https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxxx/exec';

function loadModule(overrides = {}) {
  const toasts = [];
  const input = { value: '', endsWith: () => false };
  const sandbox = {
    module: { exports: {} },
    console,
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    document: {
      getElementById: (id) => (id === 'input-webhook-url' ? input : null),
      activeElement: null
    },
    CONFIG: {
      STORAGE_KEYS: { TEACHER_PIN: 'pin', WEBHOOK: 'wh' },
      DEFAULT_TEACHER_PIN: '000000',
      DEFAULT_WEBHOOK_URL: '',
      ...overrides.CONFIG
    },
    State: { examConfig: {}, save() {} },
    Utils: { showToast: (t, ok) => toasts.push({ text: t, ok }), escapeHtml: (t) => String(t) }
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(
    fs.readFileSync(path.join(ROOT, 'js', 'modules', 'teacherAdmin.js'), 'utf8'),
    sandbox,
    { filename: 'teacherAdmin.js' }
  );
  const mod = sandbox.module.exports.TeacherAdminModule;
  return Object.assign(mod, { _toasts: toasts, _input: input });
}

test('URL Apps Script resmi diterima', () => {
  const mod = loadModule();
  const urls = [
    'https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxxx/exec',
    'https://script.google.com/macros/s/AbCdEf123/exec?foo=bar'
  ];
  for (const url of urls) {
    assert.equal(mod._isAllowedWebhookUrl(url), true, url);
  }
});

test('URL loopback tetap diterima untuk pengujian lokal', () => {
  const mod = loadModule();
  const urls = [
    'http://127.0.0.1:8080/macros/fake/exec',
    'http://localhost:3000/exec',
    'http://[::1]:9000/exec'
  ];
  for (const url of urls) {
    assert.equal(mod._isAllowedWebhookUrl(url), true, url);
  }
});

test('URL pihak ketiga dan skema berbahaya ditolak', () => {
  const mod = loadModule();
  const urls = [
    'https://hook.site/abc-123',
    'https://evil.example.com/collect',
    'http://169.254.169.254/latest/meta-data',
    'https://script.google.com/macros/s/AKfycbxxx/',          // tanpa /exec
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'https://script.google.com.evil.example.com/macros/s/x/exec'
  ];
  for (const url of urls) {
    assert.equal(mod._isAllowedWebhookUrl(url), false, url);
  }
});

test('URL kosong tidak dianggap valid (dibiarkan sebagai mode mandiri)', () => {
  const mod = loadModule();
  assert.equal(mod._isAllowedWebhookUrl(''), false);
});

test('URL webhook bawaan di config.js harus lolos allowlist', () => {
  // Menjaga agar DEFAULT_WEBHOOK_URL yang benar-benar dipakai aplikasi tidak
  // pernah tertulis salah dan diam-diam tertolak oleh validasi di atas.
  const src = fs.readFileSync(path.join(ROOT, 'js', 'config.js'), 'utf8');
  const match = src.match(/DEFAULT_WEBHOOK_URL:\s*'([^']*)'/);
  assert.ok(match, 'DEFAULT_WEBHOOK_URL tidak ditemukan di config.js');

  const url = match[1];
  if (url === '') return; // mode mandiri: bukan galat

  const mod = loadModule();
  assert.equal(mod._isAllowedWebhookUrl(url), true,
    'DEFAULT_WEBHOOK_URL harus berupa URL Apps Script /exec yang sah: ' + url);
});

// Mengosongkan kolom tidak mematikan integrasi bila config.js membawa URL
// bawaan. Pesan ke guru harus menyebut apa yang sebenarnya berlaku.
test('mengosongkan kolom memberi pesan jujur saat ada URL bawaan', () => {
  const mod = loadModule({ CONFIG: { DEFAULT_WEBHOOK_URL: FAKE_URL } });
  mod._input.value = '';
  mod.saveWebhookUrl();

  const last = mod._toasts.pop();
  assert.match(last.text, /bawaan/i);
  assert.doesNotMatch(last.text, /mode mandiri/i);
});

test('mengosongkan kolom menyebut mode mandiri saat tidak ada URL bawaan', () => {
  const mod = loadModule({ CONFIG: { DEFAULT_WEBHOOK_URL: '' } });
  mod._input.value = '';
  mod.saveWebhookUrl();

  const last = mod._toasts.pop();
  assert.match(last.text, /mode mandiri/i);
});

test('menghapus URL memberi tahu bahwa bawaan dipakai kembali', () => {
  const mod = loadModule({ CONFIG: { DEFAULT_WEBHOOK_URL: FAKE_URL } });
  mod.clearWebhookUrl();

  const last = mod._toasts.pop();
  assert.match(last.text, /bawaan/i);
  assert.doesNotMatch(last.text, /mode mandiri/i);
});
