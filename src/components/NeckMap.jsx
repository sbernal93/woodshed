import { useEffect, useRef } from 'react';
import { fretboardLayout } from '../fretboard/layout.js';
import Fretboard from './Fretboard.jsx';
import { useMediaQuery } from '../hooks/useMediaQuery.js';

const TO_FRET = 15;
const ROW = 30;

// A 0-15 fret neck with labelled bracket buttons beside it, one per region (a CAGED shape, a triad voicing...).
// regions: [{ key, label, ariaLabel, from, to, selected }]. While any region is selected, the others dim.
// Phones get the neck standing up, nut at the top, so all 15 frets fit the width and scroll with the page.
export default function NeckMap({ marks, regions, onPick, title }) {
  const upright = useMediaQuery('(max-width: 639px)');
  const orientation = upright ? 'vertical' : 'horizontal';
  // Same geometry as the Fretboard (its defaults), so brackets line up with the frets.
  const L = fretboardLayout({ fromFret: 0, toFret: TO_FRET, orientation });
  const left = (r) => (r.from === 0 ? L.fretAlong(0) - 16 : L.wirePos(r.from - 1)) + 3;
  const right = (r) => L.wirePos(r.to) - 3;
  const anySelected = regions.some((r) => r.selected);

  // On a narrow screen the neck scrolls: bring the selection into view.
  const scroller = useRef(null);
  const target = regions.find((r) => r.selected);
  const targetX = target ? left(target) : null;
  useEffect(() => {
    if (targetX !== null && !upright) scroller.current?.scrollTo({ left: Math.max(0, targetX - 40), behavior: 'smooth' });
  }, [targetX, upright]);

  return (
    <figure>
      <div ref={scroller} className="overflow-x-auto pb-2">
        <div className={upright ? 'flex w-max' : 'w-max'}>
          <div role="group" aria-label="Positions on the neck" className="relative shrink-0"
            style={upright ? { width: ROW * 2 + 8, height: L.height } : { width: L.width, height: ROW * 2 + 8 }}>
            {regions.map((r, i) => (
              <button key={r.key} type="button" aria-pressed={r.selected} onClick={() => onPick(r)} aria-label={r.ariaLabel}
                className={`group absolute flex items-center justify-center transition-opacity ${anySelected && !r.selected ? 'opacity-30 hover:opacity-70' : ''}`}
                style={upright
                  ? { top: left(r), height: right(r) - left(r), left: (i % 2) * ROW + 4, width: ROW }
                  : { left: left(r), width: right(r) - left(r), top: (i % 2) * ROW + 4, height: ROW }}>
                <span aria-hidden="true" className={`absolute ${upright ? 'inset-y-0 left-1/2 w-[3px] -translate-x-1/2' : 'inset-x-0 top-1/2 h-[3px] -translate-y-1/2'} ${i % 2 ? 'bg-ink' : 'bg-brand'}`} />
                <span aria-hidden="true" className={`relative min-w-9 -skew-x-12 whitespace-nowrap px-2 font-display text-lg font-extrabold uppercase italic leading-7 ${
                  r.selected ? 'bg-brand text-on-brand shadow-flat' : 'bg-bg text-ink outline-2 outline-line group-hover:bg-fill-hover'}`}>
                  <span className="inline-block skew-x-12">{r.label}</span>
                </span>
              </button>
            ))}
          </div>
          <Fretboard marks={marks} fromFret={0} toFret={TO_FRET} orientation={orientation} labelMode="degree" title={title} />
        </div>
      </div>
    </figure>
  );
}
