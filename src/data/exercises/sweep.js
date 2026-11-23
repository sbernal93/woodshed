import { CHORDS } from '../../music/chords.js';
import { triadVoicings } from '../../music/triads.js';
import { noteAt } from '../../music/tuning.js';
import { degreeOf } from '../../music/phrase.js';

const tags = ['sweep-picking', 'technique', 'arpeggios', 'picking'];
const INVERSIONS = ['Root position', '1st inversion', '2nd inversion'];
const chordName = (root, quality) => `${root}${quality === 'm' ? 'm' : ''}`;
const mid = (marks) => marks.reduce((sum, m) => sum + m.fret, 0) / marks.length;

// 3-string voicings on G B e, never on open strings (an open string can't be muted by lifting a finger).
const fretted = (root, quality) => triadVoicings({ root, quality, set: '321' }).filter((v) => v.from > 0);
const nearest = (voicings, near) => voicings.reduce((a, b) => (Math.abs(mid(b.marks) - near) < Math.abs(mid(a.marks) - near) ? b : a));

// A 3-string sweep: the triad up, the next chord tone on the e string, back, and down to the B. Six notes: two triplet beats.
// A top note 5 frets away is a slide, not a hammer, so the hand moves instead of stretching.
function sweepOf(root, quality, voicing) {
  const [g, b, e] = voicing.marks;
  let top = e.fret + 1;
  while (!CHORDS[quality].includes(degreeOf(root, noteAt(1, top).name))) top++;
  const [there, back] = top - e.fret > 4 ? ['s', 's'] : ['h', 'p'];
  return { type: 'phrase', key: root, notesPerBeat: 3, notes: [[3, g.fret], [2, b.fret], [1, e.fret], [1, top, there], [1, e.fret, back], [2, b.fret]] };
}
export const threeStringSweep = ({ root, quality, near }) => sweepOf(root, quality, nearest(fretted(root, quality), near));

// One voicing of each inversion around `near`, in the order they climb the neck.
function inversionsUp(root, quality, near) {
  return [0, 1, 2]
    .map((i) => nearest(fretted(root, quality).filter((v) => v.inversion === i), near))
    .sort((a, b) => a.from - b.from)
    .map((v) => ({ label: INVERSIONS[v.inversion], spec: sweepOf(root, quality, v) }));
}

// A-shape 5-string sweeps written in A, root on the A string at fret 12; other keys slide the whole shape.
// Up with one downstroke, hammer to the top, pull off, back down with one upstroke. Twelve notes: four triplet beats.
const FIVE_STRING = {
  m: [[5, 12], [5, 15, 'h'], [4, 14], [3, 14], [2, 13], [1, 12], [1, 17, 'h'], [1, 12, 'p'], [2, 13], [3, 14], [4, 14], [5, 15]],
  maj: [[5, 12], [4, 11], [4, 14, 'h'], [3, 14], [2, 14], [1, 12], [1, 17, 'h'], [1, 12, 'p'], [2, 14], [3, 14], [4, 14], [4, 11, 'p']],
};
const fiveString = (root, quality) => ({ type: 'phrase', key: 'A', root, notesPerBeat: 3, notes: FIVE_STRING[quality] });

const threeString = {
  id: 'sweep-three-string', title: 'The 3-string sweep', roles: ['warmup', 'review', 'focus'], tags, level: 2,
  variants: [{ root: 'A', quality: 'm' }, { root: 'C', quality: 'maj' }, { root: 'E', quality: 'm' }],
  build: ({ root, quality }) => {
    const name = chordName(root, quality);
    const shapes = inversionsUp(root, quality, 8);
    return {
      instruction: `${name} on the G, B and e strings, one inversion every two bars as you climb the neck: ${shapes.map((x) => x.label.toLowerCase()).join(', then ')}. Push the pick through the three strings in one downstroke, slow enough that each note gets its own triplet: a sweep is a slow strum, not three picks. Hammer (or slide) up on the e string and back, and come back down with an upstroke. Lift each finger as the next note sounds, so no two notes ring together. Where two notes sit at the same fret, roll one finger across them.`,
      bpm: { min: 50, max: 110 }, ladder: { by: 4 }, fretboard: null,
      prompt: { label: 'Play', items: shapes.map((x) => x.label), everyBars: 2, order: 'cycle' },
      pattern: { notesPerBeat: 3, byPrompt: Object.fromEntries(shapes.map((x) => [x.label, x.spec])) },
      success: 'Every note is separate and even on the click, with no smear at the top or bottom, at the tempo you set.',
    };
  },
};

const fiveStringSweep = {
  id: 'sweep-five-string', title: 'Five-string sweeps, major and minor', roles: ['review', 'focus'], tags: [...tags, 'caged'], level: 3,
  variants: [{ root: 'A' }, { root: 'C' }, { root: 'D' }],
  build: ({ root }) => ({
    instruction: `The ${root} arpeggio in the A shape across five strings, root on the A string. One downstroke from the A string to the high e, hammer to the top root, pull off, one upstroke back down. Every two bars it switches between minor and major: only the 3rd moves, on the A string and the B string, and the fingering under it changes. Keep the switch on beat 1, and keep the picking hand moving at the same speed in both.`,
    bpm: { min: 50, max: 100 }, ladder: { by: 4 }, fretboard: null,
    prompt: { label: 'Play', items: [`${root}m`, root], everyBars: 2, order: 'cycle' },
    pattern: { notesPerBeat: 3, byPrompt: { [`${root}m`]: fiveString(root, 'm'), [root]: fiveString(root, 'maj') } },
    success: 'Both shapes are clean at the same tempo, the top and bottom turn without a gap, and you can hear the 3rd change.',
  }),
};

// The 3-string sweep nearest the last one, so the hand stays in one area through the changes.
function sweepsThrough(chords, near) {
  let at = near;
  return chords.map(([root, quality]) => {
    const spec = threeStringSweep({ root, quality, near: at });
    at = mid(spec.notes.slice(0, 3).map(([, fret]) => ({ fret })));
    return { label: chordName(root, quality), spec };
  });
}

const progression = {
  id: 'sweep-progression', title: 'Sweep the changes', roles: ['apply'], tags: [...tags, 'triads', 'voice-leading'], level: 3,
  variants: [
    { chords: [['A', 'm'], ['F', 'maj'], ['C', 'maj'], ['G', 'maj']], near: 8 },
    { chords: [['E', 'm'], ['C', 'maj'], ['G', 'maj'], ['D', 'maj']], near: 7 },
    { chords: [['D', 'm'], ['Bb', 'maj'], ['F', 'maj'], ['C', 'maj']], near: 6 },
  ],
  build: ({ chords, near }) => {
    const sweeps = sweepsThrough(chords, near);
    return {
      instruction: `3-string sweeps through ${sweeps.map((s) => s.label).join(', ')}, one chord a bar, each in the inversion closest to the last. Two sweeps per bar, and the change lands on beat 1 with no gap: start moving to the next shape on the last upstroke. If a change smears, loop just those two chords until it doesn't.`,
      bpm: { min: 50, max: 100 }, ladder: { by: 4 }, fretboard: null,
      prompt: { label: 'Chord', items: sweeps.map((s) => s.label), everyBars: 1, order: 'cycle' },
      pattern: { notesPerBeat: 3, byPrompt: Object.fromEntries(sweeps.map((s) => [s.label, s.spec])) },
      success: 'Four bars round and round without a hiccup at any change, every note still separate.',
    };
  },
};

export default [threeString, fiveStringSweep, progression];
