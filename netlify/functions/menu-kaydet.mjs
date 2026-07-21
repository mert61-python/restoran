/* ===========================================================
   Menü fiyat/stok kaydetme fonksiyonu (Netlify Function)
   -----------------------------------------------------------
   Panel buraya POST eder; bu fonksiyon şifreyi doğrular ve
   data/menu.json dosyasını GitHub'a commit'ler. Netlify commit'i
   görüp siteyi otomatik yeniden yayınlar (~1 dk).

   SUNUCU AYARLARI (Netlify > Site configuration > Environment variables):
     ADMIN_SIFRE   = panele girilecek şifre
     GITHUB_TOKEN  = repo'ya yazma yetkisi olan fine-grained token
   Bu bilgiler ASLA tarayıcıya gitmez.
   =========================================================== */

const REPO = "mert61-python/restoran";
const BRANCH = "qr";
const PATH = "data/menu.json";

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

export default async (req) => {
  if (req.method !== "POST") return json({ ok: false, mesaj: "Yalnızca POST." }, 405);

  const sifre = process.env.ADMIN_SIFRE;
  const token = process.env.GITHUB_TOKEN;
  if (!sifre || !token) {
    return json({ ok: false, mesaj: "Sunucu ayarları eksik: ADMIN_SIFRE / GITHUB_TOKEN tanımlı değil." }, 500);
  }

  let body;
  try { body = await req.json(); } catch { return json({ ok: false, mesaj: "Geçersiz istek." }, 400); }

  if (!body || typeof body.sifre !== "string" || body.sifre !== sifre) {
    await bekle(700); // kaba kuvvet denemesini yavaşlat
    return json({ ok: false, mesaj: "Şifre hatalı." }, 401);
  }

  const veri = body.veri;
  if (!veri || typeof veri !== "object" || typeof veri.fiyatlar !== "object" || !veri.fiyatlar) {
    return json({ ok: false, mesaj: "Veri geçersiz." }, 400);
  }

  /* --- Gelen veriyi temizle: sadece beklenen alanlar, makul sayılar --- */
  const temiz = {
    guncelleme: new Date().toISOString(),
    fiyatlar: {},
    tukendi: Array.isArray(veri.tukendi)
      ? veri.tukendi.filter((x) => typeof x === "string" && x.length < 120).slice(0, 200)
      : []
  };
  for (const [ad, dizi] of Object.entries(veri.fiyatlar)) {
    if (typeof ad !== "string" || ad.length > 120 || !Array.isArray(dizi)) continue;
    const sayilar = dizi
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n) && n >= 0 && n <= 1000000)
      .map((n) => Math.round(n));
    if (sayilar.length) temiz.fiyatlar[ad] = sayilar;
  }
  if (!Object.keys(temiz.fiyatlar).length) {
    return json({ ok: false, mesaj: "Kaydedilecek geçerli fiyat bulunamadı." }, 400);
  }

  const icerik = JSON.stringify(temiz, null, 2) + "\n";
  const api = `https://api.github.com/repos/${REPO}/contents/${encodeURI(PATH)}`;
  const basliklar = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "pazarcik-menu-admin",
    "X-GitHub-Api-Version": "2022-11-28"
  };

  /* --- Mevcut dosyanın sha'sını al (yoksa yeni oluşturulur) --- */
  let sha;
  try {
    const mevcut = await fetch(`${api}?ref=${BRANCH}`, { headers: basliklar });
    if (mevcut.ok) {
      const j = await mevcut.json();
      sha = j.sha;
    } else if (mevcut.status === 401 || mevcut.status === 403) {
      return json({ ok: false, mesaj: "GitHub anahtarı geçersiz veya yetkisiz." }, 502);
    } else if (mevcut.status !== 404) {
      return json({ ok: false, mesaj: `GitHub okuma hatası (${mevcut.status}).` }, 502);
    }
  } catch {
    return json({ ok: false, mesaj: "GitHub'a ulaşılamadı." }, 502);
  }

  /* --- Yaz --- */
  try {
    const yaz = await fetch(api, {
      method: "PUT",
      headers: { ...basliklar, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Panelden fiyat/stok guncellemesi",
        content: Buffer.from(icerik, "utf8").toString("base64"),
        branch: BRANCH,
        ...(sha ? { sha } : {})
      })
    });
    if (!yaz.ok) {
      const metin = await yaz.text();
      return json({ ok: false, mesaj: `GitHub yazma hatası (${yaz.status}).`, detay: metin.slice(0, 200) }, 502);
    }
  } catch {
    return json({ ok: false, mesaj: "Kaydedilemedi, bağlantı hatası." }, 502);
  }

  return json({ ok: true, mesaj: "Kaydedildi. Yaklaşık 1 dakika içinde menüde görünecek." });
};
