import Chip from './Chip.jsx';
import { RATINGS } from '../progress/history.js';

// Three big choices, one tap: this is what moves the next session's starting tempo.
export default function RateStep({ title, bpm, rating, onRate, compact = false }) {
  return (
    <div>
      {!compact && (
        <p className="font-display text-lg font-extrabold uppercase italic">
          How was {title}{bpm ? ` at ${bpm}` : ''}?
        </p>
      )}
      <div role="group" aria-label={`Rate ${title}`} className="mt-2 grid grid-cols-3 gap-3 px-2">
        {Object.entries(RATINGS).map(([value, label]) => (
          <Chip key={value} selected={rating === Number(value)} onClick={() => onRate(Number(value))}>
            {label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
