// INOV Digital Services — service worker.
//
// Goal: the installed app (Add to Home Screen / Install) must always reflect the
// latest deployed site. Strategy is NETWORK-FIRST for same-origin GET requests,
// so every launch fetches fresh content when online, and falls back to the last
// cached copy only when offline. Combined with skipWaiting + clients.claim (and
// the reload wired in main.tsx), a new deploy takes over automatically.

const CACHE = "inov-runtime-v1";

self.addEventListener("install", () => {
  // Activate this new worker immediately instead of waiting for old tabs.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Drop any stale caches from previous versions.
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

// Allow the page to tell a waiting worker to activate right away.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.origin !== self.location.origin) return; // don't touch cross-origin (CDNs, APIs)

  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(req);
        // Cache a copy of successful responses for offline fallback.
        if (fresh && fresh.status === 200 && fresh.type === "basic") {
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === "navigate") {
          const shell = await caches.match("/");
          if (shell) return shell;
        }
        throw new Error("offline-and-uncached");
      }
    })(),
  );
});
