import { shellVoicing, nearestShell, cagedArpeggio, SHELL_QUALITIES } from '../../src/music/jazz.js';
import { chordTones } from '../../src/music/chords.js';
import { STANDARD_TUNING } from '../../src/music/tuning.js';
import { pitchClass } from '../../src/music/notes.js';

const ROOTS = ['C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const frets = (marks) => marks.map((m) => `${m.string}/${m.fret}`).join(' ');

test('the shells every jazz player learns', () => {
  expect(frets(shellVoicing({ root: 'G', quality: 'maj7', bass: 6 }))).toBe('6/3 4/4 3/4');
  expect(frets(shellVoicing({ root: 'G', quality: '7', bass: 6 }))).toBe('6/3 4/3 3/4');
  expect(frets(shellVoicing({ root: 'G', quality: 'm7', bass: 6 }))).toBe('6/3 4/3 3/3');
  expect(frets(shellVoicing({ root: 'C', quality: 'maj7', bass: 5 }))).toBe('5/3 4/2 3/4');
  expect(frets(shellVoicing({ root: 'C', quality: '7', bass: 5 }))).toBe('5/3 4/2 3/3');
  expect(frets(shellVoicing({ root: 'D', quality: 'm7', bass: 5 }))).toBe('5/5 4/3 3/5');
});

test('shells in every key and quality: root in the bass, then the 7 and 3 (or 3 and 7), all on the neck', () => {
  for (const root of ROOTS) for (const quality of SHELL_QUALITIES) for (const bass of [6, 5]) {
    const marks = shellVoicing({ root, quality, bass });
    const [r, third, , seventh] = chordTones(root, quality);
    expect(marks.map((m) => m.note)).toEqual(bass === 6 ? [r, seventh, third] : [r, third, seventh]);
    for (const m of marks) {
      expect(pitchClass(m.note)).toBe((STANDARD_TUNING[m.string] + m.fret) % 12);
      expect(m.fret).toBeGreaterThanOrEqual(0);
    }
    const fs = marks.map((m) => m.fret);
    expect(Math.max(...fs) - Math.min(...fs)).toBeLessThanOrEqual(3);
  }
});

test('nearest shell: ii-V-I in C around fret 4 alternates bass strings, the classic grip', () => {
  expect(frets(nearestShell({ root: 'D', quality: 'm7', near: 4 }))).toBe('5/5 4/3 3/5');
  expect(frets(nearestShell({ root: 'G', quality: '7', near: 4 }))).toBe('6/3 4/3 3/4');
  expect(frets(nearestShell({ root: 'C', quality: 'maj7', near: 4 }))).toBe('5/3 4/2 3/4');
  expect(nearestShell({ root: 'C', quality: 'maj7', near: 4, guideTones: true }).map((m) => m.degree).sort()).toEqual(['3', '7']);
});

test('arpeggios in a CAGED shape hold only chord tones, inside the shape', () => {
  for (const root of ROOTS) for (const quality of SHELL_QUALITIES) for (const shape of ['C', 'A', 'G', 'E', 'D']) {
    const marks = cagedArpeggio({ root, shape, quality });
    const tones = new Set(chordTones(root, quality));
    expect(marks.length).toBeGreaterThanOrEqual(5);
    expect(marks.every((m) => tones.has(m.note))).toBe(true);
    expect(new Set(marks.map((m) => m.note))).toEqual(tones);
  }
});
