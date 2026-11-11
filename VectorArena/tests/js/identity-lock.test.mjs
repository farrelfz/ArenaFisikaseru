/**
 * Regresi untuk bug "sekali-kerjakan" yang memakai IP sebagai kunci gawang.
 *
 * Kasus nyata: sekolah berada di belakang NAT sehingga seluruh siswa berbagi
 * satu IP publik yang sama. Akibatnya, begitu satu siswa selesai, semua
 * perangkat lain di jaringan yang sama ikut terkunci dan dituduh sebagai
 * siswa tersebut (mis. "atas nama Aline Agung Wiyono").
 *
 * Kontrak yang dikunci di sini: identitas "sudah mengerjakan" diukur lewat
 * NAMA + KELAS + ABSEN, BUKAN IP. Dua siswa beda nama (IP sama) tidak boleh
 * saling mengunci; satu siswa yang sama (IP beda) harus terdeteksi.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (...parts) => fs.readFileSync(path.join(ROOT, ...parts), 'utf8');

function loadState() {
  const sandbox = { module: { exports: {} }, console };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(read('js', 'config.js'), sandbox, { filename: 'config.js' });
  vm.runInContext(read('js', 'state.js'), sandbox, { filename: 'state.js' });
  return vm.runInContext('State', sandbox);
}

test('identityKeyFor menormalkan nama (case/space), kelas (upper), dan absen (int)', () => {
  const State = loadState();
  const a = State.identityKeyFor('  aline agung wiyono ', 'x h', '2');
  const b = State.identityKeyFor('Aline Agung Wiyono', 'X H', 2);
  assert.equal(a, b);
  assert.equal(a, 'aline agung wiyono|||X H|||2');
});

test('findRecordByIdentity mendeteksi siswa yang sama walau IP beda (lintas perangkat/NAT)', () => {
  const State = loadState();
  State.leaderboardRecords = [
    { name: 'Aline Agung Wiyono', className: 'X H', absen: 2, ip: '114.4.213.87' },
    { name: 'Bilal Al Baihaqi', className: 'X H', absen: 5, ip: '114.4.213.87' }
  ];
  const hit = State.findRecordByIdentity('Aline Agung Wiyono', 'X H', '2');
  assert.ok(hit, 'harus menemukan record siswa yang sama');
  assert.equal(hit.name, 'Aline Agung Wiyono');
});

test('findRecordByIdentity TIDAK salah mengunci siswa lain walau IP publik sama (kunci bug NAT)', () => {
  const State = loadState();
  State.leaderboardRecords = [
    { name: 'Aline Agung Wiyono', className: 'X H', absen: 2, ip: '114.4.213.87' }
  ];
  const miss = State.findRecordByIdentity('Bilal Al Baihaqi', 'X H', '5');
  assert.equal(miss, null, 'siswa beda identitas pada IP NAT yang sama TIDAK boleh dianggap sudah mengerjakan');
  const missEmpty = State.findRecordByIdentity('', '', '');
  assert.equal(missEmpty, null);
});