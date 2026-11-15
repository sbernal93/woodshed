import { KEYS } from '../data/scaleLibrary.js';
import Chip from './Chip.jsx';

export default function KeyPicker({ value, onChange }) {
  return (
    <div role="group" aria-label="Key" className="grid grid-cols-6 gap-2 px-2 lg:grid-cols-12">
      {KEYS.map((k) => (
        <Chip key={k} selected={k === value} onClick={() => onChange(k)} className="min-h-12 px-0 text-lg">{k}</Chip>
      ))}
    </div>
  );
}
