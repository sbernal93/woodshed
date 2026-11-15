import { noteAt, STANDARD_TUNING } from '../music/tuning.js';
import { resolveFretboard } from '../music/resolve.js';

const UP = [6, 5, 4, 3, 2, 1];

// Chromatic finger-independence drill: the same finger order on every string, up to the high e and back down.
export function spiderPattern({ startFret = 5, order = [1, 2, 3, 4] }) {
  const string = (s) => order.map((finger) => {
    const fret = startFret + finger - 1;
    return { string: s, fret, finger, note: noteAt(s, fret).name, degree: '', root: false };
  });
  return [...UP, ...[...UP].reverse()].flatMap(string);
}

const pitch = (m) => STANDARD_TUNING[m.string] + m.fret;

// Box notes in pitch order, then overlapping groups (A-C-D, C-D-E…) or skipped pairs (A-D, C-E…).
export function sequencePattern(marks, { group = 3, direction = 'up', skip = false }) {
  const notes = [...marks].sort((a, b) => pitch(a) - pitch(b));
  if (direction === 'down') notes.reverse();
  if (skip) return notes.slice(0, -2).flatMap((n, i) => [n, notes[i + 2]]);
  return notes.slice(0, notes.length - group + 1).flatMap((_, i) => notes.slice(i, i + group));
}

export function resolvePattern(spec) {
  if (spec.type === 'spider') return spiderPattern(spec);
  if (spec.type === 'sequence') return sequencePattern(resolveFretboard(spec.of).marks, spec);
  throw new Error(`unknown pattern type "${spec.type}"`);
}

export function playheadIndex(beats, notesPerBeat, length) {
  return Math.floor(Math.max(0, beats) * notesPerBeat) % length;
}
