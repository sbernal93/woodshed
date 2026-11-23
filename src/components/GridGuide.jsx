import { useEffect, useState } from 'react';
import { fretboardLayout } from '../fretboard/layout.js';
import { countLabels, hzOf } from '../session/grid.js';
import { demoStepMs, SUBDIVISION_NAME } from '../session/patterns.js';
import { getAudioContext } from '../audio/context.js';
import GuideHeader from './GuideHeader.jsx';
import { useFollowClick } from '../hooks/useFollowClick.js';

const TAB = { 6: 'E', 5: 'A', 4: 'D', 3: 'G', 2: 'B', 1: 'e' };
const SPOKEN = { 6: 'low E', 5: 'A', 4: 'D', 3: 'G', 2: 'B', 1: 'high e' };
const HAND = { p: 'Thumb', i: 'Index', m: 'Middle', a: 'Ring', d: 'Down' };
const ROW = 22;

function pluck(notes) {
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  notes.forEach((n) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = hzOf(n.string, n.fret);
    gain.gain.setValueAtTime(n.thumb ? 0.32 : 0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.75);
  });
}

function GridBoard({ shape, notes }) {
  const frets = [...shape, ...notes].map((n) => n.fret);
  const L = fretboardLayout({ fromFret: 0, toFret: Math.max(3, ...frets), cell: 46, stringGap: 42 });
  const sounding = new Set(notes.map((n) => `${n.string}-${n.fret}`));
  const wires = Array.from({ length: L.cells + 1 }, (_, i) => L.firstWire + i);
  return (
    <svg viewBox={`0 0 ${L.width} ${L.height}`} width={L.width} height={L.height} aria-hidden="true" className="mx-auto block h-auto max-w-full font-display italic">
      {wires.map((w) => (
        <line key={w} x1={L.stringPos(6)} x2={L.stringPos(1)} y1={L.wirePos(w)} y2={L.wirePos(w)} className="stroke-line" strokeWidth={w === 0 ? 6 : 1.5} />
      ))}
      {wires.slice(1).map((f) => (
        <text key={f} x={14} y={L.fretAlong(f)} dy="0.35em" textAnchor="middle" className="fill-ink-soft text-sm font-semibold">{f}</text>
      ))}
      {[6, 5, 4, 3, 2, 1].map((s) => (
        <g key={s}>
          <line x1={L.stringPos(s)} x2={L.stringPos(s)} y1={L.boardStart} y2={L.boardEnd} className="stroke-line" strokeWidth="1.2" />
          <text x={L.stringPos(s)} y={14} dy="0.35em" textAnchor="middle" className="fill-ink-soft text-sm font-semibold">{TAB[s]}</text>
        </g>
      ))}
      {shape.filter((n) => !sounding.has(`${n.string}-${n.fret}`)).map((n) => {
        const p = L.markPos(n.string, n.fret);
        return <circle key={`${n.string}-${n.fret}`} cx={p.x} cy={p.y} r="13" strokeWidth="2" className="fill-bg stroke-line" />;
      })}
      {notes.map((n) => {
        const p = L.markPos(n.string, n.fret);
        return (
          <g key={`${n.string}-${n.fret}-${n.hand}`}>
            <circle cx={p.x} cy={p.y} r="17" className={n.thumb ? 'fill-ink' : 'fill-brand'} />
            <text x={p.x} y={p.y} dy="0.35em" textAnchor="middle" className={`text-[17px] font-extrabold ${n.thumb ? 'fill-bg' : 'fill-on-brand'}`}>{n.hand === 'd' ? '↓' : n.hand}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Rhythm-grid guide for fingerstyle: what the thumb and fingers play on each count, looping one bar.
// `prefs` live in the session so Hear it / speed survive the remount when the prompt switches patterns.
export default function GridGuide({ grid, metronome, frozen, prefs, onPrefs }) {
  const { bpm } = metronome;
  const [slot, setSlot] = useState(0);
  const [playing, setPlaying] = useState(true);
  const speed = prefs.speed ?? 'slow';
  const { sound } = prefs;
  const setSpeed = (v) => onPrefs((p) => ({ ...p, speed: v }));
  const setSound = (f) => onPrefs((p) => ({ ...p, sound: f(p.sound) }));
  const counts = countLabels(grid.slotsPerBeat, grid.beats);
  const picked = grid.slots.flat().every((n) => n.hand === 'd');
  const length = grid.slots.length;
  const stepMs = demoStepMs(speed, bpm, grid.slotsPerBeat);
  const { following, clickActive } = useFollowClick({ metronome, slotsPerBeat: grid.slotsPerBeat, length, onSlot: setSlot });
  const running = playing && !frozen && !following;

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => { if (!clickActive()) setSlot((s) => (s + 1) % length); }, stepMs);
    return () => clearInterval(id);
  }, [running, stepMs, length]);

  const notes = grid.slots[slot];
  useEffect(() => {
    if (sound && notes.length) pluck(notes);
  }, [slot, sound]); // eslint-disable-line react-hooks/exhaustive-deps

  const isBeat = (i) => i % grid.slotsPerBeat === 0;

  return (
    <figure>
      <GuideHeader following={following} playing={playing} speed={speed} onSpeed={setSpeed}
        tempoLabel={`At tempo · ${SUBDIVISION_NAME[grid.slotsPerBeat]}`}
        extras={[{ label: 'Hear it', on: sound, onToggle: () => setSound((v) => !v) }]} />
      {picked ? (
        <p className="mt-4 text-[15px] text-ink-soft">↓ Downstroke with the pick</p>
      ) : (
        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[15px] text-ink-soft">
          <span className="flex items-center gap-2"><span className="size-3.5 rounded-full bg-ink" /> Thumb (p)</span>
          <span className="flex items-center gap-2"><span className="size-3.5 rounded-full bg-brand" /> Fingers (i m a)</span>
        </p>
      )}

      <button type="button" disabled={following} onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause the demo' : 'Play the demo'}
        className="mt-3 block w-full">
        <GridBoard shape={grid.shape} notes={notes} />
      </button>

      <figcaption className="mt-2 text-center">
        <span className="block font-display text-5xl font-extrabold italic leading-none">
          {isBeat(slot) ? counts[slot] : <><span className="text-ink-soft">{counts[slot - (slot % grid.slotsPerBeat)]}</span> {counts[slot]}</>}
        </span>
        <span className="mt-1 block text-[15px] text-ink-soft">
          {notes.length ? notes.map((n) => `${HAND[n.hand]}: ${SPOKEN[n.string]} ${n.fret === 0 ? 'open' : `fret ${n.fret}`}`).join(' · ') : 'Rest: let it ring'}
        </span>
      </figcaption>

      <div aria-hidden="true" className="mt-4 bg-fill py-2 pl-7 pr-2 font-mono">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${length}, 1fr)` }}>
          {counts.map((c, i) => (
            <span key={i} className={`h-6 text-center font-display text-base font-extrabold italic ${i === slot ? 'text-brand' : isBeat(i) ? 'text-ink' : 'text-ink-soft'}`}>{c}</span>
          ))}
        </div>
        <div className="relative" style={{ height: ROW * 5 + 10 }}>
          <div className="absolute inset-y-0 bg-brand/15" style={{ left: `${(slot / length) * 100}%`, width: `${100 / length}%` }} />
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className="absolute inset-x-0 h-px bg-line" style={{ top: 5 + (s - 1) * ROW }}>
              <span className="absolute -left-5 -translate-y-1/2 text-xs text-ink-soft">{TAB[s]}</span>
            </div>
          ))}
          {grid.slots.flatMap((ns, i) => ns.map((n) => (
            <span key={`${i}-${n.string}`}
              className={`absolute -ml-3 -mt-[9px] h-[18px] w-6 text-center text-[13px] font-bold leading-[18px] ${n.thumb ? 'bg-ink text-bg' : 'bg-brand text-on-brand'} ${i === slot ? 'outline-3 outline-offset-1 outline-brand' : ''}`}
              style={{ left: `${((i + 0.5) / length) * 100}%`, top: 5 + (n.string - 1) * ROW }}>
              {n.fret}
            </span>
          )))}
        </div>
      </div>
    </figure>
  );
}
