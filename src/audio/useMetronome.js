import { useCallback, useEffect, useRef, useState } from 'react';
import { Metronome, clampBpm } from './metronome.js';
import { getAudioContext } from './context.js';

export function useMetronome(initialBpm = 80) {
  const ref = useRef(null);
  const [bpm, setBpmState] = useState(clampBpm(initialBpm));
  const [running, setRunning] = useState(false);
  const [subdivision, setSubdivisionState] = useState(1);
  const [accent, setAccentState] = useState(true);

  // The shared AudioContext is first created inside a tap, which is what unlocks audio on iOS.
  const engine = useCallback(() => {
    if (!ref.current) ref.current = new Metronome({ audioContext: getAudioContext() });
    return ref.current;
  }, []);

  useEffect(() => () => {
    ref.current?.stop();
    ref.current = null;
  }, []);

  const setBpm = useCallback((n) => {
    const v = clampBpm(n);
    setBpmState(v);
    ref.current?.setBpm(v);
  }, []);

  const setSubdivision = useCallback((n) => {
    setSubdivisionState(n);
    ref.current?.setSubdivision(n);
  }, []);

  const setAccent = useCallback((on) => {
    setAccentState(on);
    ref.current?.setAccent(on);
  }, []);

  const toggle = useCallback(() => {
    const m = engine();
    if (m.isRunning()) {
      m.stop();
      setRunning(false);
      return;
    }
    m.setBpm(bpm);
    m.setSubdivision(subdivision);
    m.setAccent(accent);
    m.start();
    setRunning(true);
  }, [engine, bpm, subdivision, accent]);

  const tap = useCallback(() => {
    const m = engine();
    m.setBpm(bpm);
    const next = m.tap();
    if (next !== null) setBpmState(next);
  }, [engine, bpm]);

  // Listen to scheduled beats (beatInBar, isAccent, audioTime); a no-op until the click has been started once.
  const subscribe = useCallback((cb) => (ref.current ? ref.current.onBeat(cb) : () => {}), []);

  return { bpm, setBpm, running, toggle, tap, subdivision, setSubdivision, accent, setAccent, subscribe };
}
