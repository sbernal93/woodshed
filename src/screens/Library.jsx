import Header from '../components/Header.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import ArrowButton from '../components/ArrowButton.jsx';
import { SCALE_LIBRARY } from '../data/scaleLibrary.js';
import { SCALES } from '../music/scales.js';
import { scaleHref, cagedHref, triadsHref } from '../routes.js';

const card = 'flex h-full flex-col gap-2 bg-fill px-5 py-4 transition-colors hover:bg-fill-hover focus-visible:bg-fill-hover';

export default function Library() {
  return (
    <main className="mx-auto w-full max-w-[1400px] px-5 pb-16 pt-6 lg:px-12 lg:pt-10">
      <Header right={<ThemeToggle />} />
      <div className="mt-8 flex items-center gap-3">
        <ArrowButton direction="prev" href="#" label="Back to practice" />
        <h2 className="font-display text-3xl font-extrabold uppercase italic">Scale library</h2>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {SCALE_LIBRARY.map((s) => (
          <li key={s.id}>
            <a href={scaleHref(s.id, 'A')} className={card}>
              <span className="font-display text-2xl font-extrabold uppercase italic leading-tight">{s.title}</span>
              <span className="font-display text-lg font-semibold italic tracking-wide text-ink-soft">{SCALES[s.id].join('  ')}</span>
              <span className="text-[15px] leading-snug">{s.blurb}</span>
            </a>
          </li>
        ))}
        <li>
          <a href={cagedHref('C')} className={card}>
            <span className="font-display text-2xl font-extrabold uppercase italic leading-tight">CAGED System</span>
            <span className="font-display text-lg font-semibold italic tracking-wide text-ink-soft">C  A  G  E  D</span>
            <span className="text-[15px] leading-snug">One chord, five shapes up the neck: major, minor, and the major scale in each position.</span>
          </a>
        </li>
        <li>
          <a href={triadsHref('C')} className={card}>
            <span className="font-display text-2xl font-extrabold uppercase italic leading-tight">Triads</span>
            <span className="font-display text-lg font-semibold italic tracking-wide text-ink-soft">R  1st  2nd</span>
            <span className="text-[15px] leading-snug">Three notes on three strings, every inversion up the neck, and the CAGED shape each one lives in.</span>
          </a>
        </li>
      </ul>
    </main>
  );
}
