import { spell } from '../music/notes.js';

const noteFor = (root, item) => {
  try { return root ? spell(root, item) : null; } catch { return null; }
};

// "A7 (I)" reads as a chord over its numeral in the chart.
const split = (item) => item.match(/^(.*) \((.*)\)$/)?.slice(1) ?? [item, null];

// The live challenge: one big target that changes every few bars, with dots counting down the bars.
// A cycle of 3 or more also shows the whole chart, the current cell lit and the next one outlined, so you can see the change coming.
export default function StepPrompt({ prompt, state }) {
  const { item, index, barInWindow, barsPerWindow } = state;
  const note = noteFor(prompt.root, item);
  const n = prompt.items.length;
  const chart = prompt.order === 'cycle' && n >= 3;
  const next = (index + 1) % n;
  return (
    <section aria-live="polite" className="mt-4 bg-fill px-4 py-3">
      <p className="font-display text-lg font-semibold uppercase italic text-ink-soft">{prompt.label}</p>
      <p className="mt-1 flex items-baseline gap-4">
        <span className="font-display text-4xl font-extrabold italic leading-none text-brand lg:text-6xl [text-shadow:2px_2px_0_var(--wd-shadow)]">{item}</span>
        {note && <span className="font-display text-3xl font-extrabold italic">{note}</span>}
      </p>
      {barsPerWindow > 1 && (
        <ol aria-label={`Bar ${barInWindow + 1} of ${barsPerWindow}`} className="mt-3 flex gap-2">
          {Array.from({ length: barsPerWindow }, (_, i) => (
            <li key={i} className={`size-3 rounded-full ${i <= barInWindow ? 'bg-ink' : 'bg-fill'}`} />
          ))}
        </ol>
      )}
      {chart && (
        <ol aria-label={`Next: ${prompt.items[next]}`} className={`mt-3 grid gap-1 ${n % 4 === 0 ? 'grid-cols-4' : 'grid-cols-3'}`}>
          {prompt.items.map((it, i) => {
            const [main, sub] = split(it);
            const look = i === index ? 'bg-brand text-on-brand' : i === next ? 'bg-bg ring-2 ring-inset ring-ink' : 'bg-bg text-ink-soft';
            return (
              <li key={i} aria-current={i === index ? 'step' : undefined} className={`px-2 py-1.5 font-display italic leading-tight ${look}`}>
                <span className="block text-base font-extrabold">{main}</span>
                {sub && <span className="block text-xs font-semibold">{sub}</span>}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
