import { useEffect, useRef } from 'react';
import MetronomePanel from './MetronomePanel.jsx';
import { CloseIcon } from './icons.jsx';

// Native <dialog> gives focus trapping and Escape-to-close for free.
export default function MetronomeSheet({ open, onClose, m }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="sheet-h"
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-0 mt-auto w-full max-w-none bg-bg p-0 text-ink shadow-[0_-2px_0_var(--wd-shadow)] backdrop:bg-black/50">
      <div className="mx-auto max-w-md px-5 pb-8 pt-4">
        <div className="flex items-center justify-between">
          <h2 id="sheet-h" className="font-display text-2xl font-extrabold uppercase italic">Metronome</h2>
          <button type="button" onClick={onClose} aria-label="Close metronome" className="grid size-14 place-items-center rounded-full hover:bg-ink/10">
            <CloseIcon className="size-6" />
          </button>
        </div>
        <div className="mt-2"><MetronomePanel m={m} /></div>
      </div>
    </dialog>
  );
}
