export const MIN_BPM = 30;
export const MAX_BPM = 300;
const DEFAULT_BPM = 80;
const BEATS_PER_BAR = 4;
const TAP_RESET_MS = 2000;

export function clampBpm(n) {
  if (!Number.isFinite(n)) return DEFAULT_BPM;
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(n)));
}

export function nextNoteTime(t, bpm, subdivision) {
  return t + 60 / clampBpm(bpm) / subdivision;
}

export function tapTempoBpm(timesMs) {
  if (timesMs.length < 2) return null;
  const gaps = timesMs.slice(1).map((t, i) => t - timesMs[i]);
  if (gaps[gaps.length - 1] > TAP_RESET_MS) return null;
  const recent = gaps.slice(-4);
  return clampBpm(60000 / (recent.reduce((a, b) => a + b, 0) / recent.length));
}

// Web Audio "two clocks" scheduler: a coarse setTimeout loop books clicks slightly ahead on the audio clock.
export class Metronome {
  constructor({ audioContext, lookaheadMs = 25, scheduleAheadSec = 0.1 }) {
    this.ctx = audioContext;
    this.lookaheadMs = lookaheadMs;
    this.scheduleAheadSec = scheduleAheadSec;
    this.bpm = DEFAULT_BPM;
    this.subdivision = 1;
    this.accent = true;
    this.running = false;
    this.listeners = new Set();
    this.taps = [];
  }

  setBpm(bpm) { this.bpm = clampBpm(bpm); }
  // A change mid-beat waits for the next main beat so the downbeat never shifts.
  setSubdivision(n) {
    const next = [1, 2, 3, 4].includes(n) ? n : 1;
    if (this.running && this.subIndex !== 0) this.pendingSubdivision = next;
    else { this.subdivision = next; this.pendingSubdivision = null; }
  }
  setAccent(on) { this.accent = Boolean(on); }
  isRunning() { return this.running; }

  onBeat(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  start() {
    if (this.running) return;
    // 'interrupted' is what iOS reports after a phone call; 'closed' cannot be resumed.
    if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') this.ctx.resume();
    this.running = true;
    this.nextTime = this.ctx.currentTime + 0.05;
    this.beatInBar = 0;
    this.subIndex = 0;
    const tick = () => {
      this._poll();
      this.timer = setTimeout(tick, this.lookaheadMs);
    };
    tick();
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    clearTimeout(this.timer);
  }

  close() {
    this.stop();
    this.ctx.close?.();
  }

  tap(nowMs = performance.now()) {
    this.taps = [...this.taps, nowMs].slice(-5);
    const bpm = tapTempoBpm(this.taps);
    if (bpm !== null) this.setBpm(bpm);
    else if (this.taps.length > 1) this.taps = [nowMs];
    return bpm;
  }

  _poll() {
    // A throttled background tab lets nextTime fall behind; skip missed pulses silently instead of firing them all at once.
    while (this.nextTime < this.ctx.currentTime) this._advance();
    while (this.nextTime < this.ctx.currentTime + this.scheduleAheadSec) {
      const mainBeat = this.subIndex === 0;
      const isAccent = mainBeat && this.accent && this.beatInBar === 0;
      this._click(this.nextTime, isAccent ? 1500 : mainBeat ? 1000 : 700, mainBeat ? 0.6 : 0.25);
      if (mainBeat) this.listeners.forEach((cb) => cb(this.beatInBar, isAccent, this.nextTime));
      this._advance();
    }
  }

  _advance() {
    this.nextTime = nextNoteTime(this.nextTime, this.bpm, this.subdivision);
    this.subIndex = (this.subIndex + 1) % this.subdivision;
    if (this.subIndex !== 0) return;
    this.beatInBar = (this.beatInBar + 1) % BEATS_PER_BAR;
    if (this.pendingSubdivision) {
      this.subdivision = this.pendingSubdivision;
      this.pendingSubdivision = null;
    }
  }

  _click(time, freq, gainValue) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(gainValue, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.05);
  }
}
