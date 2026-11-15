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
const amFingers = { 1: [[2, 1, 'i']], 3: [[1, 0, 'm']], 5: [[2, 1, 'i']], 7: [[1, 0, 'm']] };

const tags = ['fingerstyle', 'thumb-independence'];

const thumbAlone = {
  id: 'fingerstyle-thumb-alone', title: 'Thumb alone', roles: ['warmup'], tags, level: 1,
  build: () => ({
    instruction: 'Thumb only, fingers resting on the treble strings. Alternate the bass on every beat with a light palm mute, and switch shapes when the prompt changes. Every clean 4 bars, tap Clean pass.',
    bpm: { min: 60, max: 90 }, ladder: { by: 4 }, fretboard: null,
    prompt: { label: 'Bass', items: ['Em: strings 6 & 4', 'Am: strings 5 & 4'], everyBars: 4, order: 'cycle' },
    pattern: { notesPerBeat: 2, byPrompt: { 'Em: strings 6 & 4': grid(EM, thumbEm), 'Am: strings 5 & 4': grid(AM, thumbAm) } },
    success: 'Every bass note the same volume and length, and the shape change costs no beat.',
  }),
};

const thumbOnAutopilot = {
  id: 'fingerstyle-thumb-on-autopilot', title: 'Thumb on autopilot', roles: ['focus'], tags, level: 2,
  build: () => ({
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
  }),
};

const emToAm = {
  id: 'fingerstyle-em-to-am', title: 'Em to Am, thumb never stops', roles: ['apply'], tags: [...tags, 'chord-changes'], level: 2,
  build: () => ({
    instruction: 'Two bars of Em, two bars of Am, round and round, fingers on every &. Once it is steady, replace the middle-finger note on the & of 4 with a note of your choice from E minor pentatonic (E G A B D) on the B or high e string.',
    bpm: { min: 64, max: 84 }, fretboard: null,
    prompt: { label: 'Chord', items: ['Em', 'Am'], everyBars: 2, order: 'cycle' },
    pattern: {
      notesPerBeat: 2,
      byPrompt: { Em: grid(EM, thumbEm, { 1: [G], 3: [B], 5: [G], 7: [B] }), Am: grid(AM, thumbAm, amFingers) },
    },
    success: 'The chord change leaves no gap in the bass, and your added note sounds like melody, not a mistake.',
  }),
};

const letItRing = {
  id: 'fingerstyle-let-it-ring', title: 'Let it ring', roles: ['cooldown'], tags: [...tags, 'tone'], level: 1,
  build: () => ({
    instruction: 'Metronome off, half the tempo: play the Am pattern and let every note ring into the next. Listen for whichever string is too loud.',
    bpm: null, fretboard: null,
    pattern: { notesPerBeat: 2, spec: grid(AM, thumbAm, amFingers) },
    success: 'Every note of the pattern at the same volume, ringing together.',
  }),
};

export default [thumbAlone, thumbOnAutopilot, emToAm, letItRing];
