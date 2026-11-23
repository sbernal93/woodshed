import { clampBpm, nextNoteTime, tapTempoBpm, Metronome } from '../../src/audio/metronome.js';

test('quarter note at 120bpm is 0.5s', () => expect(nextNoteTime(0, 120, 1)).toBeCloseTo(0.5));
test('subdivision divides the beat', () => expect(nextNoteTime(0, 120, 2)).toBeCloseTo(0.25));
test('bpm is clamped', () => {
  expect(clampBpm(5)).toBe(30);
  expect(clampBpm(999)).toBe(300);
  expect(clampBpm(NaN)).toBe(80);
});
test('tap tempo needs two taps', () => expect(tapTempoBpm([1000])).toBeNull());
test('tap tempo from steady taps', () => expect(tapTempoBpm([0, 500, 1000, 1500])).toBeCloseTo(120, 0));
test('long pause restarts tapping', () => expect(tapTempoBpm([0, 500, 1000, 5000])).toBeNull());

const fakeCtx = () => ({
  currentTime: 0,
  state: 'running',
  destination: {},
  createOscillator: () => ({ connect() {}, start() {}, stop() {}, frequency: { value: 0 } }),
  createGain: () => ({ connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } }),
});

test('schedules evenly spaced beats with accent on 1', () => {
  const ctx = fakeCtx(), beats = [];
  const m = new Metronome({ audioContext: ctx, scheduleAheadSec: 0.5 });
  m.setBpm(120); m.setAccent(true);
  m.onBeat((i, acc, t) => beats.push({ i, acc, t }));
  m.start(); for (let t = 0; t <= 1.6; t += 0.02) { ctx.currentTime = t; m._poll(); } m.stop();
  expect(beats.length).toBeGreaterThan(3);
  expect(beats[1].t - beats[0].t).toBeCloseTo(0.5);
  expect(beats.map((b) => b.acc)).toEqual(beats.map((b) => b.i === 0));
});

test('subdivisions do not add main beats', () => {
  const ctx = fakeCtx(), beats = [];
  const m = new Metronome({ audioContext: ctx, scheduleAheadSec: 0.5 });
  m.setBpm(120); m.setSubdivision(2);
  m.onBeat((i, acc, t) => beats.push(t));
  m.start(); for (let t = 0; t <= 1.6; t += 0.02) { ctx.currentTime = t; m._poll(); } m.stop();
  expect(beats[1] - beats[0]).toBeCloseTo(0.5);
});

test('double start/stop are no-ops', () => {
  const m = new Metronome({ audioContext: fakeCtx() });
  expect(() => { m.start(); m.start(); m.stop(); m.stop(); }).not.toThrow();
  expect(m.isRunning()).toBe(false);
});

test('a throttled background tab does not burst missed clicks', () => {
  const ctx = fakeCtx();
  let oscillators = 0;
  const make = ctx.createOscillator;
  ctx.createOscillator = () => { oscillators++; return make(); };
  const m = new Metronome({ audioContext: ctx, scheduleAheadSec: 0.1 });
  m.setBpm(200); m.setSubdivision(4);
  m.start(); oscillators = 0;
  ctx.currentTime = 60; m._poll(); m.stop();
  expect(oscillators).toBeLessThanOrEqual(2);
});

test('changing subdivision mid-beat keeps main beats on the grid', () => {
  const ctx = fakeCtx(), beats = [];
  const m = new Metronome({ audioContext: ctx, scheduleAheadSec: 0.01 });
  m.setBpm(120); m.setSubdivision(3);
  m.onBeat((i, acc, t) => beats.push(t));
  m.start();
  for (let t = 0.05; t < 0.3; t += 0.01) { ctx.currentTime = t; m._poll(); }
  m.setSubdivision(2);
  for (let t = 0.3; t < 2.2; t += 0.01) { ctx.currentTime = t; m._poll(); }
  m.stop();
  const gaps = beats.slice(1).map((t, i) => t - beats[i]);
  gaps.forEach((g) => expect(g).toBeCloseTo(0.5));
});

test('close() stops and releases the audio context', () => {
  const ctx = fakeCtx();
  let closed = false;
  ctx.close = () => { closed = true; return Promise.resolve(); };
  const m = new Metronome({ audioContext: ctx });
  m.start(); m.close();
  expect(m.isRunning()).toBe(false);
  expect(closed).toBe(true);
});

test('start resumes an interrupted context', () => {
  const ctx = { ...fakeCtx(), state: 'interrupted' };
  let resumed = false;
  ctx.resume = () => { resumed = true; return Promise.resolve(); };
  const m = new Metronome({ audioContext: ctx });
  m.start(); m.stop();
  expect(resumed).toBe(true);
});

const clicksOver = (setup, seconds) => {
  const ctx = fakeCtx(), clicks = [];
  ctx.createOscillator = () => ({ connect() {}, start(t) { clicks.push(t); }, stop() {}, frequency: { value: 0 } });
  const m = new Metronome({ audioContext: ctx, scheduleAheadSec: 0.1 });
  m.setBpm(120);
  setup(m);
  const beats = [];
  m.onBeat((i) => beats.push(i));
  m.start(); for (let t = 0; t <= seconds; t += 0.02) { ctx.currentTime = t; m._poll(); } m.stop();
  return { clicks: clicks.map((t) => Math.round((t - 0.05) * 2)), beats };
};

test('backbeat clicks only on 2 and 4, but every beat still reaches the guides', () => {
  const { clicks, beats } = clicksOver((m) => { m.setBackbeat(true); m.setSubdivision(2); }, 3.9);
  expect(clicks).toEqual([1, 3, 5, 7]);
  expect(beats.slice(0, 8)).toEqual([0, 1, 2, 3, 0, 1, 2, 3]);
});

test('one silent bar in four: bar 4 has no clicks, bar 5 comes back', () => {
  const { clicks } = clicksOver((m) => m.setSilentBars(1), 9.9);
  expect(clicks).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16, 17, 18, 19]);
});
