import { validateTrack, createRegistry, DURATIONS } from '../../src/data/schema.js';

const step = (kind, seconds) => ({ kind, title: kind, seconds, instruction: 'Do it', bpm: null, fretboard: null, success: 'Clean' });
const track = (over = {}) => ({
  id: 't', title: 'T', category: 'application', summary: 'S',
  sessions: [{ id: 's1', title: 'S1', focus: 'F', durations: { 15: [step('warmup', 180), step('focus', 420), step('apply', 240), step('cooldown', 60)] } }],
  ...over,
});

test('durations are 15, 20 and 30 minutes', () => expect(DURATIONS).toEqual([15, 20, 30]));
test('accepts a well-formed track', () => expect(() => validateTrack(track())).not.toThrow());
test('rejects an unknown category', () => expect(() => validateTrack(track({ category: 'kazoo' }))).toThrow(/category/));
test('rejects a session with no durations', () =>
  expect(() => validateTrack(track({ sessions: [{ id: 's', title: 'S', focus: 'F', durations: {} }] }))).toThrow(/duration/));
test('rejects steps that do not add up to the duration', () =>
  expect(() => validateTrack(track({ sessions: [{ id: 's', title: 'S', focus: 'F', durations: { 15: [step('focus', 600)] } }] }))).toThrow(/seconds/));
test('rejects an unknown step kind', () =>
  expect(() => validateTrack(track({ sessions: [{ id: 's', title: 'S', focus: 'F', durations: { 15: [step('nap', 900)] } }] }))).toThrow(/kind/));
test('error names the track', () => expect(() => validateTrack(track({ category: 'kazoo' }))).toThrow(/"t"/));

test('registry round-trips and rejects duplicates', () => {
  const r = createRegistry();
  r.register(track());
  expect(r.get('t').title).toBe('T');
  expect(r.list().map((x) => x.id)).toEqual(['t']);
  expect(() => r.register(track())).toThrow(/already registered/);
});
test('registry get throws for an unknown id', () => expect(() => createRegistry().get('nope')).toThrow(/nope/));

test('shipped tracks register and validate', async () => {
  const { tracks } = await import('../../src/data/tracks/index.js');
  expect(tracks.list().length).toBeGreaterThan(0);
});

const withStep = (extra) => track({ sessions: [{ id: 's', title: 'S', focus: 'F', durations: { 15: [{ ...step('focus', 900), ...extra }] } }] });

test('accepts prompt, drone and ladder on a step', () =>
  expect(() => validateTrack(withStep({
    prompt: { label: 'Land on', items: ['b3', '5'], everyBars: 4, order: 'cycle', root: 'A' },
    drone: { root: 'A' },
    ladder: { by: 4 },
  }))).not.toThrow());
test('rejects a prompt with no items', () =>
  expect(() => validateTrack(withStep({ prompt: { label: 'x', items: [], everyBars: 4, order: 'cycle' } }))).toThrow(/prompt/));
test('rejects a prompt with an unknown order', () =>
  expect(() => validateTrack(withStep({ prompt: { label: 'x', items: ['1'], everyBars: 4, order: 'shuffle' } }))).toThrow(/prompt/));
test('rejects a drone on an unknown note', () =>
  expect(() => validateTrack(withStep({ drone: { root: 'H' } }))).toThrow(/drone/));
test('rejects a ladder step of zero', () =>
  expect(() => validateTrack(withStep({ ladder: { by: 0 } }))).toThrow(/ladder/));
