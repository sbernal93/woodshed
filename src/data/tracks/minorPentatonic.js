import { expandSession } from '../library.js';
import { exercises } from '../exercises/index.js';

export default {
  id: 'minor-pentatonic',
  title: 'Minor Pentatonic',
  category: 'scales',
  summary: 'Make the most-used scale in rock sound like music, not a drill.',
  sessions: [
    expandSession({
      id: 'mp-1',
      title: 'Box 1: sequences and targets',
      focus: 'Move through box 1 in patterns and land phrases on chosen notes.',
      steps: [
        { kind: 'warmup', exercise: 'spider' },
        { kind: 'review', exercise: 'pentatonic-move-a-lick' },
        { kind: 'focus', exercise: 'pentatonic-sequences' },
        { kind: 'apply', exercise: 'pentatonic-land-the-target' },
        { kind: 'cooldown', exercise: 'pentatonic-make-it-sing' },
      ],
      timing: {
        15: [120, 60, 360, 300, 60],
        20: [180, 120, 480, 360, 60],
        30: [240, 180, 720, 600, 60],
      },
    }, exercises),
  ],
};
