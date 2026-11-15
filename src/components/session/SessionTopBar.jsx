import { formatClock } from '../../session/runner.js';
import { CloseIcon } from '../icons.jsx';

// Close, step progress and the clock: always in the same place, so the middle of the screen is free for playing.
export default function SessionTopBar({ steps, state }) {
  const total = steps.reduce((sum, s) => sum + s.seconds, 0);
  const current = steps[state.index];
  const done = state.preparing ? 0 : 1 - state.remainingMs / (current.seconds * 1000);
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 bg-bg px-3 py-2.5 lg:px-8">
      <a href="#" aria-label="End session and go home" className="grid size-12 shrink-0 place-items-center rounded-full hover:bg-fill">
        <CloseIcon className="size-6" />
      </a>
      <ol aria-label={`Step ${state.index + 1} of ${steps.length}`} className="flex flex-1 gap-1">
        {steps.map((s, i) => (
          <li key={i} style={{ flexGrow: s.seconds / total }} className="relative h-1.5 basis-0 overflow-hidden bg-fill">
            <span className={`absolute inset-y-0 left-0 ${i < state.index ? 'w-full bg-ink' : 'bg-brand transition-[width] duration-500 ease-out'}`}
              style={i === state.index ? { width: `${done * 100}%` } : i > state.index ? { width: 0 } : undefined} />
          </li>
        ))}
      </ol>
      <p key={state.startedCount} role="timer" aria-live="off"
        className={`${state.preparing ? "" : "wd-clock"} min-w-20 text-right font-display text-3xl font-extrabold italic leading-none tabular-nums ${state.paused ? 'opacity-40' : ''} ${state.preparing ? 'text-ink-soft' : ''}`}>
        {formatClock(state.preparing ? state.prepMs : state.remainingMs)}
      </p>
    </div>
  );
}
