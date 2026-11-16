import { useState } from 'react';
import Header from '../components/Header.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import ArrowButton from '../components/ArrowButton.jsx';
import KeyPicker from '../components/KeyPicker.jsx';
import Chip from '../components/Chip.jsx';
import NeckMap from '../components/NeckMap.jsx';
import { triadVoicings, cagedShapeOf, STRING_SETS } from '../music/triads.js';
import { chordTones } from '../music/chords.js';
import { triadsHref, cagedHref } from '../routes.js';

const QUALITIES = [
  { value: 'maj', label: 'Major', suffix: '' },
  { value: 'm', label: 'Minor', suffix: 'm' },
  { value: 'dim', label: 'Dim', suffix: 'dim' },
  { value: 'aug', label: 'Aug', suffix: 'aug' },
];
const SET_NAMES = { 321: 'G B e', 432: 'D G B', 543: 'A D G', 654: 'E A D' };
const INVERSION = [
  { short: 'R', long: 'Root position', bass: 'root' },
  { short: '1st', long: '1st inversion', bass: '3rd' },
  { short: '2nd', long: '2nd inversion', bass: '5th' },
];

export default function TriadsDetail({ root }) {
  const [quality, setQuality] = useState('maj');
  const [set, setSet] = useState('321');
  const [picked, setPicked] = useState(null);
  const voicings = triadVoicings({ root, quality, set });
  const keyOf = (v) => `${v.inversion}-${v.from}`;
  const chosen = voicings.find((v) => keyOf(v) === picked);
  const name = `${root}${QUALITIES.find((q) => q.value === quality).suffix}`;

  const marks = voicings.flatMap((v) => v.marks.map((m) => ({ ...m, muted: Boolean(chosen) && v !== chosen })));
  const regions = voicings.map((v) => {
    const shape = cagedShapeOf(v, root, quality);
    return {
      key: keyOf(v), from: v.from, to: v.to, label: INVERSION[v.inversion].short, selected: v === chosen,
      ariaLabel: `${INVERSION[v.inversion].long}, frets ${v.from} to ${v.to}${shape ? `, inside the ${shape} shape` : ''}`,
    };
  });
  const change = (fn) => (value) => { setPicked(null); fn(value); };

  return (
    <main className="mx-auto w-full max-w-[1400px] px-5 pb-16 pt-6 lg:px-12 lg:pt-10">
      <Header right={<ThemeToggle />} />
      <div className="mt-8 flex items-center gap-3">
        <ArrowButton direction="prev" href="#library" label="Back to scale library" />
        <h2 className="flex items-center gap-3 font-display text-3xl font-extrabold uppercase italic leading-none">
          <KeyPicker value={root} onChange={(k) => location.replace(triadsHref(k))} /> Triads
        </h2>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
        <div role="group" aria-label="Chord" className="grid w-full max-w-md grid-cols-4 gap-2 px-2">
          {QUALITIES.map((q) => (
            <Chip key={q.value} selected={quality === q.value} onClick={() => change(setQuality)(q.value)} size="sm" className="px-0">{q.label}</Chip>
          ))}
        </div>
        <div role="group" aria-label="Strings" className="grid w-full max-w-md grid-cols-4 gap-2 px-2">
          {Object.keys(STRING_SETS).map((s) => (
            <Chip key={s} selected={set === s} onClick={() => change(setSet)(s)} size="sm" className="px-0">{SET_NAMES[s]}</Chip>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <NeckMap marks={marks} regions={regions} onPick={(r) => setPicked(r.selected ? null : r.key)}
          title={`${name} triads on the ${SET_NAMES[set]} strings`} />
      </div>

      <div className="mt-3 max-w-2xl text-[16px] leading-relaxed">
        {chosen ? (
          <p>
            <span className="font-display text-xl font-extrabold uppercase italic">{INVERSION[chosen.inversion].long}</span>
            {' · '}the {INVERSION[chosen.inversion].bass} ({chosen.marks[0].note}) in the bass, frets {chosen.from}–{chosen.to}
            {cagedShapeOf(chosen, root, quality) && <>, inside the <a href={cagedHref(root)} className="underline decoration-2 underline-offset-4 hover:text-brand">{cagedShapeOf(chosen, root, quality)} shape</a></>}.
          </p>
        ) : (
          <p className="text-ink-soft">
            {name} is {chordTones(root, quality).join(' ')}. Three notes on three strings, in three orders: R has the root on the bottom,
            1st the 3rd, 2nd the 5th. Tap one to see where it sits.
          </p>
        )}
      </div>
    </main>
  );
}
