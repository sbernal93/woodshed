import { noteAt, STANDARD_TUNING } from '../music/tuning.js';

const COUNT_WORDS = { 1: [], 2: ['&'], 3: ['trip', 'let'], 4: ['e', '&', 'a'] };

// A rhythm grid: one slot per subdivision of a bar; each slot holds whatever sounds then (empty = let it ring).
export function resolveGrid(spec) {
  const slots = Array.from({ length: spec.slotsPerBeat * spec.beats }, (_, i) =>
    (spec.events[i] ?? []).map(([string, fret, hand]) => ({ string, fret, hand, thumb: hand === 'p', note: noteAt(string, fret).name })));
  return { slots, shape: spec.shape.map(([string, fret]) => ({ string, fret })), slotsPerBeat: spec.slotsPerBeat, beats: spec.beats };
}

export function countLabels(slotsPerBeat, beats) {
  return Array.from({ length: beats }, (_, b) => [String(b + 1), ...COUNT_WORDS[slotsPerBeat]]).flat();
}

export const hzOf = (string, fret) => 440 * 2 ** ((STANDARD_TUNING[string] + fret - 69) / 12);
