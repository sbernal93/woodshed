import { suggestBpm, streak, mergeEntries, lastFor } from '../../src/progress/history.js';

const entry = (over) => ({ id: 'x', exercise: 'ex', variant: 0, bpm: 88, rating: null, practicedAt: '2026-11-10T10:00:00.000Z', updatedAt: '2026-11-10T10:00:00.000Z', ...over });
const range = { min: 80, max: 120 };
const step = { exercise: 'ex', variant: 0, bpm: range };

test('no history starts at the bottom of the range', () => expect(suggestBpm([], step)).toEqual({ bpm: 80, last: null }));
test('steps without a tempo get no suggestion', () => expect(suggestBpm([entry()], { ...step, bpm: null })).toEqual({ bpm: null, last: null }));

test('clean goes up 4, okay or unrated stays, struggled drops 4', () => {
  expect(suggestBpm([entry({ rating: 3 })], step).bpm).toBe(92);
  expect(suggestBpm([entry({ rating: 2 })], step).bpm).toBe(88);
  expect(suggestBpm([entry({ rating: null })], step).bpm).toBe(88);
  expect(suggestBpm([entry({ rating: 1 })], step).bpm).toBe(84);
});

test('suggestions stay in range, but never pull you back below a tempo you already passed', () => {
  expect(suggestBpm([entry({ bpm: 82, rating: 1 })], step).bpm).toBe(80);
  expect(suggestBpm([entry({ bpm: 118, rating: 3 })], step).bpm).toBe(120);
  expect(suggestBpm([entry({ bpm: 126, rating: 3 })], step).bpm).toBe(126);
});

test('only the latest entry for the same exercise and variant counts', () => {
  const entries = [
    entry({ id: 'a', bpm: 100, rating: 3, practicedAt: '2026-11-12T10:00:00.000Z' }),
    entry({ id: 'b', bpm: 90, rating: 2, practicedAt: '2026-11-11T10:00:00.000Z' }),
    entry({ id: 'c', bpm: 110, variant: 1, practicedAt: '2026-11-13T10:00:00.000Z' }),
  ];
  expect(lastFor(entries, 'ex', 0).id).toBe('a');
  expect(suggestBpm(entries, step)).toMatchObject({ bpm: 104, last: { id: 'a' } });
});

test('streak counts consecutive local days ending today or yesterday', () => {
  const on = (day) => entry({ id: day, practicedAt: new Date(`${day}T12:00:00`).toISOString() });
  const days = ['2026-11-13', '2026-11-14', '2026-11-15'].map(on);
  expect(streak(days, new Date('2026-11-15T20:00:00'))).toBe(3);
  expect(streak(days, new Date('2026-11-16T09:00:00'))).toBe(3);
  expect(streak(days, new Date('2026-11-17T09:00:00'))).toBe(0);
  expect(streak([...days, on('2026-11-15')], new Date('2026-11-15T20:00:00'))).toBe(3);
  expect(streak([], new Date())).toBe(0);
});

test('merge keeps the newer copy of each entry', () => {
  const old = entry({ id: 'a', rating: null, updatedAt: '2026-11-10T10:00:00.000Z' });
  const rated = entry({ id: 'a', rating: 3, updatedAt: '2026-11-10T10:05:00.000Z' });
  expect(mergeEntries([old], [rated])).toEqual([rated]);
  expect(mergeEntries([rated], [old])).toEqual([rated]);
  expect(mergeEntries([old], [entry({ id: 'b' })]).map((e) => e.id).sort()).toEqual(['a', 'b']);
});
