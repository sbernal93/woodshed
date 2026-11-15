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
  m.start(); ctx.currentTime = 1.6; m._poll(); m.stop();
  expect(beats.length).toBeGreaterThan(3);
  expect(beats[1].t - beats[0].t).toBeCloseTo(0.5);
  expect(beats.map((b) => b.acc)).toEqual(beats.map((b) => b.i === 0));
});

test('subdivisions do not add main beats', () => {
  const ctx = fakeCtx(), beats = [];
  const m = new Metronome({ audioContext: ctx, scheduleAheadSec: 0.5 });
  m.setBpm(120); m.setSubdivision(2);
  m.onBeat((i, acc, t) => beats.push(t));
  m.start(); ctx.currentTime = 1.6; m._poll(); m.stop();
  expect(beats[1] - beats[0]).toBeCloseTo(0.5);
});

test('double start/stop are no-ops', () => {
  const m = new Metronome({ audioContext: fakeCtx() });
  expect(() => { m.start(); m.start(); m.stop(); m.stop(); }).not.toThrow();
  expect(m.isRunning()).toBe(false);
});
