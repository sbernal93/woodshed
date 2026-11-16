export const RATINGS = { 1: 'Struggled', 2: 'Okay', 3: 'Clean' };
const STEP_BPM = 4;

export const lastFor = (entries, exercise, variant) => entries
  .filter((e) => e.exercise === exercise && e.variant === variant && e.bpm)
  .reduce((latest, e) => (!latest || e.practicedAt > latest.practicedAt ? e : latest), null);

// Clean: up one notch. Struggled: down one. Okay or not rated: pick up where you left off.
export function suggestBpm(entries, { exercise, variant, bpm }) {
  if (!bpm) return { bpm: null, last: null };
  const last = lastFor(entries, exercise, variant);
  if (!last) return { bpm: bpm.min, last: null };
  const nudge = { 1: -STEP_BPM, 3: STEP_BPM }[last.rating] ?? 0;
  const ceiling = Math.max(bpm.max, last.bpm);
  return { bpm: Math.max(bpm.min, Math.min(ceiling, last.bpm + nudge)), last };
}

const localDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const dayKey = (d) => localDay(d).toDateString();

// Days in a row with practice; today not practised yet doesn't break it until tomorrow.
export function streak(entries, today) {
  const days = new Set(entries.map((e) => dayKey(new Date(e.practicedAt))));
  const day = localDay(today);
  if (!days.has(day.toDateString())) day.setDate(day.getDate() - 1);
  let count = 0;
  while (days.has(day.toDateString())) {
    count++;
    day.setDate(day.getDate() - 1);
  }
  return count;
}

export function mergeEntries(a, b) {
  const byId = new Map(a.map((e) => [e.id, e]));
  for (const e of b) {
    const mine = byId.get(e.id);
    if (!mine || e.updatedAt > mine.updatedAt) byId.set(e.id, e);
  }
  return [...byId.values()];
}

// Work through a track in order: the first session never played, then whichever was played longest ago.
export function nextSession(track, entries) {
  const last = new Map();
  for (const e of entries) if (e.sessionId && !(last.get(e.sessionId) > e.practicedAt)) last.set(e.sessionId, e.practicedAt);
  return track.sessions.find((s) => !last.has(s.id))
    ?? track.sessions.reduce((oldest, s) => (last.get(s.id) < last.get(oldest.id) ? s : oldest));
}
