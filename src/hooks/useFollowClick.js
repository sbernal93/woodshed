import { useEffect, useRef } from 'react';
import { getAudioContext } from '../audio/context.js';
import { beatSlots } from '../session/patterns.js';

// While the metronome runs, light each slot when its click (or subdivision) actually sounds,
// starting from the next beat 1. Returns whether the guide is following the click, and a live check the demo
// timer can use: the first clicks arrive before React re-renders, so `following` alone is a step late.
function reset(l) {
  l.timers.forEach(clearTimeout);
  l.timers.clear();
  l.count = -1;
}

export function useFollowClick({ metronome, slotsPerBeat, length, onSlot }) {
  const following = metronome.running;
  const live = useRef({ bpm: metronome.bpm, onSlot, count: -1, timers: new Set() });
  live.current.bpm = metronome.bpm;
  live.current.onSlot = onSlot;

  useEffect(() => metronome.onBeat((beatInBar, _accent, time) => {
    const l = live.current;
    if (l.count < 0 && beatInBar !== 0) return;
    l.count++;
    const now = getAudioContext().currentTime;
    for (const { slot, at } of beatSlots(l.count, slotsPerBeat, time, l.bpm, length)) {
      const id = setTimeout(() => { l.timers.delete(id); l.onSlot(slot); }, Math.max(0, (at - now) * 1000));
      l.timers.add(id);
    }
  }), [metronome.onBeat, slotsPerBeat, length]);

  // Stopping the click drops pending highlights and the next start waits for beat 1 again.
  // Only on stop: the first beats of a start arrive before React re-renders, so a reset on start would lose them.
  useEffect(() => {
    if (!following) reset(live.current);
  }, [following]);
  useEffect(() => () => reset(live.current), []);

  return { following, clickActive: () => live.current.count >= 0 };
}
