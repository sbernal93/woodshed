import { spell } from '../../music/notes.js';
import { cagedMarks } from '../../music/chords.js';
import { nearestShell } from '../../music/jazz.js';

const tags = ['jazz', 'chords', 'voice-leading'];
const name = (root, quality) => `${root}${quality}`;
const shell = (root, quality, near, guideTones) => ({ type: 'shell', root, quality, near, ...(guideTones ? { guideTones } : {}) });
const arpeggio = (of, notesPerBeat = 3) => ({ type: 'sequence', of, group: 1, direction: 'up', notesPerBeat });

// Each chord takes the shell closest to the one before it, so a progression moves by a fret or two, never by a jump.
export function voiceLead(chords, near) {
  let at = near;
  return chords.map(([root, quality, label]) => {
    at = nearestShell({ root, quality, near: at })[0].fret;
    return { root, quality, label: label ?? name(root, quality), near: at };
  });
}

const twoFiveOne = (key) => [[spell(key, '2'), 'm7', `${spell(key, '2')}m7 (ii)`], [spell(key, '5'), '7', `${spell(key, '5')}7 (V)`], [key, 'maj7', `${key}maj7 (I)`]];
const byLabel = (chords, spec) => Object.fromEntries(chords.map((c) => [c.label, spec(c)]));
const chordPrompt = (chords, everyBars = 2) => ({ label: 'Chord', items: chords.map((c) => c.label), everyBars, order: 'cycle' });

const CYCLES = [{ quality: '7', from: 'C' }, { quality: 'm7', from: 'D' }, { quality: 'maj7', from: 'G' }];

const shellsCycle = {
  id: 'jazz-shells-cycle', title: 'Shells round the cycle', roles: ['warmup', 'review'], tags: [...tags, 'shells'], level: 2,
  variants: CYCLES,
  build: ({ quality, from }) => {
    const roots = [from];
    while (roots.length < 6) roots.push(spell(roots.at(-1), '4'));
    const chords = voiceLead(roots.map((r) => [r, quality]), 5);
    return {
      instruction: `${quality === 'maj7' ? 'Major 7' : quality === 'm7' ? 'Minor 7' : 'Dominant 7'} shells up a fourth each bar: ${chords.map((c) => c.label).join(', ')}. Root, 3rd and 7th only. The root swaps between the 6th and 5th strings, so each change moves your hand a fret or two, with one jump back up the neck. Strum on beat 1, then pick the three notes, saying which one is the 3rd.`,
      bpm: { min: 60, max: 100 }, backbeat: true, ladder: { by: 4 }, fretboard: null,
      prompt: chordPrompt(chords, 1),
      pattern: { notesPerBeat: 3, byPrompt: byLabel(chords, (c) => arpeggio(shell(c.root, c.quality, c.near))) },
      success: 'Every change lands on beat 1 without looking, and every move is the smallest one there is.',
    };
  },
};

const KEYS = [{ key: 'C', near: 4 }, { key: 'F', near: 7 }, { key: 'Bb', near: 7 }, { key: 'G', near: 4 }];

const twoFiveOneShells = {
  id: 'jazz-two-five-one', title: 'ii–V–I in shells', roles: ['review', 'focus', 'apply'], tags: [...tags, 'shells', 'ii-v-i'], level: 2,
  variants: KEYS,
  build: ({ key, near }) => {
    const chords = voiceLead(twoFiveOne(key), near);
    return {
      instruction: `The ii–V–I in ${key}: ${chords.map((c) => c.label.split(' ')[0]).join(', ')}, two bars each, as shells. Comp on beats 2 and 4 like a big-band guitarist, short and dry. On every change one note stays and the other slips down a fret: find that note and hear it move.`,
      bpm: { min: 60, max: 120 }, backbeat: true, ladder: { by: 6 }, fretboard: null,
      prompt: chordPrompt(chords),
      pattern: { notesPerBeat: 3, byPrompt: byLabel(chords, (c) => arpeggio(shell(c.root, c.quality, c.near))) },
      success: 'Your hand barely moves through the changes, and you can name the note that falls each time.',
    };
  },
};

const guideTones = {
  id: 'jazz-guide-tones', title: 'Guide-tone lines', roles: ['review', 'focus', 'apply'], tags: [...tags, 'guide-tones', 'ii-v-i', 'improvisation'], level: 3,
  variants: KEYS,
  build: ({ key, near }) => {
    const chords = voiceLead(twoFiveOne(key), near);
    return {
      instruction: `Only the 3rd and 7th of each chord through the ii–V–I in ${key}: two notes that spell the whole harmony. The 7th of one chord falls a half step to the 3rd of the next. First play them as long notes and sing the line; then improvise, starting every phrase on a guide tone and ending on one when the chord changes.`,
      bpm: { min: 60, max: 110 }, backbeat: true, fretboard: null,
      prompt: chordPrompt(chords),
      pattern: { notesPerBeat: 2, byPrompt: byLabel(chords, (c) => arpeggio(shell(c.root, c.quality, c.near, true), 2)) },
      success: 'You can play and sing the guide-tone line without the root, and your solo lines land on a 3rd or 7th at every change.',
    };
  },
};

