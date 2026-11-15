import { promptState } from '../../src/session/prompts.js';

const cycle = { label: 'Land on', items: ['b3', '5', 'b7', '1'], everyBars: 4, order: 'cycle' };

test('at 120 BPM a 4-bar window lasts 8 seconds', () => {
  expect(promptState(cycle, 0, 120, 1).item).toBe('b3');
  expect(promptState(cycle, 7999, 120, 1).item).toBe('b3');
  expect(promptState(cycle, 8000, 120, 1).item).toBe('5');
  expect(promptState(cycle, 33000, 120, 1).item).toBe('b3');
});

test('at 60 BPM the prompt changes half as often', () => expect(promptState(cycle, 8000, 60, 1).item).toBe('b3'));

test('bar position within the window', () => {
  expect(promptState(cycle, 0, 120, 1)).toMatchObject({ barInWindow: 0, barsPerWindow: 4 });
  expect(promptState(cycle, 6100, 120, 1).barInWindow).toBe(3);
});

test('random order is the same for the same seed and never repeats back to back', () => {
  const random = { ...cycle, order: 'random' };
  const seq = (seed) => Array.from({ length: 40 }, (_, w) => promptState(random, w * 8000, 120, seed).item);
  expect(seq(7)).toEqual(seq(7));
  const s = seq(7);
  s.slice(1).forEach((item, i) => expect(item).not.toBe(s[i]));
  expect(new Set(s).size).toBe(4);
});

test('a single item never changes', () =>
  expect(promptState({ ...cycle, items: ['1'], order: 'random' }, 99000, 120, 3).item).toBe('1'));

test('everyBars 1 changes every bar', () => expect(promptState({ ...cycle, everyBars: 1 }, 2000, 120, 1).item).toBe('5'));
