import { playChime } from '../../src/audio/chime.js';

test('chime schedules two decaying sine partials', () => {
  const oscs = [], ramps = [];
  const ctx = {
    currentTime: 2,
    destination: {},
    createOscillator: () => { const o = { type: '', frequency: { value: 0 }, connect() {}, start(t) { o.start = t; }, stop(t) { o.stop = t; } }; oscs.push(o); return o; },
    createGain: () => ({ connect() {}, gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime: (v, t) => ramps.push({ v, t }) } }),
  };
  playChime(ctx);
  expect(oscs.map((o) => o.frequency.value)).toEqual([880, 1320]);
  expect(oscs.every((o) => o.type === 'sine' && o.start >= 2 && o.stop > o.start)).toBe(true);
  expect(ramps.every((r) => r.v < 0.01 && r.t > 2.5)).toBe(true);
});

import { playGo } from '../../src/audio/chime.js';

test('the go cue is one short high blip', () => {
  const oscs = [];
  const ctx = {
    currentTime: 1, destination: {},
    createOscillator: () => { const o = { frequency: { value: 0 }, connect() {}, start(t) { o.start = t; }, stop(t) { o.stop = t; } }; oscs.push(o); return o; },
    createGain: () => ({ connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } }),
  };
  playGo(ctx);
  expect(oscs).toHaveLength(1);
  expect(oscs[0].frequency.value).toBe(1760);
  expect(oscs[0].stop - oscs[0].start).toBeLessThan(0.2);
});
