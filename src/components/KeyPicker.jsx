import { useState } from 'react';
import Sheet from './Sheet.jsx';

// Clockwise from the top: each step adds a sharp (or removes a flat), so related keys sit side by side.
const FIFTHS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'Ab', 'Eb', 'Bb', 'F'];
const SIZE = 288;
const RADIUS = 112;

// The current key as a button; tapping it opens the circle of fifths to pick another.
export default function KeyPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const pick = (k) => {
    setOpen(false);
    if (k !== value) onChange(k);
  };
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={`Key: ${value}. Change key`}
        className="inline-block min-h-11 min-w-14 -skew-x-12 bg-brand px-3 font-display text-3xl font-extrabold uppercase italic leading-none text-on-brand shadow-flat active:translate-x-px active:translate-y-px active:shadow-none">
        <span className="inline-block skew-x-12">{value}</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Key">
        <div role="group" aria-label="Circle of fifths" className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
          <p aria-hidden="true" className="absolute inset-[74px] grid place-items-center rounded-full border-2 border-dashed border-line p-4 text-center text-[14px] leading-snug text-ink-soft">
            Clockwise adds a sharp, anticlockwise a flat
          </p>
          {FIFTHS.map((k, i) => {
            const angle = (i / FIFTHS.length) * 2 * Math.PI - Math.PI / 2;
            const selected = k === value;
            return (
              <button key={k} type="button" aria-pressed={selected} onClick={() => pick(k)}
                className={`absolute -ml-[26px] -mt-[26px] size-[52px] rounded-full font-display text-xl font-extrabold italic ${
                  selected ? 'bg-brand text-on-brand' : 'bg-fill hover:bg-fill-hover'}`}
                style={{ left: SIZE / 2 + RADIUS * Math.cos(angle), top: SIZE / 2 + RADIUS * Math.sin(angle) }}>
                {k}
              </button>
            );
          })}
        </div>
      </Sheet>
    </>
  );
}
