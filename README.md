# Pazarcık Alabalık Dinlenme Tesisleri — Dijital Menü

QR ile açılan statik menü (Türkçe / Arapça / İngilizce). Netlify'da yayında.

## 💰 Fiyat / ürün güncelleme (uzaktan, telefondan bile)

1. Bu depoda **`js/menu-data.js`** dosyasını aç (sağ üstteki ✏️ kalem ikonu).
2. İlgili **`value:`** sayısını değiştir. Örnek:
   - `prices: [ { label: L_PORTION, value: 400 }, ... ]`  →  `value: 450`
3. Aşağıdaki yeşil **"Commit changes"** düğmesine bas.
4. Netlify ~1 dakikada **otomatik yayınlar.** QR'lar hiç değişmez. ✅

> ⚠️ Sadece sayıları / yazıları değiştir. Virgül, süslü parantez `{ }`, tırnak `"` yapısını bozma — yoksa menü açılmaz.

## Yapı
| Dosya | Ne işe yarar |
|-------|--------------|
| `index.html` | Sayfa iskeleti |
| `css/style.css` | Tasarım/tema |
| `js/menu-data.js` | **MENÜ İÇERİĞİ — fiyatlar burada** |
| `js/app.js` | Menü + galeri + dil mantığı |
| `img/` | Fotoğraflar |
| `sw.js` | Offline önbellek |
| `qr.html` | QR üretici (yerel araç) |
| `masa-karti.html` | Baskıya hazır masa kartı (yerel araç) |
