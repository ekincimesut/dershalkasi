// Slayt destelerini (decks/*.js) yalnızca bir ders açıldığında yükler ve slaytları SVG olarak çizer.
(() => {
  const decks = new Map();
  const loading = new Map();
  // index.html'deki ?v= numarası deste dosyalarına da eklenir; böylece güncellemeden sonra eski kopya gelmez.
  const version = document.currentScript && new URL(document.currentScript.src).searchParams.get("v");

  window.registerDeck = (id, deck) => { decks.set(id, deck); };
  window.getDeck = id => decks.get(id);

  window.loadDeck = id => {
    if (decks.has(id)) return Promise.resolve(decks.get(id));
    if (!loading.has(id)) {
      loading.set(id, new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "./decks/" + encodeURIComponent(id) + ".js" + (version ? "?v=" + encodeURIComponent(version) : "");
        script.onload = () => {
          loading.delete(id);
          if (decks.has(id)) resolve(decks.get(id));
          else reject(new Error("Deste dosyası kayıt yapmadı: " + id));
        };
        script.onerror = () => {
          loading.delete(id);
          script.remove();
          reject(new Error("Deste yüklenemedi: " + id));
        };
        document.head.append(script);
      }));
    }
    return loading.get(id);
  };

  // Bir deste: glyphs (harf şekilleri), parts (hazır SVG parçaları), images (gömülü resimler)
  // ve pages: her slayt için [viewBox, olaylar]. Bir olay ya bir parça numarasıdır ya da
  // [a, b, c, d, y, renk, harfler, aralıklar] biçiminde bir yazı satırıdır.
  window.renderSlide = (deck, index) => {
    const [viewBox, events] = deck.pages[index];
    const used = new Set();
    const rendered = [];
    for (const event of events) {
      if (typeof event === "number") {
        rendered.push(deck.parts[event].replace(/!I(\d+)!/g, (_, id) => deck.images[id]));
        continue;
      }
      const [a, b, c, d, y, color, letters, delta] = event;
      let x = 0;
      for (let i = 0; i < letters.length; i++) {
        const id = letters.charCodeAt(i) - 256;
        used.add(id);
        x += delta[i];
        rendered.push('<use xlink:href="#sg' + id + '" transform="matrix(' +
          [a, b, c, d, x / 100, y].join(" ") + ')"' + (color ? ' fill="' + color + '"' : "") + "/>");
      }
    }
    const defs = Array.from(used, id => '<path id="sg' + id + '" d="' + deck.glyphs[id] + '"/>').join("");
    return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="' +
      viewBox + '"><defs>' + defs + "</defs>" + rendered.join("") + "</svg>";
  };
})();
