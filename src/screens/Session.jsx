import { useEffect, useMemo, useRef, useState } from 'react';
import { tracks } from '../data/tracks/index.js';
import { pickSession, formatClock, keepAwake } from '../session/runner.js';
import { useSessionClock } from '../hooks/useSessionClock.js';
import { useWakeLock } from '../hooks/useWakeLock.js';
import { useMetronome } from '../audio/useMetronome.js';
import { getAudioContext } from '../audio/context.js';
import { playChime } from '../audio/chime.js';
import { useDrone } from '../audio/useDrone.js';
import StepPrompt from '../components/StepPrompt.jsx';
import { trackBars, promptState } from '../session/prompts.js';
import { resolvePattern, groupSizeOf } from '../session/patterns.js';
import PatternGuide from '../components/PatternGuide.jsx';
import { resolveFretboard } from '../music/resolve.js';
import ArrowButton from '../components/ArrowButton.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import Fretboard from '../components/Fretboard.jsx';
import MetronomePanel from '../components/MetronomePanel.jsx';
import SessionDone from './SessionDone.jsx';
import { CloseIcon, PauseIcon, PlayIcon } from '../components/icons.jsx';

const KIND_LABEL = { warmup: 'Warm-up', review: 'Review', focus: 'Focus', apply: 'Apply it', cooldown: 'Cool-down' };
const label = 'font-display text-lg font-semibold uppercase italic text-ink-soft';

const isTyping = (el) => el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(el.tagName));

