/* ===========================================================
   Menü + Galeri + dil değiştirme + offline (PWA)
   =========================================================== */
(function () {
  "use strict";

  var LANGS = ["tr", "ar", "en"];
  var lang = localStorage.getItem("pz_lang") || "tr";
  if (LANGS.indexOf(lang) === -1) lang = "tr";

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
          main.appendChild(trn);
        }
        if (it.desc) { var d = el("div", "item-desc"); d.textContent = t(it.desc); main.appendChild(d); }

        var prices = el("div", "item-prices" + (it.prices.length > 1 ? " multi" : ""));
        it.prices.forEach(function (p) {
          var row = el("div", "price-row");
          if (p.label) { var lbl = el("span", "price-label"); lbl.textContent = t(p.label); row.appendChild(lbl); }
          var val = el("span", "price-value"); val.textContent = money(p.value); row.appendChild(val);
          prices.appendChild(row);
        });

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
    var order = ["winter", "summer"];

    order.forEach(function (season) {
      var items = GALLERY.filter(function (x) { return x.season === season; });
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
  function openLightbox(src, alt) {
    var lb = document.getElementById("lightbox");
    var im = document.getElementById("lightboxImg");
    im.src = src; im.alt = alt || "";
    lb.hidden = false;
  }
  function closeLightbox() {
    var lb = document.getElementById("lightbox");
    lb.hidden = true;
    document.getElementById("lightboxImg").src = "";
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
  document.getElementById("lightbox").addEventListener("click", closeLightbox);

  render();
  showTab("menu");

  /* Offline önbellek — sadece internete yüklenince (http/https) çalışır */
  if ("serviceWorker" in navigator &&
      (location.protocol === "https:" || location.protocol === "http:")) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
