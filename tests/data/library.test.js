import { createLibrary, expandSession } from '../../src/data/library.js';
import { validateStep } from '../../src/data/schema.js';
import { exercises } from '../../src/data/exercises/index.js';

const box = { type: 'pentatonic', root: 'A', quality: 'minor', position: 1 };
const exercise = (over = {}) => ({
  id: 'ex', title: 'Ex', roles: ['focus'], tags: ['t'], level: 1,
  variants: [{ root: 'A' }, { root: 'E' }],
  build: ({ root }) => ({ instruction: `In ${root}`, success: 'Clean', bpm: null, fretboard: { ...box, root } }),
  ...over,
});

test('builds a variant with the exercise title and its id', () => {
  const lib = createLibrary([exercise()]);
  expect(lib.build('ex', 1)).toMatchObject({ title: 'Ex', instruction: 'In E', exercise: 'ex', variant: 1 });
});

test('variant defaults to the first, and exercises without variants build from {}', () => {
  const lib = createLibrary([exercise(), exercise({ id: 'plain', variants: undefined, build: () => ({ instruction: 'x', success: 'y', bpm: null, fretboard: box }) })]);
  expect(lib.build('ex').instruction).toBe('In A');
  expect(lib.build('plain').variant).toBe(0);
});

test('rejects duplicate ids, unknown ids and out-of-range variants by name', () => {
  expect(() => createLibrary([exercise(), exercise()])).toThrow(/"ex".*already/);
  const lib = createLibrary([exercise()]);
  expect(() => lib.build('nope')).toThrow(/nope/);
  expect(() => lib.build('ex', 2)).toThrow(/"ex".*variant 2/);
});

test('rejects malformed exercises', () => {
  expect(() => createLibrary([exercise({ roles: ['nap'] })])).toThrow(/roles/);
  expect(() => createLibrary([exercise({ level: 0 })])).toThrow(/level/);
  expect(() => createLibrary([exercise({ variants: [] })])).toThrow(/variants/);
  expect(() => createLibrary([exercise({ build: null })])).toThrow(/build/);
});

const recipe = (over = {}) => ({
  id: 's', title: 'S', focus: 'F',
  steps: [{ kind: 'focus', exercise: 'ex', variant: 1 }, { kind: 'focus', exercise: 'ex' }],
  timing: { 15: [600, 300], 20: [900, 300] },
  ...over,
});

test('expands a recipe into steps per duration', () => {
  const session = expandSession(recipe(), createLibrary([exercise()]));
  expect(session).toMatchObject({ id: 's', title: 'S', focus: 'F' });
  expect(session.durations[15].map((s) => [s.kind, s.seconds, s.instruction])).toEqual([['focus', 600, 'In E'], ['focus', 300, 'In A']]);
  expect(session.durations[20].map((s) => s.seconds)).toEqual([900, 300]);
});

test('a step kind must be one of the exercise roles', () =>
  expect(() => expandSession(recipe({ steps: [{ kind: 'warmup', exercise: 'ex' }, { kind: 'focus', exercise: 'ex' }] }), createLibrary([exercise()]))).toThrow(/"ex".*warmup/));

test('timing needs one length per step', () =>
  expect(() => expandSession(recipe({ timing: { 15: [900] } }), createLibrary([exercise()]))).toThrow(/15.*2 steps/));

test('every shipped exercise builds a valid step for every variant', () => {
  for (const ex of exercises.list()) {
    (ex.variants ?? [{}]).forEach((_, v) => {
      const where = `${ex.id} variant ${v}`;
      expect(() => validateStep({ kind: ex.roles[0], seconds: 60, ...exercises.build(ex.id, v) }, where)).not.toThrow();
    });
  }
});

test('pentatonic variants follow their root and box', () => {
  const ids = exercises.list().map((e) => e.id);
  const variantOf = (id, match) => exercises.get(id).variants.findIndex((v) => Object.entries(match).every(([k, x]) => v[k] === x));

  const seqE = exercises.build('pentatonic-sequences', variantOf('pentatonic-sequences', { root: 'E', position: 1 }));
  expect(seqE.instruction).toMatch(/E-G-A, G-A-B, A-B-D/);
  expect(seqE.fretboard).toMatchObject({ root: 'E', position: 1 });
  expect(Object.values(seqE.pattern.byPrompt).every((p) => p.of.root === 'E')).toBe(true);

  const targetE = exercises.build('pentatonic-land-the-target', variantOf('pentatonic-land-the-target', { root: 'E' }));
  expect(targetE.drone.root).toBe('E');
  expect(targetE.prompt.root).toBe('E');
  expect(targetE.instruction).toMatch(/E drone/);

  const lick = exercises.build('pentatonic-move-a-lick', 0);
  expect(lick.instruction).toMatch(/^Play an A minor.*box 2 \(frets 7–10/);
  expect(ids).toContain('fingerstyle-thumb-alone');
});
