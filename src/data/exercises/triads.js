import { spell } from '../../music/notes.js';
import { triadVoicings } from '../../music/triads.js';

const SET_NAMES = { 321: 'G B e', 432: 'D G B', 543: 'A D G', 654: 'E A D' };
const INVERSIONS = ['Root position', '1st inversion', '2nd inversion'];
const tags = ['triads', 'chords', 'fretboard'];

const triad = (root, quality, set, place) => ({ type: 'triad', root, quality, set, ...place });
// Three notes per click: each triad is one triplet, so every chord starts on a beat.
const arpeggio = (of) => ({ type: 'sequence', of, group: 1, direction: 'up', notesPerBeat: 3 });

// The three inversions in the order they climb the neck for this key and string set.
function inversionsUp(root, set) {
  const seen = [];
  for (const v of triadVoicings({ root, quality: 'maj', set })) if (!seen.includes(v.inversion)) seen.push(v.inversion);
  return seen;
}

const inversionsUpTheNeck = {
  id: 'triads-inversions-up', title: 'Inversions up the neck', roles: ['warmup', 'focus'], tags, level: 1,
  variants: [{ root: 'C', set: '321' }, { root: 'G', set: '321' }, { root: 'D', set: '432' }, { root: 'A', set: '432' }, { root: 'F', set: '543' }],
  build: ({ root, set }) => {
    const order = inversionsUp(root, set);
    return {
      instruction: `${root} major triads on the ${SET_NAMES[set]} strings: ${order.map((i) => INVERSIONS[i].toLowerCase()).join(', then ')}, climbing the neck and back down. Strum each on beat 1, then pick it as a triplet arpeggio, one chord per click. Before you move, find the root in the next shape.`,
      bpm: { min: 60, max: 92 }, ladder: { by: 4 }, fretboard: null,
      prompt: { label: 'Play', items: order.map((i) => INVERSIONS[i]), everyBars: 2, order: 'cycle' },
      pattern: { notesPerBeat: 3, byPrompt: Object.fromEntries(order.map((i) => [INVERSIONS[i], arpeggio(triad(root, 'maj', set, { inversion: i }))])) },
      success: 'You land each inversion on beat 1 and can say which note is in the bass.',
    };
  },
};

const QUALITIES = [['Major', 'maj'], ['Minor', 'm'], ['Diminished', 'dim'], ['Augmented', 'aug']];

const qualitySwap = {
  id: 'triads-quality-swap', title: 'One note changes the chord', roles: ['focus', 'review'], tags: [...tags, 'ear'], level: 1,
  variants: [{ root: 'C', set: '321' }, { root: 'G', set: '432' }, { root: 'D', set: '321' }],
  build: ({ root, set }) => ({
    instruction: `Root-position ${root} triad on the ${SET_NAMES[set]} strings, and only one note moves at a time. Major; lower the 3 a fret for minor; lower the 5 as well for diminished; back to major and raise the 5 for augmented. Play each as an arpeggio and listen to the mood change.`,
    bpm: { min: 60, max: 84 }, fretboard: null,
    prompt: { label: 'Play', items: QUALITIES.map(([label]) => label), everyBars: 2, order: 'cycle' },
    pattern: { notesPerBeat: 3, byPrompt: Object.fromEntries(QUALITIES.map(([label, q]) => [label, arpeggio(triad(root, q, set, { inversion: 0 }))])) },
    success: 'Your fingers move one note, never the whole hand, and you can hear which chord it is with your eyes closed.',
  }),
};

const oneFourFive = {
  id: 'triads-one-four-five', title: 'I–IV–V without moving', roles: ['focus', 'apply'], tags: [...tags, 'voice-leading', 'chord-changes'], level: 2,
  variants: [{ root: 'G', set: '321', near: 5 }, { root: 'C', set: '321', near: 8 }, { root: 'D', set: '432', near: 7 }, { root: 'A', set: '321', near: 9 }],
  build: ({ root, set, near }) => {
    const chords = [[root, 'I'], [spell(root, '4'), 'IV'], [spell(root, '5'), 'V']];
    const label = ([name, roman]) => `${name} (${roman})`;
    return {
      instruction: `${chords.map(([n]) => n).join(', ')}: the I, IV and V of ${root}, all as triads on the ${SET_NAMES[set]} strings around fret ${near}. Don't jump to a new position for each chord: take whichever inversion is closest, so each change moves a note or two by a fret or two.`,
      bpm: { min: 60, max: 96 }, ladder: { by: 4 }, fretboard: null,
      prompt: { label: 'Chord', items: chords.map(label), everyBars: 2, order: 'cycle' },
      pattern: { notesPerBeat: 3, byPrompt: Object.fromEntries(chords.map((c) => [label(c), arpeggio(triad(c[0], 'maj', set, { near }))])) },
      success: 'The changes sound connected: the top note moves by step and your hand stays in one place.',
    };
  },
};

const triadPairs = {
  id: 'triads-pairs', title: 'Triad pairs over a drone', roles: ['apply'], tags: [...tags, 'improvisation', 'phrasing'], level: 3,
  variants: [{ root: 'A', a: 'D', b: 'E' }, { root: 'E', a: 'A', b: 'B' }, { root: 'G', a: 'C', b: 'D' }],
  build: ({ root, a, b }) => ({
    instruction: `Over the ${root} drone, improvise using only the notes of the ${a} triad for a bar, then only the ${b} triad. Together they give six notes of ${root} major without its 3rd, which sounds open and floating. Mix the order of the notes, skip strings, and slide between the two shapes.`,
    bpm: { min: 70, max: 100 }, fretboard: null, drone: { root },
    prompt: { label: 'Use', items: [`${a} triad`, `${b} triad`], everyBars: 1, order: 'cycle' },
    pattern: { notesPerBeat: 3, byPrompt: { [`${a} triad`]: arpeggio(triad(a, 'maj', '321', { near: 7 })), [`${b} triad`]: arpeggio(triad(b, 'maj', '321', { near: 7 })) } },
    success: 'Phrases that sound like melodies, not arpeggios, and the switch lands on every bar line.',
  }),
};

const ringOut = {
  id: 'triads-ring-out', title: 'Let the changes ring', roles: ['cooldown'], tags: [...tags, 'tone'], level: 1,
  variants: [{ root: 'C', set: '321', near: 5 }, { root: 'G', set: '321', near: 5 }],
  build: ({ root, set, near }) => {
    const chords = [[root, 'maj', root], [spell(root, '6'), 'm', `${spell(root, '6')}m`], [spell(root, '4'), 'maj', spell(root, '4')], [spell(root, '5'), 'maj', spell(root, '5')]];
    return {
      instruction: `Slowly, ${chords.map((c) => c[2]).join(', ')} as triads on the ${SET_NAMES[set]} strings around fret ${near}. Let every chord ring into the next and keep the top note singing.`,
      bpm: null, fretboard: null,
      prompt: { label: 'Chord', items: chords.map((c) => c[2]), everyBars: 2, order: 'cycle' },
      pattern: { notesPerBeat: 3, byPrompt: Object.fromEntries(chords.map(([r, q, name]) => [name, arpeggio(triad(r, q, set, { near }))])) },
      success: 'Each chord rings fully and the top line moves smoothly from one to the next.',
    };
  },
};

export default [inversionsUpTheNeck, qualitySwap, oneFourFive, triadPairs, ringOut];
