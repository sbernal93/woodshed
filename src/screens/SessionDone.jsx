import Header from '../components/Header.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { CheckIcon } from '../components/icons.jsx';

export default function SessionDone({ track, session, steps }) {
  const minutes = Math.round(steps.reduce((sum, s) => sum + s.seconds, 0) / 60);
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6 lg:pt-10">
      <Header right={<ThemeToggle />} />
      <h1 className="mt-12 font-display text-5xl font-extrabold uppercase italic leading-none">Session done</h1>
      <p className="mt-3 text-lg">{minutes} minutes of {track.title}: {session.title}.</p>
      <ol className="mt-8 grid gap-3">
        {steps.map((s, i) => (
          <li key={i} className="flex items-center gap-3 text-lg">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-on-brand"><CheckIcon className="size-5" /></span>
            {s.title}
          </li>
        ))}
      </ol>
      <a href="#" className="mt-10 flex min-h-16 items-center justify-center bg-brand font-display text-2xl font-extrabold uppercase italic text-on-brand shadow-flat active:translate-x-px active:translate-y-px active:shadow-none">
        Back home
      </a>
    </main>
  );
}
