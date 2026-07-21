/* Service Worker — offline yedek + HER ZAMAN GÜNCEL
   Strateji:
   - HTML / JS / CSS / manifest  → ÖNCE İNTERNET (online'ken hep en güncel sürüm),
     internet yoksa önbellekten (offline yedek).
   - Görseller (.jpeg/.png...)   → ÖNCE ÖNBELLEK (hızlı + offline). Yeni görseller
     yeni dosya adı taşıdığı için önbellekte olmaz → otomatik internetten çekilir.
   Böylece güncelleme yaptığımızda müşteri online'ken ANINDA yeni sürümü görür. */
var CACHE = "pazarcik-menu-v7";
var ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/menu-data.js",
  "./js/app.js",
  "./data/menu.json",
  "./data/galeri.json",
  "./manifest.webmanifest"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  var isImage = /\.(jpe?g|png|webp|gif|svg|ico|avif)$/i.test(url.pathname);

  if (isImage) {
    // Görseller: önce önbellek, yoksa internet (ve önbelleğe al).
    e.respondWith(
      caches.match(e.request).then(function (cached) {
        if (cached) return cached;
        return fetch(e.request).then(function (resp) {
          var copy = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
          return resp;
        });
      })
    );
    return;
  }

  // HTML / JS / CSS / manifest: ÖNCE İNTERNET, yoksa önbellek (offline yedek).
  e.respondWith(
    fetch(e.request).then(function (resp) {
      var copy = resp.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return resp;
    }).catch(function () {
      return caches.match(e.request).then(function (r) { return r || caches.match("./index.html"); });
    })
  );
});
