const SIZES = { md: 'min-h-14 text-xl', sm: 'min-h-11 text-base' };

// Skewed selectable chip; the counter-skew keeps the label upright. sm still clears a 44px tap target.
export default function Chip({ selected, onClick, children, size = 'md', className = '', ...rest }) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} {...rest}
      className={`${SIZES[size]} -skew-x-12 px-4 font-display font-extrabold italic tabular-nums transition-colors ${
        selected ? 'bg-chip text-chip-ink shadow-flat' : 'bg-fill text-ink hover:bg-fill-hover'} ${className}`}>
      <span className="inline-block skew-x-12">{children}</span>
    </button>
  );
}
