import { expandSession } from '../library.js';
import { exercises } from '../exercises/index.js';

export default {
  id: 'fingerstyle',
  title: 'Advanced Fingerstyle',
  category: 'fingerstyle',
  summary: 'The thumb keeps the groove, the fingers play everything else. Independence built one layer at a time.',
  sessions: [
    expandSession({
      id: 'fs-1',
      title: 'Thumb on autopilot',
      focus: 'Make the alternating bass automatic so the fingers are free.',
      steps: [
        { kind: 'warmup', exercise: 'fingerstyle-thumb-alone' },
        { kind: 'review', exercise: 'pentatonic-groups-of-3' },
        { kind: 'focus', exercise: 'fingerstyle-thumb-on-autopilot' },
        { kind: 'apply', exercise: 'fingerstyle-em-to-am' },
        { kind: 'cooldown', exercise: 'fingerstyle-let-it-ring' },
      ],
      timing: {
        15: [120, 120, 360, 240, 60],
        20: [180, 120, 480, 360, 60],
        30: [240, 180, 720, 600, 60],
      },
    }, exercises),
  ],
};
