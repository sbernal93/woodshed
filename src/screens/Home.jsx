import { useState } from 'react';
import { tracks } from '../data/tracks/index.js';
import { DURATIONS } from '../data/schema.js';
import { useMetronome } from '../audio/useMetronome.js';
import Header from '../components/Header.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import Chip from '../components/Chip.jsx';
import MetronomePanel from '../components/MetronomePanel.jsx';
import MetronomeSheet from '../components/MetronomeSheet.jsx';
import { MetronomeIcon, PlayIcon } from '../components/icons.jsx';

const all = tracks.list();
const heading = 'font-display text-2xl font-extrabold uppercase italic';

export default function Home() {
  const [trackId, setTrackId] = useState(all[0]?.id);
  const [minutes, setMinutes] = useState(20);
  const [sheetOpen, setSheetOpen] = useState(false);
  const metronome = useMetronome(80);

  // shortcut: random pick; Stage 4 replaces this with least-recently-practised.
  const surprise = () => setTrackId(all[Math.floor(Math.random() * all.length)].id);

  const headerActions = (
    <div className="flex items-center">
      <button type="button" onClick={() => setSheetOpen(true)} aria-label="Open metronome"
        className="relative grid size-14 place-items-center rounded-full hover:bg-ink/10 lg:hidden">
        <MetronomeIcon className="size-7" />
        {metronome.running && <span aria-hidden="true" className="absolute right-3 top-3 size-2.5 rounded-full bg-brand" />}
      </button>
      <ThemeToggle />
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-[1400px] px-5 pb-16 pt-6 lg:px-12 lg:pt-10">
      <Header right={headerActions} />

      <div className="mt-10 lg:mt-14 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-16">
        <section aria-labelledby="tracks-h">
          <div className="flex items-baseline justify-between">
            <h2 id="tracks-h" className={heading}>Pick a track</h2>
            <button type="button" onClick={surprise}
              className="min-h-12 px-2 font-display text-lg font-semibold uppercase italic underline decoration-2 underline-offset-4 hover:text-brand">
              Surprise me
            </button>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {all.map((t) => {
              const selected = t.id === trackId;
              return (
                <li key={t.id}>
                  <button type="button" aria-pressed={selected} onClick={() => setTrackId(t.id)}
                    className={`flex h-full w-full flex-col gap-1 px-5 py-4 text-left transition-colors lg:min-h-36 ${
                      selected ? 'bg-brand text-on-brand shadow-flat' : 'bg-fill hover:bg-fill-hover'}`}>
                    <span className="font-display text-2xl font-extrabold uppercase italic leading-tight">{t.title}</span>
                    <span className="text-[15px] capitalize">{t.category} · {t.sessions.length} {t.sessions.length === 1 ? 'session' : 'sessions'}</span>
                    <span className="mt-auto hidden pt-3 text-[15px] leading-snug lg:block">{t.summary}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="mt-12 lg:sticky lg:top-8 lg:mt-0">
          <section aria-labelledby="dur-h">
            <h2 id="dur-h" className={heading}>How long?</h2>
            <div className="mt-4 grid grid-cols-3 gap-3 px-2">
              {DURATIONS.map((d) => (
                <Chip key={d} selected={minutes === d} onClick={() => setMinutes(d)}>{d} min</Chip>
              ))}
            </div>
          </section>

          {/* shortcut: disabled until the session runner exists (Stage 3). */}
          <button type="button" disabled
            className="mt-8 flex min-h-16 w-full items-center justify-center gap-3 bg-brand font-display text-2xl font-extrabold uppercase italic text-on-brand shadow-flat disabled:cursor-not-allowed disabled:opacity-60">
            <PlayIcon className="size-6" /> Start {minutes}-min session
          </button>

          <section aria-labelledby="met-h" className="mt-14 hidden lg:block">
            <h2 id="met-h" className={heading}>Metronome</h2>
            <div className="mt-4"><MetronomePanel m={metronome} /></div>
          </section>
        </aside>
      </div>

      <MetronomeSheet open={sheetOpen} onClose={() => setSheetOpen(false)} m={metronome} />
    </main>
  );
}
