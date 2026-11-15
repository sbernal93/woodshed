import { useEffect, useReducer } from 'react';
import { sessionReducer, startSession } from '../session/runner.js';

const TICK_MS = 250;

// Ticks only nudge the reducer; time itself comes from performance.now deltas, so the clock cannot drift.
export function useSessionClock(steps) {
  const [state, dispatch] = useReducer(sessionReducer, steps, (s) => startSession(s, performance.now()));
  const running = !state.paused && !state.finished;

  useEffect(() => {
    if (!running) return undefined;
    const tick = () => dispatch({ type: 'tick', now: performance.now() });
    const id = setInterval(tick, TICK_MS);
    // Timers are throttled in a hidden tab; catch up to real time as soon as it is visible again.
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [running]);

  return [state, dispatch];
}
