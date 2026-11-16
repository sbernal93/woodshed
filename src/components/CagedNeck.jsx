import { useEffect, useRef } from 'react';
import { cagedNeck } from '../music/chords.js';
import { fretboardLayout } from '../fretboard/layout.js';
import Fretboard from './Fretboard.jsx';

const TO_FRET = 15;
const ROW = 28;

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
          <svg viewBox={`0 0 ${L.width} ${ROW * 2 + 6}`} width={L.width} height={ROW * 2 + 6} aria-hidden="true" className="block font-display italic">
            {regions.map((r, i) => {
              const y = (i % 2) * ROW + 6;
              const [x1, x2] = [left(r), right(r)];
              return (
                <g key={`${r.shape}-${r.from}`} onClick={() => onSelect(r.shape === selected ? null : r.shape)}
                  className={`cursor-pointer ${selected && r.shape !== selected ? 'opacity-30' : ''}`}>
                  <path d={`M${x1} ${y + 18} V${y + 10} H${x2} V${y + 18}`} fill="none" strokeWidth="2.5" className={i % 2 ? 'stroke-ink' : 'stroke-brand'} />
                  <rect x={(x1 + x2) / 2 - 15} y={y} width="30" height="20" className="fill-bg" />
                  <text x={(x1 + x2) / 2} y={y + 10} dy="0.35em" textAnchor="middle" className="fill-ink text-[17px] font-extrabold">{r.shape}</text>
                </g>
              );
            })}
          </svg>
          <Fretboard marks={marks} fromFret={0} toFret={TO_FRET} orientation="horizontal" labelMode="degree"
            title={`${root} ${view === 'scale' ? 'major scale' : view === 'm' ? 'minor' : 'major'}: all five CAGED positions on one neck`} />
        </div>
      </div>
    </figure>
  );
}
