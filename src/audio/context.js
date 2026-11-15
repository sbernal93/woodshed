let ctx = null;

// One context for the whole app: Safari caps live AudioContexts, and iOS only unlocks one inside a tap.
export function getAudioContext() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
