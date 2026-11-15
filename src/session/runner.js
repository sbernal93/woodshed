const PREV_GRACE_MS = 3000;
export const PREP_MS = 30000;
const fullMs = (steps, i) => steps[i].seconds * 1000;

// Each step opens with a get-ready phase (`preparing`) that holds the step clock so you can read and set your hand.
export function startSession(steps, nowMs, { prepMs = PREP_MS } = {}) {
  return {
    steps, prepConfig: prepMs, index: 0, remainingMs: fullMs(steps, 0),
    preparing: prepMs > 0, prepMs, paused: false, finished: false,
    endedCount: 0, startedCount: prepMs > 0 ? 0 : 1, lastTick: nowMs,
  };
}

const enterStep = (state, index) => ({
  ...state, index, remainingMs: fullMs(state.steps, index),
  preparing: state.prepConfig > 0, prepMs: state.prepConfig,
  startedCount: state.prepConfig > 0 ? state.startedCount : state.startedCount + 1,
});

// Time comes from wall-clock deltas, so a throttled background tab catches up to real time on its next tick.
function advance(state, now) {
  if (state.paused || state.finished) return { ...state, lastTick: now };
  let s = { ...state, lastTick: now };
  let dt = Math.max(0, now - state.lastTick);
  while (dt > 0 && !s.finished) {
    if (s.preparing) {
      const used = Math.min(dt, s.prepMs);
      s.prepMs -= used;
      dt -= used;
      if (s.prepMs <= 0) s = { ...s, preparing: false, prepMs: 0, startedCount: s.startedCount + 1 };
    } else if (dt < s.remainingMs) {
      s.remainingMs -= dt;
      dt = 0;
    } else {
      dt -= s.remainingMs;
      s = { ...s, endedCount: s.endedCount + 1 };
      s = s.index === s.steps.length - 1 ? { ...s, finished: true, remainingMs: 0 } : enterStep(s, s.index + 1);
    }
  }
  return s;
}

export function sessionReducer(state, action) {
  switch (action.type) {
    case 'tick':
      return advance(state, action.now);
    case 'togglePause':
      return state.paused
        ? { ...state, paused: false, lastTick: action.now }
        : { ...advance(state, action.now), paused: true };
    case 'startNow':
      return state.preparing
        ? { ...advance(state, action.now), preparing: false, prepMs: 0, startedCount: state.startedCount + 1 }
        : state;
    case 'morePrep':
      return state.preparing ? { ...state, prepMs: state.prepMs + action.ms } : state;
    case 'next':
      return state.index === state.steps.length - 1
        ? { ...state, finished: true, remainingMs: 0 }
        : enterStep(state, state.index + 1);
    case 'prev': {
      const elapsed = fullMs(state.steps, state.index) - state.remainingMs;
      return enterStep(state, elapsed < PREV_GRACE_MS && state.index > 0 ? state.index - 1 : state.index);
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
