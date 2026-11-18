import { expandSession } from '../library.js';
import { exercises } from '../exercises/index.js';

const timing = {
  15: [120, 120, 360, 240, 60],
  20: [180, 120, 480, 360, 60],
  30: [240, 180, 720, 600, 60],
};

export default {
  id: 'jazz',
  title: 'Jazz Foundations',
  category: 'application',
  summary: 'Shells, guide tones and the ii–V–I: the three-note grips and the two-note lines that carry jazz harmony.',
  sessions: [
    expandSession({
      id: 'jazz-1',
      title: 'Shells and the ii–V–I',
      focus: 'Dominant shells round the cycle, then the ii–V–I in C, comped short with the Charleston.',
      steps: [
        { kind: 'warmup', exercise: 'jazz-shells-cycle', variant: 0 },
        { kind: 'review', exercise: 'caged-arpeggios', variant: 0 },
        { kind: 'focus', exercise: 'jazz-two-five-one', variant: 0 },
        { kind: 'apply', exercise: 'jazz-charleston', variant: 0 },
        { kind: 'cooldown', exercise: 'jazz-ballad', variant: 0 },
      ],
      timing,
    }, exercises),
    expandSession({
      id: 'jazz-2',
      title: 'Guide tones',
      focus: 'Minor 7 shells, then the 3rds and 7ths alone as a line, and soloing from them over the ii–V–I in F.',
      steps: [
        { kind: 'warmup', exercise: 'jazz-shells-cycle', variant: 1 },
        { kind: 'review', exercise: 'jazz-two-five-one', variant: 1 },
        { kind: 'focus', exercise: 'jazz-guide-tones', variant: 1 },
        { kind: 'apply', exercise: 'jazz-charleston', variant: 2 },
        { kind: 'cooldown', exercise: 'jazz-ballad', variant: 1 },
      ],
      timing,
    }, exercises),
    expandSession({
      id: 'jazz-3',
      title: 'Arpeggios through the changes',
      focus: 'Major 7 shells, then ii–V–I arpeggios in one area of the neck, connected at every change.',
      steps: [
        { kind: 'warmup', exercise: 'jazz-shells-cycle', variant: 2 },
        { kind: 'review', exercise: 'jazz-guide-tones', variant: 0 },
        { kind: 'focus', exercise: 'jazz-arpeggios', variant: 0 },
        { kind: 'apply', exercise: 'jazz-charleston', variant: 1 },
        { kind: 'cooldown', exercise: 'jazz-ballad', variant: 0 },
      ],
      timing,
    }, exercises),
  ],
};
