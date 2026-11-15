import { pitchClass } from '../music/notes.js';

const FADE = 0.4;
const LEVEL = 0.18;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

// Root at octave 2 (A -> A2, 110 Hz) and the fifth above it.
export function droneFrequencies(root) {
  const midi = 36 + pitchClass(root);
  return [hz(midi), hz(midi + 7)];
}

export function startDrone(ctx, root) {
  const [rootHz, fifthHz] = droneFrequencies(root);
  const t = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, t);
  master.gain.linearRampToValueAtTime(LEVEL, t + FADE);
  master.connect(ctx.destination);

  const low = ctx.createOscillator();
  low.type = 'triangle';
  low.frequency.value = rootHz;
  low.connect(master);

  const fifthGain = ctx.createGain();
  fifthGain.gain.setValueAtTime(0.45, t);
  fifthGain.connect(master);
  const fifth = ctx.createOscillator();
  fifth.type = 'sine';
  fifth.frequency.value = fifthHz;
  fifth.connect(fifthGain);

  low.start(t);
  fifth.start(t);
  return () => {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.linearRampToValueAtTime(0, now + FADE);
    low.stop(now + FADE);
    fifth.stop(now + FADE);
  };
}
