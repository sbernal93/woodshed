import { pitchClass, noteName, spell } from '../../src/music/notes.js';
import { STANDARD_TUNING, noteAt } from '../../src/music/tuning.js';

test('open strings are E A D G B E from low to high', () =>
  expect([6, 5, 4, 3, 2, 1].map((s) => noteAt(s, 0).name)).toEqual(['E', 'A', 'D', 'G', 'B', 'E']));
test('low E fret 5 is A', () => expect(noteAt(6, 5).name).toBe('A'));
test('B string fret 1 is C', () => expect(noteAt(2, 1).name).toBe('C'));
test('G string fret 4 is B (major third to the next string)', () => expect(noteAt(3, 4).name).toBe('B'));
test('flats equal sharps', () => {
  expect(pitchClass('Bb')).toBe(pitchClass('A#'));
  expect(pitchClass('Eb')).toBe(3);
});
test('unknown note names throw', () => expect(() => pitchClass('H')).toThrow(/H/));
test('tuning is MIDI E2 A2 D3 G3 B3 E4', () => expect(STANDARD_TUNING).toEqual({ 6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64 }));
test('noteName can prefer flats', () => expect(noteName(10, true)).toBe('Bb'));
test('spell picks the letter from the degree', () => {
  expect(spell('F', '4')).toBe('Bb');
  expect(spell('A', 'b5')).toBe('Eb');
  expect(spell('G', '7')).toBe('F#');
  expect(spell('C', '9')).toBe('D');
});
