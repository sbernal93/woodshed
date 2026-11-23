import { spell } from '../../music/notes.js';
import { voiceLead, shapeNear } from './jazz.js';

const tags = ['blues', 'twelve-bar'];

// The 12-bar form as chord degrees, one per bar. The quick change goes to the IV in bar 2.
const FORM = ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V'];
const QUICK = ['I', 'IV', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V'];
const DEGREE = { I: '1', IV: '4', V: '5' };

// The three dominant chords of a key, labelled "A7 (I)", and the 12 bars as prompt items.
const chordsOf = (key) => Object.entries(DEGREE).map(([deg, d]) => [spell(key, d), '7', `${spell(key, d)}7 (${deg})`]);
const formPrompt = (labels, quick) => ({ label: 'Bar', items: (quick ? QUICK : FORM).map((deg) => labels.find((l) => l.endsWith(`(${deg})`))), everyBars: 1, order: 'cycle' });
const byLabel = (chords, spec) => Object.fromEntries(chords.map((c) => [c.label, spec(c)]));
const arpeggio = (of, notesPerBeat) => ({ type: 'sequence', of, group: 1, direction: 'up', notesPerBeat });
const shell = (c, guideTones) => ({ type: 'shell', root: c.root, quality: c.quality, near: c.near, ...(guideTones ? { guideTones } : {}) });
// The blues box whose middle sits closest to `near`; with no `near` it is box 1, rooted on the low E string.
const box = (key, near) => ({ type: 'caged-scale', root: key, shape: near ? shapeNear(key, 'm', near) : 'E', scale: 'blues', quality: 'm' });

// The boogie shuffle on two strings: root plus 5th, 6th, b7, 6th, two swung hits a beat (first and last triplet).
// The upper note is always on the next string up, which is a 4th above on E, A and D, so it sits 2, 4, 5 frets higher.
function shuffleGrid([string, fret]) {
  const upper = [2, 4, 5, 4].map((d) => [string - 1, fret + d]);
  const events = {};
  upper.forEach((u, beat) => { events[beat * 3] = events[beat * 3 + 2] = [[string, fret, 'd'], [...u, 'd']]; });
  return { type: 'grid', slotsPerBeat: 3, beats: 4, shape: [[string, fret], ...[2, 4, 5].map((d) => [string - 1, fret + d])], events };
}

// Open-position roots for the shuffle: I, IV, V.
const SHUFFLE_KEYS = {
  E: { I: [6, 0], IV: [5, 0], V: [5, 2] },
  A: { I: [5, 0], IV: [4, 0], V: [6, 0] },
};

const shuffle = {
  id: 'blues-shuffle', title: 'The boogie shuffle', roles: ['warmup', 'focus'], tags: [...tags, 'rhythm', 'shuffle'], level: 1,
  variants: [{ key: 'E' }, { key: 'A' }, { key: 'E', quick: true }],
  build: ({ key, quick }) => {
    const labels = chordsOf(key).map((c) => c[2]);
    return {
      instruction: `The shuffle through a ${quick ? 'quick-change ' : ''}12-bar in ${key}, all downstrokes: root plus 5th, 6th, b7, 6th, two hits a beat. Swing it: the second hit lands on the last third of the beat, long-short, never straight. Mute with the side of your picking hand so it chugs. Count the bars without looking: the IV comes in bar ${quick ? '2, back to the I in 3, and again in bar 5' : '5'}, the V in bar 9.`,
      bpm: { min: 70, max: 130 }, backbeat: true, ladder: { by: 6 }, fretboard: null,
      prompt: formPrompt(labels, quick),
      pattern: { notesPerBeat: 2, byPrompt: Object.fromEntries(labels.map((l) => [l, shuffleGrid(SHUFFLE_KEYS[key][l.match(/\((\w+)\)/)[1]])])) },
      success: 'Twelve bars without losing the form or the swing, and every change lands on beat 1 without a gap.',
    };
  },
};

const SHELL_KEYS = [{ key: 'A', near: 5 }, { key: 'G', near: 3 }, { key: 'C', near: 8 }];

const shells = {
  id: 'blues-shells', title: 'The 12-bar in shells', roles: ['review', 'focus'], tags: [...tags, 'chords', 'shells', 'voice-leading'], level: 2,
  variants: SHELL_KEYS,
  build: ({ key, near }) => {
    const chords = voiceLead(chordsOf(key), near);
    return {
      instruction: `The 12-bar in ${key} as dominant 7 shells: root, 3rd and b7. ${chords.map((c) => c.label.split(' ')[0]).join(', ')}, each in the grip closest to the last. Comp on 2 and 4, short. From the I to the IV the 3rd falls a half step to become the new b7: listen for it. Call out the bar numbers 5, 9 and 12 as you get there.`,
      bpm: { min: 60, max: 120 }, backbeat: true, ladder: { by: 6 }, fretboard: null,
      prompt: formPrompt(chords.map((c) => c.label)),
      pattern: { notesPerBeat: 3, byPrompt: byLabel(chords, (c) => arpeggio(shell(c), 3)) },
      success: 'You never lose your place in the form, and each change moves your hand a fret or two at most.',
    };
  },
};

const BOX_KEYS = [{ key: 'A', near: 5 }, { key: 'E', near: 12 }, { key: 'G', near: 3 }];

const thirds = {
  id: 'blues-thirds', title: 'Chase the 3rds', roles: ['review', 'focus', 'apply'], tags: [...tags, 'improvisation', 'guide-tones', 'minor-pentatonic'], level: 3,
  variants: BOX_KEYS,
  build: ({ key, near }) => {
    const chords = voiceLead(chordsOf(key), near);
    const third = (c) => spell(c.root, '3');
    return {
      instruction: `Solo in the ${key} blues box, but at every change land on the new chord's 3rd or b7: ${chords.map((c) => `${third(c)} for ${c.label.split(' ')[0]}`).join(', ')}. None of those 3rds are in the box, so bend or slide into each from a half step below; the b7s are all there. The guide shows the 3rd and b7 of the chord you're on.`,
      bpm: { min: 60, max: 100 }, backbeat: true, fretboard: box(key, near),
      prompt: formPrompt(chords.map((c) => c.label)),
      pattern: { notesPerBeat: 2, byPrompt: byLabel(chords, (c) => arpeggio(shell(c, true), 2)) },
      success: 'Someone listening without the backing could hear where the IV and the V come in, from your line alone.',
    };
  },
};

const arpeggios = {
  id: 'blues-arpeggios', title: 'Dominant arpeggios in one place', roles: ['focus', 'apply'], tags: [...tags, 'arpeggios', 'caged'], level: 3,
  variants: [{ key: 'A', near: 6 }, { key: 'E', near: 4 }, { key: 'C', near: 8 }],
  build: ({ key, near }) => {
    const chords = chordsOf(key).map(([root, quality, label]) => ({ root, quality, label, shape: shapeNear(root, quality, near) }));
    return {
      instruction: `The I7, IV7 and V7 of ${key} as arpeggios around fret ${near}: ${chords.map((c) => `${c.label.split(' ')[0]} in the ${c.shape} shape`).join(', ')}. Run up the one for the bar you're in. Then make it music: when the chord changes, carry on from the nearest note of the new arpeggio instead of restarting.`,
      bpm: { min: 60, max: 100 }, backbeat: true, ladder: { by: 4 }, fretboard: null,
      prompt: formPrompt(chords.map((c) => c.label)),
      pattern: { notesPerBeat: 2, byPrompt: byLabel(chords, (c) => arpeggio({ type: 'caged-arpeggio', root: c.root, quality: c.quality, shape: c.shape }, 2)) },
      success: 'All 12 bars without leaving the area, and every change heard in your line.',
    };
  },
};

const callResponse = {
  id: 'blues-call-response', title: 'Call, call, answer', roles: ['apply'], tags: [...tags, 'improvisation', 'phrasing'], level: 2,
  variants: [{ key: 'A' }, { key: 'E', quick: true }, { key: 'G' }],
  build: ({ key, quick }) => {
    const labels = chordsOf(key).map((c) => c[2]);
    return {
      instruction: `Solo like a blues lyric: a short call in bars 1–2, then rest. Play the same call again over the IV in bars 5–6 and let the new chord change how it sounds. Answer it in bars 9–10, then rest to the top. Each phrase is a sentence; the rests are where the singer breathes.`,
      bpm: { min: 60, max: 96 }, backbeat: true, challenge: { everyBars: 12 }, fretboard: box(key),
      prompt: formPrompt(labels, quick),
      success: 'Three phrases per chorus, the second the same as the first, and silence you can hear in between.',
    };
  },
};

const slow = {
  id: 'blues-slow', title: 'Slow blues', roles: ['cooldown'], tags: [...tags, 'chords', 'shells', 'tone'], level: 1,
  variants: [{ key: 'G', near: 3 }, { key: 'A', near: 5 }],
  build: ({ key, near }) => {
    const chords = voiceLead(chordsOf(key), near);
    return {
      instruction: `A slow 12-bar in ${key}, one shell per bar, let ring. Every few bars, pick out the top note and add a slow vibrato. Hear the b7 on the I: it's what makes a blues tonic restless.`,
      bpm: null, fretboard: null,
      prompt: formPrompt(chords.map((c) => c.label)),
      pattern: { notesPerBeat: 3, byPrompt: byLabel(chords, (c) => arpeggio(shell(c), 3)) },
      success: 'Every chord rings fully, and the form never slips even with no click.',
    };
  },
};

export default [shuffle, shells, thirds, arpeggios, callResponse, slow];
