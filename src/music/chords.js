import { parseDegree, pitchClass, spell } from './notes.js';
import { STANDARD_TUNING } from './tuning.js';
import { scaleMarks } from './scales.js';

export const CHORDS = {
  maj: ['1', '3', '5'],
  m: ['1', 'b3', '5'],
  7: ['1', '3', '5', 'b7'],
  maj7: ['1', '3', '5', '7'],
  m7: ['1', 'b3', '5', 'b7'],
  9: ['1', '3', '5', 'b7', '9'],
  sus2: ['1', '2', '5'],
  sus4: ['1', '4', '5'],
};

// Open-chord templates, strings 6 -> 1; 'x' = not played.
export const CAGED_SHAPES = { C: 'x32010', A: 'x02220', G: '320003', E: '022100', D: 'xx0232' };
export const CAGED_MINOR_SHAPES = { C: 'x3101x', A: 'x02210', G: '310033', E: '022000', D: 'xx0231' };

const mod12 = (n) => ((n % 12) + 12) % 12;

export function chordTones(root, quality) {
  const degrees = CHORDS[quality];
  if (!degrees) throw new Error(`unknown chord quality "${quality}"`);
  return degrees.map((d) => spell(root, d));
}

export function cagedMarks({ root, shape, quality = 'maj' }) {
  const template = (quality === 'm' ? CAGED_MINOR_SHAPES : CAGED_SHAPES)[shape];
  if (!template) throw new Error(`unknown CAGED shape "${shape}"`);
  const shift = mod12(pitchClass(root) - pitchClass(shape));
  const rootPc = pitchClass(root);
  const byPc = new Map(CHORDS[quality].map((d) => [mod12(rootPc + parseDegree(d).semitones), { note: spell(root, d), degree: d }]));
  return [...template].flatMap((ch, i) => {
    if (ch === 'x') return [];
    const string = 6 - i;
    const fret = Number(ch) + shift;
    const info = byPc.get(mod12(STANDARD_TUNING[string] + fret));
    return [{ string, fret, note: info.note, degree: info.degree, finger: null, root: info.degree === '1' }];
  });
}

// A scale "in" a CAGED position: every scale note from one fret below the chord shape to its top fret,
// e.g. G major around the E-shape G barre is frets 2-5. Chord tones are flagged so the shape shows inside the scale.
export function cagedScaleMarks({ root, shape, scale = 'major' }) {
  const chord = cagedMarks({ root, shape });
  const frets = chord.map((m) => m.fret);
  return scaleMarks({ root, scale, fromFret: Math.max(0, Math.min(...frets) - 1), toFret: Math.max(...frets) })
    .map((m) => ({ ...m, chordTone: ['1', '3', '5'].includes(m.degree) }));
}

// All five positions laid along one neck (0-toFret), each placed where it sits and again an octave up if it fits.
// view: 'maj' / 'm' chord shapes, or 'scale' for the major scale in each position.
export function cagedNeck({ root, view, toFret = 15 }) {
  const regions = [];
  const marks = new Map();
  for (const shape of Object.keys(CAGED_SHAPES)) {
    const base = view === 'scale' ? cagedScaleMarks({ root, shape }) : cagedMarks({ root, shape, quality: view });
    for (const octave of [0, 12]) {
      const placed = base.map((m) => ({ ...m, fret: m.fret + octave }));
      const frets = placed.map((m) => m.fret);
      if (Math.max(...frets) > toFret) continue;
      regions.push({ shape, from: Math.min(...frets), to: Math.max(...frets) });
      for (const m of placed) if (!marks.has(`${m.string}-${m.fret}`)) marks.set(`${m.string}-${m.fret}`, m);
    }
  }
  return { marks: [...marks.values()], regions: regions.sort((a, b) => a.from - b.from) };
}
