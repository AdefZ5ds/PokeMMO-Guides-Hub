// Galería de situaciones (componente reutilizable).
//
// Lee un JSON incrustado (#gallery-data):
//   { team: [{name, dex}],                       // tu equipo (sprites dentro de los pasos)
//     generations: [{ n, sections: [{ title, type: 'steps'|'moves'|'group',
//        entries: [{ id?, rivals: [[nombre, dex]], steps?, notes? }] }] }] }
//
// Modelo: la galería muestra los Pokémon LÍDER (sección "Pokémon líder" de cada
// generación). Cada líder se despliega con sus pasos y, debajo, las secciones de
// su generación ("Ataca con…", "2.º Pokémon"…) con sprites + nombre.
// Un líder que aparece en varias generaciones (Pikachu) es un único sprite con un
// bloque desplegable por generación.
// El HTML estático (#list-view) es la versión sin JS / imprimible.

const dataEl = document.getElementById('gallery-data');
const root = document.getElementById('gallery-root');
const listView = document.getElementById('list-view');
const data = JSON.parse(dataEl.textContent);
const SPRITE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/';
const LEAD_TITLE = 'Pokémon líder';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sprite = (dex) => `${SPRITE}${dex}.gif`;

// ---------- Índices ----------
/** nombre → { name, dex, blocks: [{ gen, entry, follow: sección[] }] } (orden de aparición) */
const leaders = new Map();
const entryOwner = {}; // id de entrada → primer líder (para "Sigue la solución de X")
for (const g of data.generations) {
  const follow = g.sections.filter((s) => s.title !== LEAD_TITLE);
  for (const s of g.sections.filter((x) => x.title === LEAD_TITLE)) {
    for (const e of s.entries) {
      if (e.id) entryOwner[e.id] = e.rivals[0][0];
      for (const [name, dex] of e.rivals) {
        if (!leaders.has(name)) leaders.set(name, { name, dex, blocks: [] });
        leaders.get(name).blocks.push({ gen: g.n, entry: e, follow });
      }
    }
  }
}
const teamDex = Object.fromEntries(data.team.map((m) => [m.name, m.dex]));
const teamRe = new RegExp(`\\b(${data.team.map((m) => m.name).join('|')})\\b`, 'g');

/** Texto con el sprite de tus Pokémon junto a su nombre. */
const teamify = (text) =>
  esc(text).replace(teamRe, (n) =>
    `<img src="${sprite(teamDex[n])}" alt="${n}" title="${n}" width="96" height="96" loading="lazy" class="mx-0.5 inline-block h-9 w-9 align-middle object-contain [image-rendering:pixelated]" />`);

// ---------- Estado ----------
const state = { gen: 'all', selected: null };
const gensOf = (l) => new Set(l.blocks.map((b) => b.gen));

// ---------- Estructura ----------
root.innerHTML = `
  <div data-gallery>
    <p class="mb-3 text-sm text-muted">Pulsa el Pokémon líder de RED al que te enfrentas para ver qué hacer.</p>
    <ul class="grid grid-cols-4 gap-2 !pl-0 !list-none sm:grid-cols-6 md:grid-cols-8" data-grid></ul>
  </div>`;
listView.hidden = true; // la lista estática solo se ve sin JS

const galleryEl = root.querySelector('[data-gallery]');
const grid = root.querySelector('[data-grid]');

const items = [...leaders.values()].map((l) => {
  const li = document.createElement('li');
  li.dataset.name = l.name;
  li.innerHTML = `<button type="button" aria-expanded="false" aria-controls="gallery-detail"
      class="flex w-full flex-col items-center rounded-xl border border-line bg-surface p-1.5 transition-colors hover:border-accent aria-expanded:border-accent-strong aria-expanded:bg-accent/10">
      <img src="${sprite(l.dex)}" alt="" width="96" height="96" loading="lazy" decoding="async" class="h-16 w-16 object-contain [image-rendering:pixelated]" />
      <span class="mt-0.5 w-full truncate text-center text-xs">${esc(l.name)}</span>
      <span class="text-[11px] leading-tight text-muted">Gen ${[...gensOf(l)].join(' · ')}</span></button>`;
  grid.append(li);
  return { l, li, btn: li.querySelector('button') };
});

const detail = document.createElement('li');
detail.id = 'gallery-detail';
detail.className = 'col-span-full rounded-xl border-2 border-accent bg-surface p-4';
detail.setAttribute('role', 'region');
detail.setAttribute('aria-labelledby', 'gallery-detail-title');
detail.tabIndex = -1;

// ---------- Detalle ----------
const rivalCard = (name, dex, extra = '') =>
  `<span class="flex w-16 flex-col items-center text-center"><img src="${sprite(dex)}" alt="" width="96" height="96" loading="lazy" class="h-12 w-12 object-contain [image-rendering:pixelated]" /><span class="text-xs">${esc(name)}</span>${extra}</span>`;

function stepHtml(step) {
  if (typeof step === 'string') return `<li>${teamify(step)}</li>`;
  const target = entryOwner[step.ref];
  return `<li><button type="button" data-goto="${esc(target ?? '')}" class="text-accent-text">${esc(step.text)}</button></li>`;
}

const rivalGroup = (rivals, notes = {}) => `<div class="flex flex-wrap gap-2">${rivals.map(([n, d]) =>
  rivalCard(n, d, notes[n] ? `<span class="mt-0.5 rounded bg-gold px-1 text-[11px] font-semibold text-slate-900">${esc(notes[n])}</span>` : '')).join('')}</div>`;

