const main = document.querySelector("main");
const mainNav = document.querySelector(".main-nav");
const courseSwitcher = document.querySelector(".course-switcher");
const entries = window.lessons;
const catalog = entries.filter(lesson => !lesson.upcoming);
const groups = [...new Set(entries.map(lesson => lesson.group))];
const bookmarkKey = "yetistirme.saved.v1";
const paths = {
  bookmark: '<path d="M6 4h12v16l-6-4-6 4z"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
  file: '<path d="M6 3h8l4 4v14H6zm8 0v5h4M9 12h6m-6 4h6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>'
};
const icon = name => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths[name] + '</svg>';
let saved = new Set();
try {
  const values = JSON.parse(localStorage.getItem(bookmarkKey) || "[]");
  if (Array.isArray(values)) saved = new Set(values.filter(id => catalog.some(lesson => lesson.id === id)));
} catch { /* The current session can still use bookmarks. */ }

let page = "";
let query = "";
let selected = null;
let edition = null;
let deck = null;
let slideIndex = 0;
let mode = "slides";
let readerOrigin = "benim-sunumlarim";

const series = [
  {
    id: "benim-sunumlarim",
    title: "Benim Sunumlarım",
    description: "Kur’an usûlü, Fâtiha ve hadis dersleri için hazırladığım slaytlar ve konuşma notlarım.",
    image: "./assets/cover-1.webp",
    action: "Sunumları aç"
  },
  {
    id: "irsad-ekseni",
    title: "İrşad Ekseni",
    description: "Her hafta bir bölümü arkadaşlarla Hadis, Siyer, Çağlayan, Pırlanta ve Risale’den okumalarla ele alıyoruz.",
    image: "./assets/cover-2.webp",
    action: "Haftaları aç"
  }
];

function navigation() {
  const section = page === "ders" ? readerOrigin : page;
  for (const link of mainNav.querySelectorAll("a")) {
    if (link.hash === "#" + section) link.setAttribute("aria-current", page === section ? "page" : "location");
    else link.removeAttribute("aria-current");
  }
  courseSwitcher.open = false;
}

courseSwitcher.querySelector("nav").addEventListener("click", () => { courseSwitcher.open = false; });
document.addEventListener("click", event => {
  if (courseSwitcher.open && !courseSwitcher.contains(event.target)) courseSwitcher.open = false;
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && courseSwitcher.open) {
    courseSwitcher.open = false;
    courseSwitcher.querySelector("summary").focus();
  }
});

function home() {
  document.title = "Ders kitaplığı · Ders Halkası";
  main.innerHTML = `
    <section class="library-home" aria-labelledby="library-title">
      <header class="home-heading">
        <h1 id="library-title">Ders kitaplığı</h1>
        <p>Selamünaleyküm. Yetiştirme derslerinde kullandığımız sunumları ve birlikte okuduğumuz metinleri burada topluyoruz.</p>
      </header>
      <div class="home-columns">
        <section class="home-module" aria-labelledby="courses-heading">
          <h2 id="courses-heading">Derslerim</h2>
          <div class="home-filters" role="group" aria-label="Kitaplık görünümü">
            <button type="button" data-home-view="series" aria-pressed="true">Ders bölümleri</button>
            <button type="button" data-home-view="lessons" aria-pressed="false">Tüm sunumlar</button>
          </div>
          <div id="series-cards" class="series-grid">
            ${series.map(item => `
              <a class="series-card" href="#${item.id}" aria-labelledby="title-${item.id}">
                <img class="card-cover" src="${item.image}" alt="" width="840" height="420">
                <div class="card-body">
                  <h3 id="title-${item.id}">${item.title}</h3>
                  <p>${item.description}</p>
                  <span class="series-action">${item.action}</span>
                </div>
              </a>`).join("")}
          </div>
          <ul id="home-lessons" class="home-lessons" hidden>
            ${catalog.map(lesson => `<li><a href="${lessonUrl(lesson)}"><span>${escapeHtml(lesson.title)}</span><small>${escapeHtml(lesson.group)}</small></a></li>`).join("")}
          </ul>
        </section>
        <aside class="home-module excerpt-module" aria-labelledby="excerpt-title">
          <h2 id="excerpt-title">Dersten bir sayfa</h2>
          <a class="lesson-excerpt" href="#ders/fatihada-kulluk/asil/2">
            <img src="./assets/fatiha-ders-sayfasi.webp" alt="" width="1152" height="649">
            <span>Fâtiha’da Kulluk ve Hidayet</span>
            <small>2. slayt · Yalnız sana kulluk ederiz</small>
          </a>
        </aside>
      </div>
    </section>`;
  const filters = main.querySelector(".home-filters");
  filters.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    const showLessons = button.dataset.homeView === "lessons";
    main.querySelector("#series-cards").hidden = showLessons;
    main.querySelector("#home-lessons").hidden = !showLessons;
    filters.querySelectorAll("button").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
  });
}

