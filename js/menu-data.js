/* ===========================================================
   MENÜ İÇERİĞİ  —  Pazarcık Alabalık Dinlenme Tesisleri
   -----------------------------------------------------------
   FİYAT / ÜRÜN DEĞİŞTİRMEK İÇİN:
   - Bu dosyayı Not Defteri ile aç.
   - "value: 400" gibi sayıları değiştir, kaydet.
   - Yeni ürün eklemek için mevcut bir satırı kopyala/yapıştır.
   Diller: tr (Türkçe) · ar (Arapça) · en (İngilizce)
   =========================================================== */

/* Tekrar kullanılan fiyat etiketleri */
const L_PORTION = { tr: "Porsiyon", ar: "وجبة",  en: "Portion" };
const L_KG      = { tr: "Kilo",     ar: "كيلو",  en: "Per Kilo" };

const MENU = {
  restaurant: {
    name: {
      tr: "Pazarcık Alabalık Dinlenme Tesisleri",
      ar: "منتجع بازارجيك ألاباليك",
      en: "Pazarcık Trout Rest Facility"
    },
    tagline: {
      tr: "Orman içinde, dere kenarında",
      ar: "في الغابة، على ضفة النهر",
      en: "In the forest, by the stream"
    }
  },

  ui: {
    currency: "₺",
    offerings: {
      tr: "Et · Köfte · Canlı Alabalık",
      ar: "لحم · كفتة · تراوت طازج",
      en: "Meat · Köfte · Fresh Trout"
    },
    tabs: {
      menu:    { tr: "Menü",   ar: "القائمة", en: "Menu" },
      gallery: { tr: "Galeri", ar: "المعرض",  en: "Gallery" }
    },
    seasons: {
      winter: { tr: "❄️ Kış", ar: "❄️ الشتاء", en: "❄️ Winter" },
      summer: { tr: "☀️ Yaz", ar: "☀️ الصيف",  en: "☀️ Summer" }
    },
    footer: {
      tr: "Afiyet olsun 🍃 · Pazarcık Alabalık Dinlenme Tesisleri",
      ar: "بالهناء والعافية 🍃",
      en: "Enjoy your meal 🍃"
    }
  },

  categories: [
    /* ----------------- ET & IZGARA ----------------- */
    {
      icon: "🍖",
      name: { tr: "Et & Izgara", ar: "اللحوم والمشويات", en: "Grills & Meats" },
      items: [
        {
          name: { tr: "Köfte", ar: "كفتة", en: "Köfte (Grilled Meatballs)" },
          prices: [ { label: L_PORTION, value: 400 }, { label: L_KG, value: 1400 } ]
        },
        {
          name: { tr: "Et (Kuzu)", ar: "لحم خروف", en: "Grilled Lamb" },
          prices: [ { label: L_PORTION, value: 700 }, { label: L_KG, value: 1400 } ]
        },
        {
          name: { tr: "Tavuk", ar: "دجاج", en: "Chicken" },
          prices: [ { label: L_PORTION, value: 300 }, { label: L_KG, value: 850 } ]
        },
        {
          name: { tr: "Sac Kavurma", ar: "لحم على صاج", en: "Sac Kavurma (Sautéed Meat)" },
          prices: [ { label: L_PORTION, value: 500 } ]
        },
        {
          /* Fiziksel menüde "Balık" yazıyordu; tesis alabalık üzerine
             olduğu için "Alabalık" yaptım. Sadece "Balık" olsun istersen
             aşağıdaki üç satırı değiştir. */
          name: { tr: "Alabalık", ar: "سمك مشوي (تراوت)", en: "Grilled Trout" },
          prices: [ { label: L_PORTION, value: 500 } ]
        }
      ]
    },

    /* ----------------- KAHVALTI & SICAKLAR ----------------- */
    {
      icon: "🍳",
      name: { tr: "Kahvaltı & Sıcaklar", ar: "الفطور والأطباق الساخنة", en: "Breakfast & Hot Dishes" },
      items: [
        {
          name: { tr: "Tek Kişilik Kahvaltı", ar: "فطور لشخص واحد", en: "Breakfast for One" },
          desc: {
            tr: "Bal, tereyağı, zeytin, peynir, domates, salatalık",
            ar: "عسل، زبدة، زيتون، جبنة، طماطم، خيار",
            en: "Honey, butter, olives, cheese, tomato, cucumber"
          },
          prices: [ { value: 250 } ]
        },
        {
          name: { tr: "Kuymak", ar: "مهلمة (قويماق)", en: "Kuymak (Cheese Muhlama)" },
          prices: [ { value: 200 } ]
        },
        {
          name: { tr: "Kaşarlı Yumurta", ar: "بيض بالجبن", en: "Cheese Omelette" },
          desc: {
            tr: "Kahvaltıya da eklenebilir",
            ar: "يمكن إضافته إلى الفطور",
            en: "Can also be added to breakfast"
          },
          prices: [ { value: 150 } ]
        }
      ]
    },

    /* ----------------- ÇORBA & HAŞLAMA ----------------- */
    {
      icon: "🥣",
      name: { tr: "Çorba & Haşlama", ar: "الشوربة واللحم المسلوق", en: "Soups & Boiled" },
      items: [
        {
          name: { tr: "Çorba", ar: "شوربة", en: "Soup" },
          desc: {
            tr: "Mercimek · Ezogelin",
            ar: "عدس · ازوجلين",
            en: "Lentil · Ezogelin"
          },
          prices: [ { value: 100 } ]
        },
        {
          name: { tr: "Haşlama (Kuzu Eti)", ar: "لحم خروف مسلوق", en: "Boiled Lamb" },
          prices: [ { value: 300 } ]
        }
      ]
    },

    /* ----------------- TATLILAR ----------------- */
    {
      icon: "🍮",
      name: { tr: "Tatlılar", ar: "الحلويات", en: "Desserts" },
      items: [
        {
          name: { tr: "Sütlaç", ar: "رز بحليب", en: "Rice Pudding" },
          prices: [ { value: 125 } ]
        },
        {
          name: { tr: "Baklava", ar: "بقلاوة", en: "Baklava" },
          prices: [ { value: 125 } ]
        }
      ]
    },

    /* ----------------- İÇECEKLER ----------------- */
    {
      icon: "🥤",
      name: { tr: "İçecekler", ar: "المشروبات", en: "Drinks" },
      items: [
        { name: { tr: "Ayran",      ar: "عيران", en: "Ayran (Yogurt Drink)" }, prices: [ { value: 30 } ] },
        { name: { tr: "Şalgam",     ar: "شلغم",  en: "Turnip Juice (Şalgam)" }, prices: [ { value: 50 } ] },
        { name: { tr: "Kola",       ar: "كولا",  en: "Cola" },                  prices: [ { value: 60 } ] },
        { name: { tr: "Fanta",      ar: "فانتا", en: "Fanta" },                 prices: [ { value: 60 } ] },
        { name: { tr: "Soda",       ar: "صودا",  en: "Soda (Sparkling Water)" },prices: [ { value: 25 } ] },
        { name: { tr: "Meyve Suyu", ar: "عصير",  en: "Fruit Juice" },           prices: [ { value: 50 } ] },
        { name: { tr: "Su",         ar: "ماء",   en: "Water" },                 prices: [ { value: 10 } ] }
      ]
    }
  ]
};

