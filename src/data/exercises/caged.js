import { cagedMarks } from '../../music/chords.js';
import { firstGroups, fretSpan } from './text.js';

const SHAPES = ['C', 'A', 'G', 'E', 'D'];
const chord = (root, shape) => ({ type: 'caged', root, shape, quality: 'maj' });
const scale = (root, shape) => ({ type: 'caged-scale', root, shape });

// The five shapes in the order they climb the neck for this key, starting from the lowest one.
function shapesUpTheNeck(root) {
  const lowest = (shape) => Math.min(...cagedMarks({ root, shape }).map((m) => m.fret));
  const start = SHAPES.reduce((best, s) => (lowest(s) < lowest(best) ? s : best));
  const i = SHAPES.indexOf(start);
  return [...SHAPES.slice(i), ...SHAPES.slice(0, i)];
}

const shapePrompt = (root, label, order) => ({ label, items: shapesUpTheNeck(root).map((s) => `${s} shape`), everyBars: 2, order });
const arpeggioByShape = (root) => Object.fromEntries(shapesUpTheNeck(root).map((s) => [
  `${s} shape`, { type: 'sequence', of: chord(root, s), group: 1, direction: 'up', notesPerBeat: 2 },
]));

const KEYS = [{ root: 'C' }, { root: 'G' }, { root: 'D' }, { root: 'A' }, { root: 'E' }];
const POSITIONS = [
  { root: 'C', shape: 'A' }, { root: 'G', shape: 'E' }, { root: 'G', shape: 'D' },
  { root: 'D', shape: 'C' }, { root: 'A', shape: 'G' }, { root: 'C', shape: 'E' },
];
const tags = ['caged', 'fretboard'];

const arpeggios = {
  id: 'caged-arpeggios', title: 'Five shapes, one chord', roles: ['warmup', 'review'], tags: [...tags, 'arpeggios'], level: 1,
  variants: KEYS,
  build: ({ root }) => ({
    instruction: `Arpeggiate ${root} major in each CAGED shape, low string to high, climbing the neck: ${shapesUpTheNeck(root).join(' → ')}. Two bars per shape, then slide straight into the next one without stopping. Every clean lap, tap Clean pass.`,
    bpm: { min: 60, max: 90 }, ladder: { by: 4 }, fretboard: null,
    prompt: shapePrompt(root, 'Play', 'cycle'),
    pattern: { notesPerBeat: 2, byPrompt: arpeggioByShape(root) },
    success: `Each new shape lands on beat 1, and you hear the same ${root} chord all the way up.`,
  }),
};

const findTheShape = {
  id: 'caged-find-the-shape', title: 'Find the shape', roles: ['warmup', 'review'], tags, level: 1,
  variants: KEYS,
  build: ({ root }) => ({
    instruction: `The prompt names a CAGED shape at random. Find ${root} major in that shape before the next bar, strum it once on beat 1 and let it ring, then pick out its roots. No hunting from the nut: picture where the root sits in the shape and go there.`,
    bpm: { min: 50, max: 80 }, fretboard: null,
    prompt: shapePrompt(root, 'Find', 'random'),
    pattern: { notesPerBeat: 2, byPrompt: arpeggioByShape(root) },
    success: 'You land every shape on beat 1, without looking at the diagram.',
  }),
};

const scaleSequences = {
  id: 'caged-scale-sequences', title: 'The scale inside the shape', roles: ['focus', 'review'], tags: [...tags, 'major-scale', 'sequences'], level: 2,
  variants: POSITIONS,
  build: ({ root, shape }) => {
    const of = scale(root, shape);
    return {
      instruction: `${root} major in the ${shape} shape (frets ${fretSpan(of)}). Keep the chord shape in your head: the solid dots are its chord tones, everything else lives around them. Follow the pattern on screen and switch without stopping: groups of 3 as triplets (${firstGroups({ type: 'sequence', of, group: 3 }, 3)}…), groups of 4 as 16ths, skip-a-note pairs as 8ths.`,
      bpm: { min: 60, max: 92 }, ladder: { by: 4 }, fretboard: of,
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
      success: '8 bars with no hesitation at the switch, and you never leave the shape.',
    };
  },
};

