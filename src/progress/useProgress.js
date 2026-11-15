import { useSyncExternalStore } from 'react';
import { createProgressStore } from './store.js';

const env = import.meta.env;
const config = env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY ? { url: env.VITE_SUPABASE_URL, key: env.VITE_SUPABASE_ANON_KEY } : null;

// crypto.randomUUID only exists on https/localhost; a phone hitting the dev server over the LAN is plain http.
const uuid = () => crypto.randomUUID?.() ?? '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
  (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));

function storage() {
  try { return window.localStorage; } catch { return { getItem: () => null, setItem: () => {} }; }
}

export const progress = createProgressStore({ storage: storage(), fetch: (...args) => fetch(...args), config, uuid });
export const syncEnabled = Boolean(config);

progress.sync();
addEventListener('online', () => progress.sync());

export const useProgress = () => useSyncExternalStore(progress.subscribe, progress.getSnapshot);
