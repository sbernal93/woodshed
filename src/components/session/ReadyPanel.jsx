import { PREP_MS } from '../../session/runner.js';

const RING = 2 * Math.PI * 34;

// The get-ready state: what to play and what good looks like, with a ring emptying as the seconds run out.
export default function ReadyPanel({ step, state, onStart, onMore }) {
  const seconds = Math.ceil(state.prepMs / 1000);
  const left = Math.min(1, state.prepMs / PREP_MS);
  return (
    <div className={`grid transition-[grid-template-rows,opacity] duration-400 ease-out motion-reduce:transition-none ${state.preparing ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
      <div className="overflow-hidden">
        <section aria-label="Get ready" className="mt-4 grid grid-cols-[auto_1fr] gap-4 bg-fill p-4">
          <div className="relative size-20">
            <svg viewBox="0 0 80 80" className="size-20 -rotate-90" aria-hidden="true">
              <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" className="stroke-fill" />
              <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" strokeLinecap="round" className="stroke-brand transition-[stroke-dashoffset] duration-300 ease-linear"
                strokeDasharray={RING} strokeDashoffset={RING * (1 - left)} />
            </svg>
            <span className="absolute inset-0 grid place-items-center font-display text-4xl font-extrabold italic tabular-nums">{seconds}</span>
          </div>
          <div>
            <p className="font-display text-lg font-extrabold uppercase italic text-brand">Get ready</p>
            <p className="mt-1 text-[16px] leading-relaxed">{step.instruction}</p>
            <p className="mt-3 font-display text-sm font-semibold uppercase italic text-ink-soft">What good looks like</p>
            <p className="mt-0.5 text-[16px] leading-relaxed">{step.success}</p>
          </div>
          <div className="col-span-2 grid grid-cols-[1fr_auto] gap-2">
            <button type="button" onClick={onStart}
              className="min-h-12 bg-brand font-display text-xl font-extrabold uppercase italic text-on-brand shadow-flat active:translate-x-px active:translate-y-px active:shadow-none">
              Start now
            </button>
            <button type="button" onClick={onMore} className="min-h-12 bg-fill px-5 font-display text-xl font-extrabold uppercase italic hover:bg-fill-hover">+10 s</button>
          </div>
        </section>
      </div>
    </div>
  );
}
