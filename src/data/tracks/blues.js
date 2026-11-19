import { expandSession } from '../library.js';
import { exercises } from '../exercises/index.js';

const timing = {
  15: [120, 120, 360, 240, 60],
  20: [180, 120, 480, 360, 60],
  30: [240, 180, 720, 600, 60],
};

export default {
  id: 'blues',
  title: '12-Bar Blues',
  category: 'application',
  summary: 'The form every player has to own: the shuffle, dominant shells, and solos that follow the changes instead of ignoring them.',
  sessions: [
    expandSession({
      id: 'blues-1',
      title: 'The shuffle and the form',
      focus: 'The boogie shuffle in E, the 12 bars in shells, then three-phrase solos shaped like a blues lyric.',
      steps: [
        { kind: 'warmup', exercise: 'blues-shuffle', variant: 0 },
        { kind: 'review', exercise: 'jazz-shells-cycle', variant: 0 },
        { kind: 'focus', exercise: 'blues-shells', variant: 0 },
        { kind: 'apply', exercise: 'blues-call-response', variant: 0 },
        { kind: 'cooldown', exercise: 'blues-slow', variant: 0 },
      ],
      timing,
    }, exercises),
    expandSession({
      id: 'blues-2',
      title: 'Chase the 3rds',
      focus: 'The shuffle in A, then soloing in the box while landing on the 3rd of every chord as it arrives.',
      steps: [
        { kind: 'warmup', exercise: 'blues-shuffle', variant: 1 },
        { kind: 'review', exercise: 'blues-shells', variant: 0 },
        { kind: 'focus', exercise: 'blues-thirds', variant: 0 },
        { kind: 'apply', exercise: 'blues-call-response', variant: 1 },
        { kind: 'cooldown', exercise: 'blues-slow', variant: 1 },
      ],
      timing,
    }, exercises),
    expandSession({
      id: 'blues-3',
      title: 'Arpeggios through the form',
      focus: 'The quick-change shuffle, then I7, IV7 and V7 arpeggios in one area of the neck, connected at every change.',
      steps: [
        { kind: 'warmup', exercise: 'blues-shuffle', variant: 2 },
        { kind: 'review', exercise: 'blues-thirds', variant: 0 },
        { kind: 'focus', exercise: 'blues-arpeggios', variant: 0 },
        { kind: 'apply', exercise: 'blues-thirds', variant: 1 },
        { kind: 'cooldown', exercise: 'blues-slow', variant: 0 },
      ],
      timing,
    }, exercises),
  ],
};
