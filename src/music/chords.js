import { parseDegree, pitchClass, spell } from './notes.js';
import { STANDARD_TUNING } from './tuning.js';
import { scaleMarks } from './scales.js';

export const CHORDS = {
  maj: ['1', '3', '5'],
  m: ['1', 'b3', '5'],
  dim: ['1', 'b3', 'b5'],
  aug: ['1', '3', '#5'],
  7: ['1', '3', '5', 'b7'],
  maj7: ['1', '3', '5', '7'],
  m7: ['1', 'b3', '5', 'b7'],
  m7b5: ['1', 'b3', 'b5', 'b7'],
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

// A scale "in" a CAGED position: the chord shape plus one fret, e.g. G major around the E-shape G barre is frets 2-5.
// Major scales reach a fret below the shape; minor ones a fret above it (A minor around the E-shape Am is 5-8, box 1).
// Chord tones are flagged so the shape shows inside the scale.
export function cagedScaleMarks({ root, shape, scale = 'major', quality = 'maj' }) {
  const chord = cagedMarks({ root, shape, quality });
  const frets = chord.map((m) => m.fret);
  const [below, above] = quality === 'm' ? [0, 1] : [1, 0];
  return scaleMarks({ root, scale, fromFret: Math.max(0, Math.min(...frets) - below), toFret: Math.max(...frets) + above })
    .map((m) => ({ ...m, chordTone: CHORDS[quality].includes(m.degree) }));
}

// How a shape fills in: the root, then the rest of the chord, then the pentatonic, then the full scale.
export const CAGED_LAYERS = {
  maj: [
    { label: 'Root', add: ['1'] }, { label: 'Chord', add: ['3', '5'] },
    { label: 'Major pentatonic', add: ['2', '6'] }, { label: 'Major scale', add: ['4', '7'] },
  ],
  m: [
    { label: 'Root', add: ['1'] }, { label: 'Chord', add: ['b3', '5'] },
    { label: 'Minor pentatonic', add: ['4', 'b7'] }, { label: 'Natural minor', add: ['2', 'b6'] },
  ],
};

// The notes of one shape's window up to layer `upTo`; `added` marks the ones that layer brings in.
export function cagedLayers({ root, shape, quality = 'maj', upTo }) {
  const layers = CAGED_LAYERS[quality];
  const layerOf = (degree) => layers.findIndex((l) => l.add.includes(degree));
  return cagedScaleMarks({ root, shape, quality, scale: quality === 'm' ? 'minor' : 'major' })
    .filter((m) => layerOf(m.degree) <= upTo)
    .map((m) => ({ ...m, added: upTo > 0 && layerOf(m.degree) === upTo }));
}

// All five positions laid along one neck (0-toFret), each placed where it sits and again an octave up if it fits.
// view: 'maj' / 'm'. Without `layer` it shows the chord shapes; with it, each position's window up to that layer.
export function cagedNeck({ root, view, layer, toFret = 15 }) {
  const regions = [];
  const marks = new Map();
  for (const shape of Object.keys(CAGED_SHAPES)) {
    // The neck shows a whole layer at once, so nothing on it is "new".
    const base = layer === undefined ? cagedMarks({ root, shape, quality: view })
      : cagedLayers({ root, shape, quality: view, upTo: layer }).map((m) => ({ ...m, added: false }));
    for (const octave of [0, 12]) {
      const placed = base.map((m) => ({ ...m, fret: m.fret + octave }));
      const frets = placed.map((m) => m.fret);
      if (Math.max(...frets) > toFret) continue;
      regions.push({ shape, from: Math.min(...frets), to: Math.max(...frets) });
      for (const m of placed) {
        const key = `${m.string}-${m.fret}`;
        const seen = marks.get(key);
        if (seen) { if (!seen.shapes.includes(shape)) seen.shapes.push(shape); } else marks.set(key, { ...m, shapes: [shape] });
      }
    }
  }
  return { marks: [...marks.values()], regions: regions.sort((a, b) => a.from - b.from) };
}
