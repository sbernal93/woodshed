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
        15: [
          { kind: 'warmup', title: 'Count out loud', seconds: 180, instruction: 'Start the metronome at 80 BPM and count 1-2-3-4 out loud for four bars.', bpm: { min: 70, max: 90 }, fretboard: null, success: 'Your count lands on every click without drifting.' },
          { kind: 'focus', title: 'Muted strums', seconds: 420, instruction: 'Mute the strings with your fretting hand and strum down on every beat, up on every "and".', bpm: { min: 70, max: 100 }, fretboard: null, success: 'Down-strokes land exactly on the click.' },
          { kind: 'apply', title: 'Two-chord groove', seconds: 240, instruction: 'Alternate Am and C, one bar each, keeping the same strum.', bpm: { min: 70, max: 100 }, fretboard: null, success: 'The chord change happens without a gap in the strum.' },
          { kind: 'cooldown', title: 'Free play', seconds: 60, instruction: 'Turn the metronome off and play anything you like, slowly.', bpm: null, fretboard: null, success: 'Hands relaxed, no tension in the wrist.' },
        ],
      },
    },
  ],
};
