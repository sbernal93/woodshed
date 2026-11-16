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

const SHAPES = ['C', 'A', 'G', 'E', 'D'];

export default function CagedDetail({ root }) {
  const [view, setView] = useState('maj');
  const [shape, setShape] = useState(null);
  const spec = view === 'scale' ? { type: 'caged-scale', root, shape } : { type: 'caged', root, shape, quality: view };
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
      <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
        <div role="group" aria-label="Show" className="grid w-full max-w-md grid-cols-3 gap-2 px-2">
          {VIEWS.map((v) => (
            <Chip key={v.value} selected={view === v.value} onClick={() => setView(v.value)} className="min-h-12 text-base">{v.label}</Chip>
          ))}
        </div>
        <div role="group" aria-label="Highlight a shape" className="grid w-full max-w-md grid-cols-6 gap-2 px-2">
          <Chip selected={!shape} onClick={() => setShape(null)} className="min-h-12 px-0 text-base">All</Chip>
          {SHAPES.map((s) => (
            <Chip key={s} selected={shape === s} onClick={() => setShape(shape === s ? null : s)} className="min-h-12 px-0 text-base">{s}</Chip>
          ))}
        </div>
      </div>

      <div className="mt-10 xl:flex xl:items-start xl:gap-8">
        <div className="min-w-0">
          <CagedNeck root={root} view={view} selected={shape} onSelect={setShape} />
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
            {view === 'scale'
              ? 'Pink is the root, solid dots are the rest of the chord (3 and 5), outlined dots are the notes in between. Pick a shape to see one position.'
              : 'Pick a shape to light it up on the neck and see it up close.'}
          </p>
        </div>
        {shape && (
          <div className="mt-10 max-w-sm shrink-0 xl:mt-0 xl:w-72">
            <FretboardViewer key={`${root}-${view}-${shape}`} title={`${shape} shape up close`} spec={spec} />
          </div>
        )}
      </div>
    </main>
  );
}
