/* Service Worker — offline önbellek
   Menü bir kez açıldıktan sonra internet olmasa da açılır. */
var CACHE = "pazarcik-menu-v3";
var ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/menu-data.js",
  "./js/app.js",
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
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  // Menü içeriği + sayfa: ÖNCE İNTERNET (güncel fiyatlar), yoksa önbellek.
  var fresh = e.request.mode === "navigate"
           || url.pathname === "/"
           || url.pathname.endsWith("/index.html")
           || url.pathname.endsWith("/menu-data.js");

  if (fresh) {
    e.respondWith(
      fetch(e.request).then(function (resp) {
        var copy = resp.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return resp;
      }).catch(function () {
        return caches.match(e.request).then(function (r) { return r || caches.match("./index.html"); });
      })
    );
    return;
  }

  // Diğer dosyalar (css, js, foto): ÖNCE ÖNBELLEK (hızlı), yoksa internet.
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;
      return fetch(e.request).then(function (resp) {
        var copy = resp.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return resp;
      }).catch(function () { return caches.match("./index.html"); });
    })
  );
});
