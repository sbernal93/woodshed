// Small seeded PRNG so a "random" prompt order is stable across re-renders.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomIndex(n, window, seed) {
  const rng = mulberry32(seed);
  let index = Math.floor(rng() * n);
  for (let w = 1; w <= window; w++) index = (index + 1 + Math.floor(rng() * (n - 1))) % n;
  return index;
}

const barMs = (bpm) => 240000 / bpm;

// Bars played so far in this step, accumulated at whatever tempo each stretch was played at,
// so a tempo change only affects what comes next. A new step (key) or a restart re-derives from elapsed time.
export function trackBars(prev, elapsedMs, bpm, key) {
  if (!prev || prev.key !== key || elapsedMs < prev.elapsed) return { key, elapsed: elapsedMs, bars: elapsedMs / barMs(bpm) };
  return { key, elapsed: elapsedMs, bars: prev.bars + (elapsedMs - prev.elapsed) / barMs(bpm) };
}

// Which prompt item is showing after `bars` bars (4/4) of the step.
export function promptState(prompt, bars, seed) {
  const n = prompt.items.length;
  const played = Math.max(0, bars);
  const window = Math.floor(played / prompt.everyBars);
  const index = n === 1 ? 0 : prompt.order === 'random' ? randomIndex(n, window, seed) : window % n;
  return {
    index,
    item: prompt.items[index],
    barInWindow: Math.floor(played % prompt.everyBars),
    barsPerWindow: prompt.everyBars,
  };
}
