import ArrowButton from '../ArrowButton.jsx';
import { MinusIcon, MoreIcon, PauseIcon, PlayIcon, PlusIcon } from '../icons.jsx';

const round = 'grid size-10 place-items-center rounded-full bg-fill hover:bg-fill-hover';

// Every control in one place at the bottom: steps and pause, plus a compact metronome. More settings live in a sheet.
export default function ControlBar({ paused, onPrev, onToggle, onNext, metronome, onMetronomeMore }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 bg-bg/95 shadow-[0_-1px_0_var(--wd-line)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 pb-4 pt-3 lg:px-12">
        <div className="flex flex-1 items-center justify-between gap-3 lg:flex-none lg:justify-start">
          <ArrowButton direction="prev" label="Previous step" onClick={onPrev} />
          <button type="button" onClick={onToggle} aria-label={paused ? 'Resume session' : 'Pause session'}
            className="grid size-16 place-items-center rounded-full bg-brand text-on-brand shadow-flat active:translate-x-px active:translate-y-px active:shadow-none">
            {paused ? <PlayIcon className="size-7" /> : <PauseIcon className="size-7" />}
          </button>
          <ArrowButton direction="next" label="Next step" onClick={onNext} />
        </div>
        <div className="flex w-full items-center justify-center gap-2 lg:w-auto">
          <button type="button" aria-label="Slower by 4 BPM" className={round} onClick={() => metronome.setBpm(metronome.bpm - 4)}><MinusIcon className="size-5" /></button>
          <span className="min-w-16 text-center font-display text-2xl font-extrabold italic tabular-nums">{metronome.bpm}</span>
          <button type="button" aria-label="Faster by 4 BPM" className={round} onClick={() => metronome.setBpm(metronome.bpm + 4)}><PlusIcon className="size-5" /></button>
          <button type="button" onClick={metronome.toggle} aria-pressed={metronome.running}
            className={`min-h-10 rounded-full px-4 font-display text-base font-extrabold uppercase italic ${metronome.running ? 'bg-chip text-chip-ink' : 'bg-fill hover:bg-fill-hover'}`}>
            Click {metronome.running ? 'on' : 'off'}
          </button>
          <button type="button" onClick={onMetronomeMore} aria-label="More metronome settings" className={round}><MoreIcon className="size-5" /></button>
        </div>
      </div>
    </div>
  );
}
