import { resolveFretboard } from '../../src/music/resolve.js';
import { positionMarks } from '../../src/music/scales.js';

test('pentatonic spec resolves to the position marks and frames frets 5-8', () => {
  const r = resolveFretboard({ type: 'pentatonic', root: 'A', quality: 'minor', position: 1 });
  expect(r.marks).toEqual(positionMarks({ root: 'A', scale: 'minorPentatonic', position: 1 }));
  expect([r.fromFret, r.toFret]).toEqual([5, 8]);
});
test('a shape with open strings starts at fret 0', () =>
  expect(resolveFretboard({ type: 'caged', root: 'C', shape: 'C' }).fromFret).toBe(0));
test('a short shape is padded to at least four frets', () => {
  const r = resolveFretboard({ type: 'caged', root: 'D', shape: 'D' });
  expect(r.toFret - r.fromFret).toBeGreaterThanOrEqual(3);
});
test('scale spec without a position gives every note in the range', () => {
  const r = resolveFretboard({ type: 'scale', root: 'C', scale: 'major', fromFret: 0, toFret: 12 });
  expect([r.fromFret, r.toFret]).toEqual([0, 12]);
  expect(r.marks.length).toBeGreaterThan(40);
});
test('unknown type throws', () => expect(() => resolveFretboard({ type: 'banjo' })).toThrow(/banjo/));
