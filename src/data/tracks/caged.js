import { expandSession } from '../library.js';
import { exercises } from '../exercises/index.js';

const timing = {
  15: [120, 120, 360, 240, 60],
  20: [180, 120, 480, 360, 60],
  30: [240, 180, 720, 600, 60],
};

export default {
  id: 'caged',
  title: 'CAGED System',
  category: 'caged',
  summary: 'Five chord shapes that map the whole neck, with the scale living inside each one.',
  sessions: [
    expandSession({
      id: 'caged-1',
      title: 'C everywhere',
      focus: 'One chord in five shapes, then the C major scale inside the A shape.',
      steps: [
        { kind: 'warmup', exercise: 'caged-arpeggios', variant: 0 },
        { kind: 'review', exercise: 'caged-find-the-shape', variant: 0 },
        { kind: 'focus', exercise: 'caged-scale-sequences', variant: 0 },
        { kind: 'apply', exercise: 'caged-chord-tones', variant: 0 },
        { kind: 'cooldown', exercise: 'caged-melody-in-shape', variant: 0 },
      ],
      timing,
    }, exercises),
    expandSession({
      id: 'caged-2',
      title: 'G: connect the shapes',
      focus: 'Move between the E and D shapes in G without losing the line.',
      steps: [
        { kind: 'warmup', exercise: 'caged-arpeggios', variant: 1 },
        { kind: 'review', exercise: 'caged-scale-sequences', variant: 1 },
        { kind: 'focus', exercise: 'caged-connect-shapes', variant: 0 },
        { kind: 'apply', exercise: 'caged-chord-tones', variant: 2 },
        { kind: 'cooldown', exercise: 'caged-melody-in-shape', variant: 1 },
      ],
      timing,
    }, exercises),
  ],
};