/* ===========================================================
   GALERİ (4 mevsim) — img/ klasöründeki fotoğraflar
   Yeni fotoğraf eklemek için bir satırı kopyala/yapıştır,
   src'yi img klasöründeki dosya adıyla değiştir, season = "winter"/"summer".
   =========================================================== */
const GALLERY = [
  /* ❄️ KIŞ */
  { src: "manzara6.jpeg",  season: "winter", cap: { tr: "Güneşli kış günü", ar: "يوم شتاء مشمس",   en: "Sunny winter day" } },
  { src: "manzara10.jpeg", season: "winter", cap: { tr: "Kış sabahı",       ar: "صباح الشتاء",     en: "Winter morning" } },
  { src: "manzara5.jpeg",  season: "winter", cap: { tr: "Kış şafağı",       ar: "فجر الشتاء",      en: "Winter dawn" } },
  { src: "manzara2.jpeg",  season: "winter", cap: { tr: "Kar yağışı",       ar: "تساقط الثلوج",    en: "Snowfall" } },
  { src: "manzara7.jpeg",  season: "winter", cap: { tr: "Lapa lapa kar",    ar: "ثلوج كثيفة",      en: "Heavy snow" } },
  { src: "manzara3.jpeg",  season: "winter", cap: { tr: "Kış gecesi",       ar: "ليلة شتوية",      en: "Winter night" } },

  /* ☀️ YAZ */
  { src: "hero.jpeg",      season: "summer", cap: { tr: "Yazın tesisimiz",  ar: "المنتجع صيفًا",   en: "In summer" } },
  { src: "manzara.jpeg",   season: "summer", cap: { tr: "Yeşil vadi",       ar: "الوادي الأخضر",   en: "Green valley" } },
  { src: "dere.jpeg",      season: "summer", cap: { tr: "Dere kenarı",      ar: "على ضفة النهر",   en: "By the stream" } },
  { src: "manzara4.jpeg",  season: "summer", cap: { tr: "Kuş bakışı",       ar: "منظر علوي",       en: "Aerial view" } },
  { src: "ic-mekan.jpeg",  season: "summer", cap: { tr: "Sıcak salonumuz",  ar: "صالتنا الدافئة",  en: "Our cozy hall" } }
];
