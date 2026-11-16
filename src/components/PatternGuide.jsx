import { useEffect, useState } from 'react';
import GuideHeader from './GuideHeader.jsx';
import { useFollowClick } from '../hooks/useFollowClick.js';
import { fretboardLayout } from '../fretboard/layout.js';
import { demoStepMs, groupStart, SUBDIVISION_NAME } from '../session/patterns.js';

const STRING_NAME = { 6: 'Low E', 5: 'A', 4: 'D', 3: 'G', 2: 'B', 1: 'High e' };
const TAB_NAME = { 6: 'E', 5: 'A', 4: 'D', 3: 'G', 2: 'B', 1: 'e' };
const TAB_STEP = 38;
const TAB_ROW = 21;
const keyOf = (n) => `${n.string}-${n.fret}`;

// `shape` (e.g. the whole box) stays fully visible under the current group; without it, other notes show as faint dots.
function GuideBoard({ pattern, shape, index, groupSize, labelOf }) {
  const frets = pattern.map((n) => n.fret);
  const fromFret = Math.min(...frets);
  const L = fretboardLayout({ fromFret, toFret: Math.max(Math.max(...frets), fromFret + 3), cell: 50, stringGap: 42 });
  const now = pattern[index];
  const start = groupStart(index, groupSize);
  const group = pattern.slice(start, start + groupSize);
  const groupKeys = new Set(group.map(keyOf));
  const background = [...new Map((shape ?? pattern).map((n) => [keyOf(n), n])).values()].filter((n) => !groupKeys.has(keyOf(n)));
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
      {background.map((n) => {
        const p = L.markPos(n.string, n.fret);
        return shape ? (
          <g key={keyOf(n)}>
            <circle cx={p.x} cy={p.y} r="15" strokeWidth="2" className={n.root ? 'fill-fill stroke-line' : 'fill-bg stroke-line'} />
            <text x={p.x} y={p.y} dy="0.35em" textAnchor="middle" className="fill-ink-soft text-[15px] font-extrabold">{labelOf(n)}</text>
          </g>
        ) : <circle key={keyOf(n)} cx={p.x} cy={p.y} r="5" className="fill-line opacity-40" />;
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
            <g aria-hidden="true">
              <circle cx={p.x + 14} cy={p.y - 14} r="9" className="fill-ink" />
              <text x={p.x + 14} y={p.y - 14} dy="0.35em" textAnchor="middle" className="fill-bg text-[11px] font-extrabold">{k + 1}</text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}

function TabStrip({ pattern, index, groupSize, notesPerBeat, stepMs }) {
  return (
    <div aria-hidden="true" className="relative mt-4 h-[160px] overflow-hidden bg-fill font-mono">
      <p className="absolute left-8 top-1.5 flex items-center gap-1.5 font-sans text-xs font-semibold text-ink-soft">
        <span className="size-2.5 rounded-full bg-brand" /> = metronome click
      </p>
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <div key={s} className="absolute inset-x-0 h-px bg-line" style={{ top: 40 + (s - 1) * TAB_ROW }}>
          <span className="absolute left-1.5 -translate-y-1/2 bg-bg px-0.5 text-xs text-ink-soft">{TAB_NAME[s]}</span>
        </div>
      ))}
      <div className="wd-tab absolute left-1/2 top-[40px]"
        style={{ transform: `translateX(${-index * TAB_STEP}px)`, transitionDuration: `${stepMs}ms` }}>
        {pattern.map((n, i) => (
          <span key={i}>
            {i % notesPerBeat === 0 && (
              <>
                <span className="absolute -top-[22px] -ml-[5px] size-2.5 rounded-full bg-brand" style={{ left: i * TAB_STEP - TAB_STEP / 2 }} />
                <span className="absolute -top-2.5 h-[122px] w-px bg-brand/45" style={{ left: i * TAB_STEP - TAB_STEP / 2 }} />
              </>
            )}
            {i % groupSize === 0 && i % notesPerBeat !== 0 && <span className="absolute -top-2 h-[118px] w-px bg-line/50" style={{ left: i * TAB_STEP - TAB_STEP / 2 }} />}
            <span className={`absolute -mt-[9px] h-[18px] min-w-6 -translate-x-1/2 px-0.5 text-center text-[13px] font-bold leading-[18px] ${
              i === index ? 'bg-brand text-on-brand' : i < index ? 'bg-bg text-ink-soft/60' : 'bg-bg text-ink'}`}
              style={{ left: i * TAB_STEP, top: (n.string - 1) * TAB_ROW }}>
              {n.fret}{n.tech && <span className="text-[11px]">{n.tech}</span>}
            </span>
          </span>
        ))}
      </div>
      <div className="absolute bottom-1.5 left-1/2 top-7 -ml-px w-[3px] bg-ink" />
    </div>
  );
}

// Demonstration of a pattern: the board shows the current group in play order, the tab scrolls past a playhead.
export default function PatternGuide({ pattern, shape, groupSize, notesPerBeat, metronome, frozen, labelOf, describe, clickEveryNote, onClickEveryNote, prefs, onPrefs }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const speed = prefs.speed ?? 'slow';
  const setSpeed = (v) => onPrefs((p) => ({ ...p, speed: v }));
  const { bpm } = metronome;
  const stepMs = demoStepMs(speed, bpm, notesPerBeat);
  const { following, clickActive } = useFollowClick({ metronome, slotsPerBeat: notesPerBeat, length: pattern.length, onSlot: setIndex });
  const running = playing && !frozen && !following;

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => { if (!clickActive()) setIndex((i) => (i + 1) % pattern.length); }, stepMs);
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
    <figure>
      <GuideHeader following={following} playing={playing} speed={speed} onSpeed={setSpeed}
        tempoLabel={`At tempo · ${SUBDIVISION_NAME[notesPerBeat]}`}
        extras={[{ label: 'Click every note', on: clickEveryNote, onToggle: () => onClickEveryNote(!clickEveryNote) }]} />
      <button type="button" disabled={following} onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause the demo' : 'Play the demo'}
        className="mt-3 block w-full">
        <GuideBoard pattern={pattern} shape={shape} index={index} groupSize={groupSize} labelOf={labelOf} />
      </button>
      <figcaption className="mt-3 text-center">
        <span className="block font-display text-[15px] font-semibold uppercase italic text-ink-soft">
          {STRING_NAME[now.string]} string · note {(index % notesPerBeat) + 1} of {notesPerBeat} in this click
        </span>
        <span className="block font-display text-3xl font-extrabold italic leading-tight">{describe(now)}</span>
      </figcaption>
      <TabStrip pattern={pattern} index={index} groupSize={groupSize} notesPerBeat={notesPerBeat} stepMs={wraps ? 0 : stepMs} />
    </figure>
  );
}
