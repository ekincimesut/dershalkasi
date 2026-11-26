#!/usr/bin/env node
// Eski tek parça veriyi (lessons.js + graphics.js) sunum başına ayrı dosyalara böler.
//
//   node tools/split-legacy.js <eski-lessons.js> <eski-graphics.js> [çıktı-klasörü]
//
// Çıktı klasörüne (varsayılan: proje kökü) decks/<deste>.js dosyalarını yazar ve
// lessons.js'e eklenecek katalog kayıtlarını ekrana JSON olarak basar.
// Her deste yalnızca kendi kullandığı harf şekillerini, parçaları ve resimleri içerir.

const fs = require("fs");
const path = require("path");

const [lessonsPath, graphicsPath, outDir = path.join(__dirname, "..")] = process.argv.slice(2);
if (!lessonsPath || !graphicsPath) {
  console.error("Kullanım: node tools/split-legacy.js <eski-lessons.js> <eski-graphics.js> [çıktı-klasörü]");
  process.exit(1);
}

// Metinlerin içinde ";" geçebileceği için bitiş işareti sondan aranır.
function sliceJson(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.lastIndexOf(endMarker);
  if (start < 0 || end <= start) throw new Error("Beklenen işaret bulunamadı: " + startMarker);
  return JSON.parse(source.slice(start + startMarker.length, end));
}

const lessons = sliceJson(fs.readFileSync(lessonsPath, "utf8"), "window.lessons = ", ";");
const art = sliceJson(fs.readFileSync(graphicsPath, "utf8"), "const artwork = ", ";\nfunction slideGraphic");

function deckId(lesson, edition) {
  return lesson.editions.length === 1 || edition.id === "asil" ? lesson.id : lesson.id + "-" + edition.id;
}

function extractDeck(stem) {
  const pages = art.pages[stem];
  if (!pages) throw new Error("Slayt verisi bulunamadı: " + stem);
  const glyphMap = new Map();
  const partMap = new Map();
  const imageMap = new Map();
  const glyphs = [];
  const parts = [];
  const images = {};

  const mapPart = oldId => {
    if (!partMap.has(oldId)) {
      const markup = art.parts[oldId].replace(/!I(\d+)!/g, (_, imageId) => {
        if (!imageMap.has(imageId)) {
          const newId = String(imageMap.size);
          imageMap.set(imageId, newId);
          images[newId] = art.images[imageId];
        }
        return "!I" + imageMap.get(imageId) + "!";
      });
      partMap.set(oldId, parts.length);
      parts.push(markup);
    }
    return partMap.get(oldId);
  };
  const mapGlyph = oldId => {
    if (!glyphMap.has(oldId)) {
      glyphMap.set(oldId, glyphs.length);
      glyphs.push(art.glyphs[oldId]);
    }
    return glyphMap.get(oldId);
  };

  const newPages = pages.map(([viewBox, events]) => [viewBox, events.map(event => {
    if (typeof event === "number") return mapPart(event);
    const letters = Array.from(event[6], char => String.fromCharCode(256 + mapGlyph(char.charCodeAt(0) - 256))).join("");
    return [...event.slice(0, 6), letters, ...event.slice(7)];
  })]);

  return { glyphs, images, parts, pages: newPages };
}

const decksDir = path.join(outDir, "decks");
fs.mkdirSync(decksDir, { recursive: true });

const catalog = lessons.map(lesson => {
  const { editions, ...meta } = lesson;
  return {
    ...meta,
    editions: editions.map(edition => {
      const id = deckId(lesson, edition);
      const slides = edition.slides.map(({ title, text, note }) => ({ title, text, note }));
      const deck = { slides, ...extractDeck(edition.stem) };
      if (deck.pages.length !== slides.length) {
        throw new Error(id + ": slayt sayısı (" + slides.length + ") ile çizim sayısı (" + deck.pages.length + ") uyuşmuyor");
      }
      const header = "// " + lesson.title + " — " + edition.label + " (" + slides.length + " slayt). Otomatik üretildi, elle düzenlemeyin.\n";
      fs.writeFileSync(path.join(decksDir, id + ".js"),
        header + "window.registerDeck(" + JSON.stringify(id) + ", " + JSON.stringify(deck) + ");\n");
      const entry = { id: edition.id, label: edition.label, deck: id, slideCount: slides.length };
      for (const key of ["source", "notesPdf", "pdf"]) if (edition[key]) entry[key] = edition[key];
      return entry;
    })
  };
});

process.stdout.write(JSON.stringify(catalog, null, 2) + "\n");
