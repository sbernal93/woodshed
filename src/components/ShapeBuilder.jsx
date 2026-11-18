import { useState } from 'react';
import { CAGED_LAYERS, CAGED_SHAPES, cagedLayers } from '../music/chords.js';
import ArrowButton from './ArrowButton.jsx';
import Chip from './Chip.jsx';
import Fretboard from './Fretboard.jsx';

// What each layer brings, by quality: the line under the diagram as you step through.
const WHY = {
  maj: [
    (r, s) => `Start from the roots: every ${r} inside the ${s} shape.`,
    (r) => `Add the 3rd and 5th and the ${r} chord appears, all over the position.`,
    (r) => `Add the 2nd and 6th: ${r} major pentatonic. Five notes, none of them clash.`,
    (r) => `Add the 4th and 7th: the full ${r} major scale. Each sits a fret from a chord tone, so lean on it, then resolve.`,
  ],
  m: [
    (r, s) => `Start from the roots: every ${r} inside the ${s} minor shape.`,
    (r) => `Add the b3 and 5th: the ${r} minor chord.`,
    (r) => `Add the 4th and b7: ${r} minor pentatonic, the blues box.`,
    (r) => `Add the 2nd and b6: ${r} natural minor. The b6 sits a fret above the 5th and wants to fall back to it.`,
  ],
};

// One CAGED shape filled in a layer at a time, the new notes ringed: how a chord grows into a scale.
export default function ShapeBuilder({ root, quality, shape, onShape }) {
  const [step, setStep] = useState(0);
  const layers = CAGED_LAYERS[quality];
  const marks = cagedLayers({ root, shape, quality, upTo: step });
  const frets = marks.map((m) => m.fret);
  const fromFret = Math.min(...frets);

  return (
    <figure className="flex flex-col gap-4">
      <figcaption className="font-display text-xl font-extrabold uppercase italic">Build the {shape} shape</figcaption>
      <div role="group" aria-label="Shape" className="grid grid-cols-5 gap-2 px-2">
        {Object.keys(CAGED_SHAPES).map((s) => (
          <Chip key={s} selected={s === shape} onClick={() => onShape(s)} size="sm" className="px-0">{s}</Chip>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2">
        <ArrowButton direction="prev" label="Previous layer" disabled={step === 0} onClick={() => setStep(step - 1)} />
        <p aria-live="polite" className="text-center font-display font-extrabold uppercase italic">
          <span className="block text-sm text-ink-soft">{step + 1} of {layers.length}</span>
          <span className="block text-2xl leading-tight">{layers[step].label}</span>
        </p>
        <ArrowButton direction="next" label="Next layer" disabled={step === layers.length - 1} onClick={() => setStep(step + 1)} />
      </div>
      <Fretboard marks={marks} fromFret={fromFret} toFret={Math.max(Math.max(...frets), fromFret + 3)} labelMode="degree"
        title={`${root} ${layers[step].label.toLowerCase()} in the ${shape} shape`} />
      <p className="text-[16px] leading-relaxed text-ink-soft">{WHY[quality][step](root, shape)}{step > 0 && ' New notes are ringed.'}</p>
    </figure>
  );
}
