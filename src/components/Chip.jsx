// Skewed selectable chip; the counter-skew keeps the label upright.
export default function Chip({ selected, onClick, children, className = '', ...rest }) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} {...rest}
      className={`min-h-14 -skew-x-12 px-4 font-display text-xl font-extrabold italic tabular-nums transition-colors ${
        selected ? 'bg-chip text-chip-ink shadow-flat' : 'bg-fill text-ink hover:bg-fill-hover'} ${className}`}>
      <span className="inline-block skew-x-12">{children}</span>
    </button>
  );
}
