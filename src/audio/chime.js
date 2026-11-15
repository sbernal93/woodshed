// A soft two-note bell: a fifth apart, quick attack, long decay, so it reads over a running click.
export function playChime(ctx, when = ctx.currentTime) {
  [[880, 0], [1320, 0.18]].forEach(([freq, delay]) => {
    const t = when + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 1.25);
  });
}
