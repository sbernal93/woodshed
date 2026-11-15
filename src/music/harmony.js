import { parseDegree, spell } from './notes.js';
import { SCALES, positionMarks, scaleNotes } from './scales.js';
import { CAGED_SHAPES, cagedMarks } from './chords.js';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const mod12 = (n) => ((n % 12) + 12) % 12;
const TRIADS = { '4,7': { suffix: '', upper: true, mark: '' }, '3,7': { suffix: 'm', upper: false, mark: '' }, '3,6': { suffix: 'dim', upper: false, mark: '°' }, '4,8': { suffix: 'aug', upper: true, mark: '+' } };
const SEVENTHS = { '4,7,11': 'maj7', '4,7,10': '7', '3,7,10': 'm7', '3,7,11': 'mMaj7', '3,6,10': 'm7b5', '3,6,9': 'dim7', '4,8,11': 'maj7#5' };

// Chords built by stacking thirds inside a 7-note scale.
export function diatonicChords(root, scale) {
  const degrees = SCALES[scale];
  if (degrees.length !== 7) return [];
  const notes = scaleNotes(root, scale);
  const semis = degrees.map((d) => parseDegree(d).semitones);
  return degrees.map((degree, i) => {
    const at = (step) => mod12(semis[(i + step) % 7] - semis[i]);
    const triad = TRIADS[`${at(2)},${at(4)}`];
    const accidental = degree.replace(/\d+/, '');
    const roman = ROMAN[i];
    return {
      numeral: accidental + (triad.upper ? roman : roman.toLowerCase()) + triad.mark,
      triad: notes[i] + triad.suffix,
      seventh: notes[i] + SEVENTHS[`${at(2)},${at(4)},${at(6)}`],
    };
  });
}

export function tonicQuality(scale) {
  const degrees = SCALES[scale];
  if (degrees.includes('3')) return 'maj';
  if (degrees.includes('b3') && degrees.includes('5')) return 'm';
  return null;
}

// Rule-of-thumb backing chords for the 5- and 6-note scales that have no diatonic table.
export function playsOver(root, scale) {
  if (scale === 'minorPentatonic' || scale === 'blues') {
    return {
      chords: [`${root}m`, `${root}m7`, `${root}7`],
      progressions: [{ name: '12-bar blues', chords: [`${root}7`, `${spell(root, '4')}7`, `${spell(root, '5')}7`] }],
      relative: spell(root, 'b3'),
    };
  }
  if (scale === 'majorPentatonic') {
    return {
      chords: [root, `${root}6`, `${root}add9`],
      progressions: [{ name: 'I–IV–V', chords: [root, spell(root, '4'), spell(root, '5')] }],
      relative: `${spell(root, '6')}m`,
    };
  }
  return null;
}

// Which pentatonic box each CAGED shape of the tonic chord sits inside, by shared string/fret spots.
export function shapeFits(root, scale) {
  if (SCALES[scale].length !== 5) return {};
  const quality = tonicQuality(scale);
  const boxes = [1, 2, 3, 4, 5].map((p) => new Set(positionMarks({ root, scale, position: p }).map((m) => `${m.string}-${m.fret}`)));
  const fits = {};
  for (const shape of Object.keys(CAGED_SHAPES)) {
    const marks = cagedMarks({ root, shape, quality });
    let best = { position: null, overlap: 0 };
    for (const offset of [-12, 0, 12]) {
      if (marks.some((m) => m.fret + offset < 0)) continue;
      boxes.forEach((box, i) => {
        const overlap = marks.filter((m) => box.has(`${m.string}-${m.fret + offset}`)).length;
        if (overlap > best.overlap) best = { position: i + 1, overlap };
      });
    }
    fits[shape] = best.position;
  }
  return fits;
}
