import { resolvePhrase, degreeOf, TECHNIQUES } from '../../src/music/phrase.js';
import { STANDARD_TUNING } from '../../src/music/tuning.js';
import { pitchClass } from '../../src/music/notes.js';

const lick = { key: 'A', notes: [[3, 5], [3, 6, 'h'], [2, 5], [1, 5, 'v']] };

test('a phrase in its own key keeps its frets and gets degrees and spelled notes', () => {
  expect(resolvePhrase({ ...lick, root: 'A' }).map((n) => `${n.string}/${n.fret} ${n.note} ${n.degree}${n.tech ? ` ${n.tech}` : ''}`))
    .toEqual(['3/5 C b3', '3/6 C# 3 h', '2/5 E 5', '1/5 A 1 v']);
});

test('moved to another key, every note moves by the same interval and stays on the neck', () => {
  for (const root of ['C', 'D', 'E', 'F', 'G', 'Bb', 'B']) {
    const moved = resolvePhrase({ ...lick, root });
    const original = resolvePhrase({ ...lick, root: 'A' });
    const shift = moved[0].fret - original[0].fret;
    expect(moved.map((n) => n.fret - shift)).toEqual(original.map((n) => n.fret));
    expect(moved.every((n) => n.fret >= 0 && n.fret <= 17)).toBe(true);
    expect(moved.map((n) => n.degree)).toEqual(original.map((n) => n.degree));
    for (const n of moved) expect(pitchClass(n.note)).toBe((STANDARD_TUNING[n.string] + n.fret) % 12);
  }
});

test('degrees cover the chromatic notes', () => {
  expect(degreeOf('A', 'C')).toBe('b3');
  expect(degreeOf('A', 'C#')).toBe('3');
  expect(degreeOf('A', 'G')).toBe('b7');
  expect(degreeOf('A', 'D#')).toBe('b5');
});

test('techniques are named for the guide', () => {
  expect(Object.keys(TECHNIQUES)).toEqual(['h', 'p', 's', 'b', 'v']);
  expect(TECHNIQUES.b).toMatch(/bend/i);
});
