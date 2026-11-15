import { getAudioContext } from '../../src/audio/context.js';

test('returns one shared context and resumes it when suspended', () => {
  let resumed = 0;
  globalThis.AudioContext = class { constructor() { this.state = 'suspended'; } resume() { resumed++; return Promise.resolve(); } };
  const a = getAudioContext();
  expect(getAudioContext()).toBe(a);
  expect(resumed).toBe(2);
});
