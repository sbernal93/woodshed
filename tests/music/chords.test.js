import { chordTones, cagedMarks, cagedScaleMarks, cagedNeck, CAGED_SHAPES } from '../../src/music/chords.js';
import { pitchClass, spell } from '../../src/music/notes.js';
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

test('minor CAGED shapes reproduce the open minor chords', () =>
  expect(Object.keys(CAGED_SHAPES).map((s) => shapeString(cagedMarks({ root: s, shape: s, quality: 'm' }))))
    .toEqual(['x3101x', 'x02210', '310033', '022000', 'xx0231']));
test('every minor CAGED shape for every root sounds only minor-triad tones', () => {
  for (const root of ROOTS) for (const shape of Object.keys(CAGED_SHAPES)) {
    const triad = new Set(chordTones(root, 'm').map(pitchClass));
    const marks = cagedMarks({ root, shape, quality: 'm' });
    for (const m of marks) expect(triad.has(noteAt(m.string, m.fret).pc)).toBe(true);
    expect(marks.some((m) => m.root)).toBe(true);
  }
});

// Major scale in each CAGED position: the scale notes inside the chord shape's frets (one fret below it to its top).
const fretsByString = (marks) => [6, 5, 4, 3, 2, 1].map((s) => marks.filter((m) => m.string === s).map((m) => m.fret).join(',')).join(' ');

test('G major, E shape is the familiar frets 2-5 pattern', () =>
  expect(fretsByString(cagedScaleMarks({ root: 'G', shape: 'E' }))).toBe('2,3,5 2,3,5 2,4,5 2,4,5 3,5 2,3,5'));
test('C major, C shape is open position', () =>
  expect(fretsByString(cagedScaleMarks({ root: 'C', shape: 'C' }))).toBe('0,1,3 0,2,3 0,2,3 0,2 0,1,3 0,1,3'));
test('C major, D shape sits at frets 9-13', () =>
  expect(fretsByString(cagedScaleMarks({ root: 'C', shape: 'D' }))).toBe('10,12,13 10,12 9,10,12 9,10,12 10,12,13 10,12,13'));

test('every key and shape has all seven degrees, 2-4 notes per string, within 5 frets, around its chord', () => {
  for (const root of ROOTS) for (const shape of Object.keys(CAGED_SHAPES)) {
    const marks = cagedScaleMarks({ root, shape });
    expect(new Set(marks.map((m) => m.degree))).toEqual(new Set(['1', '2', '3', '4', '5', '6', '7']));
    for (const s of [6, 5, 4, 3, 2, 1]) expect(marks.filter((m) => m.string === s).length).toBeGreaterThanOrEqual(2);
    for (const s of [6, 5, 4, 3, 2, 1]) expect(marks.filter((m) => m.string === s).length).toBeLessThanOrEqual(4);
    const frets = marks.map((m) => m.fret);
    expect(Math.max(...frets) - Math.min(...frets)).toBeLessThanOrEqual(4);
    for (const c of cagedMarks({ root, shape })) expect(marks.some((m) => m.string === c.string && m.fret === c.fret)).toBe(true);
    for (const m of marks) expect(spell(root, m.degree)).toBe(m.note);
  }
});

test('chord tones are flagged so the shape stands out inside the scale', () => {
  const marks = cagedScaleMarks({ root: 'G', shape: 'E' });
  expect(marks.filter((m) => m.chordTone).map((m) => m.degree).every((d) => ['1', '3', '5'].includes(d))).toBe(true);
  expect(marks.find((m) => m.string === 4 && m.fret === 4)).toMatchObject({ note: 'F#', degree: '7', chordTone: false });
});

test('the CAGED neck for G marks each shape where it sits, repeating past the 12th fret', () => {
  const { regions } = cagedNeck({ root: 'G', view: 'maj' });
  expect(regions.map((r) => `${r.shape} ${r.from}-${r.to}`)).toEqual(['G 0-3', 'E 3-5', 'D 5-8', 'C 7-10', 'A 10-12', 'G 12-15']);
});

test('the CAGED neck has each note once, and only notes from the view', () => {
  for (const view of ['maj', 'm', 'scale']) {
    const { marks } = cagedNeck({ root: 'D', view });
    const keys = marks.map((m) => `${m.string}-${m.fret}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(marks.every((m) => m.fret >= 0 && m.fret <= 15)).toBe(true);
    const allowed = view === 'scale' ? ['1', '2', '3', '4', '5', '6', '7'] : view === 'm' ? ['1', 'b3', '5'] : ['1', '3', '5'];
    expect(marks.every((m) => allowed.includes(m.degree))).toBe(true);
  }
});

test('in the scale view each region spans the scale window around its chord shape', () => {
  const g = cagedNeck({ root: 'G', view: 'scale' }).regions.find((r) => r.shape === 'E');
  expect([g.from, g.to]).toEqual([2, 5]);
});
