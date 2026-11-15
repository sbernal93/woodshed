import Header from '../components/Header.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import FretboardViewer from '../components/FretboardViewer.jsx';

// Dev-only gallery at #lab for checking generated diagrams; not linked from the app.
const SPECS = [
  ...[1, 2, 3, 4, 5].map((position) => ({ title: `A minor pentatonic · position ${position}`, spec: { type: 'pentatonic', root: 'A', quality: 'minor', position } })),
  { title: 'G major · 3 notes per string', spec: { type: 'scale', root: 'G', scale: 'major', position: 1, perString: 3 } },
  ...['C', 'A', 'G', 'E', 'D'].map((shape) => ({ title: `C major · ${shape} shape`, spec: { type: 'caged', root: 'C', shape } })),
];

export default function Lab() {
  return (
    <main className="mx-auto w-full max-w-[1400px] px-5 pb-16 pt-6 lg:px-12 lg:pt-10">
      <Header right={<ThemeToggle />} />
      <h2 className="mt-10 font-display text-3xl font-extrabold uppercase italic">Fretboard lab</h2>
      <div className="mt-8 grid gap-14 md:grid-cols-2 xl:grid-cols-3">
        {SPECS.map((s) => <FretboardViewer key={s.title} {...s} />)}
      </div>
    </main>
  );
}
