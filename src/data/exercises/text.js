import { resolveFretboard } from '../../music/resolve.js';
import { resolvePattern } from '../../session/patterns.js';

// The first few groups of a sequence spelled out, e.g. "A-C-D, C-D-E, D-E-G", so the text always matches the key.
export function firstGroups(spec, size, count = 3) {
  const notes = resolvePattern(spec).map((n) => n.note);
  return Array.from({ length: count }, (_, i) => notes.slice(i * size, i * size + size).join('-')).join(', ');
}

export function fretSpan(spec) {
  const frets = resolveFretboard(spec).marks.map((m) => m.fret);
  return `${Math.min(...frets)}–${Math.max(...frets)}`;
}

export const article = (note) => (/^[AEF]/.test(note) ? 'an' : 'a');
