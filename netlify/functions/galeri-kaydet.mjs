/* ===========================================================
   Galeri yönetimi (Netlify Function)
   -----------------------------------------------------------
   İşlemler:
     ekle : küçültülmüş fotoğrafı img/ klasörüne koyar + data/galeri.json'a ekler
     sil  : sadece data/galeri.json'dan çıkarır (DOSYAYI SİLMEZ —
            hero.jpeg/dere.jpeg gibi görseller kapak/alt görsel olarak da
            kullanılıyor, dosya silinirse site bozulur)

   Sunucu ayarları: ADMIN_SIFRE, GITHUB_TOKEN (Netlify env)
   =========================================================== */

const REPO = "mert61-python/restoran";
const BRANCH = "qr";
const JSON_PATH = "data/galeri.json";
const IMG_DIR = "img";
const BOLUMLER = ["dishes", "winter", "summer", "meat"];
const MAX_B64 = 3 * 1024 * 1024; // ~3 MB base64 (≈2.2 MB dosya)

function cevap(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

function ghBasliklar(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "pazarcik-galeri-admin",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

async function dosyaOku(token, yol) {
  const r = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${encodeURI(yol)}?ref=${BRANCH}`,
    { headers: ghBasliklar(token) }
  );
  if (r.status === 404) return { yok: true };
  if (!r.ok) throw new Error(`okuma ${r.status}`);
  const j = await r.json();
  return { sha: j.sha, icerik: Buffer.from(j.content, "base64").toString("utf8") };
}

async function dosyaYaz(token, yol, base64Icerik, mesaj, sha) {
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${encodeURI(yol)}`, {
    method: "PUT",
    headers: { ...ghBasliklar(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: mesaj,
      content: base64Icerik,
      branch: BRANCH,
      ...(sha ? { sha } : {})
    })
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`yazma ${r.status}: ${t.slice(0, 160)}`);
  }
  return r.json();
}

export default async (req) => {
  if (req.method !== "POST") return cevap({ ok: false, mesaj: "Yalnızca POST." }, 405);

  const sifre = process.env.ADMIN_SIFRE;
  const token = process.env.GITHUB_TOKEN;
  if (!sifre || !token) {
    return cevap({ ok: false, mesaj: "Sunucu ayarları eksik (ADMIN_SIFRE / GITHUB_TOKEN)." }, 500);
  }

  let g;
  try { g = await req.json(); } catch { return cevap({ ok: false, mesaj: "Geçersiz istek." }, 400); }

  if (!g || typeof g.sifre !== "string" || g.sifre !== sifre) {
    await bekle(700);
    return cevap({ ok: false, mesaj: "Şifre hatalı." }, 401);
  }

  /* ---- mevcut galeri listesini oku ---- */
  let liste = [];
  let jsonSha;
  try {
    const mevcut = await dosyaOku(token, JSON_PATH);
    if (!mevcut.yok) {
      jsonSha = mevcut.sha;
      const j = JSON.parse(mevcut.icerik);
      if (Array.isArray(j.fotograflar)) liste = j.fotograflar;
    }
  } catch (e) {
    return cevap({ ok: false, mesaj: "Galeri listesi okunamadı." }, 502);
  }

  /* ================= EKLE ================= */
  if (g.islem === "ekle") {
    const b64 = typeof g.base64 === "string" ? g.base64.replace(/^data:image\/\w+;base64,/, "") : "";
    if (!b64) return cevap({ ok: false, mesaj: "Fotoğraf boş." }, 400);
    if (b64.length > MAX_B64) return cevap({ ok: false, mesaj: "Fotoğraf çok büyük. Lütfen tekrar deneyin." }, 413);

    const bolum = BOLUMLER.indexOf(g.bolum) !== -1 ? g.bolum : "dishes";
    let cap = (typeof g.aciklama === "string" ? g.aciklama : "").trim().slice(0, 60);
    if (!cap) cap = "Fotoğraf";

    const ad = `g-${Date.now()}.jpg`;
    const yol = `${IMG_DIR}/${ad}`;

    // 1) Önce görseli yaz (json'dan önce → yarım kalırsa kırık bağlantı olmaz)
    try {
      await dosyaYaz(token, yol, b64, `Galeriye fotograf eklendi: ${ad}`);
    } catch (e) {
      return cevap({ ok: false, mesaj: "Fotoğraf yüklenemedi. " + String(e.message || "").slice(0, 120) }, 502);
    }

    // 2) Listeye ekle
    liste.push({ src: ad, season: bolum, cap: { tr: cap } });
    try {
      const yeni = JSON.stringify({ guncelleme: new Date().toISOString(), fotograflar: liste }, null, 2) + "\n";
      await dosyaYaz(token, JSON_PATH, Buffer.from(yeni, "utf8").toString("base64"),
        "Galeri listesi guncellendi (ekleme)", jsonSha);
    } catch (e) {
      return cevap({ ok: false, mesaj: "Fotoğraf yüklendi ama listeye eklenemedi. Tekrar deneyin." }, 502);
    }

    return cevap({ ok: true, mesaj: "Fotoğraf eklendi. ~1 dakika içinde galeride görünecek.", src: ad });
  }

  /* ============== VİDEO EKLE (Cloudinary) ==============
     Video dosyası Cloudinary'de barınır (depoyu şişirmez, Netlify limitini yemez).
     Burada yalnızca galeri.json'a video kaydını ekleriz — dosya commit'lemeyiz.
     [skip ci]: müşteri menüsü galeri.json'u GitHub'dan okur + video Cloudinary'den
     geldiği için Netlify yeniden yayınına GEREK YOK → ücretsiz limit korunur. */
  if (g.islem === "ekle-video") {
    const url = typeof g.url === "string" ? g.url.trim() : "";
    const poster = typeof g.poster === "string" ? g.poster.trim() : "";
    if (!/^https:\/\/res\.cloudinary\.com\/[\w./-]+$/.test(url)) {
      return cevap({ ok: false, mesaj: "Geçersiz video adresi." }, 400);
    }
    if (poster && !/^https:\/\/res\.cloudinary\.com\/[\w./,-]+$/.test(poster)) {
      return cevap({ ok: false, mesaj: "Geçersiz kapak adresi." }, 400);
    }
    const bolum = BOLUMLER.indexOf(g.bolum) !== -1 ? g.bolum : "dishes";
    let cap = (typeof g.aciklama === "string" ? g.aciklama : "").trim().slice(0, 60);
    if (!cap) cap = "Video";

    liste.push({ tip: "video", src: url, poster: poster || "", season: bolum, cap: { tr: cap } });
    try {
      const yeni = JSON.stringify({ guncelleme: new Date().toISOString(), fotograflar: liste }, null, 2) + "\n";
      await dosyaYaz(token, JSON_PATH, Buffer.from(yeni, "utf8").toString("base64"),
        "Galeriye video eklendi [skip ci]", jsonSha);
    } catch (e) {
      return cevap({ ok: false, mesaj: "Video listeye eklenemedi. Tekrar deneyin." }, 502);
    }
    return cevap({ ok: true, mesaj: "Video eklendi. ~1 dakika içinde galeride görünecek.", src: url });
  }

  /* ================= SİL ================= */
  if (g.islem === "sil") {
    const src = typeof g.src === "string" ? g.src : "";
    if (!src) return cevap({ ok: false, mesaj: "Silinecek fotoğraf belirtilmedi." }, 400);

    const once = liste.length;
    liste = liste.filter((x) => x && x.src !== src);
    if (liste.length === once) return cevap({ ok: false, mesaj: "Fotoğraf listede bulunamadı." }, 404);

    try {
      const yeni = JSON.stringify({ guncelleme: new Date().toISOString(), fotograflar: liste }, null, 2) + "\n";
      await dosyaYaz(token, JSON_PATH, Buffer.from(yeni, "utf8").toString("base64"),
        `Galeriden cikarildi: ${src}`, jsonSha);
    } catch (e) {
      return cevap({ ok: false, mesaj: "Silinemedi, tekrar deneyin." }, 502);
    }

    return cevap({ ok: true, mesaj: "Fotoğraf galeriden çıkarıldı." });
  }

  return cevap({ ok: false, mesaj: "Bilinmeyen işlem." }, 400);
};
