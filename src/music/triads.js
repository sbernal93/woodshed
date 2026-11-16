import { pitchClass, spell } from './notes.js';
import { STANDARD_TUNING } from './tuning.js';
import { CHORDS, cagedNeck } from './chords.js';

// Three adjacent strings, low to high.
export const STRING_SETS = { 321: [3, 2, 1], 432: [4, 3, 2], 543: [5, 4, 3], 654: [6, 5, 4] };
export const TRIAD_QUALITIES = ['maj', 'm', 'dim', 'aug'];

const mod12 = (n) => ((n % 12) + 12) % 12;

// Every close-voiced triad on a string set, up to `toFret`. Inversion 0 has the root in the bass, 1 the third, 2 the fifth.
// Each string takes the next chord tone up from the string below, so the voicing stays inside an octave.
export function triadVoicings({ root, quality, set, toFret = 15 }) {
  const degrees = CHORDS[quality];
  const strings = STRING_SETS[set];
  if (!degrees || degrees.length !== 3) throw new Error(`"${quality}" is not a triad`);
  if (!strings) throw new Error(`unknown string set "${set}"`);
  const voicings = [];
  for (const inversion of [0, 1, 2]) {
    const order = [0, 1, 2].map((k) => degrees[(inversion + k) % 3]);
    let prev = null;
    const close = strings.map((string, k) => {
      const note = spell(root, order[k]);
      const open = STANDARD_TUNING[string];
      prev = prev === null ? open + mod12(pitchClass(note) - open) : prev + (mod12(pitchClass(note) - prev) || 12);
      return { string, fret: prev - open, note, degree: order[k], finger: null, root: order[k] === '1' };
    });
    // A note that would sit below its open string moves the whole voicing up an octave, keeping it close.
    const lift = Math.min(...close.map((m) => m.fret)) < 0 ? 12 : 0;
    const base = close.map((m) => ({ ...m, fret: m.fret + lift }));
    for (const octave of [0, 12]) {
      const marks = base.map((m) => ({ ...m, fret: m.fret + octave }));
      const frets = marks.map((m) => m.fret);
      if (Math.max(...frets) <= toFret) voicings.push({ inversion, marks, from: Math.min(...frets), to: Math.max(...frets) });
    }
  }
  return voicings.sort((a, b) => a.from - b.from || a.to - b.to);
}

// The CAGED shape whose chord contains all three notes of this voicing (major and minor only).
export function cagedShapeOf(voicing, root, quality) {
  if (quality !== 'maj' && quality !== 'm') return null;
  const neck = new Map(cagedNeck({ root, view: quality, toFret: 17 }).marks.map((m) => [`${m.string}-${m.fret}`, m.shapes]));
  const sets = voicing.marks.map((m) => neck.get(`${m.string}-${m.fret}`) ?? []);
  return sets[0].find((shape) => sets.every((s) => s.includes(shape))) ?? null;
}
