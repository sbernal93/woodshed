import { mergeEntries } from './history.js';

const KEY = 'woodshed.progress';
export const SYNC_CODE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const toRow = (e, deviceId) => ({
  id: e.id, device_id: deviceId, practiced_at: e.practicedAt, updated_at: e.updatedAt,
  track_id: e.trackId ?? null, session_id: e.sessionId ?? null, minutes: e.minutes ?? null,
  exercise_id: e.exercise, variant: e.variant, kind: e.kind, bpm: e.bpm ?? null, rating: e.rating ?? null, seconds: e.seconds,
});
const fromRow = (r) => ({
  id: r.id, practicedAt: new Date(r.practiced_at).toISOString(), updatedAt: new Date(r.updated_at).toISOString(),
  trackId: r.track_id, sessionId: r.session_id, minutes: r.minutes,
  exercise: r.exercise_id, variant: r.variant, kind: r.kind, bpm: r.bpm, rating: r.rating, seconds: r.seconds,
});

// Local-first: every write lands in storage, then pending entries are pushed to Supabase when it is reachable.
// The sync code (a random UUID) is the only identity: RLS lets a request touch only rows whose device_id matches its x-device-id header.
export function createProgressStore({ storage, fetch, config, uuid, now = () => new Date() }) {
  let state;
  try { state = JSON.parse(storage.getItem(KEY)); } catch { state = null; }
  const listeners = new Set();

  const save = (next) => {
    state = next;
    try { storage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked: keep it in memory for this visit */ }
    listeners.forEach((l) => l());
  };
  if (!state?.deviceId) save({ deviceId: uuid(), entries: [], pending: [] });

  const request = (path, init = {}) => fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: config.key, 'x-device-id': state.deviceId, 'Content-Type': 'application/json', ...init.headers },
  }).then((res) => {
    if (!res.ok) throw new Error(`sync failed: ${res.status}`);
    return res;
  });

  let syncing = null;
  async function runSync() {
    const deviceId = state.deviceId;
    const sending = [...state.pending];
    const rows = state.entries.filter((e) => sending.includes(e.id)).map((e) => toRow(e, deviceId));
    if (rows.length) {
      await request('practice_log?on_conflict=id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) });
    }
    const remote = await (await request(`practice_log?device_id=eq.${deviceId}&select=*`)).json();
    if (state.deviceId !== deviceId) return; // the code changed mid-sync; that sync will run on its own
    // An entry edited while this sync was in flight stays pending for the next one.
    const stillPending = state.pending.filter((id) => !sending.includes(id) || state.entries.find((e) => e.id === id)?.updatedAt > rows.find((r) => r.id === id)?.updated_at);
    save({ ...state, entries: mergeEntries(state.entries, remote.map(fromRow)), pending: stillPending });
  }

  function sync() {
    if (!config) return Promise.resolve();
    syncing = (syncing ?? Promise.resolve()).then(runSync).catch(() => { /* offline or misconfigured: pending entries retry next time */ });
    return syncing;
  }

  const touch = (entries, id) => ({ ...state, entries, pending: state.pending.includes(id) ? state.pending : [...state.pending, id] });

  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    sync,
    record(fields) {
      const at = now().toISOString();
      const entry = { id: uuid(), practicedAt: at, updatedAt: at, rating: null, ...fields };
      save(touch([...state.entries, entry], entry.id));
      sync();
      return entry.id;
    },
    rate(id, rating) {
      const updatedAt = now().toISOString();
      save(touch(state.entries.map((e) => (e.id === id ? { ...e, rating, updatedAt } : e)), id));
      sync();
    },
    // Linking a device: adopt the other device's code and pull its history. Local history from this device is pushed under the new code.
    async useSyncCode(code) {
      const trimmed = code.trim().toLowerCase();
      if (!SYNC_CODE.test(trimmed)) throw new Error('That is not a sync code');
      save({ ...state, deviceId: trimmed, pending: state.entries.map((e) => e.id) });
      await sync();
    },
  };
}
