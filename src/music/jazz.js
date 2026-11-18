import { pitchClass, spell } from './notes.js';
import { STANDARD_TUNING } from './tuning.js';
import { CHORDS, cagedMarks } from './chords.js';
import { scaleMarks } from './scales.js';

export const SHELL_QUALITIES = ['maj7', '7', 'm7', 'm7b5'];
// The scale each 7th chord lives in, so arpeggio marks come out spelled and labelled.
const HOME_SCALE = { maj7: 'major', 7: 'mixolydian', m7: 'dorian', m7b5: 'locrian' };

const mod12 = (n) => ((n % 12) + 12) % 12;
const mark = (string, fret, note, degree) => ({ string, fret, note, degree, finger: null, root: degree === '1' });

// Root, 3rd and 7th: root on the 6th string with the 7 and 3 on strings 4 and 3, or root on the 5th with the 3 and 7.
export function shellVoicing({ root, quality, bass }) {
  const [, third, , seventh] = CHORDS[quality] ?? [];
  if (!SHELL_QUALITIES.includes(quality)) throw new Error(`no shell for "${quality}"`);
  if (bass !== 6 && bass !== 5) throw new Error(`shells sit on the 6th or 5th string, not ${bass}`);
  const r = mod12(pitchClass(root) - STANDARD_TUNING[bass]);
  const voices = [[bass, '1'], [4, bass === 6 ? seventh : third], [3, bass === 6 ? third : seventh]];
  // Each upper note takes the fret closest to the root's, so the grip stays inside a hand span.
  const close = voices.map(([string, degree]) => {
    const note = spell(root, degree);
    const fret = r + mod12(pitchClass(note) - STANDARD_TUNING[string] - r + 6) - 6;
    return mark(string, fret, note, degree);
  });
  const lift = Math.min(...close.map((m) => m.fret)) < 0 ? 12 : 0;
  return close.map((m) => ({ ...m, fret: m.fret + lift }));
}

// Whichever shell (either bass string, either octave) has its root closest to `near`: chord changes then move by a fret or two.
export function nearestShell({ root, quality, near, guideTones = false }) {
  const options = [6, 5].flatMap((bass) => {
    const base = shellVoicing({ root, quality, bass });
    return [0, 12].map((o) => base.map((m) => ({ ...m, fret: m.fret + o })));
  });
  const best = options.reduce((a, b) => (Math.abs(b[0].fret - near) < Math.abs(a[0].fret - near) ? b : a));
  return guideTones ? best.slice(1) : best;
}

// A 7th-chord arpeggio inside one CAGED shape: every chord tone from a fret below the shape to its top.
export function cagedArpeggio({ root, shape, quality }) {
  if (!SHELL_QUALITIES.includes(quality)) throw new Error(`no arpeggio for "${quality}"`);
  const chord = cagedMarks({ root, shape, quality: quality.startsWith('m') ? 'm' : 'maj' });
  const frets = chord.map((m) => m.fret);
  const degrees = CHORDS[quality];
  return scaleMarks({ root, scale: HOME_SCALE[quality], fromFret: Math.max(0, Math.min(...frets) - 1), toFret: Math.max(...frets) })
    .filter((m) => degrees.includes(m.degree));
}
