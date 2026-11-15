import { promptState, trackBars } from '../../src/session/prompts.js';

const cycle = { label: 'Land on', items: ['b3', '5', 'b7', '1'], everyBars: 4, order: 'cycle' };
const barsAt = (ms, bpm) => ms / (240000 / bpm);

test('a 4-bar window at 120 BPM lasts 8 seconds', () => {
  expect(promptState(cycle, barsAt(0, 120), 1).item).toBe('b3');
  expect(promptState(cycle, barsAt(7999, 120), 1).item).toBe('b3');
  expect(promptState(cycle, barsAt(8000, 120), 1).item).toBe('5');
  expect(promptState(cycle, barsAt(33000, 120), 1).item).toBe('b3');
});

test('bar position within the window', () => {
  expect(promptState(cycle, 0, 1)).toMatchObject({ barInWindow: 0, barsPerWindow: 4 });
  expect(promptState(cycle, barsAt(6100, 120), 1).barInWindow).toBe(3);
});

test('random order is the same for the same seed and never repeats back to back', () => {
  const random = { ...cycle, order: 'random' };
  const seq = (seed) => Array.from({ length: 40 }, (_, w) => promptState(random, w * 4, seed).item);
  expect(seq(7)).toEqual(seq(7));
  const s = seq(7);
  s.slice(1).forEach((item, i) => expect(item).not.toBe(s[i]));
  expect(new Set(s).size).toBe(4);
});

test('a single item never changes', () => expect(promptState({ ...cycle, items: ['1'], order: 'random' }, 99, 3).item).toBe('1'));
test('everyBars 1 changes every bar', () => expect(promptState({ ...cycle, everyBars: 1 }, 1, 1).item).toBe('5'));

test('bars accumulate at the tempo they were played at', () => {
  let t = trackBars(null, 0, 120, 'step-1');
  t = trackBars(t, 8000, 120, 'step-1');
  expect(t.bars).toBeCloseTo(4);
  t = trackBars(t, 14000, 60, 'step-1'); // slower tempo: 6 s more is 1.5 bars
  expect(t.bars).toBeCloseTo(5.5);
});

test('a tempo change on its own does not move the prompt', () => {
  let t = trackBars(null, 0, 80, 'k');
  t = trackBars(t, 200000, 80, 'k');
  const before = promptState(cycle, t.bars, 1).item;
  t = trackBars(t, 200000, 84, 'k');
  expect(promptState(cycle, t.bars, 1).item).toBe(before);
});

test('a new step or a restarted step starts counting again', () => {
  let t = trackBars(trackBars(null, 0, 120, 'a'), 8000, 120, 'a');
  expect(trackBars(t, 8000, 120, 'b').bars).toBeCloseTo(4); // new step: from its own elapsed time
  expect(trackBars(t, 0, 120, 'a').bars).toBe(0); // restarted: elapsed went backwards
});
