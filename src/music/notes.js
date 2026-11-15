const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11];

const mod12 = (n) => ((n % 12) + 12) % 12;

export function pitchClass(name) {
  const m = /^([A-G])(#{1,2}|b{1,2})?$/.exec(name);
  if (!m) throw new Error(`unknown note name "${name}"`);
  const acc = m[2] ?? '';
  return mod12(LETTER_PC[m[1]] + (acc.startsWith('#') ? acc.length : -acc.length));
}

export function noteName(pc, preferFlats = false) {
  return (preferFlats ? FLATS : SHARPS)[mod12(pc)];
}

// Degree label like '1', 'b3', '#4', '9' -> { number, semitones }.
export function parseDegree(label) {
  const m = /^(b{1,2}|#{1,2})?(\d+)$/.exec(label);
  if (!m) throw new Error(`unknown degree "${label}"`);
  const number = Number(m[2]);
  const acc = m[1] ?? '';
  const octave = Math.floor((number - 1) / 7) * 12;
  const shift = acc.startsWith('#') ? acc.length : -acc.length;
  return { number, semitones: MAJOR_STEPS[(number - 1) % 7] + octave + shift };
}

// Spell by letter: degree n uses the letter n-1 steps above the root's letter.
export function spell(root, degree) {
  const { number, semitones } = parseDegree(degree);
  const letter = LETTERS[(LETTERS.indexOf(root[0]) + number - 1) % 7];
  let diff = mod12(pitchClass(root) + semitones - LETTER_PC[letter]);
  if (diff > 6) diff -= 12;
  return letter + (diff > 0 ? '#'.repeat(diff) : 'b'.repeat(-diff));
}
