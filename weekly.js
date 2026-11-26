(() => {
  const sources = [
    { id: "hadis", name: "Hadis" },
    { id: "siyer", name: "Siyer" },
    { id: "caglayan", name: "Çağlayan" },
    { id: "pirlanta", name: "Pırlanta" },
    { id: "risale", name: "Risale" }
  ];

  // Each chapter's materials are grouped by source ID. Each item has a title and href.
  const weeks = [
    {
      id: "hafta-1",
      title: "1. Hafta",
      example: true,
      chapters: [{ id: "bolum-1", title: "1. Bölüm", materials: {} }]
    }
  ];

  const route = (...nodes) => "#irsad-ekseni" + nodes.map(node => "/" + encodeURIComponent(node.id)).join("");
  const filesFor = (chapter, source) => chapter.materials[source.id] || [];

  function outline(week, chapter, source) {
    function topic(href, text, level, current) {
      return '<li class="wk-topic wk-level-' + level + '"><a href="' + href + '"' +
        (current ? ' aria-current="page"' : '') + '>' + escapeHtml(text) + '</a></li>';
    }
    const rows = weeks.map(item => {
      const chapters = item.chapters.map(child => {
        const resources = sources.map(resource =>
          topic(route(item, child, resource), resource.name, 2, item === week && child === chapter && resource === source)
        ).join("");
        return '<li class="wk-node wk-child"><details' + (item === week && child === chapter ? ' open' : '') +
          '><summary>' + escapeHtml(child.title) + '</summary><ul>' +
          topic(route(item, child), 'Bölüm kaynakları', 2, item === week && child === chapter && !source) +
          resources + '</ul></details></li>';
      }).join("");
      return '<li class="wk-node"><details' + (item === week ? ' open' : '') +
        '><summary>' + escapeHtml(item.title) + '</summary><ul>' +
        topic(route(item), 'Bölümler', 1, item === week && !chapter) + chapters + '</ul></details></li>';
    }).join("");
    return '<nav class="wk-outline" aria-label="Haftalar ve bölümler"><h2>Haftalar</h2>' +
      '<button class="wk-mobile-toggle" type="button" aria-expanded="false" aria-controls="wk-topic-menu">Haftalar ve bölümler</button><div id="wk-topic-menu">' +
      '<label class="wk-search"><input type="search" aria-label="İçerikte ara" placeholder="İçerikte ara" autocomplete="off">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg></label>' +
      '<ul class="wk-tree">' + rows + '</ul><p class="wk-no-match" role="status" hidden>Sonuç bulunamadı.</p></div></nav>';
  }

  function enableOutlineSearch(main) {
    const mobileToggle = main.querySelector(".wk-mobile-toggle");
    mobileToggle.addEventListener("click", () => {
      mobileToggle.setAttribute("aria-expanded", String(mobileToggle.getAttribute("aria-expanded") !== "true"));
    });
    const tree = main.querySelector(".wk-tree");
    const initialOpen = new Set([...tree.querySelectorAll("details[open]")]);
    const noMatch = main.querySelector(".wk-no-match");

    function filterNodes(list, term) {
      let found = false;
      for (const node of list.children) {
        const branch = node.querySelector(":scope > details");
        const label = branch ? branch.querySelector("summary") : node.firstElementChild;
        const ownMatch = foldText(label.textContent).includes(term);
        const matchedChild = branch && filterNodes(branch.querySelector("ul"), ownMatch ? "" : term);
        node.hidden = !ownMatch && !matchedChild;
        if (!node.hidden) found = true;
        if (branch) branch.open = term ? !node.hidden : initialOpen.has(branch);
      }
      return found;
    }

    main.querySelector(".wk-search input").addEventListener("input", event => {
      const term = foldText(event.target.value.trim());
      noMatch.hidden = filterNodes(tree, term);
    });
  }

  function weekView(week) {
    return '<h2>' + escapeHtml(week.title) + '</h2><h3>Bölümler</h3><ul class="wk-rows">' +
      week.chapters.map(chapter => {
        const total = sources.reduce((sum, source) => sum + filesFor(chapter, source).length, 0);
        return '<li><a href="' + route(week, chapter) + '"><span>' + escapeHtml(chapter.title) +
          '</span><small>' + (total ? total + ' sunum' : 'Henüz eklenmedi') + '</small></a></li>';
      }).join("") + '</ul>';
  }

  function chapterView(week, chapter) {
    return '<a class="wk-back" href="' + route(week) + '">Haftaya dön</a><h2>' +
      escapeHtml(chapter.title) + '</h2><h3>Kaynaklar</h3><ul class="wk-rows wk-sources">' +
      sources.map(source => {
        const files = filesFor(chapter, source);
        return '<li><a href="' + route(week, chapter, source) + '"><span>' + escapeHtml(source.name) +
          '</span><small>' + (files.length ? files.length + ' sunum' : 'Henüz eklenmedi') + '</small></a></li>';
      }).join("") + '</ul>';
  }

  function sourceView(week, chapter, source) {
    const files = filesFor(chapter, source);
    const items = files.map(file =>
      '<li><a href="' + escapeHtml(file.href) + '">' + escapeHtml(file.title) + '</a></li>'
    ).join("");
    return '<a class="wk-back" href="' + route(week, chapter) + '">Kaynaklara dön</a><h2>' +
      escapeHtml(source.name) + '</h2><p class="wk-desc">' + escapeHtml(week.title + ' · ' + chapter.title) + '</p>' +
      (files.length ? '<h3>Sunumlar</h3><ul class="wk-rows">' + items + '</ul>' :
       '<p class="wk-empty">Bu bölümün ' + escapeHtml(source.name) + ' sunumunu henüz paylaşmadık.</p>');
  }

  window.renderWeekly = function renderWeekly(main, parts) {
    const [, weekId, chapterId, sourceId] = parts;
    const week = weekId ? weeks.find(item => item.id === weekId) : weeks[0];
    const chapter = week?.chapters.find(item => item.id === chapterId);
    const source = sources.find(item => item.id === sourceId);
    const valid = week && (!chapterId || chapter) && (!sourceId || (chapter && source)) && parts.length <= 4;
    let content;
    if (!valid) {
      content = '<h2>İçerik bulunamadı</h2><p class="wk-empty"><a class="wk-back" href="#irsad-ekseni">Haftalara dön</a></p>';
    } else if (source) {
      content = sourceView(week, chapter, source);
    } else if (chapter) {
      content = chapterView(week, chapter);
    } else {
      content = weekView(week);
    }
    const title = valid ? (source?.name || chapter?.title || week.title) : "İçerik bulunamadı";
    const overview = valid && !weekId;
    const intro = 'Arkadaşlarımız her hafta Hadis, Siyer, Çağlayan, Pırlanta ve Risale üzerine sunumlar hazırlıyor.';
    const header = overview
      ? '<header class="wk-banner"><h1>İrşad Ekseni</h1></header>'
      : '<header class="wk-course-title"><h1>İrşad Ekseni</h1></header>';
    const trail = '<nav class="wk-trail" aria-label="Gezinme yolu"><a href="#kitaplik">Kitaplık</a>' +
      '<span aria-hidden="true">/</span>' + (overview ? '<span>İrşad Ekseni</span>' : '<a href="#irsad-ekseni">İrşad Ekseni</a>') + '</nav>';
    document.title = (overview ? '' : title + ' · ') + 'İrşad Ekseni · Ders Halkası';
    main.innerHTML = '<section class="wk-page' + (overview ? ' wk-overview' : '') + '">' +
      (overview ? header + trail : trail + header) +
      '<div class="wk-layout">' + outline(week, chapter, source) +
      '<section class="wk-panel">' + (overview ? '<p class="wk-intro">' + intro + '</p>' : '') +
      (valid && week.example ? '<p class="wk-context">Örnek hafta</p>' : '') + content +
      '</section></div></section>';
    enableOutlineSearch(main);
  };
})();
