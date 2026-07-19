/* ASIA WAY PWA service worker — v2 (silliq F5 + tez ochilish).
   Navigatsiya HAR DOIM tarmoqdan (yangi kontent), navigation preload bilan
   tezlashtirilgan. Statik (immutable) resurslar cache-first. API keshlanmaydi. */
const CACHE = "aw-pwa-v2";
const OFFLINE_URL = "/dashboard/login";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.add(OFFLINE_URL).catch(() => null))
  );
  self.skipWaiting(); // yangi SW darrov faollashadi
});

// Client "SKIP_WAITING" desa — kutmasdan faollashamiz (avto-yangilanish)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Eski kesh versiyalarini tozalaymiz (deploy'dan keyin bayat kontent qolmasin)
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      // Navigation preload — sahifa yuklanishini tezlashtiradi (F5 silliq)
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // API — hech qachon keshlanmaydi
  if (url.pathname.startsWith("/api/")) return;

  // Navigatsiya (sahifa/F5): DOIM tarmoqdan, preload bilan tez.
  // Faqat HAQIQATAN offline bo'lsa — keshdagi login sahifasi.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preload = await event.preloadResponse;
          if (preload) return preload;
          return await fetch(req);
        } catch {
          const cached = await caches.match(OFFLINE_URL);
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // Statik resurslar (content-hash'li, immutable): cache-first — tez ochiladi
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
      )
    );
  }
});
