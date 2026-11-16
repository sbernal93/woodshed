import { pitchClass, spell } from './notes.js';
import { STANDARD_TUNING } from './tuning.js';

export const TECHNIQUES = {
  h: 'hammer on',
  p: 'pull off',
  s: 'slide into it',
  b: 'bend up a whole step',
  v: 'vibrato',
};

const DEGREES = ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
const mod12 = (n) => ((n % 12) + 12) % 12;
const MAX_FRET = 17;

export const degreeOf = (root, note) => DEGREES[mod12(pitchClass(note) - pitchClass(root))];

// A lick written as [string, fret, technique?] in `key`, moved to `root` by the smallest shift that keeps it on the neck.
export function resolvePhrase({ notes, key, root = key }) {
  const up = mod12(pitchClass(root) - pitchClass(key));
  const shift = [up, up - 12].sort((a, b) => Math.abs(a) - Math.abs(b))
    .find((d) => notes.every(([, fret]) => fret + d >= 0 && fret + d <= MAX_FRET));
  if (shift === undefined) throw new Error(`phrase in ${key} does not fit on the neck in ${root}`);
  return notes.map(([string, written, tech]) => {
    const fret = written + shift;
    const degree = DEGREES[mod12(STANDARD_TUNING[string] + fret - pitchClass(root))];
    return { string, fret, note: spell(root, degree), degree, finger: null, root: degree === '1', ...(tech ? { tech } : {}) };
  });
}
