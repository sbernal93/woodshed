import { resolveGrid, countLabels, hzOf } from '../../src/session/grid.js';

const em = {
  type: 'grid', slotsPerBeat: 2, beats: 4,
  shape: [[6, 0], [5, 2], [4, 2], [3, 0], [2, 0], [1, 0]],
  events: { 0: [[6, 0, 'p']], 1: [[3, 0, 'i']], 2: [[4, 2, 'p']], 3: [[2, 0, 'm']] },
};

test('a grid resolves to one slot per subdivision, rests included', () => {
  const g = resolveGrid(em);
  expect(g.slots).toHaveLength(8);
  expect(g.slots[0]).toEqual([{ string: 6, fret: 0, hand: 'p', thumb: true, note: 'E' }]);
  expect(g.slots[3][0]).toMatchObject({ string: 2, fret: 0, hand: 'm', thumb: false, note: 'B' });
  expect(g.slots[5]).toEqual([]);
});

test('the shape is kept as background marks', () =>
  expect(resolveGrid(em).shape).toContainEqual({ string: 5, fret: 2 }));

test('count labels for 8ths and 16ths', () => {
  expect(countLabels(2, 4)).toEqual(['1', '&', '2', '&', '3', '&', '4', '&']);
  expect(countLabels(4, 1)).toEqual(['1', 'e', '&', 'a']);
  expect(countLabels(3, 1)).toEqual(['1', 'trip', 'let']);
});

test('string and fret to pitch: low E open is E2, D string fret 2 is E3', () => {
  expect(hzOf(6, 0)).toBeCloseTo(82.41, 1);
  expect(hzOf(4, 2)).toBeCloseTo(164.81, 1);
});
