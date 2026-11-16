import { useState } from 'react';
import Header from '../components/Header.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import ArrowButton from '../components/ArrowButton.jsx';
import KeyPicker from '../components/KeyPicker.jsx';
import Chip from '../components/Chip.jsx';
import FretboardViewer from '../components/FretboardViewer.jsx';
import CagedNeck from '../components/CagedNeck.jsx';
import { cagedHref } from '../routes.js';

const VIEWS = [
  { value: 'maj', label: 'Major' },
  { value: 'm', label: 'Minor' },
  { value: 'scale', label: 'Major scale' },
];

export default function CagedDetail({ root }) {
  const [view, setView] = useState('maj');
  const spec = (shape) => (view === 'scale' ? { type: 'caged-scale', root, shape } : { type: 'caged', root, shape, quality: view });
  return (
    <main className="mx-auto w-full max-w-[1400px] px-5 pb-16 pt-6 lg:px-12 lg:pt-10">
      <Header right={<ThemeToggle />} />
      <div className="mt-8 flex items-center gap-3">
        <ArrowButton direction="prev" href="#library" label="Back to scale library" />
        <h2 className="font-display text-3xl font-extrabold uppercase italic leading-none">
          {root}{view === 'm' ? 'm' : ''}{view === 'scale' ? ' major scale' : ''} · CAGED
        </h2>
      </div>
      <div className="mt-8"><KeyPicker value={root} onChange={(k) => location.replace(cagedHref(k))} /></div>
      <div role="group" aria-label="Show" className="mt-3 grid max-w-md grid-cols-3 gap-2 px-2">
        {VIEWS.map((v) => (
          <Chip key={v.value} selected={view === v.value} onClick={() => setView(v.value)} className="min-h-12 text-base">{v.label}</Chip>
        ))}
      </div>
      {view === 'scale' && (
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed">
          The major scale in each of the five positions. Every note sits inside the chord shape's frets, so the shape is your map:
          the pink dot is the root, solid dots are the rest of the chord (3 and 5), and outlined dots are the notes in between.
        </p>
      )}
      <div className="mt-10"><CagedNeck root={root} view={view} /></div>
      <h3 className="mt-14 font-display text-2xl font-extrabold uppercase italic">One position at a time</h3>
      <div className="mt-6 grid gap-14 md:grid-cols-2 xl:grid-cols-3">
        {['C', 'A', 'G', 'E', 'D'].map((shape) => (
          <FretboardViewer key={`${root}-${view}-${shape}`} title={`${shape} shape`} spec={spec(shape)} />
        ))}
      </div>
    </main>
  );
}
