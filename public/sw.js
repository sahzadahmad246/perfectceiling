const CACHE_VERSION = "perfect-ceiling-v2";
const PRECACHE_URLS = ["/logo.png", "/manifest.webmanifest"];

function shouldBypassCache(url) {
  const { pathname } = url;

  // Next.js chunks and HMR assets change on every build/recompile.
  if (pathname.startsWith("/_next/")) {
    return true;
  }

  // Always fetch fresh HTML so chunk references stay current.
  if (pathname.endsWith(".html") || pathname === "/") {
    return true;
  }

  return false;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (shouldBypassCache(requestUrl) || event.request.mode === "navigate") {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then((response) => {
        if (
          !response ||
          response.status !== 200 ||
          response.type !== "basic"
        ) {
          return response;
        }

        const responseClone = response.clone();

        caches.open(CACHE_VERSION).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      });
    }),
  );
});