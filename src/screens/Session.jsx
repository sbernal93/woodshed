import { useEffect, useMemo, useRef, useState } from 'react';
import { tracks } from '../data/tracks/index.js';
import { pickSession, keepAwake } from '../session/runner.js';
import { useSessionClock } from '../hooks/useSessionClock.js';
import { useWakeLock } from '../hooks/useWakeLock.js';
import { useMetronome } from '../audio/useMetronome.js';
import { getAudioContext } from '../audio/context.js';
import { playChime, playGo } from '../audio/chime.js';
import { useDrone } from '../audio/useDrone.js';
import StepPrompt from '../components/StepPrompt.jsx';
import { trackBars, promptState } from '../session/prompts.js';
import { resolvePattern, groupSizeOf, notesPerBeatOf } from '../session/patterns.js';
import PatternGuide from '../components/PatternGuide.jsx';
import GridGuide from '../components/GridGuide.jsx';
import { resolveGrid } from '../session/grid.js';
import { resolveFretboard } from '../music/resolve.js';
import Fretboard from '../components/Fretboard.jsx';
import MetronomeSheet from '../components/MetronomeSheet.jsx';
import SessionTopBar from '../components/session/SessionTopBar.jsx';
import ReadyPanel from '../components/session/ReadyPanel.jsx';
import ControlBar from '../components/session/ControlBar.jsx';
import SessionDone from './SessionDone.jsx';

