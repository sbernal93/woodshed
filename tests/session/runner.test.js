import { startSession, sessionReducer as reduce, formatClock, pickSession, keepAwake } from '../../src/session/runner.js';

const steps = [{ seconds: 60 }, { seconds: 120 }, { seconds: 30 }];
const at = (state, ...actions) => actions.reduce(reduce, state);

test('starts on step 1 with its full time', () => {
  const s = startSession(steps, 1000, { prepMs: 0 });
  expect([s.index, s.remainingMs, s.paused, s.finished, s.endedCount]).toEqual([0, 60000, false, false, 0]);
});

test('ticks subtract wall-clock time', () => {
  const s = at(startSession(steps, 0, { prepMs: 0 }), { type: 'tick', now: 1500 }, { type: 'tick', now: 4000 });
  expect(s.remainingMs).toBe(56000);
});

test('running out moves to the next step and carries the overflow', () => {
  const s = at(startSession(steps, 0, { prepMs: 0 }), { type: 'tick', now: 61000 });
  expect([s.index, s.remainingMs, s.endedCount]).toEqual([1, 119000, 1]);
});

test('a long gap (backgrounded tab) skips exactly the steps real time covered', () => {
  const s = at(startSession(steps, 0, { prepMs: 0 }), { type: 'tick', now: 185000 });
  expect([s.index, s.remainingMs, s.endedCount]).toEqual([2, 25000, 2]);
});

test('running past the last step finishes without going negative', () => {
  const s = at(startSession(steps, 0, { prepMs: 0 }), { type: 'tick', now: 999999 });
  expect(s.finished).toBe(true);
  expect(s.remainingMs).toBe(0);
  expect(s.index).toBe(2);
  expect(s.endedCount).toBe(3);
});

test('pause freezes the countdown and resume continues from the same time', () => {
  let s = at(startSession(steps, 0, { prepMs: 0 }), { type: 'tick', now: 10000 }, { type: 'togglePause', now: 10000 }, { type: 'tick', now: 50000 });
  expect([s.paused, s.remainingMs]).toEqual([true, 50000]);
  s = at(s, { type: 'togglePause', now: 90000 }, { type: 'tick', now: 92000 });
  expect([s.paused, s.remainingMs]).toEqual([false, 48000]);
});

test('next jumps to the following step with its full time; next on the last step finishes', () => {
  let s = at(startSession(steps, 0, { prepMs: 0 }), { type: 'next' });
  expect([s.index, s.remainingMs]).toEqual([1, 120000]);
  s = at(s, { type: 'next' }, { type: 'next' });
  expect(s.finished).toBe(true);
});

test('prev restarts the step, or goes back a step in its first 3 seconds', () => {
  const later = at(startSession(steps, 0, { prepMs: 0 }), { type: 'next' }, { type: 'tick', now: 10000 });
  expect(at(later, { type: 'prev' })).toMatchObject({ index: 1, remainingMs: 120000 });
  const fresh = at(startSession(steps, 0, { prepMs: 0 }), { type: 'next' }, { type: 'tick', now: 1000 });
  expect(at(fresh, { type: 'prev' })).toMatchObject({ index: 0, remainingMs: 60000 });
  expect(at(startSession(steps, 0, { prepMs: 0 }), { type: 'tick', now: 1000 }, { type: 'prev' })).toMatchObject({ index: 0, remainingMs: 60000 });
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

test('the screen stays awake for the whole session, paused included', () => {
  const running = startSession(steps, 0, { prepMs: 0 });
  expect(keepAwake(running)).toBe(true);
  expect(keepAwake(reduce(running, { type: 'togglePause', now: 1000 }))).toBe(true);
  expect(keepAwake(reduce(running, { type: 'tick', now: 999999 }))).toBe(false);
});

const prep = (now = 0) => startSession(steps, now, { prepMs: 10000 });

test('each step starts with a get-ready phase that holds the step clock', () => {
  const s = at(prep(), { type: 'tick', now: 6000 });
  expect([s.preparing, s.prepMs, s.remainingMs]).toEqual([true, 4000, 60000]);
});

test('when get-ready runs out the step clock starts, carrying the overflow', () => {
  const s = at(prep(), { type: 'tick', now: 12000 });
  expect([s.preparing, s.remainingMs, s.startedCount]).toEqual([false, 58000, 1]);
});

test('Start now skips the rest of get-ready', () => {
  const s = at(prep(), { type: 'tick', now: 3000 }, { type: 'startNow', now: 3000 }, { type: 'tick', now: 5000 });
  expect([s.preparing, s.remainingMs, s.startedCount]).toEqual([false, 58000, 1]);
});

test('+10 s adds time to get-ready', () =>
  expect(at(prep(), { type: 'tick', now: 8000 }, { type: 'morePrep', ms: 10000 }).prepMs).toBe(12000));

test('when a step ends, the next one begins in get-ready', () => {
  const s = at(prep(), { type: 'tick', now: 10000 }, { type: 'tick', now: 71000 });
  expect([s.index, s.preparing, s.prepMs, s.remainingMs, s.endedCount]).toEqual([1, true, 9000, 120000, 1]);
});

test('next and prev land in get-ready', () => {
  const s = at(prep(), { type: 'startNow', now: 0 }, { type: 'next' });
  expect([s.index, s.preparing, s.prepMs]).toEqual([1, true, 10000]);
});

test('pause freezes get-ready too', () => {
  const s = at(prep(), { type: 'tick', now: 2000 }, { type: 'togglePause', now: 2000 }, { type: 'tick', now: 9000 });
  expect(s.prepMs).toBe(8000);
});
test('pickSession uses the named session when it has that duration', () =>
  expect(pickSession({ sessions: [...track.sessions, { id: 'c', durations: { 20: [{ seconds: 1200 }] } }] }, 20, 'c'))
    .toMatchObject({ session: { id: 'c' }, minutes: 20 }));
test('pickSession ignores an unknown session id', () =>
  expect(pickSession(track, 20, 'zzz')).toMatchObject({ session: { id: 'b' } }));
