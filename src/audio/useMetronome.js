import { useCallback, useEffect, useRef, useState } from 'react';
import { Metronome, clampBpm } from './metronome.js';
import { getAudioContext } from './context.js';

export function useMetronome(initialBpm = 80) {
  const ref = useRef(null);
  const [bpm, setBpmState] = useState(clampBpm(initialBpm));
  const [running, setRunning] = useState(false);
  const [subdivision, setSubdivisionState] = useState(1);
  const [accent, setAccentState] = useState(true);
  const [backbeat, setBackbeatState] = useState(false);
  const [silentBars, setSilentBarsState] = useState(0);

  // The shared AudioContext is first created inside a tap, which is what unlocks audio on iOS.
  // Listeners can subscribe before the engine exists, so nothing misses the very first click.
  const listeners = useRef(new Set());
  const engine = useCallback(() => {
    if (!ref.current) {
      ref.current = new Metronome({ audioContext: getAudioContext() });
      ref.current.onBeat((...beat) => listeners.current.forEach((cb) => cb(...beat)));
    }
    return ref.current;
  }, []);
  const onBeat = useCallback((cb) => {
    listeners.current.add(cb);
    return () => listeners.current.delete(cb);
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

  const setBackbeat = useCallback((on) => {
    setBackbeatState(on);
    ref.current?.setBackbeat(on);
  }, []);

  const setSilentBars = useCallback((n) => {
    setSilentBarsState(n);
    ref.current?.setSilentBars(n);
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
    m.setBackbeat(backbeat);
    m.setSilentBars(silentBars);
    m.start();
    setRunning(true);
  }, [engine, bpm, subdivision, accent, backbeat, silentBars]);

  const tap = useCallback(() => {
    const m = engine();
    m.setBpm(bpm);
    const next = m.tap();
    if (next !== null) setBpmState(next);
  }, [engine, bpm]);

  return { bpm, setBpm, running, toggle, tap, subdivision, setSubdivision, accent, setAccent, backbeat, setBackbeat, silentBars, setSilentBars, onBeat };
}
