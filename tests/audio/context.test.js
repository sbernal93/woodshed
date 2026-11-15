let made = 0;
let resumed = 0;
class FakeContext {
  constructor() { made++; this.state = 'suspended'; }
  resume() { resumed++; this.state = 'running'; return Promise.resolve(); }
}

beforeEach(() => { made = 0; resumed = 0; globalThis.AudioContext = FakeContext; vi.resetModules(); });

test('returns one shared context and resumes it when suspended', async () => {
  const { getAudioContext } = await import('../../src/audio/context.js');
  const a = getAudioContext();
  expect(getAudioContext()).toBe(a);
  expect([made, resumed]).toEqual([1, 1]);
});

test('resumes after an iOS interruption (phone call, Siri)', async () => {
  const { getAudioContext } = await import('../../src/audio/context.js');
  const a = getAudioContext();
  a.state = 'interrupted';
  getAudioContext();
  expect(a.state).toBe('running');
});

test('replaces a context that was closed', async () => {
  const { getAudioContext } = await import('../../src/audio/context.js');
  const a = getAudioContext();
  a.state = 'closed';
  expect(getAudioContext()).not.toBe(a);
  expect(made).toBe(2);
});
