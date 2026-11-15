import { spiderPattern, sequencePattern, resolvePattern, playheadIndex } from '../../src/session/patterns.js';
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

test('playhead index follows beats at the given notes per beat and wraps', () => {
  expect(playheadIndex(0, 2, 48)).toBe(0);
  expect(playheadIndex(0.49, 2, 48)).toBe(0);
  expect(playheadIndex(0.5, 2, 48)).toBe(1);
  expect(playheadIndex(24, 2, 48)).toBe(0);
  expect(playheadIndex(-1, 2, 48)).toBe(0);
});