// The CAGED shape of a chord whose middle sits closest to `near`, so all three arpeggios share one area of the neck.
export function shapeNear(root, quality, near) {
  const mid = (shape) => {
    const frets = cagedMarks({ root, shape, quality: quality.startsWith('m') ? 'm' : 'maj' }).map((m) => m.fret);
    return (Math.min(...frets) + Math.max(...frets)) / 2;
  };
  return [...'CAGED'].reduce((a, b) => (Math.abs(mid(b) - near) < Math.abs(mid(a) - near) ? b : a));
}

const arpeggios = {
  id: 'jazz-arpeggios', title: 'ii–V–I arpeggios in one place', roles: ['focus', 'apply'], tags: [...tags, 'arpeggios', 'ii-v-i', 'caged'], level: 3,
  variants: [{ key: 'C', near: 8 }, { key: 'G', near: 5 }, { key: 'F', near: 6 }],
  build: ({ key, near }) => {
    const chords = twoFiveOne(key).map(([root, quality, label]) => ({ root, quality, label, shape: shapeNear(root, quality, near) }));
    return {
      instruction: `7th-chord arpeggios for the ii–V–I in ${key}, all around fret ${near}: ${chords.map((c) => `${c.label.split(' ')[0]} in the ${c.shape} shape`).join(', ')}. Run each up from its lowest note. Then the real test: when the chord changes, don't restart. Carry on from the nearest note of the new chord, ideally its 3rd.`,
      bpm: { min: 60, max: 100 }, backbeat: true, ladder: { by: 4 }, fretboard: null,
      prompt: chordPrompt(chords),
      pattern: { notesPerBeat: 2, byPrompt: byLabel(chords, (c) => arpeggio({ type: 'caged-arpeggio', root: c.root, quality: c.quality, shape: c.shape }, 2)) },
      success: 'The changes are audible in your line alone: every new chord starts on one of its own notes, a step from where you were.',
    };
  },
};

// The Charleston: a chord on 1 and another on the "and" of 2, then silence. Shells are plucked thumb, index, middle.
const charlestonGrid = (marks) => {
  const hit = marks.map((m, i) => [m.string, m.fret, ['p', 'i', 'm'][i]]);
  return { type: 'grid', slotsPerBeat: 2, beats: 4, shape: marks.map((m) => [m.string, m.fret]), events: { 0: hit, 3: hit } };
};

const charleston = {
  id: 'jazz-charleston', title: 'Charleston comping', roles: ['apply'], tags: [...tags, 'comping', 'rhythm', 'ii-v-i'], level: 2,
  variants: [{ key: 'C', near: 4 }, { key: 'Bb', near: 7 }, { key: 'F', near: 7 }],
  build: ({ key, near }) => {
    const chords = voiceLead(twoFiveOne(key), near);
    return {
      instruction: `Comp the ii–V–I in ${key} with the Charleston rhythm: a short chord on 1, another on the "and" of 2, then nothing for beats 3 and 4. Thumb on the root, fingers on the 3rd and 7th. Kill each chord by easing off the strings: the silence is half the groove. Once it sits, anticipate the next chord on the "and" of 4.`,
      bpm: { min: 80, max: 160 }, backbeat: true, ladder: { by: 8 }, fretboard: null,
      prompt: chordPrompt(chords),
      pattern: { notesPerBeat: 2, byPrompt: byLabel(chords, (c) => charlestonGrid(nearestShell(c))) },
      success: 'Both hits are short and exactly placed, beats 3 and 4 are truly silent, and it swings at the top tempo.',
    };
  },
};

const ballad = {
  id: 'jazz-ballad', title: 'Ballad changes', roles: ['cooldown'], tags: [...tags, 'shells', 'tone'], level: 1,
  variants: [{ key: 'C', near: 3 }, { key: 'G', near: 3 }],
  build: ({ key, near }) => {
    const chords = voiceLead([[key, 'maj7'], [spell(key, '6'), 'm7'], [spell(key, '2'), 'm7'], [spell(key, '5'), '7']], near);
    return {
      instruction: `Slowly, ${chords.map((c) => c.label).join(', ')}: the I–vi–ii–V that turns around under a thousand standards. Let each shell ring for its whole bar and listen to the top note move.`,
      bpm: null, fretboard: null,
      prompt: chordPrompt(chords),
      pattern: { notesPerBeat: 3, byPrompt: byLabel(chords, (c) => arpeggio(shell(c.root, c.quality, c.near))) },
      success: 'Every chord rings fully, and the changes are quiet and connected.',
    };
  },
};

export default [shellsCycle, twoFiveOneShells, guideTones, arpeggios, charleston, ballad];
