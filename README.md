# Ders Halkası

[dershalkasi.nl](https://dershalkasi.nl/) sitesinin kaynak kodu. Site yetiştirme derslerinin sunumlarını, konuşma notlarını ve haftalık İrşad Ekseni okumalarını bir araya getiriyor.

Herhangi bir derleme adımı yok: düz HTML, CSS ve JavaScript. Dosyaları olduğu gibi sunucuya yüklemek yeterli.

## Yerelde açmak

`index.html` dosyasını tarayıcıda çift tıklayarak açabilirsin. İstersen küçük bir sunucu da kullanabilirsin:

```bash
python3 -m http.server 8000
```

Sonra tarayıcıda `http://localhost:8000` adresini aç.

## Dosyalar

| Dosya | Ne işe yarar |
| --- | --- |
| `index.html` | Sayfa iskeleti, menü, paylaşım önizlemesi (Open Graph) etiketleri |
| `app.js` | Ana sayfa, sunum listesi, kaydedilenler ve slayt okuyucu |
| `lessons.js` | **Ders kataloğu**: başlıklar, gruplar, sürümler, indirilebilir dosyalar |
| `decks/*.js` | Her sunum sürümünün slayt çizimleri ve konuşma notları. Sadece o ders açılınca yüklenir |
| `slides.js` | Deste dosyalarını yükler ve slaytları SVG olarak çizer |
| `weekly.js` | İrşad Ekseni bölümü (haftalar, bölümler, kaynaklar) |
| `utils.js` | Ortak yardımcılar (HTML kaçışı, Türkçe uyumlu arama) |
| `style.css`, `reader.css`, `weekly.css` | Görünüm |
| `files/` | İndirilebilir PowerPoint ve PDF dosyaları |
| `assets/` | Kapak resimleri ve paylaşım görseli |
| `tools/split-legacy.js` | Eski tek parça `graphics.js` + `lessons.js` biçimini `decks/` dosyalarına bölen araç |

## Güncelleme yaptıktan sonra: sürüm numarası

`index.html` içindeki bütün `?v=2` ifadelerini bir artır (`?v=3` gibi). Aynı numara deste dosyalarına da eklenir. Böylece ziyaretçilerin tarayıcısı eski kopyayı göstermez, yeni dosyaları indirir.

## Yeni sunum eklemek

1. PowerPoint dosyasını `files/` klasörüne koy (örnek: `files/teblig.pptx`).
2. Slayt çizimlerini ve notlarını `decks/<deste-adi>.js` olarak ekle (biçim aşağıda).
3. `lessons.js` içine dersi ekle:

```js
{
  "id": "teblig",                 // adres çubuğunda görünür: #ders/teblig
  "title": "Tebliğ",
  "group": "Haftalık dersler",    // aynı gruptaki dersler birlikte listelenir
  "sequence": "1. hafta",
  "description": "Kısa açıklama (aramada da kullanılır).",
  "editions": [
    {
      "id": "asil",
      "label": "Asıl",
      "deck": "teblig",           // decks/teblig.js
      "slideCount": 20,
      "source": "./files/teblig.pptx",
      "notesPdf": "./files/teblig-konusma.pdf",   // isteğe bağlı
      "pdf": "./files/teblig.pdf"                 // isteğe bağlı
    }
  ]
}
```

Henüz sunumu hazır olmayan bir ders için `editions` yerine `"upcoming": true` yaz. Listede "Sunum henüz eklenmedi" olarak görünür. Şu an Tebliğ dersi böyle duruyor; sunumu hazır olunca bu kaydı yukarıdaki gibi doldurman yeterli.

Bir dersin birden fazla sürümü olabilir (örnek: Teslimiyet ve Selimiyet). Her sürüm `editions` içinde ayrı bir kayıt ve ayrı bir deste dosyasıdır.

### Deste dosyası biçimi

```js
window.registerDeck("teblig", {
  "slides": [{ "title": "…", "text": "Slayttaki yazı", "note": "Konuşma notu" }],
  "glyphs": ["…"],   // harf şekilleri (SVG path)
  "parts": ["…"],    // hazır SVG parçaları; !I0! gibi işaretler images'taki resimle değişir
  "images": { "0": "data:image/png;base64,…" },
  "pages": [["0 0 960 540", [ /* parça numaraları ve yazı satırları */ ]]]
});
```

`slides` ve `pages` aynı sayıda olmalı. Ayrıntılar `slides.js` içindeki açıklamada.

## İrşad Ekseni'ne kaynak eklemek

`weekly.js` başındaki `weeks` listesinde her bölümün `materials` alanı kaynak türüne göre doldurulur:

```js
materials: {
  hadis: [{ title: "Hadis sunumu", href: "./files/hafta-1-hadis.pdf" }],
  risale: [{ title: "Risale okuması", href: "./files/hafta-1-risale.pdf" }]
}
```

Kaynak türleri: `hadis`, `siyer`, `caglayan`, `pirlanta`, `risale`. Gerçek haftalar eklenince `example: true` satırını kaldır; bu satır sayfada "Örnek hafta" yazısını gösteriyor.
