const box = (position) => ({ type: 'pentatonic', root: 'A', quality: 'minor', position });

const steps = ([warmup, review, focus, apply, cooldown]) => [
  {
    kind: 'warmup', title: 'Spider permutations', seconds: warmup,
    instruction: 'Four fingers, four frets, starting at fret 5 on the low E. Play the fingers in the order 1-3-2-4 on each string, up to the high e and back down, alternate picking in eighth notes. Every clean pass, tap Clean pass and go again 4 BPM faster.',
    bpm: { min: 80, max: 120 }, ladder: { by: 4 }, fretboard: null,
    success: 'A clean pass: every note even, fingers hovering close, and a new top tempo before the timer ends.',
  },
  {
    kind: 'review', title: 'Move a lick', seconds: review,
    instruction: 'Play an A minor pentatonic lick you already know in box 1. Then find the same lick in box 2 (frets 7–10, shown here) and play it there.',
    bpm: { min: 70, max: 100 }, fretboard: box(2),
    success: 'The lick sounds identical in both places: same notes, same rhythm.',
  },
  {
    kind: 'focus', title: 'Sequences, not scales', seconds: focus,
    instruction: 'Box 1, never straight up and down. Follow the pattern on screen and switch without stopping when it changes. Groups of 3 = A-C-D, C-D-E, D-E-G… Skip a note = A-D, C-E, D-G…',
    bpm: { min: 72, max: 100 }, ladder: { by: 4 }, fretboard: box(1),
    prompt: { label: 'Play', items: ['Groups of 3 up', 'Groups of 4 down', 'Skip a note up', 'Groups of 3 down'], everyBars: 4, order: 'cycle' },
    success: '8 bars in a row with no hesitation when the pattern switches.',
  },
  {
    kind: 'apply', title: 'Land the target', seconds: apply,
    instruction: 'Three-note phrases over the A drone. Every phrase must end on the target shown, which changes every 4 bars. Leave a bar of silence between phrases, and bend into the target at least once.',
    bpm: { min: 80, max: 100 }, fretboard: box(1), drone: { root: 'A' },
    prompt: { label: 'Land on', items: ['b3', '5', 'b7', '1'], everyBars: 4, order: 'cycle', root: 'A' },
    success: 'Each phrase lands squarely on the target and you can hear it settle against the drone.',
  },
  {
    kind: 'cooldown', title: 'Make it sing', seconds: cooldown,
    instruction: 'Take your favourite phrase from today. Play it slowly, with wide, even vibrato on the last note.',
    bpm: null, fretboard: null, drone: { root: 'A' },
    success: 'The vibrato is steady and stays in pitch: a pulse, not a wobble.',
  },
];

export default {
  id: 'minor-pentatonic',
  title: 'Minor Pentatonic',
  category: 'scales',
  summary: 'Make the most-used scale in rock sound like music, not a drill.',
  sessions: [
    {
      id: 'mp-1',
      title: 'Box 1: sequences and targets',
      focus: 'Move through box 1 in patterns and land phrases on chosen notes.',
      durations: {
        15: steps([120, 60, 360, 300, 60]),
        20: steps([180, 120, 480, 360, 60]),
        30: steps([240, 180, 720, 600, 60]),
      },
    },
  ],
};