// Neighbouring shapes for a key: the second sits just above the first on the neck.
const PAIRS = [{ root: 'G', from: 'E', to: 'D' }, { root: 'C', from: 'A', to: 'G' }, { root: 'D', from: 'C', to: 'A' }, { root: 'A', from: 'G', to: 'E' }];

const connectShapes = {
  id: 'caged-connect-shapes', title: 'Connect two shapes', roles: ['focus', 'apply'], tags: [...tags, 'major-scale', 'position-shifts'], level: 2,
  variants: PAIRS,
  build: ({ root, from, to }) => {
    const up = `${from} shape, 3s up`;
    const down = `${to} shape, 3s down`;
    return {
      instruction: `Groups of 3 up the ${from} shape, then shift up and come back down the ${to} shape, all in ${root} major. The ${from} shape sits at frets ${fretSpan(scale(root, from))} and the ${to} shape at ${fretSpan(scale(root, to))}. They share notes, so shift on a note the two have in common rather than jumping.`,
      bpm: { min: 56, max: 84 }, ladder: { by: 4 }, fretboard: scale(root, from),
      prompt: { label: 'Play', items: [up, down], everyBars: 4, order: 'cycle' },
      pattern: {
        notesPerBeat: 3,
        byPrompt: {
          [up]: { type: 'sequence', of: scale(root, from), group: 3, direction: 'up', notesPerBeat: 3 },
          [down]: { type: 'sequence', of: scale(root, to), group: 3, direction: 'down', notesPerBeat: 3 },
        },
      },
      success: 'The shift sounds like part of the line, not a gap.',
    };
  },
};

const chordTones = {
  id: 'caged-chord-tones', title: 'Land on the chord', roles: ['apply'], tags: [...tags, 'phrasing', 'targets'], level: 2,
  variants: POSITIONS,
  build: ({ root, shape }) => ({
    instruction: `Improvise over the ${root} drone using only the ${root} major scale in the ${shape} shape. Every phrase ends on the chord tone shown, which changes every 4 bars: the solid dots and the root are your landing spots. Keep phrases short and leave space between them.`,
    bpm: { min: 70, max: 96 }, fretboard: scale(root, shape), drone: { root },
    prompt: { label: 'Land on', items: ['1', '3', '5'], everyBars: 4, order: 'random', root },
    success: 'Every phrase settles on its target, and the 3 sounds sweet against the drone.',
  }),
};

const melodyInShape = {
  id: 'caged-melody-in-shape', title: 'A melody in one shape', roles: ['cooldown'], tags: [...tags, 'phrasing', 'vibrato'], level: 1,
  variants: POSITIONS,
  build: ({ root, shape }) => ({
    instruction: `Slowly, over the ${root} drone: make up a short melody inside the ${shape} shape, sing it back, then play it again. End on the root with relaxed vibrato.`,
    bpm: null, fretboard: scale(root, shape), drone: { root },
    success: 'A melody you could hum, finished on the root.',
  }),
};

