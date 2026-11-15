import { startDrone, droneFrequencies } from '../../src/audio/drone.js';

const fakeCtx = () => {
  const oscs = [], gains = [];
  return {
    oscs, gains, currentTime: 1, destination: {},
    createOscillator: () => { const o = { type: '', frequency: { value: 0 }, connect() {}, start() {}, stop(t) { o.stoppedAt = t; } }; oscs.push(o); return o; },
    createGain: () => { const g = { connect() {}, gain: { events: [], setValueAtTime(v, t) { g.gain.events.push(['set', v, t]); }, linearRampToValueAtTime(v, t) { g.gain.events.push(['ramp', v, t]); }, cancelScheduledValues() {} } }; gains.push(g); return g; },
  };
};

test('A drone is the root at octave 2 plus its fifth', () => {
  const [root, fifth] = droneFrequencies('A');
  expect(root).toBeCloseTo(110, 1);
  expect(fifth).toBeCloseTo(164.81, 1);
});
test('E drone sits at the low E string', () => expect(droneFrequencies('E')[0]).toBeCloseTo(82.41, 1));

test('fades in, and stop fades out before stopping the oscillators', () => {
  const ctx = fakeCtx();
  const stop = startDrone(ctx, 'A');
  expect(ctx.oscs.map((o) => o.type)).toEqual(['triangle', 'sine', 'sine']);
  const master = ctx.gains[0].gain.events;
  expect(master[0]).toEqual(['set', 0, 1]);
  expect(master[1][0]).toBe('ramp');
  ctx.currentTime = 5;
  stop();
  expect(master.at(-1)).toEqual(['ramp', 0, 5.4]);
  expect(ctx.oscs.every((o) => o.stoppedAt >= 5.4)).toBe(true);
});

test('includes the root an octave up so phone speakers can play it', () =>
  expect(droneFrequencies('A')[2]).toBeCloseTo(220, 1));

test('stopping during the fade-in holds the current level instead of jumping to silence', () => {
  const ctx = fakeCtx();
  const stop = startDrone(ctx, 'A');
  const master = ctx.gains[0].gain;
  master.value = 0.07; // part-way up the fade-in
  ctx.currentTime = 1.2;
  stop();
  const tail = master.events.slice(-2);
  expect(tail).toEqual([['set', 0.07, 1.2], ['ramp', 0, 1.6]]);
});
