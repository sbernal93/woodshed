import { expandSession } from '../library.js';
import { exercises } from '../exercises/index.js';

const timing = {
  15: [120, 120, 360, 240, 60],
  20: [180, 120, 480, 360, 60],
  30: [240, 180, 720, 600, 60],
};

export default {
  id: 'sweep',
  title: 'Sweep Picking',
  category: 'electric',
  summary: 'Arpeggios with one pick stroke per direction: clean 3-string sweeps, then five strings, then sweeping through chord changes.',
  sessions: [
    expandSession({
      id: 'sweep-1',
      title: 'The 3-string motion',
      focus: 'One note turns major into minor, then A minor sweeps on the top three strings through all three inversions, then a progression.',
      steps: [
        { kind: 'warmup', exercise: 'spider', variant: 0 },
        { kind: 'review', exercise: 'triads-quality-swap', variant: 0 },
        { kind: 'focus', exercise: 'sweep-three-string', variant: 0 },
        { kind: 'apply', exercise: 'sweep-progression', variant: 0 },
        { kind: 'cooldown', exercise: 'triads-ring-out', variant: 0 },
      ],
      timing,
    }, exercises),
    expandSession({
      id: 'sweep-2',
      title: 'Five strings',
      focus: 'The A-shape sweep across five strings, switching between minor and major.',
      steps: [
        { kind: 'warmup', exercise: 'sweep-three-string', variant: 1 },
        { kind: 'review', exercise: 'sweep-three-string', variant: 2 },
        { kind: 'focus', exercise: 'sweep-five-string', variant: 0 },
        { kind: 'apply', exercise: 'sweep-progression', variant: 1 },
        { kind: 'cooldown', exercise: 'triads-ring-out', variant: 1 },
      ],
      timing,
    }, exercises),
    expandSession({
      id: 'sweep-3',
      title: 'Through the changes',
      focus: 'Five-string sweeps in C and D, then sweeping a progression in D minor without a gap at the changes.',
      steps: [
        { kind: 'warmup', exercise: 'sweep-three-string', variant: 0 },
        { kind: 'review', exercise: 'sweep-five-string', variant: 1 },
        { kind: 'focus', exercise: 'sweep-five-string', variant: 2 },
        { kind: 'apply', exercise: 'sweep-progression', variant: 2 },
        { kind: 'cooldown', exercise: 'triads-ring-out', variant: 0 },
      ],
      timing,
    }, exercises),
  ],
};
