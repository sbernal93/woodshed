import { useState } from 'react';
import Header from '../components/Header.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import ArrowButton from '../components/ArrowButton.jsx';
import KeyPicker from '../components/KeyPicker.jsx';
import Chip from '../components/Chip.jsx';
import ShapeBuilder from '../components/ShapeBuilder.jsx';
import NeckMap from '../components/NeckMap.jsx';
import { cagedNeck } from '../music/chords.js';
import { cagedHref, triadsHref } from '../routes.js';

const QUALITIES = [{ value: 'maj', label: 'Major' }, { value: 'm', label: 'Minor' }];
// What the neck shows in every position: the chord shapes, or the pentatonic or full scale around them.
const LAYERS = [{ value: undefined, label: 'Chord' }, { value: 2, label: 'Pentatonic' }, { value: 3, label: 'Scale' }];

export default function CagedDetail({ root }) {
  const [view, setView] = useState('maj');
  const [layer, setLayer] = useState(undefined);
  const [shape, setShape] = useState(null);
  const neck = cagedNeck({ root, view, layer });
  // A picked shape stays bright wherever it appears; everything else dims.
  const marks = shape ? neck.marks.map((m) => ({ ...m, muted: !m.shapes.includes(shape) })) : neck.marks;
  const regions = neck.regions.map((r) => ({
    ...r, key: `${r.shape}-${r.from}`, label: r.shape, selected: r.shape === shape, ariaLabel: `${r.shape} shape, frets ${r.from} to ${r.to}`,
  }));
  return (
    <main className="mx-auto w-full max-w-[1400px] px-5 pb-16 pt-6 lg:px-12 lg:pt-10">
      <Header right={<ThemeToggle />} />
      <div className="mt-8 flex items-center gap-3">
        <ArrowButton direction="prev" href="#library" label="Back to scale library" />
        <h2 className="flex items-center gap-3 font-display text-3xl font-extrabold uppercase italic leading-none">
          CAGED in <KeyPicker value={root} onChange={(k) => location.replace(cagedHref(k))} />
        </h2>
      </div>
      <div role="group" aria-label="Chord quality" className="mt-6 grid w-full max-w-md grid-cols-2 gap-2 px-2">
        {QUALITIES.map((v) => (
          <Chip key={v.value} selected={view === v.value} onClick={() => setView(v.value)} size="sm">{v.label}</Chip>
        ))}
      </div>
      <div role="group" aria-label="Show" className="mt-2 grid w-full max-w-md grid-cols-3 gap-2 px-2">
        {LAYERS.map((l) => (
          <Chip key={l.label} selected={layer === l.value} onClick={() => setLayer(l.value)} size="sm" className="px-0">{l.label}</Chip>
        ))}
      </div>

      <div className="mt-10 xl:flex xl:items-start xl:gap-8">
        <div className="min-w-0">
          <NeckMap marks={marks} regions={regions} onPick={(r) => setShape(r.selected ? null : r.shape)}
            title={`${root} ${view === 'm' ? 'minor' : 'major'} ${LAYERS.find((l) => l.value === layer).label.toLowerCase()}: all five CAGED positions on one neck`} />
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
            {layer
              ? 'Pink is the root, solid dots are the rest of the chord, outlined dots are the notes in between. Tap a shape’s tag to see one position and build it up below.'
              : 'Tap a shape’s tag to light it up and build it up below. Tap it again to see them all.'}
          </p>
          <a href={triadsHref(root)} className="mt-2 inline-block min-h-11 py-2 font-display text-lg font-extrabold uppercase italic underline decoration-2 underline-offset-4 hover:text-brand">
            The triads inside these shapes
          </a>
        </div>
        <div className="mt-10 max-w-sm shrink-0 xl:mt-0 xl:w-72">
          <ShapeBuilder key={`${root}-${view}`} root={root} quality={view} shape={shape ?? 'E'} onShape={setShape} />
        </div>
      </div>
    </main>
  );
}
