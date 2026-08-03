/* ===========================================================
   Menü + Galeri + dil değiştirme + offline (PWA)
   =========================================================== */
(function () {
  "use strict";

  var LANGS = ["tr", "ar", "en"];
  var lang = localStorage.getItem("pz_lang") || "tr";
  if (LANGS.indexOf(lang) === -1) lang = "tr";

  /* Yönetim panelinden (admin.html) güncellenen canlı fiyat/stok verisi.
     data/menu.json okunamazsa menu-data.js'teki varsayılan fiyatlar kullanılır. */
  var OV = { fiyatlar: {}, tukendi: [] };

  /* Galeri listesi: panelden yönetilir (data/galeri.json).
     Okunamazsa menu-data.js'teki GALLERY listesi kullanılır. */
  var GAL = (typeof GALLERY !== "undefined" && GALLERY) ? GALLERY : [];

  /* Fiyat/galeri verisini ÖNCE GitHub'dan TAZE oku: panelden yapılan değişiklik
     Netlify yeniden yayınlamasa/duraklasa bile ANINDA görünür (QR değişmez).
     GitHub okunamazsa Netlify kopyasına, o da olmazsa menu-data.js'e düşer. */
  var RAW = "https://raw.githubusercontent.com/mert61-python/restoran/qr/";
  function veriGetir(dosya) {
    return fetch(RAW + dosya + "?t=" + Date.now(), { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .catch(function () {
        return fetch(dosya, { cache: "no-cache" })
          .then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; });
      });
  }

  function t(o) { if (!o) return ""; return o[lang] || o.tr || ""; }
  function money(v) { return v + " " + MENU.ui.currency; }
  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }

  /* ---------- ETİKETLER ---------- */
  function renderLabels() {
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";

    document.getElementById("restName").textContent = t(MENU.restaurant.name);
    document.getElementById("restTagline").textContent = t(MENU.restaurant.tagline);
    document.getElementById("offerings").textContent = t(MENU.ui.offerings);
    document.getElementById("footNote").textContent = t(MENU.ui.footer);
    document.getElementById("tabMenu").textContent = t(MENU.ui.tabs.menu);
    document.getElementById("tabGallery").textContent = t(MENU.ui.tabs.gallery);

    var lb = document.querySelectorAll("#langSwitch button");
    for (var i = 0; i < lb.length; i++) {
      lb[i].classList.toggle("active", lb[i].getAttribute("data-lang") === lang);
    }
  }

  /* ---------- MENÜ ---------- */
  function renderMenu() {
    var menu = document.getElementById("menu");
    menu.innerHTML = "";

    MENU.categories.forEach(function (cat) {
      var sec = el("section", "category");

      var h = el("h2", "category-header");
      var icon = el("span", "cat-icon"); icon.textContent = cat.icon || "";
      var cname = el("span", "cat-name"); cname.textContent = t(cat.name);
      h.appendChild(icon); h.appendChild(cname);
      sec.appendChild(h);

      cat.items.forEach(function (it) {
        var item = el("article", "item");
        var main = el("div", "item-main");
        var nm = el("div", "item-name"); nm.textContent = t(it.name);
        main.appendChild(nm);
        // Arapça/İngilizce modda personelin anlaması için Türkçe karşılık
        if (lang !== "tr") {
          var trn = el("div", "item-name-tr");
          trn.textContent = "🇹🇷 " + (it.name.tr || "");
          trn.lang = "tr";
          trn.setAttribute("translate", "no"); // tarayıcı çevirisi bunu Arapçaya çevirmesin
          main.appendChild(trn);
        }
        if (it.desc) { var d = el("div", "item-desc"); d.textContent = t(it.desc); main.appendChild(d); }

        var ovFiyat = OV.fiyatlar[it.name.tr];
        var tukendi = OV.tukendi.indexOf(it.name.tr) !== -1;
        if (tukendi) item.classList.add("tukendi");

        var prices = el("div", "item-prices" + (it.prices.length > 1 ? " multi" : ""));
        if (tukendi) {
          var so = el("span", "sold-out");
          so.textContent = t(MENU.ui.tukendi);
          prices.appendChild(so);
        } else {
          it.prices.forEach(function (p, pi) {
            var row = el("div", "price-row");
            if (p.label) { var lbl = el("span", "price-label"); lbl.textContent = t(p.label); row.appendChild(lbl); }
            var deger = (ovFiyat && typeof ovFiyat[pi] === "number") ? ovFiyat[pi] : p.value;
            var val = el("span", "price-value"); val.textContent = money(deger); row.appendChild(val);
            prices.appendChild(row);
          });
        }

        item.appendChild(main); item.appendChild(prices);
        sec.appendChild(item);
      });
      menu.appendChild(sec);
    });
  }

  /* ---------- GALERİ ---------- */
  function renderGallery() {
    var g = document.getElementById("gallery");
    g.innerHTML = "";
    var order = ["dishes", "winter", "summer", "meat"];

    order.forEach(function (season) {
      var items = GAL.filter(function (x) { return x && x.season === season; });
      if (!items.length) return;

      var h = el("h2", "gallery-season");
      h.textContent = t(MENU.ui.seasons[season]);
      g.appendChild(h);

      var grid = el("div", "gallery-grid");
      items.forEach(function (it) {
        var fig = el("figure", "gphoto");
        var img = el("img");
        img.src = "img/" + it.src;
        img.alt = t(it.cap);
        img.loading = "lazy";
        var cap = el("figcaption", "cap"); cap.textContent = t(it.cap);
        fig.appendChild(img); fig.appendChild(cap);
        fig.addEventListener("click", function () { openLightbox(img.src, t(it.cap)); });
        grid.appendChild(fig);
      });
      g.appendChild(grid);
    });
  }

  /* ---------- LIGHTBOX ---------- */
  var lbOpen = false;
  function openLightbox(src, alt) {
    var lb = document.getElementById("lightbox");
    var im = document.getElementById("lightboxImg");
    im.src = src; im.alt = alt || "";
    lb.hidden = false;
    lbOpen = true;
    // Geri tuşu tüm menüyü kapatmasın: tarihçeye giriş ekle → geri'de sadece foto kapanır
    try { history.pushState({ lb: 1 }, ""); } catch (e) {}
  }
  function closeLightbox() {
    var lb = document.getElementById("lightbox");
    lb.hidden = true;
    document.getElementById("lightboxImg").src = "";
    lbOpen = false;
  }

  /* ---------- SEKMELER ---------- */
  function showTab(name) {
    document.getElementById("menu").hidden = (name !== "menu");
    document.getElementById("gallery").hidden = (name !== "gallery");
    var tb = document.querySelectorAll("#tabs button");
    for (var i = 0; i < tb.length; i++) {
      tb[i].classList.toggle("active", tb[i].getAttribute("data-tab") === name);
    }
    window.scrollTo(0, 0);
  }

  function render() { renderLabels(); renderMenu(); renderGallery(); }

  /* ---------- OLAYLAR ---------- */
  document.getElementById("langSwitch").addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("button") : null;
    if (!b) return;
    lang = b.getAttribute("data-lang");
    localStorage.setItem("pz_lang", lang);
    render();
  });
  document.getElementById("tabs").addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("button") : null;
    if (!b) return;
    showTab(b.getAttribute("data-tab"));
  });
  document.getElementById("lightbox").addEventListener("click", function () {
    if (lbOpen) { history.back(); } else { closeLightbox(); }
  });
  // Android/tarayıcı geri tuşu: lightbox açıksa sadece onu kapat (siteden çıkma)
  window.addEventListener("popstate", function () {
    if (lbOpen) { closeLightbox(); }
  });

  /* ---------- AÇILIŞ EKRANI (logo → menü) ---------- */
  (function () {
    var intro = document.getElementById("intro");
    var btn = document.getElementById("introBtn");
    if (!intro || !btn) return;
    document.body.classList.add("intro-acik");
    btn.addEventListener("click", function () {
      intro.classList.add("kapali");
      document.body.classList.remove("intro-acik");
      setTimeout(function () { intro.hidden = true; }, 420);
    });
  })();

  function basla() { render(); showTab("menu"); }

  /* Önce panelden gelen güncel fiyat/stok verisini oku, sonra çiz.
     Veri gelmezse (internet yok vb.) varsayılan fiyatlarla açılır. */
  if (typeof fetch === "function") {
    var pFiyat = veriGetir("data/menu.json")
      .then(function (d) {
        if (d && typeof d === "object") {
          OV.fiyatlar = d.fiyatlar || {};
          OV.tukendi = Array.isArray(d.tukendi) ? d.tukendi : [];
        }
      })
      .catch(function () {});

    var pGaleri = veriGetir("data/galeri.json")
      .then(function (d) {
        if (d && Array.isArray(d.fotograflar) && d.fotograflar.length) GAL = d.fotograflar;
      })
      .catch(function () {});

    Promise.all([pFiyat, pGaleri]).then(basla, basla);
  } else {
    basla();
  }

  /* Offline önbellek — sadece internete yüklenince (http/https) çalışır */
  if ("serviceWorker" in navigator &&
      (location.protocol === "https:" || location.protocol === "http:")) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
