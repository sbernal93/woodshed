import { triadVoicings, cagedShapeOf, STRING_SETS, TRIAD_QUALITIES } from '../../src/music/triads.js';
import { chordTones } from '../../src/music/chords.js';
import { STANDARD_TUNING } from '../../src/music/tuning.js';
import { pitchClass } from '../../src/music/notes.js';

const ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const INV = ['root', 'first', 'second'];
const shapes = (vs) => vs.map((v) => `${INV[v.inversion]} ${v.marks.map((m) => m.fret).join('-')}`);

test('C major on the top three strings: the shapes everyone learns', () =>
  expect(shapes(triadVoicings({ root: 'C', quality: 'maj', set: '321' })))
    .toEqual(['second 0-1-0', 'root 5-5-3', 'first 9-8-8', 'second 12-13-12']));

test('C major on strings 4-3-2', () =>
  expect(shapes(triadVoicings({ root: 'C', quality: 'maj', set: '432' })))
    .toEqual(['first 2-0-1', 'second 5-5-5', 'root 10-9-8', 'first 14-12-13']));

test('qualities spell correctly', () => {
  expect(chordTones('C', 'dim')).toEqual(['C', 'Eb', 'Gb']);
  expect(chordTones('C', 'aug')).toEqual(['C', 'E', 'G#']);
  expect(TRIAD_QUALITIES).toEqual(['maj', 'm', 'dim', 'aug']);
});

test('every voicing in every key, quality and string set is a close triad with the right bass', () => {
  for (const root of ROOTS) for (const quality of TRIAD_QUALITIES) for (const set of Object.keys(STRING_SETS)) {
    const voicings = triadVoicings({ root, quality, set });
    expect(new Set(voicings.map((v) => v.inversion))).toEqual(new Set([0, 1, 2]));
    const tones = chordTones(root, quality);
    for (const v of voicings) {
      expect(v.marks.map((m) => m.string)).toEqual(STRING_SETS[set]);
      const pitches = v.marks.map((m) => STANDARD_TUNING[m.string] + m.fret);
      expect(pitches[1] > pitches[0] && pitches[2] > pitches[1]).toBe(true);
      expect(pitches[2] - pitches[0]).toBeLessThan(12);
      expect(new Set(v.marks.map((m) => m.note))).toEqual(new Set(tones));
      expect(v.marks[0].note).toBe(tones[v.inversion]);
      expect(v.marks.every((m) => m.fret >= 0 && m.fret <= 15)).toBe(true);
      for (const m of v.marks) expect(pitchClass(m.note)).toBe((STANDARD_TUNING[m.string] + m.fret) % 12);
    }
  }
});

test('each major or minor triad names the CAGED shape it sits in', () => {
  const [open, root, first] = triadVoicings({ root: 'C', quality: 'maj', set: '321' });
  expect(cagedShapeOf(open, 'C', 'maj')).toBe('C');
  expect(cagedShapeOf(root, 'C', 'maj')).toBe('A');
  expect(cagedShapeOf(first, 'C', 'maj')).toBe('E');
  expect(cagedShapeOf(triadVoicings({ root: 'C', quality: 'dim', set: '321' })[0], 'C', 'dim')).toBe(null);
});
