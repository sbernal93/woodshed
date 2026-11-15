import { scaleNotes, scaleMarks, positionMarks, SCALES } from '../../src/music/scales.js';
import { pitchClass, noteName } from '../../src/music/notes.js';
import { noteAt } from '../../src/music/tuning.js';

const fretsOn = (marks, s) => marks.filter((m) => m.string === s).map((m) => m.fret).sort((a, b) => a - b);
const fingersOn = (marks, s) => marks.filter((m) => m.string === s).sort((a, b) => a.fret - b.fret).map((m) => m.finger);
const ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

test('G major is G A B C D E F#', () => expect(scaleNotes('G', 'major')).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#']));
test('F major spells Bb, not A#', () => expect(scaleNotes('F', 'major')).toEqual(['F', 'G', 'A', 'Bb', 'C', 'D', 'E']));
test('A blues spells Eb', () => expect(scaleNotes('A', 'blues')).toEqual(['A', 'C', 'D', 'Eb', 'E', 'G']));
test('D dorian is the C major notes', () => expect(scaleNotes('D', 'dorian')).toEqual(['D', 'E', 'F', 'G', 'A', 'B', 'C']));

test('A minor pentatonic position 1 is the classic box', () => {
  const m = positionMarks({ root: 'A', scale: 'minorPentatonic', position: 1 });
  expect([6, 5, 4, 3, 2, 1].map((s) => fretsOn(m, s))).toEqual([[5, 8], [5, 7], [5, 7], [5, 7], [5, 8], [5, 8]]);
  expect(m.filter((x) => x.root).map((x) => [x.string, x.fret])).toEqual([[6, 5], [4, 7], [1, 5]]);
  expect(fingersOn(m, 6)).toEqual([1, 4]);
  expect(fingersOn(m, 5)).toEqual([1, 3]);
});

test('A minor pentatonic positions 1-5 start on frets 5, 8, 10, 12, 15', () =>
  expect([1, 2, 3, 4, 5].map((p) => fretsOn(positionMarks({ root: 'A', scale: 'minorPentatonic', position: p }), 6)[0]))
    .toEqual([5, 8, 10, 12, 15]));

test('E minor pentatonic position 1 starts open with no negative frets', () => {
  const m = positionMarks({ root: 'E', scale: 'minorPentatonic', position: 1 });
  expect(fretsOn(m, 6)[0]).toBe(0);
  expect(Math.min(...m.map((x) => x.fret))).toBe(0);
});

test('G major 3-notes-per-string position 1', () => {
  const m = positionMarks({ root: 'G', scale: 'major', position: 1, perString: 3 });
  expect(fretsOn(m, 6)).toEqual([3, 5, 7]);
  expect(fretsOn(m, 3)).toEqual([4, 5, 7]);
  expect(fretsOn(m, 2)).toEqual([5, 7, 8]);
  expect(fingersOn(m, 6)).toEqual([1, 2, 4]);
  expect(fingersOn(m, 2)).toEqual([1, 3, 4]);
});

test('every position mark sounds a scale note, for all roots and positions', () => {
  for (const root of ROOTS) for (const position of [1, 2, 3, 4, 5]) {
    const pcs = new Set(scaleNotes(root, 'minorPentatonic').map(pitchClass));
    const m = positionMarks({ root, scale: 'minorPentatonic', position });
    expect(m).toHaveLength(12);
    for (const x of m) {
      expect(pcs.has(noteAt(x.string, x.fret).pc)).toBe(true);
      expect(pitchClass(x.note)).toBe(noteAt(x.string, x.fret).pc);
      expect(x.fret).toBeGreaterThanOrEqual(0);
    }
  }
});

test('scaleMarks covers every occurrence in the range', () => {
  const m = scaleMarks({ root: 'C', scale: 'major', fromFret: 0, toFret: 12 });
  expect(m.every((x) => scaleNotes('C', 'major').includes(noteName(noteAt(x.string, x.fret).pc)))).toBe(true);
  expect(m.filter((x) => x.string === 6).map((x) => x.fret)).toEqual([0, 1, 3, 5, 7, 8, 10, 12]);
});

test('every scale has a degree list starting at 1', () =>
  Object.values(SCALES).forEach((degrees) => expect(degrees[0]).toBe('1')));

const SEVEN = ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian'];
const sweep = [
  ...['minorPentatonic', 'majorPentatonic'].flatMap((scale) => [1, 2, 3, 4, 5].map((position) => ({ scale, position, perString: 2 }))),
  ...SEVEN.flatMap((scale) => [1, 2, 3, 4, 5, 6, 7].map((position) => ({ scale, position, perString: 3 }))),
];

test('every root, scale and position stays on a playable neck (frets 0-17)', () => {
  for (const root of ROOTS) for (const s of sweep) {
    const frets = positionMarks({ root, ...s }).map((m) => m.fret);
    expect(Math.min(...frets), `${root} ${s.scale} ${s.position}`).toBeGreaterThanOrEqual(0);
    expect(Math.max(...frets), `${root} ${s.scale} ${s.position}`).toBeLessThanOrEqual(17);
  }
});

test('E major pentatonic position 1 has no notes behind the nut', () =>
  expect(Math.min(...positionMarks({ root: 'E', scale: 'majorPentatonic', position: 1 }).map((m) => m.fret))).toBeGreaterThanOrEqual(0));

test('open strings get no finger and open shapes sit in first position', () => {
  const m = positionMarks({ root: 'E', scale: 'minorPentatonic', position: 1 });
  expect(m.filter((x) => x.fret === 0).every((x) => x.finger === null)).toBe(true);
  expect(m.find((x) => x.string === 6 && x.fret === 3).finger).toBe(3);
});

test('nonsense position requests throw', () => {
  expect(() => positionMarks({ root: 'A', scale: 'minorPentatonic', position: 0 })).toThrow(/position/);
  expect(() => positionMarks({ root: 'A', scale: 'minorPentatonic', position: 6 })).toThrow(/position/);
  expect(() => positionMarks({ root: 'C', scale: 'major', position: 1, perString: 2 })).toThrow(/per string/);
  expect(() => positionMarks({ root: 'A', scale: 'blues', position: 1 })).toThrow(/per string/);
});
