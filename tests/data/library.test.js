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

test('every diagram and pattern in every variant resolves to real notes', async () => {
  const { resolveFretboard } = await import('../../src/music/resolve.js');
  const { resolvePattern } = await import('../../src/session/patterns.js');
  const { resolveGrid } = await import('../../src/session/grid.js');
  for (const ex of exercises.list()) {
    (ex.variants ?? [{}]).forEach((_, v) => {
      const step = exercises.build(ex.id, v);
      if (step.fretboard) expect(resolveFretboard(step.fretboard).marks.length, `${ex.id} ${v}`).toBeGreaterThan(0);
      const specs = step.pattern ? (step.pattern.byPrompt ? Object.values(step.pattern.byPrompt) : [step.pattern.spec]) : [];
      for (const spec of specs) {
        const notes = spec.type === 'grid' ? resolveGrid(spec).slots : resolvePattern(spec);
        expect(notes.length, `${ex.id} ${v}`).toBeGreaterThan(0);
      }
    });
  }
});

test('CAGED exercises walk the shapes up the neck from the lowest one for the key', () => {
  const variantOf = (id, match) => exercises.get(id).variants.findIndex((v) => Object.entries(match).every(([k, x]) => v[k] === x));
  expect(exercises.build('caged-arpeggios', variantOf('caged-arpeggios', { root: 'C' })).prompt.items)
    .toEqual(['C shape', 'A shape', 'G shape', 'E shape', 'D shape']);
  expect(exercises.build('caged-arpeggios', variantOf('caged-arpeggios', { root: 'G' })).prompt.items)
    .toEqual(['G shape', 'E shape', 'D shape', 'C shape', 'A shape']);
  const seq = exercises.build('caged-scale-sequences', variantOf('caged-scale-sequences', { root: 'G', shape: 'E' }));
  expect(seq.fretboard).toEqual({ type: 'caged-scale', root: 'G', shape: 'E' });
  expect(seq.instruction).toMatch(/G major.*E shape.*frets 2–5/);
  const targets = exercises.build('caged-chord-tones', variantOf('caged-chord-tones', { root: 'D', shape: 'C' }));
  expect(targets.drone.root).toBe('D');
  expect(targets.prompt).toMatchObject({ root: 'D', items: ['1', '3', '5'] });
});

test('neck climb snakes through every shape up the neck, alternating direction', () => {
  const ex = exercises.get('caged-neck-climb');
  const v = ex.variants.findIndex((x) => x.root === 'G' && x.group === 1);
  const step = exercises.build('caged-neck-climb', v);
  expect(step.prompt.items).toEqual(['G shape, up', 'E shape, down', 'D shape, up', 'C shape, down', 'A shape, up']);
  expect(step.pattern.byPrompt['E shape, down']).toMatchObject({ direction: 'down', of: { type: 'caged-scale', root: 'G', shape: 'E' } });
});

test('scale swap keeps one shape and changes the scale', () => {
  const step = exercises.build('caged-scale-swap', 0);
  const specs = Object.values(step.pattern.byPrompt);
  expect(specs.map((s) => s.of.scale)).toEqual(['majorPentatonic', 'major', 'mixolydian']);
  expect(new Set(specs.map((s) => `${s.of.root}-${s.of.shape}`)).size).toBe(1);
  expect(step.drone.root).toBe(specs[0].of.root);
});

test('shape switch alternates two shapes of the same chord', () => {
  const step = exercises.build('caged-shape-switch', 0);
  expect(step.prompt.items).toHaveLength(2);
  const roots = Object.values(step.pattern.byPrompt).map((s) => s.of.root);
  expect(roots[0]).toBe(roots[1]);
});

test('triad exercises: inversions climb the neck, chords move to the nearest voicing', () => {
  const up = exercises.build('triads-inversions-up', 0);
  expect(up.prompt.items).toEqual(['2nd inversion', 'Root position', '1st inversion']);
  expect(up.instruction).toMatch(/C major.*G B e/);

  const swap = exercises.build('triads-quality-swap', 0);
  expect(Object.values(swap.pattern.byPrompt).map((s) => s.of.quality)).toEqual(['maj', 'm', 'dim', 'aug']);

  const g = exercises.get('triads-one-four-five').variants.findIndex((v) => v.root === 'G');
  const ifv = exercises.build('triads-one-four-five', g);
  expect(ifv.prompt.items).toEqual(['G (I)', 'C (IV)', 'D (V)']);
  expect(Object.values(ifv.pattern.byPrompt).map((s) => s.of.root)).toEqual(['G', 'C', 'D']);
  expect(new Set(Object.values(ifv.pattern.byPrompt).map((s) => s.of.near)).size).toBe(1);

  const pairs = exercises.build('triads-pairs', 0);
  expect(pairs.drone.root).toBe('A');
  expect(pairs.prompt.items).toEqual(['D triad', 'E triad']);
});

test('style licks: the notes they claim, in every key they offer', async () => {
  const { resolvePattern } = await import('../../src/session/patterns.js');
  const degrees = (id, v = 0) => resolvePattern(exercises.build(id, v).pattern.spec).map((n) => n.degree).join(' ');
  expect(degrees('mayer-blues-major')).toBe('b3 3 5 1 b7 5 4 3');
  expect(degrees('mayer-triad-slides')).toBe('b7 1 3 5 1 6 1 5');
  expect(degrees('hendrix-thumb-over')).toBe('1 3 5 6 1 2 1 5');
  expect(degrees('hendrix-c-shape')).toBe('1 3 5 6 1 2 3 1');
  for (const id of ['mayer-blues-major', 'mayer-triad-slides', 'hendrix-thumb-over', 'hendrix-c-shape']) {
    exercises.get(id).variants.forEach((_, v) => expect(degrees(id, v), `${id} ${v}`).toBe(degrees(id, 0)));
  }
});
