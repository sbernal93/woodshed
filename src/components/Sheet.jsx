import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from './icons.jsx';

// Bottom sheet on phones, centred dialog on wide screens; a native <dialog> gives focus trapping and Escape-to-close.
// Portalled to <body> so a sheet opened from inside a heading or label is not read as part of it.
export default function Sheet({ open, onClose, title, children }) {
  const ref = useRef(null);
  const headingId = useId();
  useEffect(() => {
    const d = ref.current;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return createPortal(
    <dialog ref={ref} onClose={onClose} aria-labelledby={headingId}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-0 mt-auto w-full max-w-none bg-bg p-0 text-ink shadow-[0_-2px_0_var(--wd-shadow)] backdrop:bg-black/50 lg:m-auto lg:w-[28rem] lg:shadow-[6px_6px_0_var(--wd-shadow)]">
      <div className="mx-auto max-w-md px-5 pb-8 pt-4">
        <div className="flex items-center justify-between">
          <h2 id={headingId} className="font-display text-2xl font-extrabold uppercase italic">{title}</h2>
          <button type="button" onClick={onClose} aria-label={`Close ${title.toLowerCase()}`} className="grid size-14 place-items-center rounded-full hover:bg-ink/10">
            <CloseIcon className="size-6" />
          </button>
        </div>
        <div className="mt-2">{children}</div>
      </div>
    </dialog>,
    document.body,
  );
}
