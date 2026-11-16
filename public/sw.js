// Offline support: pages come from the network when there is one (so deploys show up), cached copies otherwise.
// Other same-origin files are served from cache and refreshed in the background. Supabase calls are never touched.
// shortcut: old hashed bundles stay in the cache after a deploy; bump CACHE if it ever grows enough to matter.
const CACHE = 'woodshed-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const save = (res) => {
    if (res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req.mode === 'navigate' ? '/' : req, copy));
    }
    return res;
  };
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(save).catch(() => caches.match('/')));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => {
    const fresh = fetch(req).then(save);
    if (hit) fresh.catch(() => {});
    return hit ?? fresh;
  }));
});
