import { chordTones, cagedMarks, CAGED_SHAPES } from '../../src/music/chords.js';
import { pitchClass } from '../../src/music/notes.js';
import { noteAt } from '../../src/music/tuning.js';

const ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const shapeString = (marks) => [6, 5, 4, 3, 2, 1].map((s) => marks.find((m) => m.string === s)?.fret ?? 'x').join('');

test('A minor 7 is A C E G', () => expect(chordTones('A', 'm7')).toEqual(['A', 'C', 'E', 'G']));
test('Bb dominant 9 spells Ab and C', () => expect(chordTones('Bb', '9')).toEqual(['Bb', 'D', 'F', 'Ab', 'C']));
test('Dsus4 is D G A', () => expect(chordTones('D', 'sus4')).toEqual(['D', 'G', 'A']));

test('open shapes reproduce the open chords', () =>
  expect(Object.keys(CAGED_SHAPES).map((s) => shapeString(cagedMarks({ root: s, shape: s }))))
    .toEqual(['x32010', 'x02220', '320003', '022100', 'xx0232']));
test('C via the A shape is x35553', () => expect(shapeString(cagedMarks({ root: 'C', shape: 'A' }))).toBe('x35553'));
test('D via the E shape is a fret-10 barre', () => expect(shapeString(cagedMarks({ root: 'D', shape: 'E' }))).toBe('101212111010'));

test('every CAGED shape for every root sounds only triad tones and includes the root', () => {
  for (const root of ROOTS) for (const shape of Object.keys(CAGED_SHAPES)) {
    const triad = new Set(chordTones(root, 'maj').map(pitchClass));
    const marks = cagedMarks({ root, shape });
    for (const m of marks) expect(triad.has(noteAt(m.string, m.fret).pc)).toBe(true);
    expect(marks.some((m) => m.root && noteAt(m.string, m.fret).pc === pitchClass(root))).toBe(true);
    expect(marks.map((m) => m.degree).every((d) => ['1', '3', '5'].includes(d))).toBe(true);
  }
});
