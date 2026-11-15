import { ArrowIcon } from './icons.jsx';

// 56px hit area around a 44px disc: big enough to hit without looking, small enough that the arrow reads.
export default function ArrowButton({ direction = 'next', label, onClick, disabled }) {
  const disc = direction === 'next'
    ? 'bg-brand text-on-brand shadow-flat'
    : 'border-[2.5px] border-ink text-ink';
  return (
    <button type="button" aria-label={label} onClick={onClick} disabled={disabled}
      className="group grid size-14 place-items-center rounded-full disabled:opacity-40">
      <span className={`grid size-11 place-items-center rounded-full transition-transform group-active:translate-x-px group-active:translate-y-px group-active:shadow-none ${disc}`}>
        <ArrowIcon direction={direction} className="size-[22px]" />
      </span>
    </button>
  );
}
