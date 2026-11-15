// Placeholder track until the real curriculum lands in Stage 5.
const steps = ([warmup, focus, apply, cooldown]) => [
  { kind: 'warmup', title: 'Count out loud', seconds: warmup, instruction: 'Start the metronome and count 1-2-3-4 out loud for four bars, then strum muted strings on every beat.', bpm: { min: 70, max: 90 }, fretboard: null, success: 'Your count lands on every click without drifting.' },
  { kind: 'focus', title: 'A minor pentatonic, box 1', seconds: focus, instruction: 'Play the box up and down, one note per click. Keep fretting fingers close to the strings.', bpm: { min: 72, max: 96 }, fretboard: { type: 'pentatonic', root: 'A', quality: 'minor', position: 1 }, success: 'Every note rings clearly and lands exactly on the click.' },
  { kind: 'apply', title: 'Three-note phrases', seconds: apply, instruction: 'Improvise using only three notes of the box. Leave space between phrases.', bpm: { min: 80, max: 100 }, fretboard: { type: 'pentatonic', root: 'A', quality: 'minor', position: 1 }, success: 'Phrases start and end on purpose, with rests between them.' },
  { kind: 'cooldown', title: 'Free play', seconds: cooldown, instruction: 'Turn the metronome off and play anything you like, slowly.', bpm: null, fretboard: null, success: 'Hands relaxed, no tension in the wrist.' },
];

export default {
  id: 'stub',
  title: 'Tempo Check-In',
  category: 'application',
  summary: 'Placeholder track until the real curriculum lands in Stage 5.',
  sessions: [
    {
      id: 'stub-1',
      title: 'Count it in',
      focus: 'Lock to the click before playing anything else.',
      durations: {
        15: steps([180, 420, 240, 60]),
        20: steps([240, 600, 300, 60]),
        30: steps([300, 900, 480, 120]),
      },
    },
  ],
};