function followHtml(section) {
  let body;
  if (section.type === 'moves') {
    // Mismo estilo que "Ataca con…": se agrupan los Pokémon que comparten la misma acción.
    const byAction = new Map();
    for (const e of section.entries) {
      if (!byAction.has(e.steps[0])) byAction.set(e.steps[0], []);
      byAction.get(e.steps[0]).push(...e.rivals);
    }
    body = [...byAction].map(([action, rivals]) =>
      `<div class="mt-2 first:mt-0"><p class="!mb-1 text-sm font-semibold">${teamify(action)}</p>${rivalGroup(rivals)}</div>`).join('');
  } else {
    body = `<div class="flex flex-wrap gap-2">${section.entries.map((e) =>
      e.rivals.map(([n, d]) => rivalCard(n, d, e.notes?.[n] ? `<span class="mt-0.5 rounded bg-gold px-1 text-[11px] font-semibold text-slate-900">${esc(e.notes[n])}</span>` : '')).join('')).join('')}</div>`;
  }
  return `<div class="mt-3 rounded-lg bg-bg p-3"><p class="!mb-2 text-sm font-semibold text-accent-text">${esc(section.title)}</p>${body}</div>`;
}

function blockHtml(b, name) {
  const others = b.entry.rivals.map(([n]) => n).filter((n) => n !== name);
  return `<div class="rounded-lg bg-bg p-3">
      <p class="!mb-1 text-sm font-semibold text-accent-text">Si es el líder</p>
      <ol class="!mb-0 list-decimal space-y-1 pl-6">${b.entry.steps.map(stepHtml).join('')}</ol>
      ${others.length ? `<p class="!mb-0 mt-2 text-xs text-muted">Misma respuesta para: ${esc(others.join(', '))}.</p>` : ''}
    </div>${b.follow.map(followHtml).join('')}`;
}

function renderDetail(l) {
  const blocks = l.blocks.filter((b) => state.gen === 'all' || String(b.gen) === state.gen);
  // Varias generaciones (Pikachu) → un bloque desplegable por generación.
  const content = blocks.length > 1
    ? blocks.map((b) => `<details class="mt-3 rounded-xl border border-line p-3 open:border-accent" data-gen-block>
        <summary class="cursor-pointer text-base font-semibold">Generación ${b.gen}</summary>${blockHtml(b, l.name)}</details>`).join('')
    : blocks.map((b) => `<div class="mt-3">${blockHtml(b, l.name)}</div>`).join('');
  detail.innerHTML = `
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3">
        <img src="${sprite(l.dex)}" alt="" width="96" height="96" class="h-20 w-20 shrink-0 object-contain [image-rendering:pixelated]" />
        <div><h3 id="gallery-detail-title" class="!m-0 text-lg font-bold" tabindex="-1">RED empieza con ${esc(l.name)}</h3>
        <p class="!m-0 text-sm text-muted">${blocks.length > 1 ? 'Aparece como líder en 2 generaciones: despliega la que enfrentas.' : `Generación ${blocks[0].gen}`}</p></div>
      </div>
      <button type="button" data-close class="btn-ghost !px-3 !py-1.5">Cerrar</button>
    </div>${content}`;
}

/** Inserta el detalle tras el último sprite de la misma fila visual. */
function placeDetail() {
  const sel = items.find((i) => i.l.name === state.selected);
  detail.remove();
  if (!sel) return;
  const rowTop = sel.li.offsetTop;
  const row = items.filter((i) => !i.li.hidden && i.li.offsetTop === rowTop);
  row[row.length - 1].li.after(detail);
}

// ---------- Acciones ----------
function select(name, { scroll = false, focus = false } = {}) {
  const found = items.find((i) => i.l.name === name && !i.li.hidden);
  if (!found) return;
  state.selected = name;
  items.forEach((i) => i.btn.setAttribute('aria-expanded', String(i.l.name === name)));
  renderDetail(found.l);
  placeDetail();
  if (scroll) detail.scrollIntoView({ block: 'nearest' });
  if (focus) detail.querySelector('#gallery-detail-title').focus();
}

function close({ refocus = false } = {}) {
  const prev = items.find((i) => i.l.name === state.selected);
  state.selected = null;
  items.forEach((i) => i.btn.setAttribute('aria-expanded', 'false'));
  detail.remove();
  if (refocus) prev?.btn.focus();
}

function applyFilters() {
  items.forEach((i) => { i.li.hidden = false; });
  const sel = items.find((i) => i.l.name === state.selected);
  if (sel) { renderDetail(sel.l); placeDetail(); }
}

root.addEventListener('click', (e) => {
  if (e.target.closest('[data-close]')) { close({ refocus: true }); return; }
  const go = e.target.closest('[data-goto]');
  if (go?.dataset.goto) { select(go.dataset.goto, { scroll: true, focus: true }); return; }
  const li = e.target.closest('[data-grid] > li[data-name]');
  if (li) { if (state.selected === li.dataset.name) close(); else select(li.dataset.name, { scroll: true }); }
});
root.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.selected) close({ refocus: true }); });

// Lista estática: "Sigue la solución de X" abre el bloque destino.
listView.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-ref]');
  if (!a) return;
  e.preventDefault();
  const t = document.getElementById(a.dataset.ref);
  if (!t) return;
  t.open = true;
  t.scrollIntoView({ block: 'center' });
  t.querySelector('summary')?.focus();
});

let rt;
window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(placeDetail, 150); });

// La selección NO se guarda: al entrar o recargar la guía siempre empieza sin nada seleccionado.
applyFilters();
