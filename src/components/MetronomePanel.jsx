import { useMetronome } from '../audio/useMetronome.js';
import { MAX_BPM, MIN_BPM } from '../audio/metronome.js';
import Chip from './Chip.jsx';
import { MinusIcon, PlayIcon, PlusIcon, StopIcon } from './icons.jsx';

const SUBDIVISIONS = [
  { value: 1, label: '1/4' },
  { value: 2, label: '1/8' },
  { value: 3, label: 'Trip' },
  { value: 4, label: '1/16' },
];

const roundBtn = 'grid size-14 place-items-center rounded-full border-[2.5px] border-ink text-ink hover:bg-ink/10 disabled:opacity-40';

export default function MetronomePanel({ initialBpm = 80 }) {
  const m = useMetronome(initialBpm);
  return (
    <section aria-labelledby="metronome-h" className="mt-10">
      <h2 id="metronome-h" className="font-display text-2xl font-extrabold uppercase italic">Metronome</h2>

      <div className="mt-4 flex items-center justify-between">
        <button type="button" aria-label="Slower by 4 BPM" className={roundBtn} disabled={m.bpm <= MIN_BPM} onClick={() => m.setBpm(m.bpm - 4)}>
          <MinusIcon className="size-6" />
        </button>
        <p className="text-center" aria-live="polite">
          <span className="block font-display text-7xl font-extrabold italic leading-none tabular-nums">{m.bpm}</span>
          <span className="font-display text-lg font-semibold uppercase italic tracking-widest text-ink-soft">BPM</span>
        </p>
        <button type="button" aria-label="Faster by 4 BPM" className={roundBtn} disabled={m.bpm >= MAX_BPM} onClick={() => m.setBpm(m.bpm + 4)}>
          <PlusIcon className="size-6" />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button type="button" onClick={m.tap}
          className="min-h-14 border-2 border-ink font-display text-xl font-extrabold uppercase italic hover:bg-ink/10 active:translate-x-px active:translate-y-px">
          Tap tempo
        </button>
        <button type="button" onClick={m.toggle} aria-pressed={m.running}
          className="flex min-h-14 items-center justify-center gap-2 bg-brand font-display text-xl font-extrabold uppercase italic text-on-brand shadow-flat active:translate-x-px active:translate-y-px active:shadow-none">
          {m.running ? <StopIcon className="size-5" /> : <PlayIcon className="size-5" />}
          {m.running ? 'Stop' : 'Start'}
        </button>
      </div>

      <fieldset className="mt-6">
        <legend className="text-base font-semibold text-ink-soft">Click on every</legend>
        <div className="mt-2 grid grid-cols-4 gap-2 px-2">
          {SUBDIVISIONS.map((s) => (
            <Chip key={s.value} selected={m.subdivision === s.value} onClick={() => m.setSubdivision(s.value)} className="px-0 text-lg">
              {s.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <label className="mt-5 flex min-h-14 cursor-pointer items-center justify-between text-base font-semibold">
        Accent beat 1
        <input type="checkbox" checked={m.accent} onChange={(e) => m.setAccent(e.target.checked)} className="size-6 accent-[var(--wd-brand)]" />
      </label>
    </section>
  );
}
