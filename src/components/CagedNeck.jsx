import { useEffect, useRef } from 'react';
import { cagedNeck } from '../music/chords.js';
import { fretboardLayout } from '../fretboard/layout.js';
import Fretboard from './Fretboard.jsx';

const TO_FRET = 15;
const ROW = 30;

// The whole neck with every CAGED position on it, and a bracket above showing where each shape sits.
// With a `selected` shape, only its notes (wherever it appears) stay bright.
export default function CagedNeck({ root, view, selected, onSelect }) {
  const neck = cagedNeck({ root, view, toFret: TO_FRET });
  const { regions } = neck;
  const marks = selected ? neck.marks.map((m) => ({ ...m, muted: !m.shapes.includes(selected) })) : neck.marks;
  // Same geometry as the Fretboard below (its defaults), so brackets line up with the frets.
  const L = fretboardLayout({ fromFret: 0, toFret: TO_FRET, orientation: 'horizontal' });
  const left = (r) => (r.from === 0 ? L.fretAlong(0) - 16 : L.wirePos(r.from - 1)) + 3;
  const right = (r) => L.wirePos(r.to) - 3;

  // On a narrow screen the neck scrolls: bring the picked shape into view.
  const scroller = useRef(null);
  const target = selected && regions.find((r) => r.shape === selected);
  const targetX = target ? left(target) : null;
  useEffect(() => {
    if (targetX !== null) scroller.current?.scrollTo({ left: Math.max(0, targetX - 40), behavior: 'smooth' });
  }, [targetX]);

  return (
    <figure>
      <div ref={scroller} className="overflow-x-auto pb-2">
        <div className="w-max">
          <div role="group" aria-label="Shapes on the neck" className="relative" style={{ width: L.width, height: ROW * 2 + 8 }}>
            {regions.map((r, i) => {
              const [x1, x2] = [left(r), right(r)];
              const on = r.shape === selected;
              return (
                <button key={`${r.shape}-${r.from}`} type="button" aria-pressed={on} onClick={() => onSelect(on ? null : r.shape)}
                  aria-label={`${r.shape} shape, frets ${r.from} to ${r.to}`}
                  className={`group absolute flex items-center justify-center transition-opacity ${selected && !on ? 'opacity-30 hover:opacity-70' : ''}`}
                  style={{ left: x1, width: x2 - x1, top: (i % 2) * ROW + 4, height: ROW }}>
                  <span aria-hidden="true" className={`absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 ${i % 2 ? 'bg-ink' : 'bg-brand'}`} />
                  <span aria-hidden="true" className={`relative min-w-9 -skew-x-12 px-2 font-display text-lg font-extrabold uppercase italic leading-7 ${
                    on ? 'bg-brand text-on-brand shadow-flat' : 'bg-bg text-ink outline-2 outline-line group-hover:bg-fill-hover'}`}>
                    <span className="inline-block skew-x-12">{r.shape}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <Fretboard marks={marks} fromFret={0} toFret={TO_FRET} orientation="horizontal" labelMode="degree"
            title={`${root} ${view === 'scale' ? 'major scale' : view === 'm' ? 'minor' : 'major'}: all five CAGED positions on one neck`} />
        </div>
      </div>
    </figure>
  );
}
