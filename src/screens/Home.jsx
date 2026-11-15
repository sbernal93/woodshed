import { useState } from 'react';
import { tracks } from '../data/tracks/index.js';
import { DURATIONS } from '../data/schema.js';
import Header from '../components/Header.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import Chip from '../components/Chip.jsx';
import MetronomePanel from '../components/MetronomePanel.jsx';

const all = tracks.list();

export default function Home() {
  const [trackId, setTrackId] = useState(all[0]?.id);
  const [minutes, setMinutes] = useState(20);

  // shortcut: random pick; Stage 4 replaces this with least-recently-practised.
  const surprise = () => setTrackId(all[Math.floor(Math.random() * all.length)].id);

  return (
    <main className="mx-auto max-w-md px-5 pb-16 pt-6">
      <Header right={<ThemeToggle />} />

      <section aria-labelledby="tracks-h" className="mt-8">
        <h2 id="tracks-h" className="font-display text-2xl font-extrabold uppercase italic">Pick a track</h2>
        <ul className="mt-3 grid gap-3">
          {all.map((t) => {
            const selected = t.id === trackId;
            return (
              <li key={t.id}>
                <button type="button" aria-pressed={selected} onClick={() => setTrackId(t.id)}
                  className={`w-full px-4 py-3 text-left transition-colors ${selected ? 'bg-brand text-on-brand shadow-flat' : 'border-2 border-ink hover:bg-ink/10'}`}>
                  <span className="block font-display text-2xl font-extrabold uppercase italic leading-tight">{t.title}</span>
                  <span className="block text-[15px]">{t.category} · {t.sessions.length} {t.sessions.length === 1 ? 'session' : 'sessions'}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <button type="button" onClick={surprise}
          className="mt-3 min-h-14 w-full border-2 border-dashed border-ink font-display text-xl font-extrabold uppercase italic hover:bg-ink/10">
          Surprise me
        </button>
      </section>

      <section aria-labelledby="dur-h" className="mt-10">
        <h2 id="dur-h" className="font-display text-2xl font-extrabold uppercase italic">How long?</h2>
        <div className="mt-3 grid grid-cols-3 gap-3 px-2">
          {DURATIONS.map((d) => (
            <Chip key={d} selected={minutes === d} onClick={() => setMinutes(d)}>{d} min</Chip>
          ))}
        </div>
      </section>

      <MetronomePanel />
    </main>
  );
}
