import { expandSession } from '../library.js';
import { exercises } from '../exercises/index.js';

const timing = {
  15: [120, 120, 360, 240, 60],
  20: [180, 120, 480, 360, 60],
  30: [240, 180, 720, 600, 60],
};

export default {
  id: 'styles',
  title: 'Style Studies',
  category: 'application',
  summary: 'CAGED put to work: original licks in the style of Mayer and Hendrix, then your own answers in the same shapes.',
  sessions: [
    expandSession({
      id: 'styles-mayer-1',
      title: 'Mayer: blues meets major',
      focus: 'The b3-to-3 hammer and triad slides in A, then answering them in the same shapes.',
      steps: [
        { kind: 'warmup', exercise: 'caged-shape-switch', variant: 3 },
        { kind: 'review', exercise: 'caged-scale-sequences', variant: 4 },
        { kind: 'focus', exercise: 'mayer-blues-major', variant: 0 },
        { kind: 'apply', exercise: 'mayer-triad-slides', variant: 0 },
        { kind: 'cooldown', exercise: 'caged-melody-in-shape', variant: 4 },
      ],
      timing,
    }, exercises),
    expandSession({
      id: 'styles-hendrix-1',
      title: 'Hendrix: chords that sing',
      focus: 'Thumb-over barre chords with hammer-on melodies, then improvised decorations over I and IV.',
      steps: [
        { kind: 'warmup', exercise: 'caged-arpeggios', variant: 3 },
        { kind: 'review', exercise: 'caged-find-the-shape', variant: 3 },
        { kind: 'focus', exercise: 'hendrix-thumb-over', variant: 0 },
        { kind: 'apply', exercise: 'hendrix-embellish', variant: 0 },
        { kind: 'cooldown', exercise: 'hendrix-c-shape', variant: 3 },
      ],
      timing,
    }, exercises),
  ],
};
