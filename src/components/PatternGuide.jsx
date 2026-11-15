import { useEffect, useState } from 'react';
import { ArrowIcon } from './icons.jsx';
import { fretboardLayout } from '../fretboard/layout.js';
import { demoStepMs, groupStart } from '../session/patterns.js';

const STRING_NAME = { 6: 'Low E', 5: 'A', 4: 'D', 3: 'G', 2: 'B', 1: 'High e' };
const TAB_NAME = { 6: 'E', 5: 'A', 4: 'D', 3: 'G', 2: 'B', 1: 'e' };
const ORDINAL = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
const SPEEDS = [['slow', 'Slow'], ['medium', 'Medium'], ['tempo', 'At tempo']];
const TAB_STEP = 38;
const TAB_ROW = 21;
const keyOf = (n) => `${n.string}-${n.fret}`;

function GuideBoard({ pattern, index, groupSize, labelOf }) {
  const frets = pattern.map((n) => n.fret);
  const fromFret = Math.min(...frets);
  const L = fretboardLayout({ fromFret, toFret: Math.max(Math.max(...frets), fromFret + 3), cell: 50, stringGap: 42 });
  const now = pattern[index];
  const start = groupStart(index, groupSize);
  const group = pattern.slice(start, start + groupSize);
  const groupKeys = new Set(group.map(keyOf));
  const ghosts = [...new Map(pattern.map((n) => [keyOf(n), n])).values()].filter((n) => !groupKeys.has(keyOf(n)));
  const prev = index > 0 ? pattern[index - 1] : null;
  const wires = Array.from({ length: L.cells + 1 }, (_, i) => L.firstWire + i);
  const [top, bottom] = [L.wirePos(L.firstWire), L.boardEnd];
  const trail = prev && (() => {
    const a = L.markPos(prev.string, prev.fret), b = L.markPos(now.string, now.fret);
    return { ...{ x1: a.x, y1: a.y, x2: b.x, y2: b.y }, len: Math.hypot(b.x - a.x, b.y - a.y) };
  })();

  return (
    <svg viewBox={`0 0 ${L.width + 34} ${L.height}`} width={L.width + 34} height={L.height} aria-hidden="true"
      className="mx-auto block h-auto max-w-full font-display italic">
      {wires.map((w) => (
        <line key={w} x1={L.stringPos(6)} x2={L.stringPos(1)} y1={L.wirePos(w)} y2={L.wirePos(w)} className="stroke-line" strokeWidth={w === 0 ? 6 : 1.5} />
      ))}
      {wires.slice(1).map((f) => (
        <text key={f} x={14} y={L.fretAlong(f)} dy="0.35em" textAnchor="middle" className="fill-ink-soft text-sm font-semibold">{f}</text>
      ))}
      {[6, 5, 4, 3, 2, 1].map((s) => {
        const on = s === now.string;
        return (
          <g key={s}>
            <line x1={L.stringPos(s)} x2={L.stringPos(s)} y1={top} y2={bottom} className={on ? 'stroke-ink' : 'stroke-line'} strokeWidth={on ? 2.5 : 1.2} />
            <text x={L.stringPos(s)} y={14} dy="0.35em" textAnchor="middle" className={`text-sm font-semibold ${on ? 'fill-ink' : 'fill-ink-soft'}`}>{TAB_NAME[s]}</text>
          </g>
        );
      })}
      {ghosts.map((n) => {
        const p = L.markPos(n.string, n.fret);
        return <circle key={keyOf(n)} cx={p.x} cy={p.y} r="5" className="fill-line opacity-40" />;
      })}
      {trail && (
        <line key={`t${index}`} {...trail} className="wd-trail stroke-brand" strokeWidth="4" strokeLinecap="round"
          style={{ '--len': trail.len, strokeDasharray: trail.len }} />
      )}
      {group.map((n, k) => {
        const p = L.markPos(n.string, n.fret);
        const i = start + k;
        const isNow = i === index;
        const done = i < index;
        return (
          <g key={`${keyOf(n)}-${k}`} className={done ? 'opacity-45' : undefined}>
            {isNow && <circle key={`r${index}`} cx={p.x} cy={p.y} r="16" className="wd-pulse fill-none stroke-brand" strokeWidth="3" />}
            <circle cx={p.x} cy={p.y} r="16" strokeWidth="2" className={isNow ? 'fill-brand stroke-brand' : 'fill-bg stroke-ink'} />
            <text x={p.x} y={p.y} dy="0.35em" textAnchor="middle" className={`text-[17px] font-extrabold ${isNow ? 'fill-on-brand' : 'fill-ink'}`}>{labelOf(n)}</text>
            <text x={p.x + 22} y={p.y} dy="0.35em" className="fill-ink-soft text-xs font-semibold">{ORDINAL[k]}</text>
          </g>
        );
      })}
    </svg>
  );
}