const neckClimb = {
  id: 'caged-neck-climb', title: 'Up and down the neck', roles: ['focus', 'warmup'], tags: [...tags, 'major-scale', 'position-shifts'], level: 2,
  variants: [
    { root: 'G', group: 1 }, { root: 'C', group: 1 }, { root: 'D', group: 1 },
    { root: 'G', group: 3 }, { root: 'A', group: 3 },
  ],
  build: ({ root, group }) => {
    const order = shapesUpTheNeck(root);
    const legs = order.map((shape, i) => ({ shape, direction: i % 2 ? 'down' : 'up' }));
    const label = (l) => `${l.shape} shape, ${l.direction}`;
    const npb = group === 3 ? 3 : 2;
    return {
      instruction: `Climb the neck through all five ${root} major positions, ${order.join(' → ')}: up one shape, slide into the next and come down it, and so on to the top${group === 3 ? ', in groups of 3 as triplets' : ', straight 8th notes'}. Then jump back to the bottom and go again. Shift on a note the two shapes share.`,
      bpm: { min: group === 3 ? 56 : 66, max: group === 3 ? 84 : 100 }, ladder: { by: 4 }, fretboard: null,
      prompt: { label: 'Play', items: legs.map(label), everyBars: group === 3 ? 4 : 2, order: 'cycle' },
      pattern: {
        notesPerBeat: npb,
        byPrompt: Object.fromEntries(legs.map((l) => [label(l), { type: 'sequence', of: scale(root, l.shape), group, direction: l.direction, notesPerBeat: npb }])),
      },
      success: 'A full lap with no stop at any shift, and you can name the shape you are in at every moment.',
    };
  },
};

const SWITCHES = [{ root: 'C', a: 'A', b: 'E' }, { root: 'G', a: 'E', b: 'C' }, { root: 'D', a: 'C', b: 'E' }, { root: 'A', a: 'E', b: 'C' }, { root: 'E', a: 'D', b: 'A' }];

const shapeSwitch = {
  id: 'caged-shape-switch', title: 'Switch shapes on the beat', roles: ['warmup', 'review'], tags: [...tags, 'chords', 'position-shifts'], level: 1,
  variants: SWITCHES,
  build: ({ root, a, b }) => ({
    instruction: `${root} major, two places on the neck: the ${a} shape and the ${b} shape. Strum the chord on beat 1, arpeggiate it for the rest of the two bars, and land the other shape exactly on the next beat 1. Move your eyes to the new root before your hand goes.`,
    bpm: { min: 60, max: 96 }, ladder: { by: 4 }, fretboard: null,
    prompt: { label: 'Play', items: [`${a} shape`, `${b} shape`], everyBars: 2, order: 'cycle' },
    pattern: {
      notesPerBeat: 2,
      byPrompt: Object.fromEntries([a, b].map((s) => [`${s} shape`, { type: 'sequence', of: chord(root, s), group: 1, direction: 'up', notesPerBeat: 2 }])),
    },
    success: 'Both shapes ring cleanly and the switch never costs a beat.',
  }),
};

const SWAP_SCALES = [
  { label: 'Major pentatonic', scale: 'majorPentatonic' },
  { label: 'Major scale', scale: 'major' },
  { label: 'Mixolydian (b7)', scale: 'mixolydian' },
];

const scaleSwap = {
  id: 'caged-scale-swap', title: 'Three scales, one shape', roles: ['focus', 'apply'], tags: [...tags, 'major-scale', 'major-pentatonic', 'mixolydian', 'ear'], level: 2,
  variants: POSITIONS,
  build: ({ root, shape }) => ({
    instruction: `Stay in the ${shape} shape over the ${root} drone and change scale when the prompt does: major pentatonic, then the full major scale (adds the 4 and the 7), then Mixolydian (the 7 drops to b7). The chord shape never moves, only the notes around it. Run it in 3s, then improvise and listen for what each scale adds.`,
    bpm: { min: 60, max: 90 }, fretboard: scale(root, shape), drone: { root },
    prompt: { label: 'Scale', items: SWAP_SCALES.map((x) => x.label), everyBars: 4, order: 'cycle' },
    pattern: {
      notesPerBeat: 3,
      byPrompt: Object.fromEntries(SWAP_SCALES.map((x) => [x.label, { type: 'sequence', of: { type: 'caged-scale', root, shape, scale: x.scale }, group: 3, direction: 'up', notesPerBeat: 3 }])),
    },
    success: 'You can hear each change: the pentatonic is open, the major sweetens it, the b7 makes it bluesy.',
  }),
};

export default [arpeggios, findTheShape, scaleSequences, connectShapes, chordTones, melodyInShape, neckClimb, shapeSwitch, scaleSwap];
