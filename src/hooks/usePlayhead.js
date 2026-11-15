import { useEffect, useRef, useState } from 'react';
import { getAudioContext } from '../audio/context.js';
import { playheadIndex } from '../session/patterns.js';

// Which pattern note is "now". With the click running it follows the click's own scheduled audio times,
// so the highlight can't drift from what you hear; with the click off it previews at the same tempo.
// Only re-renders when the note changes.
// Mount one per pattern (key it by step and prompt) so a shorter pattern never sees a stale index.
export function usePlayhead({ metronome, frozen, notesPerBeat, length }) {
  const [index, setIndex] = useState(0);
  const [countIn, setCountIn] = useState(false);
  const beats = useRef(0);
  const bpm = useRef(metronome.bpm);
  bpm.current = metronome.bpm;
  const { running: clickRunning, subscribe } = metronome;

  useEffect(() => {
    if (frozen) return undefined;
    let frame;
    let last = performance.now();
    const queue = [];
    let lastBeat = null;
    let count = -1;
    // With the click on, the pattern waits for the next beat 1 of a bar: a built-in count-in.
    if (clickRunning) beats.current = 0;
    setCountIn(clickRunning);
    const unsubscribe = clickRunning
      ? subscribe((beatInBar, __, time) => {
        if (count < 0 && beatInBar !== 0) return;
        queue.push({ n: ++count, time });
      })
      : () => {};

    const loop = () => {
      const now = performance.now();
      if (clickRunning) {
        const audioNow = getAudioContext().currentTime;
        while (queue.length && queue[0].time <= audioNow) lastBeat = queue.shift();
        if (lastBeat) setCountIn(false);
        if (lastBeat) beats.current = lastBeat.n + Math.min(1, ((audioNow - lastBeat.time) * bpm.current) / 60);
      } else {
        beats.current += ((now - last) / 60000) * bpm.current;
      }
      last = now;
      const i = playheadIndex(beats.current, notesPerBeat, length);
      setIndex((prev) => (prev === i ? prev : i));
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, [clickRunning, frozen, notesPerBeat, length, subscribe]);

  return { index, countIn };
}
