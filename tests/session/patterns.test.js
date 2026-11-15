import { spiderPattern, sequencePattern, resolvePattern } from '../../src/session/patterns.js';
import { positionMarks } from '../../src/music/scales.js';
import { noteAt } from '../../src/music/tuning.js';

const box1 = positionMarks({ root: 'A', scale: 'minorPentatonic', position: 1 });
const names = (notes) => notes.map((n) => n.note);

test('spider is 1-3-2-4 on every string, low E up to high e and back down', () => {
  const p = spiderPattern({ startFret: 5, order: [1, 3, 2, 4] });
  expect(p).toHaveLength(48);
  expect(p.slice(0, 4).map((n) => [n.string, n.fret, n.finger])).toEqual([[6, 5, 1], [6, 7, 3], [6, 6, 2], [6, 8, 4]]);
  expect(p.slice(20, 28).map((n) => n.string)).toEqual([1, 1, 1, 1, 1, 1, 1, 1]);
  expect(p.at(-1)).toMatchObject({ string: 6, fret: 8, finger: 4 });
});

test('groups of 3 up walk the box in pitch order: A-C-D, C-D-E, D-E-G…', () => {
  const p = sequencePattern(box1, { group: 3, direction: 'up' });
  expect(names(p.slice(0, 9))).toEqual(['A', 'C', 'D', 'C', 'D', 'E', 'D', 'E', 'G']);
  expect(p).toHaveLength(30);
});

test('groups of 4 down start from the top note', () =>
  expect(names(sequencePattern(box1, { group: 4, direction: 'down' }).slice(0, 8))).toEqual(['C', 'A', 'G', 'E', 'A', 'G', 'E', 'D']));

test('skip a note up: A-D, C-E, D-G…', () =>
  expect(names(sequencePattern(box1, { skip: true, direction: 'up' }).slice(0, 6))).toEqual(['A', 'D', 'C', 'E', 'D', 'G']));

test('sequence notes keep their box fingering and positions', () => {
  const p = sequencePattern(box1, { group: 3, direction: 'up' });
  for (const n of p) expect(noteAt(n.string, n.fret).pc).toBe(noteAt(n.string, n.fret).pc);
  expect(p[0]).toMatchObject({ string: 6, fret: 5, finger: 1 });
});

test('resolvePattern builds a sequence from a fretboard spec', () => {
  const p = resolvePattern({ type: 'sequence', of: { type: 'pentatonic', root: 'A', quality: 'minor', position: 1 }, group: 3, direction: 'up' });
  expect(names(p.slice(0, 3))).toEqual(['A', 'C', 'D']);
});



import { groupSizeOf, groupStart, demoStepMs } from '../../src/session/patterns.js';

test('group size: one string for spider, the group for sequences, a pair for skips', () => {
  expect(groupSizeOf({ type: 'spider', order: [1, 3, 2, 4] })).toBe(4);
  expect(groupSizeOf({ type: 'sequence', group: 3 })).toBe(3);
  expect(groupSizeOf({ type: 'sequence', skip: true })).toBe(2);
});
test('group start snaps the note index to its group', () => {
  expect(groupStart(0, 4)).toBe(0);
  expect(groupStart(7, 4)).toBe(4);
  expect(groupStart(5, 3)).toBe(3);
});
test('demo speeds: slow, medium, and at tempo from the BPM', () => {
  expect(demoStepMs('slow', 80, 2)).toBe(1100);
  expect(demoStepMs('medium', 80, 2)).toBe(650);
  expect(demoStepMs('tempo', 80, 2)).toBe(375);
});

import { notesPerBeatOf, SUBDIVISION_NAME } from '../../src/session/patterns.js';

test('a pattern can set its own notes per click, else the step default applies', () => {
  expect(notesPerBeatOf({ notesPerBeat: 2 }, { type: 'sequence', group: 3, notesPerBeat: 3 })).toBe(3);
  expect(notesPerBeatOf({ notesPerBeat: 2 }, { type: 'spider' })).toBe(2);
});
test('subdivisions have musician names', () =>
  expect([1, 2, 3, 4].map((n) => SUBDIVISION_NAME[n])).toEqual(['quarters', '8ths', 'triplets', '16ths']));
