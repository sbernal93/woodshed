const PREV_GRACE_MS = 3000;
const fullMs = (steps, i) => steps[i].seconds * 1000;

export function startSession(steps, nowMs) {
  return { steps, index: 0, remainingMs: fullMs(steps, 0), paused: false, finished: false, endedCount: 0, lastTick: nowMs };
}

// Time comes from wall-clock deltas, so a throttled background tab catches up to real time on its next tick.
function advance(state, now) {
  if (state.paused || state.finished) return { ...state, lastTick: now };
  const last = state.steps.length - 1;
  let { index, endedCount } = state;
  let remainingMs = state.remainingMs - Math.max(0, now - state.lastTick);
  let finished = false;
  while (remainingMs <= 0 && !finished) {
    endedCount++;
    if (index === last) {
      finished = true;
      remainingMs = 0;
    } else {
      index++;
      remainingMs += fullMs(state.steps, index);
    }
  }
  return { ...state, index, remainingMs, endedCount, finished, lastTick: now };
}

const goTo = (state, index) => ({ ...state, index, remainingMs: fullMs(state.steps, index) });

export function sessionReducer(state, action) {
  switch (action.type) {
    case 'tick':
      return advance(state, action.now);
    case 'togglePause':
      return state.paused
        ? { ...state, paused: false, lastTick: action.now }
        : { ...advance(state, action.now), paused: true };
    case 'next':
      return state.index === state.steps.length - 1
        ? { ...state, finished: true, remainingMs: 0 }
        : goTo(state, state.index + 1);
    case 'prev': {
      const elapsed = fullMs(state.steps, state.index) - state.remainingMs;
      return goTo(state, elapsed < PREV_GRACE_MS && state.index > 0 ? state.index - 1 : state.index);
    }
    default:
      return state;
  }
}

// Paused still counts: the player is mid-session with the phone on a stand.
export const keepAwake = (state) => !state.finished;

export function formatClock(ms) {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function pickSession(track, minutes) {
  const exact = track.sessions.find((s) => s.durations[minutes]);
  if (exact) return { session: exact, minutes, steps: exact.durations[minutes] };
  const session = track.sessions[0];
  const closest = Object.keys(session.durations).map(Number).sort((a, b) => Math.abs(a - minutes) - Math.abs(b - minutes))[0];
  return { session, minutes: closest, steps: session.durations[closest] };
}