const KIND_LABEL = { warmup: 'Warm-up', review: 'Review', focus: 'Focus', apply: 'Apply it', cooldown: 'Cool-down' };

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
  const [howOpen, setHowOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  // Bars are counted at the tempo they were played at, so a Clean pass doesn't jump the prompt.
  const barsRef = useRef(null);
  barsRef.current = trackBars(barsRef.current, step.seconds * 1000 - state.remainingMs, metronome.bpm, state.index);
  const prompt = step.prompt ? promptState(step.prompt, barsRef.current.bars, seed + state.index) : null;
  const patternSpec = step.pattern && (step.pattern.byPrompt ? step.pattern.byPrompt[prompt?.item] : step.pattern.spec);
  const grid = useMemo(() => (patternSpec?.type === 'grid' ? resolveGrid(patternSpec) : null), [patternSpec]);
  const pattern = useMemo(() => (patternSpec && !grid ? resolvePattern(patternSpec) : null), [patternSpec, grid]);
  const shape = useMemo(() => (patternSpec?.of ? resolveFretboard(patternSpec.of).marks : null), [patternSpec]);
  const patternBeat = pattern ? notesPerBeatOf(step.pattern, patternSpec) : 1;
  // Opt-in: the metronome also clicks the pattern's subdivision, so you hear where each note falls.
  const [clickEveryNote, setClickEveryNote] = useState(false);
  const [guidePrefs, setGuidePrefs] = useState({ speed: null, sound: false });
  useEffect(() => {
    if (clickEveryNote) metronome.setSubdivision(pattern ? patternBeat : 1);
  }, [clickEveryNote, patternBeat, pattern]); // eslint-disable-line react-hooks/exhaustive-deps
  useDrone(step.drone?.root, Boolean(step.drone) && droneOn && !state.paused && !state.finished);

  // Each step suggests its own tempo; the click keeps running across the change.
  useEffect(() => {
    if (step.bpm) metronome.setBpm(step.bpm.min);
  }, [state.index]); // eslint-disable-line react-hooks/exhaustive-deps

  const started = useRef(state.startedCount);
  useEffect(() => {
    if (state.startedCount > started.current) playGo(getAudioContext());
    started.current = state.startedCount;
  }, [state.startedCount]);

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

  const board = step.fretboard && !pattern && !grid ? resolveFretboard(step.fretboard) : null;
  const firstSentence = step.instruction.split(/(?<=\.)\s/)[0];
  const now = () => performance.now();

  return (
    <>
      <SessionTopBar steps={steps} state={state} />
      <main className="mx-auto w-full max-w-[1400px] px-5 pb-48 pt-2 lg:px-12 lg:pb-32">
        <div key={state.index} className="wd-step-in lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <section aria-labelledby="step-h">
            <p className="font-display text-base font-semibold uppercase italic text-ink-soft">
              {KIND_LABEL[step.kind]} · step {state.index + 1} of {steps.length} · {track.title}
            </p>
            <h1 id="step-h" className="font-display text-4xl font-extrabold uppercase italic leading-none lg:text-5xl">{step.title}</h1>

            <ReadyPanel step={step} state={state}
              onStart={() => dispatch({ type: 'startNow', now: now() })}
              onMore={() => dispatch({ type: 'morePrep', ms: 10000 })} />

            {!state.preparing && (
              <div className="wd-fade-up">
                {step.prompt && <StepPrompt prompt={step.prompt} state={prompt} />}
                <div className="mt-4 text-[16px] leading-relaxed">
                  {howOpen ? (
                    <>
                      <p>{step.instruction}</p>
                      <p className="mt-2"><span className="font-display font-semibold uppercase italic text-ink-soft">What good looks like · </span>{step.success}</p>
                    </>
                  ) : <p className="text-ink-soft">{firstSentence}</p>}
                  <button type="button" onClick={() => setHowOpen((o) => !o)} aria-expanded={howOpen}
                    className="mt-1 min-h-10 font-display text-base font-extrabold uppercase italic underline decoration-2 underline-offset-4 hover:text-brand">
                    {howOpen ? 'Less' : 'How to play'}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {step.bpm && (
                <p className="inline-block -skew-x-12 bg-chip px-3 py-1 font-display text-base font-extrabold italic text-chip-ink">
                  <span className="inline-block skew-x-12">Target {step.bpm.min}–{step.bpm.max} BPM</span>
                </p>
              )}
              {step.drone && (
                <button type="button" aria-pressed={droneOn} onClick={() => setDroneOn((on) => !on)}
                  className={`min-h-10 rounded-full px-4 font-display text-base font-extrabold uppercase italic ${droneOn ? 'bg-ink text-bg' : 'bg-fill hover:bg-fill-hover'}`}>
                  {step.drone.root} drone
                </button>
              )}
              {step.ladder && !state.preparing && (
                <button type="button" onClick={() => metronome.setBpm(metronome.bpm + step.ladder.by)}
                  className="min-h-10 rounded-full bg-brand px-4 font-display text-base font-extrabold uppercase italic text-on-brand shadow-flat active:translate-x-px active:translate-y-px active:shadow-none">
                  Clean pass · +{step.ladder.by} BPM
                </button>
              )}
            </div>
          </section>

          <aside className="mt-8 lg:mt-0">
            {grid && <GridGuide key={`${state.index}-${prompt?.index ?? 0}`} grid={grid} metronome={metronome} frozen={state.paused} prefs={guidePrefs} onPrefs={setGuidePrefs} />}
            {pattern && (
              <PatternGuide key={`${state.index}-${prompt?.index ?? 0}`} pattern={pattern} shape={shape} groupSize={groupSizeOf(patternSpec)}
                notesPerBeat={patternBeat} metronome={metronome} frozen={state.paused}
                clickEveryNote={clickEveryNote} prefs={guidePrefs} onPrefs={setGuidePrefs}
                onClickEveryNote={(on) => { setClickEveryNote(on); if (!on) metronome.setSubdivision(1); }}
                labelOf={(n) => (patternSpec.type === 'spider' ? n.finger : n.degree)}
                describe={(n) => (patternSpec.type === 'spider'
                  ? `Fret ${n.fret} · finger ${n.finger}`
                  : `Fret ${n.fret} · ${n.note} (${n.degree})${n.finger ? ` · finger ${n.finger}` : ''}`)} />
            )}
            {board && (
              <div className="overflow-x-auto">
                <Fretboard {...board} labelMode="degree" title={`${step.title} diagram`} />
              </div>
            )}
          </aside>
        </div>
      </main>

      <ControlBar paused={state.paused} metronome={metronome}
        onPrev={() => dispatch({ type: 'prev' })}
        onNext={() => dispatch({ type: 'next' })}
        onToggle={() => dispatch({ type: 'togglePause', now: now() })}
        onMetronomeMore={() => setSheetOpen(true)} />
      <MetronomeSheet open={sheetOpen} onClose={() => setSheetOpen(false)} m={metronome} />
    </>
  );
}
