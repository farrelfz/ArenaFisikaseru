import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Simulated 10 students dataset integrity and extreme conditions', () => {
    const filePath = path.resolve('simulated_10_students.json');
    assert.ok(fs.existsSync(filePath), 'simulated_10_students.json must exist');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    assert.equal(data.length, 10, 'Must have exactly 10 student records');

    // Cek ada siswa top, tuntas KKM, remedial, timeout, pelanggaran tab berat
    const topStudent = data[0];
    assert.ok(topStudent.totalScore > 90000, 'Top student should achieve >90k score');
    assert.equal(topStudent.academicGrade, 100.0, 'Top student grade 100');

    const timeoutStudent = data.find(s => s.durationSec === 5400);
    assert.ok(timeoutStudent, 'Must simulate timeout student (5400s)');
    assert.equal(timeoutStudent.speedBonus, 0, 'Timeout student gets 0 speed bonus');

    const heavyViolator = data.find(s => s.tabSwitches >= 5);
    assert.ok(heavyViolator, 'Must simulate heavy tab switch violator');

    const exactKkm = data.find(s => s.academicGrade >= 75.0 && s.academicGrade <= 76.0);
    assert.ok(exactKkm, 'Must simulate threshold KKM student');
    assert.equal(exactKkm.statusKKM, 'TUNTAS');
});

test('Simulated 25 students dataset covers Kelas X A - X K (11 classes)', () => {
    const filePath = path.resolve('simulated_25_students.json');
    assert.ok(fs.existsSync(filePath), 'simulated_25_students.json must exist');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    assert.equal(data.length, 25, 'Must have exactly 25 student records');

    const classes = new Set(data.map(s => s.className));
    const expected = ['X A', 'X B', 'X C', 'X D', 'X E', 'X F', 'X G', 'X H', 'X I', 'X J', 'X K'];
    expected.forEach(cls => {
        assert.ok(classes.has(cls), `Dataset must contain class ${cls}`);
    });

    data.forEach(s => {
        assert.ok(s.name, 'Student must have name');
        assert.ok(s.absen >= 1 && s.absen <= 40, 'Absen must be valid');
        assert.ok(s.academicGrade >= 0 && s.academicGrade <= 100, 'Grade 0-100');
        assert.ok(s.totalScore >= 0 && s.totalScore <= 100000, 'Score 0-100,000');
        if (s.academicGrade < 75.0) {
            assert.equal(s.speedBonus, 0, 'Remedial student should receive 0 speed bonus');
            assert.equal(s.statusKKM, 'REMEDIAL');
        } else {
            assert.equal(s.statusKKM, 'TUNTAS');
        }
    });
});
