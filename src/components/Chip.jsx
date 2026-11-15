// Skewed selectable chip; the counter-skew keeps the label upright.
export default function Chip({ selected, onClick, children, className = '', ...rest }) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} {...rest}
      className={`min-h-14 -skew-x-12 px-4 font-display text-xl font-extrabold italic tabular-nums transition-colors ${
        selected ? 'bg-chip text-chip-ink shadow-flat' : 'border-2 border-ink text-ink hover:bg-ink/10'} ${className}`}>
      <span className="inline-block skew-x-12">{children}</span>
    </button>
  );
}
