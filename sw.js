const CACHE_NAME = "vkrn-sanxing-v1";

const OFFLINE_URLS = [
  "./",
  "./index.html",
  "https://raw.githubusercontent.com/zaidhidayat/vkrn_kejajar/main/data/sanxing1",
  "https://raw.githubusercontent.com/zaidhidayat/vkrn/main/laporan/sanxing.csv"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // untuk navigasi halaman: pakai cache dulu, kalau gagal baru network
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then((cached) => {
        return (
          cached ||
          fetch(req).catch(() => caches.match("./index.html"))
        );
      })
    );
    return;
  }

  // selain itu: cache-first, lalu network fallback
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((resp) => {
          const respClone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, respClone));
          return resp;
        })
        .catch(() => cached);
    })
  );
});
