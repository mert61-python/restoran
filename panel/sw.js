/* Panel (Menü Fiyatları uygulaması) service worker
   - Kurulabilirlik (ana ekrana ekle) için gerekli
   - Strateji: ÖNCE İNTERNET (panel her zaman güncel olmalı), yoksa önbellek */
var CACHE = "pz-panel-v2";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "../js/menu-data.js"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // Tek tek ekle: biri hata verirse kurulum çökmesin
      return Promise.all(ASSETS.map(function (u) {
        return c.add(u).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE && k.indexOf("pz-panel-") === 0) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;           // kaydetme (POST) asla önbelleğe girmez
  var url = new URL(e.request.url);
  if (url.pathname.indexOf("/.netlify/") === 0) return; // fonksiyon çağrıları doğrudan geçsin

  e.respondWith(
    fetch(e.request).then(function (resp) {
      // Sadece başarılı cevabı önbellekle (404 önbelleğe yapışmasın)
      if (resp && resp.ok && resp.status === 200) {
        var kopya = resp.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, kopya); });
      }
      return resp;
    }).catch(function () {
      return caches.match(e.request).then(function (r) { return r || caches.match("./index.html"); });
    })
  );
});
