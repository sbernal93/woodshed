import { MAX_BPM, MIN_BPM } from '../audio/metronome.js';
import Chip from './Chip.jsx';
import { MinusIcon, PlayIcon, PlusIcon, StopIcon } from './icons.jsx';

const SUBDIVISIONS = [
  { value: 1, label: '1/4' },
  { value: 2, label: '1/8' },
  { value: 3, label: 'Trip' },
  { value: 4, label: '1/16' },
];

const SILENT = [
  { value: 0, label: 'Off' },
  { value: 1, label: '1 in 4' },
  { value: 2, label: '2 in 4' },
];

const stepBtn = 'grid size-14 place-items-center rounded-full bg-fill text-ink hover:bg-fill-hover disabled:opacity-40';

// Takes the metronome from useMetronome() so the click keeps running when this panel unmounts.
export default function MetronomePanel({ m }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <button type="button" aria-label="Slower by 4 BPM" className={stepBtn} disabled={m.bpm <= MIN_BPM} onClick={() => m.setBpm(m.bpm - 4)}>
          <MinusIcon className="size-6" />
        </button>
        <p className="text-center" aria-live="polite">
          <span className="block font-display text-7xl font-extrabold italic leading-none tabular-nums">{m.bpm}</span>
          <span className="font-display text-lg font-semibold uppercase italic tracking-widest text-ink-soft">BPM</span>
        </p>
        <button type="button" aria-label="Faster by 4 BPM" className={stepBtn} disabled={m.bpm >= MAX_BPM} onClick={() => m.setBpm(m.bpm + 4)}>
          <PlusIcon className="size-6" />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button type="button" onClick={m.tap}
          className="min-h-14 bg-fill font-display text-xl font-extrabold uppercase italic hover:bg-fill-hover active:translate-x-px active:translate-y-px">
          Tap
        </button>
        <button type="button" onClick={m.toggle}
          className="flex min-h-14 items-center justify-center gap-2 bg-brand font-display text-xl font-extrabold uppercase italic text-on-brand shadow-flat active:translate-x-px active:translate-y-px active:shadow-none">
          {m.running ? <StopIcon className="size-5" /> : <PlayIcon className="size-5" />}
          {m.running ? 'Stop' : 'Start'}
        </button>
      </div>

      <fieldset className="mt-8">
        <legend className="text-[15px] font-semibold text-ink-soft">Click on every</legend>
        <div className="mt-3 grid grid-cols-4 gap-2 px-2">
          {SUBDIVISIONS.map((s) => (
            <Chip key={s.value} selected={m.subdivision === s.value} onClick={() => m.setSubdivision(s.value)} className="px-0 text-lg">
              {s.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <label className="mt-4 flex min-h-14 cursor-pointer items-center justify-between text-[15px] font-semibold">
        Accent beat 1
        <input type="checkbox" checked={m.accent} disabled={m.backbeat} onChange={(e) => m.setAccent(e.target.checked)} className="size-6 accent-[var(--wd-brand)]" />
      </label>

      <label className="flex min-h-14 cursor-pointer items-center justify-between text-[15px] font-semibold">
        Click on 2 and 4 only
        <input type="checkbox" checked={m.backbeat} onChange={(e) => m.setBackbeat(e.target.checked)} className="size-6 accent-[var(--wd-brand)]" />
      </label>

      <fieldset className="mt-4">
        <legend className="text-[15px] font-semibold text-ink-soft">Silent bars: keep time with no click</legend>
        <div className="mt-3 grid grid-cols-3 gap-2 px-2">
          {SILENT.map((s) => (
            <Chip key={s.value} selected={m.silentBars === s.value} onClick={() => m.setSilentBars(s.value)} className="px-0 text-lg">
              {s.label}
            </Chip>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
