import { diatonicChords, tonicQuality, playsOver, shapeFits } from '../../src/music/harmony.js';

const names = (chords, k) => chords.map((c) => c[k]);

test('A major diatonic triads and numerals', () => {
  const c = diatonicChords('A', 'major');
  expect(names(c, 'triad')).toEqual(['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim']);
  expect(names(c, 'numeral')).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']);
});
test('A major diatonic sevenths', () =>
  expect(names(diatonicChords('A', 'major'), 'seventh')).toEqual(['Amaj7', 'Bm7', 'C#m7', 'Dmaj7', 'E7', 'F#m7', 'G#m7b5']));
test('D dorian chords', () => {
  const c = diatonicChords('D', 'dorian');
  expect(names(c, 'triad')).toEqual(['Dm', 'Em', 'F', 'G', 'Am', 'Bdim', 'C']);
  expect(names(c, 'numeral')).toEqual(['i', 'ii', 'bIII', 'IV', 'v', 'vi°', 'bVII']);
});
test('F major spells Bb', () => expect(names(diatonicChords('F', 'major'), 'triad')[3]).toBe('Bb'));
test('pentatonic scales have no diatonic table', () => expect(diatonicChords('A', 'minorPentatonic')).toEqual([]));

test('tonic quality follows the third', () => {
  expect(tonicQuality('mixolydian')).toBe('maj');
  expect(tonicQuality('minorPentatonic')).toBe('m');
  expect(tonicQuality('locrian')).toBe(null);
});

test('A minor pentatonic plays over A minor, the A blues I-IV-V and C major', () => {
  const p = playsOver('A', 'minorPentatonic');
  expect(p.chords).toEqual(['Am', 'Am7', 'A7']);
  expect(p.progressions).toEqual([{ name: '12-bar blues', chords: ['A7', 'D7', 'E7'] }]);
  expect(p.relative).toBe('C');
});
test('E major pentatonic plays over E, its I-IV-V and C#m', () => {
  const p = playsOver('E', 'majorPentatonic');
  expect(p.chords).toEqual(['E', 'E6', 'Eadd9']);
  expect(p.progressions).toEqual([{ name: 'I–IV–V', chords: ['E', 'A', 'B'] }]);
  expect(p.relative).toBe('C#m');
});

test('A minor pentatonic box 1 sits inside the E-shape A minor barre', () =>
  expect(shapeFits('A', 'minorPentatonic').E).toBe(1));
test('A major pentatonic: the E shape fits box 1', () =>
  expect(shapeFits('A', 'majorPentatonic').E).toBe(1));
test('every shape maps to a different box', () => {
  const fits = Object.values(shapeFits('A', 'minorPentatonic'));
  expect(new Set(fits).size).toBe(5);
});
