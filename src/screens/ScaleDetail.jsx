import { useState } from 'react';
import Header from '../components/Header.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import ArrowButton from '../components/ArrowButton.jsx';
import KeyPicker from '../components/KeyPicker.jsx';
import Chip from '../components/Chip.jsx';
import Fretboard from '../components/Fretboard.jsx';
import ScaleHarmony from '../components/ScaleHarmony.jsx';
import { SCALE_LIBRARY } from '../data/scaleLibrary.js';
import { SCALES, positionMarks, scaleMarks, scaleNotes } from '../music/scales.js';
import { CAGED_SHAPES, cagedScaleMarks } from '../music/chords.js';
import { tonicQuality } from '../music/harmony.js';
import { scaleHref } from '../routes.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';

const NECK_FRETS = 15;
const heading = 'font-display text-xl font-extrabold uppercase italic';
const key = (m) => `${m.string}-${m.fret}`;
// "the 3rd", but "the b3": flats and sharps read better as written.
const ordinal = (degree) => (/^\d$/.test(degree) ? ({ 2: '2nd', 3: '3rd' })[degree] ?? `${degree}th` : degree);

export default function ScaleDetail({ scale, root }) {
  const [labelMode, setLabelMode] = useState('degree');
  const [position, setPosition] = useState(null);
  const wide = useMediaQuery('(min-width: 1024px)');
  const info = SCALE_LIBRARY.find((s) => s.id === scale);
  const degrees = SCALES[scale];
  const notes = scaleNotes(root, scale);
  const positions = degrees.length === 5 || degrees.length === 7 ? degrees.map((_, i) => i + 1) : [];
  // Two ways to cut the neck up: the five CAGED shapes (needs a major or minor home chord) or the scale's own positions.
  const quality = tonicQuality(scale);
  const systems = [quality && 'caged', positions.length > 0 && 'positions'].filter(Boolean);
  const [chosen, setSystem] = useState(null);
  const system = systems.includes(chosen) ? chosen : systems.at(-1);
  const pick = (sys, p) => { setSystem(sys); setPosition(p); };
  // CAGED shapes in the order they climb the neck, each one also an octave up when it fits.
  const caged = quality ? Object.keys(CAGED_SHAPES)
    .map((shape) => ({ shape, marks: cagedScaleMarks({ root, shape, scale, quality }) }))
    .sort((a, b) => Math.min(...a.marks.map((m) => m.fret)) - Math.min(...b.marks.map((m) => m.fret))) : [];

  const cagedShape = caged.find((c) => c.shape === position)?.marks ?? [];
  const shape = !position ? []
    : system === 'caged' ? [...cagedShape, ...cagedShape.map((m) => ({ ...m, fret: m.fret + 12 })).filter((m) => m.fret <= NECK_FRETS)]
      : positionMarks({ root, scale, position });
  const inShape = new Map(shape.map((m) => [key(m), m]));
  // Where the picked shape sits (the lower copy, for a CAGED shape that repeats up the neck).
  const spanOf = (ms) => [Math.min(...ms.map((m) => m.fret)), Math.max(...ms.map((m) => m.fret))];
  const span = position ? spanOf(system === 'caged' ? cagedShape : shape) : null;
  const toFret = Math.max(NECK_FRETS, ...shape.map((m) => m.fret));
  const marks = scaleMarks({ root, scale, fromFret: 0, toFret }).map((m) =>
    position ? { ...m, muted: !inShape.has(key(m)), finger: inShape.get(key(m))?.finger ?? null } : m);
  const hasFingers = shape.some((m) => m.finger);
  const mode = labelMode === 'finger' && !hasFingers ? 'degree' : labelMode;

  const changeKey = (k) => location.replace(scaleHref(scale, k));

  return (
    <main className="mx-auto w-full max-w-[1400px] px-5 pb-16 pt-6 lg:px-12 lg:pt-10">
      <Header right={<ThemeToggle />} />

      <div className="mt-8 flex items-center gap-3">
        <ArrowButton direction="prev" href="#library" label="Back to scale library" />
        <div>
          <h2 className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-3xl font-extrabold uppercase italic leading-none">
            <KeyPicker value={root} onChange={changeKey} /> {info.title}
          </h2>
          <p className="mt-1 text-[15px] text-ink-soft">{info.blurb}</p>
        </div>
      </div>

      <section aria-labelledby="notes-h" className="mt-8">
        <h3 id="notes-h" className={heading}>Notes and degrees</h3>
        <ol className="mt-3 flex border-y-2 border-line">
          {notes.map((n, i) => (
            <li key={n} className="flex min-w-0 flex-1 flex-col items-center py-3 lg:max-w-24">
              <span className={`font-display text-3xl font-extrabold italic leading-none ${i === 0 ? 'text-brand' : ''}`}>{n}</span>
              <span className="mt-1 font-display text-lg font-semibold italic text-ink-soft">{i === 0 ? '1 · root' : degrees[i]}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="neck-h" className="mt-10 scroll-mt-6">
        <h3 id="neck-h" className={heading}>On the neck</h3>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-8">
          <div role="group" aria-label="Label notes by" className="grid grid-cols-3 gap-2 px-2 lg:w-96">
            {[['degree', 'Degrees'], ['note', 'Notes'], ['finger', 'Fingers']].map(([v, l]) => (
              <Chip key={v} selected={mode === v} disabled={v === 'finger' && !hasFingers} onClick={() => setLabelMode(v)}
                size="sm" className="px-0 disabled:opacity-40">{l}</Chip>
            ))}
          </div>
          {systems.length > 1 && (
            <div role="group" aria-label="Shapes" className="grid grid-cols-2 gap-2 px-2 lg:w-72">
              {systems.map((sys) => (
                <Chip key={sys} selected={system === sys} onClick={() => pick(sys, null)} size="sm" className="px-0">
                  {sys === 'caged' ? 'CAGED' : degrees.length === 5 ? 'Boxes' : '3 per string'}
                </Chip>
              ))}
            </div>
          )}
          {systems.length > 0 && (
            <div role="group" aria-label="Highlight position"
              className={`grid gap-2 px-2 lg:flex ${system === 'positions' && positions.length > 5 ? 'grid-cols-4' : 'grid-cols-6'}`}>
              <Chip selected={!position} onClick={() => setPosition(null)} size="sm" className="px-0 lg:px-4">All</Chip>
              {(system === 'caged' ? caged.map((c) => c.shape) : positions).map((p) => (
                <Chip key={p} selected={position === p} onClick={() => setPosition(p)} size="sm" className="px-0 lg:min-w-12 lg:px-3">
                  {system === 'caged' ? p : `Pos ${p}`}
                </Chip>
              ))}
            </div>
          )}
        </div>
        {position && (
          <p aria-live="polite" className="mt-3 px-2 text-[16px] text-ink-soft">
            {system === 'caged' ? `${position} shape` : `Position ${position} · starts on `}
            {system !== 'caged' && <b className="text-brand">{shape[0].note}</b>}
            {system !== 'caged' && (degrees[position - 1] === '1' ? ', the root' : `, the ${ordinal(degrees[position - 1])}`)}
            {` · frets ${span[0]}–${span[1]}`}
          </p>
        )}
        <div className="mt-6 overflow-x-auto pb-2">
          <Fretboard marks={marks} fromFret={0} toFret={toFret} labelMode={mode}
            orientation={wide ? 'horizontal' : 'vertical'}
            title={`${root} ${info.title}${position ? (system === 'caged' ? `, ${position} shape` : `, position ${position}`) : ''}, frets 0 to ${toFret}`} />
        </div>
      </section>

      <ScaleHarmony root={root} scale={scale} onShowBox={(p) => {
        pick('positions', p);
        document.getElementById('neck-h').scrollIntoView({ behavior: 'smooth' });
      }} />
    </main>
  );
}
