import { pitchClass } from '../music/notes.js';

const FADE = 0.4;
const LEVEL = 0.18;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

// Root at octave 2 (A -> A2, 110 Hz), its fifth, and the root an octave up: phone speakers barely play below ~150 Hz.
export function droneFrequencies(root) {
  const midi = 36 + pitchClass(root);
  return [hz(midi), hz(midi + 7), hz(midi + 12)];
}

export function startDrone(ctx, root) {
  const [rootHz, fifthHz, upperHz] = droneFrequencies(root);
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

  const upperGain = ctx.createGain();
  upperGain.gain.setValueAtTime(0.5, t);
  upperGain.connect(master);
  const upper = ctx.createOscillator();
  upper.type = 'sine';
  upper.frequency.value = upperHz;
  upper.connect(upperGain);

  const voices = [low, fifth, upper];
  voices.forEach((v) => v.start(t));
  return () => {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    // Hold wherever the fade-in had reached; otherwise the ramp restarts from 0 and clicks.
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + FADE);
    voices.forEach((v) => v.stop(now + FADE));
  };
}