export default function Session({ trackId, minutes }) {
  const track = tracks.get(trackId);
  const { session, steps } = pickSession(track, minutes);
  const [state, dispatch] = useSessionClock(steps);
  const metronome = useMetronome(steps[0].bpm?.min ?? 80);
  const step = steps[state.index];

  useWakeLock(keepAwake(state));

  const [seed] = useState(() => Math.floor(Math.random() * 2 ** 31));
  const [droneOn, setDroneOn] = useState(true);
  // Bars are counted at the tempo they were played at, so a Clean pass doesn't jump the prompt.
  const barsRef = useRef(null);
  barsRef.current = trackBars(barsRef.current, step.seconds * 1000 - state.remainingMs, metronome.bpm, state.index);
  const prompt = step.prompt ? promptState(step.prompt, barsRef.current.bars, seed + state.index) : null;
  const patternSpec = step.pattern && (step.pattern.byPrompt ? step.pattern.byPrompt[prompt?.item] : step.pattern.spec);
  const pattern = useMemo(() => (patternSpec ? resolvePattern(patternSpec) : null), [patternSpec]);
  useDrone(step.drone?.root, Boolean(step.drone) && droneOn && !state.paused && !state.finished);

  // Each step suggests its own tempo; the click keeps running across the change.
  useEffect(() => {
    if (step.bpm) metronome.setBpm(step.bpm.min);
  }, [state.index]); // eslint-disable-line react-hooks/exhaustive-deps

  const chimed = useRef(state.endedCount);
  useEffect(() => {
    if (state.endedCount > chimed.current) playChime(getAudioContext());
    chimed.current = state.endedCount;
  }, [state.endedCount]);

  useEffect(() => {
    if (state.finished && metronome.running) metronome.toggle();
  }, [state.finished]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === ' ' && !isTyping(e.target)) {
        e.preventDefault();
        dispatch({ type: 'togglePause', now: performance.now() });
      } else if (e.key === 'ArrowLeft') dispatch({ type: 'prev' });
      else if (e.key === 'ArrowRight') dispatch({ type: 'next' });
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [dispatch]);

  if (state.finished) return <SessionDone track={track} session={session} steps={steps} />;

  const board = step.fretboard && !pattern ? resolveFretboard(step.fretboard) : null;
  const total = steps.reduce((sum, s) => sum + s.seconds, 0);

  return (
    <main className="mx-auto w-full max-w-[1400px] px-5 pb-16 pt-4 lg:px-12 lg:pt-8">
      <div className="flex items-center gap-2">
        <a href="#" aria-label="End session and go home" className="grid size-14 shrink-0 place-items-center rounded-full hover:bg-fill">
          <CloseIcon className="size-7" />
        </a>
        <p className="min-w-0 flex-1 truncate text-[15px] text-ink-soft">{track.title} · {session.title}</p>
        <ThemeToggle />
      </div>

      <ol aria-label={`Step ${state.index + 1} of ${steps.length}`} className="mt-3 flex gap-1.5">
        {steps.map((s, i) => (
          <li key={i} style={{ flexGrow: s.seconds / total }}
            className={`h-2 basis-0 ${i < state.index ? 'bg-ink' : i === state.index ? 'bg-brand' : 'bg-fill'}`} />
        ))}
      </ol>

      <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <section aria-labelledby="step-h">
          <h1 id="step-h" className="font-display text-4xl font-extrabold uppercase italic leading-none lg:text-5xl">{step.title}</h1>
          <p className={`${label} mt-2`}>{KIND_LABEL[step.kind]} · step {state.index + 1} of {steps.length}</p>

          <div className="mt-6 flex items-center justify-between gap-4">
            <ArrowButton direction="prev" label="Previous step" onClick={() => dispatch({ type: 'prev' })} />
            <div className="text-center" role="timer" aria-live="off">
              <p className={`font-display text-[clamp(3.5rem,19vw,6rem)] font-extrabold italic leading-none tabular-nums lg:text-9xl ${state.paused ? 'opacity-40' : ''}`}>
                {formatClock(state.remainingMs)}
              </p>
            </div>
            <ArrowButton direction="next" label="Next step" onClick={() => dispatch({ type: 'next' })} />
          </div>

          <div className="mt-4 flex justify-center">
            <button type="button" onClick={() => dispatch({ type: 'togglePause', now: performance.now() })}
              className="flex min-h-14 items-center gap-2 px-6 font-display text-xl font-extrabold uppercase italic underline decoration-2 underline-offset-4 hover:text-brand">
              {state.paused ? <PlayIcon className="size-5" /> : <PauseIcon className="size-5" />}
              {state.paused ? 'Paused · resume' : 'Pause'}
            </button>
          </div>

          {step.prompt && (
            <StepPrompt prompt={step.prompt} state={prompt} />
          )}

          {pattern && (
            <PatternGuide key={`${state.index}-${prompt?.index ?? 0}`} pattern={pattern} groupSize={groupSizeOf(patternSpec)}
              notesPerBeat={step.pattern.notesPerBeat} bpm={metronome.bpm} frozen={state.paused}
              labelOf={(n) => (patternSpec.type === 'spider' ? n.finger : n.degree)}
              describe={(n) => (patternSpec.type === 'spider'
                ? `Fret ${n.fret} · finger ${n.finger}`
                : `Fret ${n.fret} · ${n.note} (${n.degree})${n.finger ? ` · finger ${n.finger}` : ''}`)} />
          )}

          <p className="mt-6 text-lg leading-relaxed">{step.instruction}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {step.bpm && (
              <p className="inline-block -skew-x-12 bg-chip px-3 py-1 font-display text-lg font-extrabold italic text-chip-ink">
                <span className="inline-block skew-x-12">Target {step.bpm.min}–{step.bpm.max} BPM</span>
              </p>
            )}
            {step.drone && (
              <button type="button" aria-pressed={droneOn} onClick={() => setDroneOn((on) => !on)}
                className={`min-h-12 px-4 font-display text-lg font-extrabold uppercase italic ${droneOn ? 'bg-ink text-bg' : 'bg-fill hover:bg-fill-hover'}`}>
                {step.drone.root} drone · {droneOn ? 'on' : 'off'}
              </button>
            )}
          </div>
          {step.ladder && (
            <button type="button" onClick={() => metronome.setBpm(metronome.bpm + step.ladder.by)}
              className="mt-4 flex min-h-14 w-full items-center justify-center bg-brand font-display text-xl font-extrabold uppercase italic text-on-brand shadow-flat active:translate-x-px active:translate-y-px active:shadow-none">
              Clean pass · +{step.ladder.by} BPM
            </button>
          )}

          <div className="mt-8 border-t-2 border-line pt-4">
            <h2 className={label}>What good looks like</h2>
            <p className="mt-1 text-lg leading-relaxed">{step.success}</p>
          </div>
        </section>

        <aside className="mt-10 lg:mt-0">
          {board && (
            <div className="overflow-x-auto">
              <Fretboard {...board} labelMode="degree" title={`${step.title} diagram`} />
            </div>
          )}
          <section aria-labelledby="met-h" className={board ? 'mt-10' : ''}>
            <h2 id="met-h" className="font-display text-2xl font-extrabold uppercase italic">Metronome</h2>
            <div className="mt-4"><MetronomePanel m={metronome} /></div>
          </section>
        </aside>
      </div>
    </main>
  );
}
