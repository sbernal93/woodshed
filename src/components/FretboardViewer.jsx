import { useState } from 'react';
import { resolveFretboard } from '../music/resolve.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import Fretboard from './Fretboard.jsx';
import Chip from './Chip.jsx';

const LABELS = [
  { value: 'note', label: 'Notes' },
  { value: 'degree', label: 'Degrees' },
  { value: 'finger', label: 'Fingers' },
];
const RANGES = [
  { value: 'shape', label: 'Shape' },
  { value: 12, label: '12 frets' },
  { value: 15, label: '15 frets' },
];

export default function FretboardViewer({ spec, title }) {
  const [labelMode, setLabelMode] = useState('note');
  const [range, setRange] = useState('shape');
  const wide = useMediaQuery('(min-width: 1024px)');
  const { marks, fromFret, toFret } = resolveFretboard(spec);
  const hasFingers = marks.some((m) => m.finger);
  const mode = labelMode === 'finger' && !hasFingers ? 'note' : labelMode;
  const frame = range === 'shape' ? { fromFret, toFret } : { fromFret: 0, toFret: Math.max(range, toFret) };

  return (
    <figure className="flex flex-col gap-4">
      <figcaption className="font-display text-xl font-extrabold uppercase italic">{title}</figcaption>
      <div className="grid grid-cols-3 gap-2 px-2" role="group" aria-label="Label notes by">
        {LABELS.map((l) => (
          <Chip key={l.value} selected={mode === l.value} disabled={l.value === 'finger' && !hasFingers}
            onClick={() => setLabelMode(l.value)} size="sm" className="px-0 disabled:opacity-40">{l.label}</Chip>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 px-2" role="group" aria-label="Show">
        {RANGES.map((r) => (
          <Chip key={r.value} selected={range === r.value} onClick={() => setRange(r.value)} size="sm" className="px-0">{r.label}</Chip>
        ))}
      </div>
      <div className="overflow-x-auto">
        <Fretboard marks={marks} {...frame} labelMode={mode} title={title}
          orientation={wide && range !== 'shape' ? 'horizontal' : 'vertical'} />
      </div>
    </figure>
  );
}
