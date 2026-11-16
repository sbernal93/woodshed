import { useRef, useState } from 'react';
import Sheet from './Sheet.jsx';
import { spell } from '../music/notes.js';

// Clockwise from the top: each step adds a sharp (or removes a flat), so related keys sit side by side.
const FIFTHS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'Ab', 'Eb', 'Bb', 'F'];
const SIZE = 300;
const RADIUS = 118;
const PICK_MS = 260;

const angleOf = (k) => FIFTHS.indexOf(k) * 30;
const signature = (k) => {
  const i = FIFTHS.indexOf(k);
  if (i === 0) return 'No sharps or flats';
  const [n, kind] = i <= 7 ? [i, 'sharp'] : [12 - i, 'flat'];
  return `${n} ${kind}${n > 1 ? 's' : ''}`;
};
const neighbour = (k, step) => FIFTHS[(FIFTHS.indexOf(k) + step + 12) % 12];

// The current key as a button; tapping it opens a circle-of-fifths dial to pick another.
export default function KeyPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [aim, setAim] = useState(value);
  const [picking, setPicking] = useState(false);
  // The needle keeps a running angle so it always swings the short way (F to C is one step, not eleven).
  const needle = useRef(angleOf(value));
  const target = angleOf(aim);
  needle.current += ((((target - needle.current) % 360) + 540) % 360) - 180;

  const show = () => { setAim(value); setPicking(false); setOpen(true); };
  const pick = (k) => {
    setAim(k);
    setPicking(true);
    setTimeout(() => {
      setOpen(false);
      if (k !== value) onChange(k);
    }, PICK_MS);
  };
  const badge = { [neighbour(value, -1)]: 'IV', [neighbour(value, 1)]: 'V' };

  return (
    <>
      <button type="button" onClick={show} aria-label={`Key: ${value}. Change key`}
        className="inline-block min-h-11 min-w-14 -skew-x-12 bg-brand px-3 font-display text-3xl font-extrabold uppercase italic leading-none text-on-brand shadow-flat active:translate-x-px active:translate-y-px active:shadow-none">
        <span className="inline-block skew-x-12">{value}</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Key">
        {open && (
          <div role="group" aria-label="Circle of fifths" className="relative mx-auto" style={{ width: SIZE, height: SIZE }}
            onMouseLeave={() => !picking && setAim(value)}>
            <div aria-hidden="true" className="wd-needle absolute left-1/2 top-1/2 h-[92px] w-[3px] origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-brand"
              style={{ rotate: `${needle.current}deg` }} />
            <div aria-live="polite" className="absolute left-1/2 top-1/2 grid size-[118px] -translate-x-1/2 -translate-y-1/2 place-content-center rounded-full border-2 border-dashed border-line bg-bg text-center">
              <span className="font-display text-4xl font-extrabold italic leading-none">{aim}</span>
              <span className="mt-1 text-[13px] leading-tight text-ink-soft">{signature(aim)}</span>
              <span className="text-[13px] leading-tight text-ink-soft">relative {spell(aim, '6')}m</span>
            </div>
            {FIFTHS.map((k, i) => {
              const angle = (i / FIFTHS.length) * 2 * Math.PI - Math.PI / 2;
              const [x, y] = [RADIUS * Math.cos(angle), RADIUS * Math.sin(angle)];
              const selected = k === value;
              const aimed = k === aim;
              return (
                <button key={k} type="button" aria-pressed={selected} onClick={() => pick(k)}
                  onMouseEnter={() => !picking && setAim(k)} onFocus={() => !picking && setAim(k)}
                  aria-label={`${k}${badge[k] ? `, the ${badge[k]} of ${value}` : ''}`}
                  className={`wd-dial-in absolute -ml-[26px] -mt-[26px] size-[52px] rounded-full font-display text-xl font-extrabold italic transition-[background-color,scale] duration-150 ${
                    selected ? 'bg-brand text-on-brand' : aimed ? 'scale-110 bg-ink text-bg' : 'bg-fill hover:bg-fill-hover'}`}
                  style={{ left: SIZE / 2 + x, top: SIZE / 2 + y, '--dx': `${-x}px`, '--dy': `${-y}px`, animationDelay: `${i * 22}ms` }}>
                  {k}
                  {badge[k] && (
                    <span aria-hidden="true" className="absolute -right-1 -top-1 rounded-full bg-chip px-1.5 font-display text-[11px] font-extrabold not-italic leading-4 text-chip-ink">
                      {badge[k]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </Sheet>
    </>
  );
}
