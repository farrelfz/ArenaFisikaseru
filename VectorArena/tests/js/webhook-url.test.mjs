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

function loadModule() {
  const sandbox = {
    module: { exports: {} },
    console,
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    document: { getElementById: () => null },
    CONFIG: { STORAGE_KEYS: { TEACHER_PIN: 'pin', WEBHOOK: 'wh' }, DEFAULT_TEACHER_PIN: '000000' },
    State: { examConfig: {}, save() {} },
    Utils: { showToast() {}, escapeHtml: (t) => String(t) }
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(
    fs.readFileSync(path.join(ROOT, 'js', 'modules', 'teacherAdmin.js'), 'utf8'),
    sandbox,
    { filename: 'teacherAdmin.js' }
  );
  return sandbox.module.exports.TeacherAdminModule;
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
