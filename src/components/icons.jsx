const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const ArrowIcon = ({ direction = 'next', className }) => (
  <svg {...base} strokeWidth={3.2} className={className}>
    <path d={direction === 'next' ? 'M4 12h15M13 5l7 7-7 7' : 'M20 12H5M11 5l-7 7 7 7'} />
  </svg>
);
export const PlusIcon = ({ className }) => <svg {...base} className={className}><path d="M12 5v14M5 12h14" /></svg>;
export const MinusIcon = ({ className }) => <svg {...base} className={className}><path d="M5 12h14" /></svg>;
export const PlayIcon = ({ className }) => <svg {...base} className={className}><path d="M7 4.5v15l12-7.5z" fill="currentColor" /></svg>;
export const StopIcon = ({ className }) => <svg {...base} className={className}><rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" /></svg>;
export const SunIcon = ({ className }) => (
  <svg {...base} strokeWidth={2.5} className={className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </svg>
);
export const MoonIcon = ({ className }) => (
  <svg {...base} strokeWidth={2.5} className={className}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
);
export const MetronomeIcon = ({ className }) => (
  <svg {...base} strokeWidth={2.5} className={className}>
    <path d="M9 3h6l4 18H5z" /><path d="M12 15l5-9" /><path d="M7 15h10" />
  </svg>
);
export const CloseIcon = ({ className }) => <svg {...base} className={className}><path d="M6 6l12 12M18 6L6 18" /></svg>;
export const BookIcon = ({ className }) => (
  <svg {...base} strokeWidth={2.5} className={className}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
  </svg>
);
export const PauseIcon = ({ className }) => (
  <svg {...base} className={className}><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" /><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" /></svg>
);
export const CheckIcon = ({ className }) => <svg {...base} className={className}><path d="M5 12.5l4.5 4.5L19 7" /></svg>;
