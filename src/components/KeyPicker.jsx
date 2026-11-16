import { useEffect, useRef } from 'react';
import { KEYS } from '../data/scaleLibrary.js';
import Chip from './Chip.jsx';

// One row: scrolls sideways on phones (current key kept in view), all twelve across on wide screens.
export default function KeyPicker({ value, onChange }) {
  const row = useRef(null);
  useEffect(() => {
    row.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [value]);
  return (
    <div ref={row} role="group" aria-label="Key" className="wd-no-scrollbar flex gap-2 overflow-x-auto px-2 py-1 lg:grid lg:grid-cols-12 lg:overflow-visible">
      {KEYS.map((k) => (
        <Chip key={k} selected={k === value} onClick={() => onChange(k)} size="sm" className="w-12 shrink-0 px-0 lg:w-auto">{k}</Chip>
      ))}
    </div>
  );
}
