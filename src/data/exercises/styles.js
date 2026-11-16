// Original licks written in the style of a player, to show the CAGED shapes in use. No transcriptions.
// Each lick is written once ([string, fret, technique?] in `key`) and moved to the variant's key.
const chord = (root, shape) => ({ type: 'caged', root, shape, quality: 'maj' });
const phrase = (lick, root) => ({ type: 'phrase', key: lick.key, root, notes: lick.notes, notesPerBeat: 2, of: chord(root, lick.shape) });

const callAndResponse = { label: 'Now', items: ['Play the phrase', 'Your answer'], everyBars: 2, order: 'cycle' };
const tags = ['caged', 'style', 'phrasing'];

const lickStep = ({ lick, title, how, success }) => (root) => ({
  instruction: `${how(root)} Two bars of the phrase, then two bars of your own answer in the same shape. Learn it with the Slow demo first.`,
  bpm: { min: 60, max: 92 }, ladder: { by: 4 }, fretboard: null,
  prompt: callAndResponse,
  pattern: { notesPerBeat: 2, spec: phrase(lick, root) },
  success,
});

// Blues and major in one breath: minor pentatonic box 1 with a hammer from the b3 up to the major 3.
const BLUES_MAJOR = { key: 'A', shape: 'E', notes: [[3, 5], [3, 6, 'h'], [2, 5], [1, 5], [2, 8], [2, 5], [3, 7], [3, 6, 'v']] };
// Slide into a major triad on the top strings, then step down to the 6: sweet, open, singer-songwriter.
const TRIAD_SLIDES = { key: 'A', shape: 'D', notes: [[2, 8], [2, 10, 's'], [1, 9], [3, 9], [2, 10], [2, 7, 's'], [1, 5], [2, 5, 'v']] };
// Thumb on the low root, fingers decorating the barre chord with hammer-ons to the 6 and the 2.
const THUMB_OVER = { key: 'A', shape: 'E', notes: [[6, 5], [3, 6], [2, 5], [2, 7, 'h'], [1, 5], [1, 7, 'h'], [1, 5, 'p'], [2, 5, 'v']] };
// The C shape as a chord-melody: arpeggiate it and hammer the 6 and the 2 out of the chord.
const C_SHAPE = { key: 'D', shape: 'C', notes: [[5, 5], [4, 4], [3, 2], [3, 4, 'h'], [2, 3], [2, 5, 'h'], [1, 2], [2, 3, 'v']] };

const mayerBluesMajor = {
  id: 'mayer-blues-major', title: 'Blues meets major', roles: ['focus', 'apply'], tags: [...tags, 'mayer', 'minor-pentatonic'], level: 2,
  variants: [{ root: 'A' }, { root: 'E' }, { root: 'G' }],
  build: ({ root }) => lickStep({
    lick: BLUES_MAJOR,
    how: (r) => `A Mayer-style blend around the ${r} E-shape barre: it starts on the bluesy b3 and hammers up to the sweet major 3, the move that makes minor pentatonic sound happy over a major chord.`,
    success: 'The hammer from b3 to 3 is in tune and in time, and your answers use it too.',
  })(root),
};

const mayerTriadSlides = {
  id: 'mayer-triad-slides', title: 'Slide into the triad', roles: ['focus', 'apply'], tags: [...tags, 'mayer', 'triads'], level: 2,
  variants: [{ root: 'A' }, { root: 'E' }, { root: 'G' }],
  build: ({ root }) => lickStep({
    lick: TRIAD_SLIDES,
    how: (r) => `Mayer-style triad phrasing in ${r}: slide up into the top-string triad inside the D shape, then slide down to the 6 and land in the E shape below. The slides are the phrasing: let them be slow and vocal.`,
    success: 'Both slides land exactly on pitch, and the phrase breathes like a sung line.',
  })(root),
};

const hendrixThumbOver = {
  id: 'hendrix-thumb-over', title: 'Thumb over, fingers sing', roles: ['focus', 'apply'], tags: [...tags, 'hendrix', 'chord-embellishment'], level: 3,
  variants: [{ root: 'A' }, { root: 'G' }, { root: 'C' }],
  build: ({ root }) => lickStep({
    lick: THUMB_OVER,
    how: (r) => `A Hendrix-style move on the ${r} E-shape barre: wrap your thumb over the neck for the low root, keep the chord under your fingers, and decorate it with hammer-ons to the 6 and the 2. It is a chord and a melody at once.`,
    success: 'The thumb note rings under the whole phrase and the hammer-ons are as loud as the picked notes.',
  })(root),
};

const hendrixCShape = {
  id: 'hendrix-c-shape', title: 'C-shape chord melody', roles: ['focus', 'apply', 'cooldown'], tags: [...tags, 'hendrix', 'chord-embellishment'], level: 2,
  variants: [{ root: 'D' }, { root: 'C' }, { root: 'E' }, { root: 'A' }],
  build: ({ root }) => lickStep({
    lick: C_SHAPE,
    how: (r) => `Hendrix-style chord melody in the ${r} C shape: arpeggiate the chord up from the root, then hammer the 6 and the 2 out of it and let them ring against the chord.`,
    success: 'The chord keeps ringing under the hammer-ons: lift a finger only when the next note needs it.',
  })(root),
};

const EMBELLISH = [{ root: 'A', four: 'D' }, { root: 'G', four: 'C' }, { root: 'C', four: 'F' }];

const hendrixEmbellish = {
  id: 'hendrix-embellish', title: 'Decorate the chord', roles: ['apply'], tags: [...tags, 'hendrix', 'chord-embellishment', 'improvisation'], level: 3,
  variants: EMBELLISH,
  build: ({ root, four }) => ({
    instruction: `${root} as the E shape and ${four} as the A shape, both at the same fret, two bars each. Hold the shape, thumb on the root, and improvise decorations: hammer onto the 2, 4 or 6 from a chord tone, slide into a 3, pull back to the chord. Never let the rhythm stop.`,
    bpm: { min: 60, max: 88 }, fretboard: null,
    prompt: { label: 'Chord', items: [`${root} (E shape)`, `${four} (A shape)`], everyBars: 2, order: 'cycle' },
    pattern: {
      notesPerBeat: 2,
      byPrompt: {
        [`${root} (E shape)`]: { type: 'sequence', of: chord(root, 'E'), group: 1, direction: 'up', notesPerBeat: 2 },
        [`${four} (A shape)`]: { type: 'sequence', of: chord(four, 'A'), group: 1, direction: 'up', notesPerBeat: 2 },
      },
    },
    success: 'Every bar has the chord and a little melody in it, and the change to the IV costs no time.',
  }),
};

export default [mayerBluesMajor, mayerTriadSlides, hendrixThumbOver, hendrixCShape, hendrixEmbellish];
