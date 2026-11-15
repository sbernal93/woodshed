import { startSession, sessionReducer as reduce, formatClock, pickSession } from '../../src/session/runner.js';

const steps = [{ seconds: 60 }, { seconds: 120 }, { seconds: 30 }];
const at = (state, ...actions) => actions.reduce(reduce, state);

test('starts on step 1 with its full time', () => {
  const s = startSession(steps, 1000);
  expect([s.index, s.remainingMs, s.paused, s.finished, s.endedCount]).toEqual([0, 60000, false, false, 0]);
});

test('ticks subtract wall-clock time', () => {
  const s = at(startSession(steps, 0), { type: 'tick', now: 1500 }, { type: 'tick', now: 4000 });
  expect(s.remainingMs).toBe(56000);
});

test('running out moves to the next step and carries the overflow', () => {
  const s = at(startSession(steps, 0), { type: 'tick', now: 61000 });
  expect([s.index, s.remainingMs, s.endedCount]).toEqual([1, 119000, 1]);
});

test('a long gap (backgrounded tab) skips exactly the steps real time covered', () => {
  const s = at(startSession(steps, 0), { type: 'tick', now: 185000 });
  expect([s.index, s.remainingMs, s.endedCount]).toEqual([2, 25000, 2]);
});

test('running past the last step finishes without going negative', () => {
  const s = at(startSession(steps, 0), { type: 'tick', now: 999999 });
  expect(s.finished).toBe(true);
  expect(s.remainingMs).toBe(0);
  expect(s.index).toBe(2);
  expect(s.endedCount).toBe(3);
});

test('pause freezes the countdown and resume continues from the same time', () => {
  let s = at(startSession(steps, 0), { type: 'tick', now: 10000 }, { type: 'togglePause', now: 10000 }, { type: 'tick', now: 50000 });
  expect([s.paused, s.remainingMs]).toEqual([true, 50000]);
  s = at(s, { type: 'togglePause', now: 90000 }, { type: 'tick', now: 92000 });
  expect([s.paused, s.remainingMs]).toEqual([false, 48000]);
});

test('next jumps to the following step with its full time; next on the last step finishes', () => {
  let s = at(startSession(steps, 0), { type: 'next' });
  expect([s.index, s.remainingMs]).toEqual([1, 120000]);
  s = at(s, { type: 'next' }, { type: 'next' });
  expect(s.finished).toBe(true);
});

test('prev restarts the step, or goes back a step in its first 3 seconds', () => {
  const later = at(startSession(steps, 0), { type: 'next' }, { type: 'tick', now: 10000 });
  expect(at(later, { type: 'prev' })).toMatchObject({ index: 1, remainingMs: 120000 });
  const fresh = at(startSession(steps, 0), { type: 'next' }, { type: 'tick', now: 1000 });
  expect(at(fresh, { type: 'prev' })).toMatchObject({ index: 0, remainingMs: 60000 });
  expect(at(startSession(steps, 0), { type: 'tick', now: 1000 }, { type: 'prev' })).toMatchObject({ index: 0, remainingMs: 60000 });
});

test('formatClock rounds up to whole seconds', () => {
  expect(formatClock(272000)).toBe('4:32');
  expect(formatClock(200)).toBe('0:01');
  expect(formatClock(0)).toBe('0:00');
  expect(formatClock(600000)).toBe('10:00');
});

const track = { sessions: [
  { id: 'a', durations: { 15: [{ seconds: 900 }] } },
  { id: 'b', durations: { 20: [{ seconds: 1200 }], 30: [{ seconds: 1800 }] } },
] };
test('pickSession takes the first session with that duration', () =>
  expect(pickSession(track, 20)).toMatchObject({ session: { id: 'b' }, minutes: 20 }));
test('pickSession falls back to the closest duration of the first session', () =>
  expect(pickSession({ sessions: [track.sessions[0]] }, 30)).toMatchObject({ session: { id: 'a' }, minutes: 15 }));