function saveButton(lesson, wide = false) {
  const on = saved.has(lesson.id);
  const label = on ? "Kaydedilenlerden çıkar" : "Dersi kaydet";
  return `<button type="button" class="save-lesson${wide ? ' with-caption' : ''}" data-save="${escapeHtml(lesson.id)}" title="${label}"
    aria-label="${escapeHtml(lesson.title+' – '+label)}" aria-pressed="${on}">${icon("bookmark")}${wide ? '<span>'+(on ? 'Kaydedildi' : 'Kaydet')+'</span>' : ''}</button>`;
}
function lessonUrl(lesson) {
  return "#ders/" + encodeURIComponent(lesson.id);
}
function catalogueRow(lesson) {
  if (lesson.upcoming) {
    return `<li class="course-row course-missing"><div class="course-link">
      <span class="course-file-icon">${icon("file")}</span>
      <span class="course-text"><strong>${escapeHtml(lesson.title)}</strong>
      <span class="course-meta">${escapeHtml([lesson.sequence,"Sunum henüz eklenmedi"].filter(Boolean).join(" · "))}</span></span>
      </div></li>`;
  }
  const counts = lesson.editions[0].slideCount + " slayt" + (lesson.editions.length>1 ? ' · '+lesson.editions.length+' sürüm' : '');
  return `<li class="course-row"><a href="${lessonUrl(lesson)}" class="course-link">
    <span class="course-file-icon">${icon("file")}</span>
    <span class="course-text"><strong>${escapeHtml(lesson.title)}</strong>
    <span class="course-meta">${escapeHtml([lesson.sequence,counts].filter(Boolean).join(" · "))}</span></span>
    </a>${saveButton(lesson)}</li>`;
}
function updateList() {
  const onlySaved = page === "kaydedilenler";
  const term = foldText(query.trim());
  const filter = onlySaved ? "" : main.querySelector('input[name="course-group"]:checked')?.value;
  const found = entries.filter(lesson => (onlySaved ? saved.has(lesson.id) : !filter || lesson.group === filter) &&
    foldText([lesson.title,lesson.group,lesson.sequence,lesson.description].join(" ")).includes(term));
  let html = "";
  for (const group of groups) {
    const items = found.filter(lesson=>lesson.group===group);
    if (!items.length) continue;
    html += `<section class="course-group"><h3>${escapeHtml(group)}</h3>
      <ul>${items.map(catalogueRow).join("")}</ul></section>`;
  }
  if (!html) {
    const emptySaved = onlySaved && !saved.size;
    html = `<div class="empty"><h2>${emptySaved ? 'Henüz ders kaydetmedin' : 'Ders bulunamadı'}</h2>
      <p>${emptySaved ? 'Bir sunumu buraya eklemek için kaydetme simgesine dokun.' : 'Başka bir ders adıyla aramayı deneyebilirsin.'}</p>
      ${emptySaved ? '<a href="#benim-sunumlarim">Benim Sunumlarım</a>' : ''}</div>`;
  }
  main.querySelector("#course-list").innerHTML = html;
  main.querySelector("#result-count").textContent = found.filter(lesson => !lesson.upcoming).length + " sunum";
}
function collection() {
  const onlySaved = page === "kaydedilenler";
  const title = onlySaved ? "Kaydettiklerim" : "Benim Sunumlarım";
  document.title = title+" · Ders Halkası";
  const expanded = !window.matchMedia?.("(max-width: 760px)").matches;
  main.innerHTML = `<section class="course-catalog">
    <nav class="course-trail" aria-label="Gezinme yolu"><a href="#kitaplik">Kitaplık</a><span aria-hidden="true">/</span><span aria-current="page">${title}</span></nav>
    <header class="${onlySaved ? 'saved-header' : 'course-banner'}"><div><h1>${title}</h1>
      <p>${onlySaved ? 'Bu tarayıcıda kaydettiğin ders sunumları.' : catalog.length+' sunum · '+groups.length+' ders grubu'}</p></div>
    </header>
    <div class="catalog-layout${onlySaved ? ' catalog-saved' : ''}">
      ${onlySaved ? '' : `<aside><details class="catalog-filters" ${expanded ? 'open' : ''}><summary>Ders grupları</summary>
        <fieldset id="course-filters"><legend class="sr-only">Ders grubunu seç</legend>
        ${["",...groups].map((group,i) => `<label class="catalog-filter"><input type="radio" name="course-group" value="${escapeHtml(group)}" ${i===0?'checked':''}>
          <span>${escapeHtml(group || "Tüm dersler")}</span><small>${i===0?catalog.length:catalog.filter(lesson=>lesson.group===group).length}</small></label>`).join("")}
        </fieldset></details></aside>`}
      <div class="catalog-content"><div class="archive-tools"><div><h2>${onlySaved ? 'Kaydedilen dersler' : 'Ders içeriği'}</h2>
        <span class="course-meta" id="result-count" role="status"></span></div>
        <label class="course-search">${icon("search")}<input type="search" id="search" aria-label="Ders ara" placeholder="Ders ara…" autocomplete="off"></label></div>
        <div class="course-list" id="course-list"></div>
      </div></div></section>`;
  if (!onlySaved) main.querySelector("#course-filters").addEventListener("change",updateList);
  main.querySelector("#search").addEventListener("input", event => {
    query = event.target.value;
    updateList();
  });
  updateList();
}
function notFound(lesson) {
  const title = lesson ? lesson.title + " sunumu henüz eklenmedi" : "Ders bulunamadı";
  document.title = title + " · Ders Halkası";
  main.innerHTML = `<section class="course-catalog">
    <nav class="course-trail" aria-label="Gezinme yolu"><a href="#kitaplik">Kitaplık</a><span aria-hidden="true">/</span><a href="#benim-sunumlarim">Benim Sunumlarım</a></nav>
    <div class="empty not-found"><h1>${escapeHtml(title)}</h1>
      <p>${lesson ? 'Sunum hazır olduğunda bu bağlantıdan açılacak.' : 'Bu bağlantıdaki ders kaldırılmış ya da adresi değişmiş olabilir.'}</p>
      <a href="#benim-sunumlarim">Tüm sunumlara göz at</a></div>
  </section>`;
}
function fileLink(path, caption, download = false) {
  if (!path) return "";
  const filename = String(path).split("/").pop();
  const attrs = download ? 'download="'+escapeHtml(filename)+'"' : 'target="_blank" rel="noopener"';
  return `<a class="source-link" href="${escapeHtml(path)}" ${attrs}>${icon(download ? "download" : "file")}${escapeHtml(caption)}</a>`;
}
function outline() {
  return groups.map(group => [group, catalog.filter(lesson=>lesson.group===group)]).filter(([, lessons]) => lessons.length).map(([group, lessons])=>`
    <details class="outline-group" data-group="${escapeHtml(group)}" ${group===selected.group ? 'open' : ''}>
      <summary>${escapeHtml(group)}</summary><nav aria-label="${escapeHtml(group)}">
      ${lessons.map(lesson=>
        `<a href="${lessonUrl(lesson)}" ${lesson===selected ? 'aria-current="page"' : ''}>
          ${lesson.sequence ? '<small>'+escapeHtml(lesson.sequence)+'</small>' : ''}${escapeHtml(lesson.title)}</a>`
      ).join("")}
    </nav></details>`).join("");
}
function reader() {
  document.title = selected.title+" · Ders Halkası";
  const expanded = !window.matchMedia?.("(max-width: 760px)").matches;
  const versions = selected.editions.length>1 ? `
    <label class="edition-field">Sürüm
      <select id="edition-choice">${selected.editions.map(item=>`<option value="${escapeHtml(item.id)}" ${item===edition ? 'selected' : ''}>${escapeHtml(item.label)}</option>`).join("")}</select>
    </label>` : "";
  main.innerHTML = `<section class="reader">
    <nav class="course-trail" aria-label="Gezinme yolu"><a href="#kitaplik">Kitaplık</a><span aria-hidden="true">/</span><a href="#${readerOrigin}">${readerOrigin==='kaydedilenler' ? 'Kaydettiklerim' : 'Benim Sunumlarım'}</a></nav>
    <div class="archive-reader">
      <aside class="lesson-outline"><details class="outline-container" ${expanded ? 'open' : ''}><summary>Ders içeriği</summary>
        <label class="course-search">${icon("search")}<input type="search" id="outline-search" aria-label="Ders içeriğinde ara" placeholder="Ders içeriğinde ara…" autocomplete="off"></label>
        <div class="outline-list">${outline()}</div><p id="outline-empty" hidden>Ders bulunamadı.</p>
      </details></aside>
      <div class="reader-content">
        <header class="reader-head"><div><p>${escapeHtml([selected.group,selected.sequence].filter(Boolean).join(' · '))}</p><h1>${escapeHtml(selected.title)}</h1></div>${saveButton(selected,true)}</header>
        <div class="view-options">
          <div class="tabs" role="group" aria-label="Görünüm">
            <button type="button" class="tab" data-mode="slides" aria-pressed="${mode==='slides'}">Slaytlar</button>
            <button type="button" class="tab" data-mode="notes" aria-pressed="${mode==='notes'}">Konuşma metni</button>
          </div>${versions}
        </div>
        <div id="lesson-panel"></div>
        <div class="source-links">${fileLink(edition.source,"PowerPoint’i indir",true)}
          ${fileLink(edition.notesPdf,"Konuşma metni (PDF)")}${fileLink(edition.pdf,"Slaytlar (PDF)")}</div>
      </div>
    </div>
  </section>`;
  main.querySelector("#outline-search").addEventListener("input", event => {
    const term = foldText(event.target.value.trim());
    let matches = 0;
    main.querySelectorAll(".outline-group").forEach(section => {
      let count = 0;
      section.querySelectorAll("a").forEach(link => {
        const match = foldText(section.dataset.group+" "+link.textContent).includes(term);
        link.hidden = !match;
        if (match) count++;
      });
      section.hidden = count === 0;
      section.open = term ? count > 0 : section.dataset.group === selected.group;
      matches += count;
    });
    main.querySelector("#outline-empty").hidden = matches > 0;
  });
  showDeck();
}
// Slaytlar ders açılınca decks/ klasöründen yüklenir; o sırada yer tutucu gösterilir.
function showDeck() {
  if (deck) {
    slidePanel();
    return;
  }
  const wanted = edition;
  main.querySelector("#lesson-panel").innerHTML = '<div class="slide-status" role="status">Slaytlar yükleniyor…</div>';
  window.loadDeck(wanted.deck).then(loaded => {
    if (edition !== wanted) return;
    deck = loaded;
    slidePanel();
  }, () => {
    if (edition !== wanted) return;
    main.querySelector("#lesson-panel").innerHTML = `<div class="slide-status" role="alert">
      <p>Slaytlar yüklenemedi. İnternet bağlantını kontrol edip tekrar dene.</p>
      <button type="button" class="pg" data-retry>Tekrar dene</button></div>`;
  });
}
function slidePanel() {
  const slide = deck.slides[slideIndex];
  const text = Array.isArray(slide.text) ? slide.text.join("\n") : slide.text;
  const name = escapeHtml(slide.title);
  const count = deck.slides.length;
  const options = deck.slides.map((_,i)=>`<option value="${i}" ${i===slideIndex ? 'selected' : ''}>${i+1} / ${count}</option>`).join("");
  const panel = main.querySelector("#lesson-panel");
  let content;
  if (mode === "notes") {
    content = `<article class="speaker-text">
      <p class="course-meta">Slayt ${slideIndex+1}</p><h2>${name}</h2><p dir="auto">${escapeHtml(slide.note || "Bu slayda konuşmacı notu eklenmemiş.")}</p>
    </article>`;
  } else {
    content = `<div class="slide-art" role="img" aria-label="Slayt ${slideIndex+1} · ${name}">
      ${window.renderSlide(deck,slideIndex)}</div>`;
  }
  panel.innerHTML = `${content}<div class="slide-controls">
    <button type="button" class="pg" data-pg="-1" ${slideIndex===0 ? 'disabled' : ''}>Önceki</button>
    <label class="page-field"><span>Slayt</span><select aria-label="Slayt seç" id="page-choice">${options}</select></label>
    <button type="button" class="pg" data-pg="1" ${slideIndex===count-1 ? 'disabled' : ''}>Sonraki</button>
    </div>
    <p class="sr-only" role="status">Slayt ${slideIndex+1} / ${count} · ${name}</p>
    ${mode==="slides" && text ? '<details class="slide-transcript"><summary>Slayt metnini oku</summary><p dir="auto">'+escapeHtml(text)+'</p></details>' : ''}`;
}
function selectSlide(index, focusTarget) {
  if (!deck || !Number.isInteger(index) || index<0 || index>=deck.slides.length || index===slideIndex) return;
  slideIndex = index;
  const hash=lessonUrl(selected)+"/"+encodeURIComponent(edition.id)+"/"+(index+1);
  try { history.replaceState(null,"",hash); } catch { /* Slide navigation also works in restricted file previews. */ }
  slidePanel();
  if (focusTarget) {
    const target = main.querySelector(focusTarget);
    (target && !target.disabled ? target : main.querySelector("#page-choice"))?.focus({preventScroll:true});
  }
}
main.addEventListener("change", event => {
  if (event.target.id==="page-choice") selectSlide(Number(event.target.value),"#page-choice");
  if (event.target.id==="edition-choice") location.hash=lessonUrl(selected)+"/"+encodeURIComponent(event.target.value)+"/1";
});
main.addEventListener("click", event => {
  const button=event.target.closest("button");
  if (!button) return;
  if (button.hasAttribute("data-save")) {
    const id=button.dataset.save;
    if (saved.has(id)) saved.delete(id); else saved.add(id);
    try { localStorage.setItem(bookmarkKey,JSON.stringify([...saved])); } catch { /* Keep session state. */ }
    if (selected) button.outerHTML=saveButton(selected,true); else updateList();
    (main.querySelector('[data-save="'+id+'"]') || main.querySelector("#search"))?.focus({preventScroll:true});
  } else if (button.hasAttribute("data-mode") && edition) {
    mode=button.dataset.mode;
    main.querySelectorAll("[data-mode]").forEach(item=>item.setAttribute("aria-pressed",String(item.dataset.mode===mode)));
    if (deck) slidePanel();
  } else if (button.hasAttribute("data-pg")) {
    selectSlide(slideIndex+Number(button.dataset.pg),'[data-pg="'+button.dataset.pg+'"]');
  } else if (button.hasAttribute("data-retry") && edition) {
    showDeck();
  }
});
document.addEventListener("keydown",event=>{
  if (!deck || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
      event.target.closest("select,input,textarea,[contenteditable=true],summary")) return;
  if(event.key==="ArrowRight" || event.key==="ArrowLeft") {
    event.preventDefault();
    const focusTarget=event.target.closest("[data-pg]") ? '[data-pg="'+event.target.closest("[data-pg]").dataset.pg+'"]' : null;
    selectSlide(slideIndex+(event.key==="ArrowRight" ? 1 : -1),focusTarget);
  }
});
document.querySelector(".skip").addEventListener("click",event=>{
  event.preventDefault();
  main.focus();
  main.scrollIntoView();
});
function route() {
  const [section,id,version,number] = location.hash.slice(1).split("/");
  const wasRendered=Boolean(main.children.length);
  const oldLesson=selected;
  const lesson=section==="ders" ? entries.find(item=>item.id===id) : null;
  selected=lesson && !lesson.upcoming ? lesson : null;
  edition=null;
  deck=null;
  if (selected) {
    if (page!=="ders") readerOrigin=page==="kaydedilenler" ? page : "benim-sunumlarim";
    edition=selected.editions.find(item=>item.id===version) || selected.editions[0];
    deck=window.getDeck(edition.deck) || null;
    if (oldLesson!==selected) mode="slides";
    const requested=Number(number);
    slideIndex=Number.isInteger(requested) && requested>=1 && requested<=edition.slideCount ? requested-1 : 0;
    page="ders";
    reader();
  } else if (section==="ders") {
    page="bulunamadi";
    notFound(lesson);
  } else if (section==="irsad-ekseni") {
    page=section;
    window.renderWeekly(main,location.hash.slice(1).split("/"));
  } else if(section==="benim-sunumlarim" || section==="kaydedilenler") {
    page=section;
    query="";
    collection();
  } else {
    page="kitaplik";
    home();
  }
  navigation();
  if (wasRendered) {main.focus({preventScroll:true});window.scrollTo(0,0);}
}
window.addEventListener("hashchange",route);
route();
