import { promptState } from '../session/prompts.js';
import { spell } from '../music/notes.js';

const noteFor = (root, item) => {
  try { return root ? spell(root, item) : null; } catch { return null; }
};

// The live challenge: one big target that changes every few bars, with dots counting down the bars.
export default function StepPrompt({ prompt, elapsedMs, bpm, seed }) {
  const { item, barInWindow, barsPerWindow } = promptState(prompt, elapsedMs, bpm, seed);
  const note = noteFor(prompt.root, item);
  return (
    <section aria-live="polite" className="mt-6 bg-fill px-5 py-4">
      <p className="font-display text-lg font-semibold uppercase italic text-ink-soft">{prompt.label}</p>
      <p className="mt-1 flex items-baseline gap-4">
        <span className="font-display text-6xl font-extrabold italic leading-none text-brand [text-shadow:2px_2px_0_var(--wd-shadow)]">{item}</span>
        {note && <span className="font-display text-3xl font-extrabold italic">{note}</span>}
      </p>
      <ol aria-label={`Bar ${barInWindow + 1} of ${barsPerWindow}`} className="mt-3 flex gap-2">
        {Array.from({ length: barsPerWindow }, (_, i) => (
          <li key={i} className={`size-3 rounded-full ${i <= barInWindow ? 'bg-ink' : 'bg-fill'}`} />
        ))}
      </ol>
    </section>
  );
}
