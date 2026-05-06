// HVAC/R Pro Service Worker
// Caches the app shell and static tools for offline use
// API calls (AI, Supabase, photos) always go to network

const CACHE_NAME = "hvacr-pro-v1";
const OFFLINE_URL = "/offline.html";

// Resources to cache immediately on install
const PRECACHE_URLS = [
  "/",
  "/hvac_units",
  "/offline.html",
  "/manifest.json",
];

// ── Install: precache core shell ──────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn("SW precache partial failure:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: smart caching strategy ─────────────────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Always go to network for:
  // - API routes (AI, Supabase, photos)
  // - Auth routes
  // - External URLs
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth") ||
    url.hostname !== self.location.hostname ||
    event.request.method !== "GET"
  ) {
    return; // Let browser handle normally
  }

  // For Supabase requests - always network
  if (url.hostname.includes("supabase")) {
    return;
  }

  // For navigation requests (page loads) - network first, fall back to cache
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the fresh response
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline - try cache first, then offline page
          return caches.match(event.request).then((cached) => {
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // For static assets (_next/static) - cache first, then network
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // For everything else - network first, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});