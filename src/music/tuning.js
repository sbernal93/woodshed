import { noteName } from './notes.js';

// MIDI note of each open string; string 6 is low E.
export const STANDARD_TUNING = { 6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64 };

export function noteAt(string, fret) {
  const midi = STANDARD_TUNING[string] + fret;
  return { midi, pc: midi % 12, name: noteName(midi % 12) };
}
