let ctx = null;

// One context for the whole app: Safari caps live AudioContexts, and iOS only unlocks one inside a tap.
export function getAudioContext() {
  if (!ctx || ctx.state === 'closed') ctx = new AudioContext();
  // iOS reports 'interrupted' after a phone call or Siri; both that and 'suspended' need a resume.
  if (ctx.state !== 'running') ctx.resume();
  return ctx;
}
