import Header from '../components/Header.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import RateStep from '../components/RateStep.jsx';
import { CheckIcon } from '../components/icons.jsx';
import { progress, useProgress } from '../progress/useProgress.js';
import { streak } from '../progress/history.js';

// `logged` maps step index -> history entry id; skipped steps have none.
export default function SessionDone({ track, session, steps, logged = {} }) {
  const { entries } = useProgress();
  const minutes = Math.round(steps.reduce((sum, s) => sum + s.seconds, 0) / 60);
  const days = streak(entries, new Date());
  const anyLogged = steps.some((_, i) => logged[i]);
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6 lg:pt-10">
      <Header right={<ThemeToggle />} />
      <h1 className="mt-12 font-display text-5xl font-extrabold uppercase italic leading-none">Session done</h1>
      <p className="mt-3 text-lg">
        {anyLogged ? `${minutes} minutes of` : 'Nothing played long enough to log from'} {track.title}: {session.title}.{days > 1 && ` ${days} days in a row.`}
      </p>
      {anyLogged && <p className="mt-1 text-[16px] text-ink-soft">Rate each step and the next session starts at the right tempo.</p>}
      <ol className="mt-8 grid gap-6">
        {steps.map((s, i) => {
          const entry = entries.find((e) => e.id === logged[i]);
          return (
            <li key={i}>
              <p className="flex items-center gap-3 text-lg">
                {entry
                  ? <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-on-brand"><CheckIcon className="size-5" /></span>
                  : <span className="size-8 shrink-0 rounded-full border-2 border-line" />}
                <span className="font-semibold">{s.title}</span>
                <span className="text-ink-soft">{entry ? (entry.bpm ? `${entry.bpm} BPM` : '') : 'skipped'}</span>
              </p>
              {entry && <RateStep compact title={s.title} rating={entry.rating} onRate={(r) => progress.rate(entry.id, r)} />}
            </li>
          );
        })}
      </ol>
      <a href="#" className="mt-10 flex min-h-16 items-center justify-center bg-brand font-display text-2xl font-extrabold uppercase italic text-on-brand shadow-flat active:translate-x-px active:translate-y-px active:shadow-none">
        Back home
      </a>
    </main>
  );
}
