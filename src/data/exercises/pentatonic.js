import { resolveFretboard } from '../../music/resolve.js';
import { resolvePattern } from '../../session/patterns.js';

const box = (root, position) => ({ type: 'pentatonic', root, quality: 'minor', position });
const BOXES = [{ root: 'A', position: 1 }, { root: 'A', position: 2 }, { root: 'E', position: 1 }];

// The first few groups of a sequence spelled out, e.g. "A-C-D, C-D-E, D-E-G", so the text always matches the key.
function firstGroups(spec, size, count = 3) {
  const notes = resolvePattern(spec).map((n) => n.note);
  return Array.from({ length: count }, (_, i) => notes.slice(i * size, i * size + size).join('-')).join(', ');
}

function fretSpan(spec) {
  const frets = resolveFretboard(spec).marks.map((m) => m.fret);
  return `${Math.min(...frets)}–${Math.max(...frets)}`;
}

const spider = {
  id: 'spider', title: 'Spider permutations', roles: ['warmup'], tags: ['technique', 'picking', 'fretting-hand'], level: 1,
  variants: [{ startFret: 5, order: [1, 3, 2, 4] }, { startFret: 7, order: [1, 4, 2, 3] }, { startFret: 3, order: [2, 4, 1, 3] }],
  build: ({ startFret, order }) => ({
    instruction: `Four fingers, four frets, starting at fret ${startFret} on the low E. Play the fingers in the order ${order.join('-')} on each string, up to the high e and back down the same way, alternate picking in eighth notes. Every clean pass, tap Clean pass and go again 4 BPM faster.`,
    bpm: { min: 80, max: 120 }, ladder: { by: 4 }, fretboard: null,
    pattern: { notesPerBeat: 2, spec: { type: 'spider', startFret, order } },
    success: 'A clean pass: every note even, fingers hovering close, and a new top tempo before the timer ends.',
  }),
};

const moveALick = {
  id: 'pentatonic-move-a-lick', title: 'Move a lick', roles: ['review'], tags: ['minor-pentatonic', 'fretboard'], level: 1,
  variants: [{ root: 'A', from: 1, to: 2 }, { root: 'A', from: 2, to: 3 }, { root: 'E', from: 1, to: 2 }],
  build: ({ root, from, to }) => ({
    instruction: `Play ${/^[AEF]/.test(root) ? 'an' : 'a'} ${root} minor pentatonic lick you already know in box ${from}. Then find the same lick in box ${to} (frets ${fretSpan(box(root, to))}, shown here) and play it there.`,
    bpm: { min: 70, max: 100 }, fretboard: box(root, to),
    success: 'The lick sounds identical in both places: same notes, same rhythm.',
  }),
};

const sequences = {
  id: 'pentatonic-sequences', title: 'Sequences, not scales', roles: ['focus'], tags: ['minor-pentatonic', 'sequences', 'picking'], level: 2,
  variants: BOXES,
  build: ({ root, position }) => {
    const of = box(root, position);
    return {
      instruction: `${root} minor pentatonic box ${position}, never straight up and down. Follow the pattern on screen and switch without stopping when it changes. Each group starts on a click: groups of 3 as triplets (${firstGroups({ type: 'sequence', of, group: 3 }, 3)}…), groups of 4 as 16ths, skip-a-note pairs as 8ths (${firstGroups({ type: 'sequence', of, skip: true }, 2)}…).`,
      bpm: { min: 72, max: 100 }, ladder: { by: 4 }, fretboard: of,
      prompt: { label: 'Play', items: ['Groups of 3 up', 'Groups of 4 down', 'Skip a note up', 'Groups of 3 down'], everyBars: 4, order: 'cycle' },
      pattern: {
        notesPerBeat: 2,
        byPrompt: {
          'Groups of 3 up': { type: 'sequence', of, group: 3, direction: 'up', notesPerBeat: 3 },
          'Groups of 4 down': { type: 'sequence', of, group: 4, direction: 'down', notesPerBeat: 4 },
          'Skip a note up': { type: 'sequence', of, skip: true, direction: 'up', notesPerBeat: 2 },
          'Groups of 3 down': { type: 'sequence', of, group: 3, direction: 'down', notesPerBeat: 3 },
        },
      },
      success: '8 bars in a row with no hesitation when the pattern switches.',
    };
  },
};

const groupsOf3 = {
  id: 'pentatonic-groups-of-3', title: 'Groups of 3', roles: ['review'], tags: ['minor-pentatonic', 'sequences'], level: 1,
  variants: BOXES,
  build: ({ root, position }) => {
    const of = box(root, position);
    return {
      instruction: `${root} minor pentatonic box ${position} in groups of 3, as triplets, from the lowest note to the top of the box. Fingerstyle or pick, your choice.`,
      bpm: { min: 60, max: 84 }, fretboard: of,
      pattern: { notesPerBeat: 3, spec: { type: 'sequence', of, group: 3, direction: 'up', notesPerBeat: 3 } },
      success: 'Each group of three starts exactly on a click.',
    };
  },
};

const landTheTarget = {
  id: 'pentatonic-land-the-target', title: 'Land the target', roles: ['apply'], tags: ['minor-pentatonic', 'phrasing', 'targets'], level: 2,
  variants: BOXES,
  build: ({ root, position }) => ({
    instruction: `Three-note phrases over the ${root} drone. Every phrase must end on the target shown, which changes every 4 bars. Leave a bar of silence between phrases, and bend into the target at least once.`,
    bpm: { min: 80, max: 100 }, fretboard: box(root, position), drone: { root },
    prompt: { label: 'Land on', items: ['b3', '5', 'b7', '1'], everyBars: 4, order: 'cycle', root },
    success: 'Each phrase lands squarely on the target and you can hear it settle against the drone.',
  }),
};

const makeItSing = {
  id: 'pentatonic-make-it-sing', title: 'Make it sing', roles: ['cooldown'], tags: ['minor-pentatonic', 'vibrato', 'phrasing'], level: 1,
  variants: BOXES,
  build: ({ root, position }) => ({
    instruction: 'Take your favourite phrase from today. Play it slowly, with wide, even vibrato on the last note.',
    bpm: null, fretboard: box(root, position), drone: { root },
    success: 'The vibrato is steady and stays in pitch: a pulse, not a wobble.',
  }),
};

export default [spider, moveALick, sequences, groupsOf3, landTheTarget, makeItSing];