function TabStrip({ pattern, index, groupSize, stepMs }) {
  return (
    <div aria-hidden="true" className="relative mt-4 h-[134px] overflow-hidden bg-fill font-mono">
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <div key={s} className="absolute inset-x-0 h-px bg-line" style={{ top: 14 + (s - 1) * TAB_ROW }}>
          <span className="absolute left-1.5 -translate-y-1/2 bg-bg px-0.5 text-xs text-ink-soft">{TAB_NAME[s]}</span>
        </div>
      ))}
      <div className="wd-tab absolute left-1/2 top-[14px]"
        style={{ transform: `translateX(${-index * TAB_STEP}px)`, transitionDuration: `${stepMs}ms` }}>
        {pattern.map((n, i) => (
          <span key={i}>
            {i % groupSize === 0 && <span className="absolute -top-2 h-[124px] w-px bg-line/50" style={{ left: i * TAB_STEP - TAB_STEP / 2 }} />}
            <span className={`absolute -ml-3 -mt-[9px] h-[18px] w-6 text-center text-[13px] font-bold leading-[18px] ${
              i === index ? 'bg-brand text-on-brand' : i < index ? 'bg-bg text-ink-soft/60' : 'bg-bg text-ink'}`}
              style={{ left: i * TAB_STEP, top: (n.string - 1) * TAB_ROW }}>
              {n.fret}
            </span>
          </span>
        ))}
      </div>
      <div className="absolute inset-y-1.5 left-1/2 -ml-px w-[3px] bg-brand" />
    </div>
  );
}

// Demonstration of a pattern: the board shows the current group in play order, the tab scrolls past a playhead.
export default function PatternGuide({ pattern, groupSize, notesPerBeat, bpm, frozen, labelOf, describe }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState('medium');
  const stepMs = demoStepMs(speed, bpm, notesPerBeat);
  const running = playing && !frozen;

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % pattern.length), stepMs);
    return () => clearInterval(id);
  }, [running, stepMs, pattern.length]);

  const step = (d) => {
    setPlaying(false);
    setIndex((i) => (i + d + pattern.length) % pattern.length);
  };
  const now = pattern[index];
  // Jumping back to the first note scrolls instantly instead of sliding across the whole tab.
  const wraps = index === 0;

  return (
    <figure className="mt-6">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => step(-1)} aria-label="Previous note" className="grid size-12 place-items-center rounded-full bg-fill hover:bg-fill-hover"><ArrowIcon direction="prev" className="size-5" /></button>
        <button type="button" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}
          className={`min-h-12 rounded-full px-5 font-display text-lg font-extrabold uppercase italic ${playing ? 'bg-brand text-on-brand' : 'bg-fill hover:bg-fill-hover'}`}>
          {playing ? 'Pause demo' : 'Play demo'}
        </button>
        <button type="button" onClick={() => step(1)} aria-label="Next note" className="grid size-12 place-items-center rounded-full bg-fill hover:bg-fill-hover"><ArrowIcon direction="next" className="size-5" /></button>
      </div>
      <div role="group" aria-label="Demo speed" className="mt-2 flex gap-1.5">
        {SPEEDS.map(([v, l]) => (
          <button key={v} type="button" aria-pressed={speed === v} onClick={() => setSpeed(v)}
            className={`min-h-10 rounded-full px-3 font-display text-sm font-extrabold uppercase italic ${speed === v ? 'bg-ink text-bg' : 'bg-fill hover:bg-fill-hover'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <GuideBoard pattern={pattern} index={index} groupSize={groupSize} labelOf={labelOf} />
      </div>
      <figcaption className="mt-3 text-center">
        <span className="block font-display text-[15px] font-semibold uppercase italic text-ink-soft">{STRING_NAME[now.string]} string</span>
        <span className="block font-display text-3xl font-extrabold italic leading-tight">{describe(now)}</span>
      </figcaption>
      <TabStrip pattern={pattern} index={index} groupSize={groupSize} stepMs={wraps ? 0 : stepMs} />
    </figure>
  );
}
