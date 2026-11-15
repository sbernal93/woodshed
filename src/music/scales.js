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

const PER_STRING = { 5: 2, 7: 3 };
const MAX_POSITION_FRET = 17;

// Fret 0 is open (no finger). 2-per-string shapes use the hand frame; 3-per-string strings use 1-2-4 / 1-3-4.
function fingersFor(frets, perString, frameStart) {
  const fretted = frets.filter((f) => f > 0);
  return frets.map((f) => {
    if (f === 0) return null;
    if (perString !== 3) return Math.min(4, Math.max(1, f - frameStart + 1));
    if (fretted.length < 3) return Math.min(4, 1 + f - fretted[0]);
    const i = fretted.indexOf(f);
    if (i === 0) return 1;
    if (i === fretted.length - 1) return 4;
    return fretted[i + 1] - f === 1 ? 3 : 2;
  });
}

export function positionMarks({ root, scale, position, perString }) {
  const degrees = degreesOf(scale);
  const expected = PER_STRING[degrees.length];
  if (!expected || (perString !== undefined && perString !== expected)) {
    throw new Error(`${scale} has no ${perString ?? ''} notes per string pattern; use ${expected ?? 'scaleMarks'} per string`);
  }
  if (!Number.isInteger(position) || position < 1 || position > degrees.length) {
    throw new Error(`position must be 1-${degrees.length} for ${scale}, got ${position}`);
  }
  const map = degreeMap(root, scale);
  const rootFret = mod12(pitchClass(root) - STANDARD_TUNING[6]);
  // Positions climb the neck from the root: position p starts on scale degree p above the low-E root.
  let midi = STANDARD_TUNING[6] + rootFret + parseDegree(degrees[position - 1]).semitones;

  let perStringFrets = STRINGS_LOW_TO_HIGH.map((string) => {
    const frets = [];
    while (frets.length < expected) {
      if (map.has(mod12(midi))) frets.push(midi - STANDARD_TUNING[string]);
      midi++;
    }
    return frets;
  });

  // Keep every shape on a playable neck: up an octave if it dips behind the nut, down one if it runs past fret 17.
  const all = perStringFrets.flat();
  const shift = Math.min(...all) < 0 ? 12 : Math.max(...all) > MAX_POSITION_FRET ? -12 : 0;
  perStringFrets = perStringFrets.map((frets) => frets.map((f) => f + shift));

  // Open-position shapes sit in first position (finger n on fret n).
  const shifted = perStringFrets.flat();
  const frameStart = shifted.includes(0) ? 1 : Math.min(...shifted);
  return STRINGS_LOW_TO_HIGH.flatMap((string, s) => {
    const fingers = fingersFor(perStringFrets[s], expected, frameStart);
    return perStringFrets[s].map((fret, i) => mark(string, fret, map.get(mod12(STANDARD_TUNING[string] + fret)), fingers[i]));
  });
}
