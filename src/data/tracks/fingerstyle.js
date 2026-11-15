// Original exercises in the thumb-independence style: no song transcriptions.
const EM = [[6, 0], [5, 2], [4, 2], [3, 0], [2, 0], [1, 0]];
const AM = [[5, 0], [4, 2], [3, 2], [2, 1], [1, 0]];

// Alternating bass on every beat (8th-note grid: beats are slots 0, 2, 4, 6).
const thumbEm = { 0: [[6, 0, 'p']], 2: [[4, 2, 'p']], 4: [[6, 0, 'p']], 6: [[4, 2, 'p']] };
const thumbAm = { 0: [[5, 0, 'p']], 2: [[4, 2, 'p']], 4: [[5, 0, 'p']], 6: [[4, 2, 'p']] };

const merge = (...layers) => layers.reduce((all, layer) => {
  for (const [slot, notes] of Object.entries(layer)) all[slot] = [...(all[slot] ?? []), ...notes];
  return all;
}, {});
const grid = (shape, ...layers) => ({ type: 'grid', slotsPerBeat: 2, beats: 4, shape, events: merge(...layers) });

const G = [3, 0, 'i'];
const B = [2, 0, 'm'];

const box1 = { type: 'pentatonic', root: 'A', quality: 'minor', position: 1 };

const session1 = ([warmup, review, focus, apply, cooldown]) => [
  {
    kind: 'warmup', title: 'Thumb alone', seconds: warmup,
    instruction: 'Thumb only, fingers resting on the treble strings. Alternate the bass on every beat with a light palm mute, and switch shapes when the prompt changes. Every clean 4 bars, tap Clean pass.',
    bpm: { min: 60, max: 90 }, ladder: { by: 4 }, fretboard: null,
    prompt: { label: 'Bass', items: ['Em: strings 6 & 4', 'Am: strings 5 & 4'], everyBars: 4, order: 'cycle' },
    pattern: { notesPerBeat: 2, byPrompt: { 'Em: strings 6 & 4': grid(EM, thumbEm), 'Am: strings 5 & 4': grid(AM, thumbAm) } },
    success: 'Every bass note the same volume and length, and the shape change costs no beat.',
  },
  {
    kind: 'review', title: 'Review: groups of 3', seconds: review,
    instruction: 'Spaced review from the Minor Pentatonic track: box 1 in groups of 3, as triplets, up and back down. Fingerstyle or pick, your choice.',
    bpm: { min: 60, max: 84 }, fretboard: box1,
    pattern: { notesPerBeat: 3, spec: { type: 'sequence', of: box1, group: 3, direction: 'up', notesPerBeat: 3 } },
    success: 'Each group of three starts exactly on a click.',
  },
  {
    kind: 'focus', title: 'Thumb on autopilot', seconds: focus,
    instruction: 'The thumb keeps the alternating bass no matter what. Your fingers play only where the prompt says. When it changes, switch without the thumb hesitating.',
    bpm: { min: 60, max: 80 }, ladder: { by: 4 }, fretboard: null,
    prompt: { label: 'Fingers play', items: ['Every &', 'Only &2 and &4', 'Pinch on 1, then &3', 'Just the & of 4'], everyBars: 4, order: 'cycle' },
    pattern: {
      notesPerBeat: 2,
      byPrompt: {
        'Every &': grid(EM, thumbEm, { 1: [G], 3: [B], 5: [G], 7: [B] }),
        'Only &2 and &4': grid(EM, thumbEm, { 3: [G, B], 7: [G, B] }),
        'Pinch on 1, then &3': grid(EM, thumbEm, { 0: [B], 5: [G, B] }),
        'Just the & of 4': grid(EM, thumbEm, { 7: [G, B] }),
      },
    },
    success: 'The thumb never stutters when the finger pattern changes, and every off-beat lands exactly halfway between clicks.',
  },
  {
    kind: 'apply', title: 'Em to Am, thumb never stops', seconds: apply,
    instruction: 'Two bars of Em, two bars of Am, round and round, fingers on every &. Once it is steady, replace the middle-finger note on the & of 4 with a note of your choice from E minor pentatonic (E G A B D) on the B or high e string.',
    bpm: { min: 64, max: 84 }, fretboard: null,
    prompt: { label: 'Chord', items: ['Em', 'Am'], everyBars: 2, order: 'cycle' },
    pattern: {
      notesPerBeat: 2,
      byPrompt: {
        Em: grid(EM, thumbEm, { 1: [G], 3: [B], 5: [G], 7: [B] }),
        Am: grid(AM, thumbAm, { 1: [[2, 1, 'i']], 3: [[1, 0, 'm']], 5: [[2, 1, 'i']], 7: [[1, 0, 'm']] }),
      },
    },
    success: 'The chord change leaves no gap in the bass, and your added note sounds like melody, not a mistake.',
  },
  {
    kind: 'cooldown', title: 'Let it ring', seconds: cooldown,
    instruction: 'Metronome off, half the tempo: play the Am pattern and let every note ring into the next. Listen for whichever string is too loud.',
    bpm: null, fretboard: null,
    success: 'Every note of the pattern at the same volume, ringing together.',
  },
];

export default {
  id: 'fingerstyle',
  title: 'Advanced Fingerstyle',
  category: 'fingerstyle',
  summary: 'The thumb keeps the groove, the fingers play everything else. Independence built one layer at a time.',
  sessions: [
    {
      id: 'fs-1',
      title: 'Thumb on autopilot',
      focus: 'Make the alternating bass automatic so the fingers are free.',
      durations: {
        15: session1([120, 120, 360, 240, 60]),
        20: session1([180, 120, 480, 360, 60]),
        30: session1([240, 180, 720, 600, 60]),
      },
    },
  ],
};
