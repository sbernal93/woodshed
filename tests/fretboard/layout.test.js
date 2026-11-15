import { fretboardLayout } from '../../src/fretboard/layout.js';
import { positionMarks } from '../../src/music/scales.js';

const amBox = positionMarks({ root: 'A', scale: 'minorPentatonic', position: 1 });

test('every mark of the A minor box lies inside the board (vertical)', () => {
  const L = fretboardLayout({ fromFret: 5, toFret: 8 });
  for (const m of amBox) {
    const { y } = L.markPos(m.string, m.fret);
    expect(y).toBeGreaterThan(L.boardStart);
    expect(y).toBeLessThan(L.boardEnd);
  }
});

test('a fret-5 note sits between wire 4 and wire 5', () => {
  const L = fretboardLayout({ fromFret: 5, toFret: 8 });
  const { y } = L.markPos(6, 5);
  expect(y).toBeGreaterThan(L.wirePos(4));
  expect(y).toBeLessThan(L.wirePos(5));
});

test('open strings sit above the nut', () => {
  const L = fretboardLayout({ fromFret: 0, toFret: 4 });
  expect(L.markPos(6, 0).y).toBeLessThan(L.wirePos(0));
  expect(L.markPos(6, 0).y).toBeGreaterThan(0);
});

test('wires are evenly spaced', () => {
  const L = fretboardLayout({ fromFret: 1, toFret: 12 });
  const gaps = [1, 2, 3, 4, 5].map((w) => L.wirePos(w) - L.wirePos(w - 1));
  expect(new Set(gaps).size).toBe(1);
});

test('low E is the leftmost string when vertical', () => {
  const L = fretboardLayout({ fromFret: 5, toFret: 8 });
  expect(L.markPos(6, 5).x).toBeLessThan(L.markPos(1, 5).x);
});

test('horizontal runs frets left to right with high e on top', () => {
  const L = fretboardLayout({ fromFret: 1, toFret: 12, orientation: 'horizontal' });
  expect(L.width).toBeGreaterThan(L.height);
  expect(L.markPos(6, 3).x).toBeLessThan(L.markPos(6, 4).x);
  expect(L.markPos(1, 3).y).toBeLessThan(L.markPos(6, 3).y);
  const { x } = L.markPos(6, 5);
  expect(x).toBeGreaterThan(L.wirePos(4));
  expect(x).toBeLessThan(L.wirePos(5));
});
