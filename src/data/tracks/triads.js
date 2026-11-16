import { expandSession } from '../library.js';
import { exercises } from '../exercises/index.js';

const timing = {
  15: [120, 120, 360, 240, 60],
  20: [180, 120, 480, 360, 60],
  30: [240, 180, 720, 600, 60],
};

export default {
  id: 'triads',
  title: 'Triads',
  category: 'caged',
  summary: 'Three notes, three strings: the small shapes inside every chord, and how to move through changes with them.',
  sessions: [
    expandSession({
      id: 'triads-1',
      title: 'Top three strings',
      focus: 'Every inversion of C on the G B e strings, one-note chord changes, and I–IV–V in one place.',
      steps: [
        { kind: 'warmup', exercise: 'triads-inversions-up', variant: 0 },
        { kind: 'review', exercise: 'caged-arpeggios', variant: 0 },
        { kind: 'focus', exercise: 'triads-quality-swap', variant: 0 },
        { kind: 'apply', exercise: 'triads-one-four-five', variant: 1 },
        { kind: 'cooldown', exercise: 'triads-ring-out', variant: 0 },
      ],
      timing,
    }, exercises),
    expandSession({
      id: 'triads-2',
      title: 'Changes on D G B',
      focus: 'Move through D, G and A on the middle strings, then improvise with triad pairs.',
      steps: [
        { kind: 'warmup', exercise: 'triads-inversions-up', variant: 2 },
        { kind: 'review', exercise: 'triads-quality-swap', variant: 1 },
        { kind: 'focus', exercise: 'triads-one-four-five', variant: 2 },
        { kind: 'apply', exercise: 'triads-pairs', variant: 0 },
        { kind: 'cooldown', exercise: 'triads-ring-out', variant: 1 },
      ],
      timing,
    }, exercises),
  ],
};
