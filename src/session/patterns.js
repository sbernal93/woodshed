import { noteAt, STANDARD_TUNING } from '../music/tuning.js';
import { resolveFretboard } from '../music/resolve.js';
import { resolvePhrase } from '../music/phrase.js';

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
  if (spec.type === 'phrase') return resolvePhrase(spec);
  throw new Error(`unknown pattern type "${spec.type}"`);
}

// How many notes the guide groups together: one string for spider, the sequence group, or a skipped pair.
export function groupSizeOf(spec) {
  if (spec.type === 'spider') return (spec.order ?? [1, 2, 3, 4]).length;
  if (spec.type === 'grid') return spec.slotsPerBeat;
  if (spec.type === 'phrase') return spec.notesPerBeat ?? 2;
  return spec.skip ? 2 : spec.group ?? 3;
}

export const SUBDIVISION_NAME = { 1: 'quarters', 2: '8ths', 3: 'triplets', 4: '16ths' };

// Each pattern can carry its own subdivision (groups of 3 in triplets, of 4 in 16ths); otherwise the step's.
export const notesPerBeatOf = (stepPattern, spec) => spec.notesPerBeat ?? stepPattern.notesPerBeat;

export const groupStart = (index, size) => Math.floor(index / size) * size;

const DEMO_MS = { slow: 1100, medium: 650 };

// The guide is a demonstration, not a sync: slow and medium are fixed, 'tempo' matches the step's BPM.
export function demoStepMs(speed, bpm, notesPerBeat) {
  return DEMO_MS[speed] ?? Math.round(60000 / bpm / notesPerBeat);
}

// When the click is running the guide follows it: beat number `count` lights its slots at the click's own audio times.
export function beatSlots(count, slotsPerBeat, beatTime, bpm, length) {
  const gap = 60 / bpm / slotsPerBeat;
  return Array.from({ length: slotsPerBeat }, (_, k) => ({ slot: (count * slotsPerBeat + k) % length, at: beatTime + k * gap }));
}
