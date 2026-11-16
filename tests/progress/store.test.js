import { createProgressStore, SYNC_CODE } from '../../src/progress/store.js';

const memory = () => {
  const data = new Map();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)), data };
};
let n = 0;
const uuid = () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`;
const config = { url: 'https://p.supabase.co', key: 'anon' };

// A fake PostgREST: stores upserted rows, returns them on GET, can be switched off.
function fakeServer() {
  const rows = new Map();
  const calls = [];
  const server = {
    rows, calls, down: false,
    fetch: async (url, init = {}) => {
      calls.push({ url, init });
      if (server.down) throw new Error('offline');
      if (init.method === 'POST') JSON.parse(init.body).forEach((r) => rows.set(r.id, r));
      return { ok: true, json: async () => [...rows.values()] };
    },
  };
  return server;
}

const make = (over = {}) => createProgressStore({ storage: memory(), config, uuid, now: () => new Date('2026-11-15T10:00:00Z'), ...over });
const flush = () => new Promise((r) => setTimeout(r, 0));

test('a device gets a sync code once and keeps it', () => {
  const storage = memory();
  const a = make({ storage, fetch: fakeServer().fetch });
  const b = make({ storage, fetch: fakeServer().fetch });
  expect(a.getSnapshot().deviceId).toMatch(SYNC_CODE);
  expect(b.getSnapshot().deviceId).toBe(a.getSnapshot().deviceId);
});

test('record saves locally and syncs with the device header', async () => {
  const server = fakeServer();
  const store = make({ fetch: server.fetch });
  const id = store.record({ trackId: 't', sessionId: 's', minutes: 15, exercise: 'ex', variant: 0, kind: 'focus', bpm: 90, seconds: 300 });
  expect(store.getSnapshot().entries[0]).toMatchObject({ id, exercise: 'ex', bpm: 90, rating: null, practicedAt: '2026-11-15T10:00:00.000Z' });
  await flush();
  const post = server.calls.find((c) => c.init.method === 'POST');
  expect(post.init.headers['x-device-id']).toBe(store.getSnapshot().deviceId);
  expect(server.rows.get(id)).toMatchObject({ exercise_id: 'ex', device_id: store.getSnapshot().deviceId, bpm: 90 });
  expect(store.getSnapshot().pending).toEqual([]);
});

test('rating updates the entry and re-syncs it', async () => {
  const server = fakeServer();
  const store = make({ fetch: server.fetch });
  const id = store.record({ exercise: 'ex', variant: 0, kind: 'focus', bpm: 90, seconds: 300 });
  store.rate(id, 3);
  await flush();
  expect(store.getSnapshot().entries[0].rating).toBe(3);
  expect(server.rows.get(id).rating).toBe(3);
});

test('offline: entries stay pending and survive a reload, then sync later', async () => {
  const storage = memory();
  const server = fakeServer();
  server.down = true;
  const store = make({ storage, fetch: server.fetch });
  const id = store.record({ exercise: 'ex', variant: 0, kind: 'focus', bpm: 90, seconds: 300 });
  await flush();
  expect(store.getSnapshot().pending).toEqual([id]);
  server.down = false;
  const reloaded = make({ storage, fetch: server.fetch });
  await reloaded.sync();
  expect(server.rows.has(id)).toBe(true);
  expect(reloaded.getSnapshot().pending).toEqual([]);
});

test('without config nothing is sent and entries stay local', async () => {
  const server = fakeServer();
  const store = make({ fetch: server.fetch, config: null });
  store.record({ exercise: 'ex', variant: 0, kind: 'focus', bpm: 90, seconds: 300 });
  await store.sync();
  expect(server.calls).toEqual([]);
  expect(store.getSnapshot().entries).toHaveLength(1);
});

test('using another device code pulls its history', async () => {
  const server = fakeServer();
  const phone = make({ fetch: server.fetch });
  phone.record({ exercise: 'ex', variant: 0, kind: 'focus', bpm: 96, seconds: 300 });
  await flush();
  const tablet = make({ fetch: server.fetch });
  await tablet.useSyncCode(phone.getSnapshot().deviceId);
  expect(tablet.getSnapshot().deviceId).toBe(phone.getSnapshot().deviceId);
  expect(tablet.getSnapshot().entries.map((e) => e.bpm)).toEqual([96]);
});

test('a malformed sync code is rejected', async () => {
  await expect(make({ fetch: fakeServer().fetch }).useSyncCode('not a code')).rejects.toThrow(/code/);
});
