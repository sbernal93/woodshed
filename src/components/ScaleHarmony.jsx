import Fretboard from './Fretboard.jsx';
import { diatonicChords, playsOver, shapeFits, tonicQuality } from '../music/harmony.js';
import { resolveFretboard } from '../music/resolve.js';

const heading = 'font-display text-xl font-extrabold uppercase italic';
const chordName = 'font-display text-2xl font-extrabold italic leading-none';
// Listed in the order they climb the neck for the chosen key.
const SHAPES = ['C', 'A', 'G', 'E', 'D'];

export default function ScaleHarmony({ root, scale, onShowBox }) {
  const diatonic = diatonicChords(root, scale);
  const over = playsOver(root, scale);
  const quality = tonicQuality(scale);
  const fits = shapeFits(root, scale);
  const tonic = quality === 'm' ? `${root}m` : root;

  return (
    <>
      {diatonic.length > 0 && (
        <section aria-labelledby="dia-h" className="mt-12">
          <h3 id="dia-h" className={heading}>Chords in this key</h3>
          <p className="mt-1 text-[15px] text-ink-soft">Built from the scale's own notes. Any of these can back the scale.</p>
          <ol className="mt-4 grid grid-cols-4 gap-x-3 gap-y-6 lg:grid-cols-7">
            {diatonic.map((c, i) => (
              <li key={c.numeral} className="border-t-2 border-line pt-2">
                <span className="block font-display text-lg font-semibold italic text-ink-soft">{c.numeral}</span>
                <span className={`${chordName} block ${i === 0 ? 'text-brand' : ''}`}>{c.triad}</span>
                <span className="mt-1 block text-[15px]">{c.seventh}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {over && (
        <section aria-labelledby="over-h" className="mt-12">
          <h3 id="over-h" className={heading}>Sounds good over</h3>
          <dl className="mt-4 grid gap-5 sm:grid-cols-3">
            <div>
              <dt className="text-[15px] text-ink-soft">Home chords</dt>
              <dd className={`${chordName} mt-1`}>{over.chords.join('  ·  ')}</dd>
            </div>
            {over.progressions.map((p) => (
              <div key={p.name}>
                <dt className="text-[15px] text-ink-soft">{p.name}</dt>
                <dd className={`${chordName} mt-1`}>{p.chords.join(' → ')}</dd>
              </div>
            ))}
            <div>
              <dt className="text-[15px] text-ink-soft">Same notes as</dt>
              <dd className={`${chordName} mt-1`}>{over.relative} {quality === 'm' ? 'major' : 'minor'} pentatonic</dd>
            </div>
          </dl>
        </section>
      )}

      {quality && (
        <section aria-labelledby="shapes-h" className="mt-12">
          <h3 id="shapes-h" className={heading}>{tonic} chord shapes · CAGED</h3>
          <p className="mt-1 text-[15px] text-ink-soft">The home chord in five places, low to high on the neck. Solo over a shape and you're never far from a chord tone.</p>
          <ul className="mt-6 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {SHAPES.map((shape) => ({ shape, ...resolveFretboard({ type: 'caged', root, shape, quality }) }))
              .sort((a, b) => a.fromFret - b.fromFret)
              .map(({ shape, marks, fromFret, toFret }) => (
                <li key={shape} className="flex flex-col items-center gap-3">
                  <span className="font-display text-lg font-extrabold uppercase italic">{shape} shape</span>
                  <Fretboard marks={marks} fromFret={fromFret} toFret={toFret} labelMode="degree" title={`${tonic} chord, ${shape} shape`} />
                  {fits[shape] && (
                    <button type="button" onClick={() => onShowBox(fits[shape])}
                      className="mt-auto min-h-12 px-3 font-display text-lg font-semibold uppercase italic underline decoration-2 underline-offset-4 hover:text-brand">
                      Sits in box {fits[shape]}
                    </button>
                  )}
                </li>
              ))}
          </ul>
        </section>
      )}
    </>
  );
}
