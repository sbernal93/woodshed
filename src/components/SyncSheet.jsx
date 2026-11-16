import { useState } from 'react';
import Sheet from './Sheet.jsx';
import { progress, syncEnabled, useProgress } from '../progress/useProgress.js';

const label = 'font-display text-base font-semibold uppercase italic text-ink-soft';
const action = 'min-h-12 bg-brand px-5 font-display text-lg font-extrabold uppercase italic text-on-brand shadow-flat active:translate-x-px active:translate-y-px active:shadow-none disabled:opacity-60';

// No accounts: the sync code is the identity. Same code on two devices means the same history.
export default function SyncSheet({ open, onClose }) {
  const { deviceId, pending } = useProgress();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(deviceId);
      setStatus('Copied.');
    } catch {
      setStatus('Copy failed: select the code and copy it by hand.');
    }
  };
  const link = async (e) => {
    e.preventDefault();
    try {
      await progress.useSyncCode(code);
      setCode('');
      setStatus('Linked. Both devices now share one history.');
    } catch (err) {
      setStatus(`${err.message}. It looks like 8-4-4-4-12 letters and digits.`);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Sync devices">
      {!syncEnabled && <p className="text-[16px]">Sync isn't set up in this build, so history stays on this device.</p>}
      <p className={`${label} mt-2`}>This device's code</p>
      <div className="mt-1 flex items-center gap-2">
        <code className="min-w-0 flex-1 select-all break-all bg-fill px-3 py-2 text-[15px]">{deviceId}</code>
        <button type="button" onClick={copy} className={action}>Copy</button>
      </div>
      <p className="mt-2 text-[15px] text-ink-soft">
        Keep it private: anyone with the code can read and change your history.
        {pending.length > 0 && ` ${pending.length} ${pending.length === 1 ? 'entry is' : 'entries are'} waiting to sync.`}
      </p>

      <form onSubmit={link} className="mt-6">
        <label htmlFor="sync-code" className={label}>Use a code from another device</label>
        <div className="mt-1 flex gap-2">
          <input id="sync-code" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" spellCheck="false"
            className="min-h-12 min-w-0 flex-1 bg-fill px-3 text-[16px] outline-offset-2 focus:outline-2 focus:outline-brand" />
          <button type="submit" disabled={!code.trim() || !syncEnabled} className={action}>Link</button>
        </div>
      </form>
      <p role="status" className="mt-3 min-h-6 text-[15px]">{status}</p>
    </Sheet>
  );
}
