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

// Which prompt item is showing, from elapsed step time and the current tempo (4/4 bars).
export function promptState(prompt, elapsedMs, bpm, seed) {
  const n = prompt.items.length;
  const barMs = 240000 / bpm;
  const windowMs = barMs * prompt.everyBars;
  const window = Math.floor(Math.max(0, elapsedMs) / windowMs);
  const index = n === 1 ? 0 : prompt.order === 'random' ? randomIndex(n, window, seed) : window % n;
  return {
    index,
    item: prompt.items[index],
    barInWindow: Math.floor((Math.max(0, elapsedMs) % windowMs) / barMs),
    barsPerWindow: prompt.everyBars,
  };
}
