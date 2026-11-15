import { parseDegree, pitchClass, spell } from './notes.js';
import { STANDARD_TUNING } from './tuning.js';

export const SCALES = {
  major: ['1', '2', '3', '4', '5', '6', '7'],
  minor: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
  minorPentatonic: ['1', 'b3', '4', '5', 'b7'],
  majorPentatonic: ['1', '2', '3', '5', '6'],
  blues: ['1', 'b3', '4', 'b5', '5', 'b7'],
  ionian: ['1', '2', '3', '4', '5', '6', '7'],
  dorian: ['1', '2', 'b3', '4', '5', '6', 'b7'],
  phrygian: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'],
  lydian: ['1', '2', '3', '#4', '5', '6', '7'],
  mixolydian: ['1', '2', '3', '4', '5', '6', 'b7'],
  aeolian: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
  locrian: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'],
};

const STRINGS_LOW_TO_HIGH = [6, 5, 4, 3, 2, 1];
const mod12 = (n) => ((n % 12) + 12) % 12;

function degreesOf(scale) {
  const degrees = SCALES[scale];
  if (!degrees) throw new Error(`unknown scale "${scale}"`);
  return degrees;
}

export function scaleNotes(root, scale) {
  return degreesOf(scale).map((d) => spell(root, d));
}

// pitch class -> { note, degree } for one scale, so marks carry spelled names.
function degreeMap(root, scale) {
  const rootPc = pitchClass(root);
  return new Map(degreesOf(scale).map((d) => [mod12(rootPc + parseDegree(d).semitones), { note: spell(root, d), degree: d }]));
}

const mark = (string, fret, info, finger) => ({ string, fret, note: info.note, degree: info.degree, finger, root: info.degree === '1' });

export function scaleMarks({ root, scale, fromFret = 0, toFret = 12 }) {
  const map = degreeMap(root, scale);
  const marks = [];
  for (const string of STRINGS_LOW_TO_HIGH) {
    for (let fret = fromFret; fret <= toFret; fret++) {
      const info = map.get(mod12(STANDARD_TUNING[string] + fret));
      if (info) marks.push(mark(string, fret, info, null));
    }
  }
  return marks;
}

// Hand-frame fingering for 2-per-string shapes; per-string 1-2-4 / 1-3-4 for 3-per-string.
function fingerFor(frets, i, perString, frameStart) {
  if (perString !== 3) return Math.min(4, Math.max(1, frets[i] - frameStart + 1));
  if (i === 0) return 1;
  if (i === frets.length - 1) return 4;
  return frets[i + 1] - frets[i] === 1 ? 3 : 2;
}

export function positionMarks({ root, scale, position, perString = 2 }) {
  const degrees = degreesOf(scale);
  const map = degreeMap(root, scale);
  const rootFret = mod12(pitchClass(root) - STANDARD_TUNING[6]);
  // Positions climb the neck from the root: position p starts on scale degree p above the low-E root.
  let midi = STANDARD_TUNING[6] + rootFret + parseDegree(degrees[(position - 1) % degrees.length]).semitones;

  const perStringFrets = STRINGS_LOW_TO_HIGH.map((string) => {
    const frets = [];
    while (frets.length < perString) {
      if (map.has(mod12(midi))) frets.push(midi - STANDARD_TUNING[string]);
      midi++;
    }
    return frets;
  });

  const frameStart = Math.min(...perStringFrets.flat());
  return STRINGS_LOW_TO_HIGH.flatMap((string, s) =>
    perStringFrets[s].map((fret, i) =>
      mark(string, fret, map.get(mod12(STANDARD_TUNING[string] + fret)), fingerFor(perStringFrets[s], i, perString, frameStart))));
}
