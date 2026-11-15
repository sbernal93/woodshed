import { useState } from 'react';
import Header from '../components/Header.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import ArrowButton from '../components/ArrowButton.jsx';
import KeyPicker from '../components/KeyPicker.jsx';
import Chip from '../components/Chip.jsx';
import FretboardViewer from '../components/FretboardViewer.jsx';
import { cagedHref } from '../routes.js';

export default function CagedDetail({ root }) {
  const [quality, setQuality] = useState('maj');
  return (
    <main className="mx-auto w-full max-w-[1400px] px-5 pb-16 pt-6 lg:px-12 lg:pt-10">
      <Header right={<ThemeToggle />} />
      <div className="mt-8 flex items-center gap-3">
        <ArrowButton direction="prev" href="#library" label="Back to scale library" />
        <h2 className="font-display text-3xl font-extrabold uppercase italic leading-none">
          {root}{quality === 'm' ? 'm' : ''} · CAGED
        </h2>
      </div>
      <div className="mt-8"><KeyPicker value={root} onChange={(k) => location.replace(cagedHref(k))} /></div>
      <div role="group" aria-label="Chord quality" className="mt-3 grid max-w-xs grid-cols-2 gap-2 px-2">
        <Chip selected={quality === 'maj'} onClick={() => setQuality('maj')} className="min-h-12 text-base">Major</Chip>
        <Chip selected={quality === 'm'} onClick={() => setQuality('m')} className="min-h-12 text-base">Minor</Chip>
      </div>
      <div className="mt-10 grid gap-14 md:grid-cols-2 xl:grid-cols-3">
        {['C', 'A', 'G', 'E', 'D'].map((shape) => (
          <FretboardViewer key={`${root}-${quality}-${shape}`} title={`${shape} shape`} spec={{ type: 'caged', root, shape, quality }} />
        ))}
      </div>
    </main>
  );
}
