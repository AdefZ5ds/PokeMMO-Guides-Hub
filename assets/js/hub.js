// Lógica de la portada (buscador, filtros, orden, populares) con Alpine.js.
// Se carga con import() dinámico solo en index.html → las guías no pagan su coste.
import Alpine from 'alpinejs';
import data from '../data/guides.json';
import { t, currentLang } from './i18n.js';
import { icon } from './icons.js';
import { loadViews } from './counter.js';

const BASE = import.meta.env.BASE_URL;
// En la portada se usan PNG estáticos (≈3 KB): 26 GIF animados a la vez frenaban la carga.
const SPRITE = 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/';
const NEW_DAYS = 45;
const SORTS = ['popular', 'alpha', 'recent'];

// Sin tildes y en minúsculas: "crianza" encuentra "Crianza", "Pokédex" ← "pokedex"
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const debounce = (fn, ms = 200) => {
  let id;
  return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), ms); };
};

export function startHub() {
  Alpine.data('hub', () => ({
    guides: data.guides,
    categories: data.categories,
    goals: data.goals,
    lang: currentLang(),
    qInput: '', q: '', cat: 'all', sort: 'popular',
    counts: Object.fromEntries(data.guides.map((g) => [g.slug, g.popularity])),
    source: 'seed',
    failed: {},
    menuOpen: false,
    filtersOpen: false,
    spriteError(e, g) { this.failed[g.slug] = true; e.target.removeAttribute('src'); },
    // Listas derivadas: se recalculan una vez por cambio (no en cada lectura de la plantilla)
    filtered: [],
    groups: [],

    init() {
      const p = new URLSearchParams(location.search);
      this.qInput = this.q = p.get('q') ?? '';
      const cat = p.get('cat');
      if (cat && this.categories.some((c) => c.id === cat)) this.cat = cat;
      if (SORTS.includes(p.get('sort'))) this.sort = p.get('sort');

      this.$watch('qInput', debounce((v) => { this.q = v.trim(); }));
      ['q', 'cat', 'sort'].forEach((k) => this.$watch(k, () => this.syncUrl()));
      ['q', 'cat', 'sort', 'lang', 'counts'].forEach((k) => this.$watch(k, () => this.recompute()));
      this.recompute();

      // Contadores tras el primer pintado: no bloquea el render inicial.
      const load = () => loadViews(this.guides).then((r) => { this.counts = r.counts; this.source = r.source; });
      const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200));
      idle(load);
    },

    // --- helpers de presentación ---
    icon,
    tr(key, opts) { this.lang; return t(key, opts); }, // leer this.lang hace la plantilla reactiva
    title(g) { return this.tr(`guides.${g.slug}.title`, { defaultValue: g.title }); },
    desc(g) { return this.tr(`guides.${g.slug}.description`, { defaultValue: g.description }); },
    catLabel(id) { return this.tr(`categories.${id}`); },
    goalTitle(id) { return this.tr(`goals.${id}.title`); },
    goalDesc(id) { return this.tr(`goals.${id}.desc`); },
    catEmoji(id) { return this.categories.find((c) => c.id === id)?.emoji ?? ''; },
    href(g) { return `${BASE}guides/${g.slug}.html`; },
    cover(g) { return `${BASE}img/portadas/${g.image}.webp`; },
    sprite(g) { return `${SPRITE}${g.sprite}.png`; },
    views(g) { return this.tr('card.views', { count: this.counts[g.slug] ?? 0 }); },
    isNew(g) { return (Date.now() - new Date(g.added)) / 864e5 <= NEW_DAYS; },

    // --- datos derivados ---
    recompute() {
      // View-model por guía: cada texto se traduce una sola vez por cambio de estado,
      // en vez de en cada expresión de la plantilla (clave para el tiempo de render).
      const vm = this.guides.map((g) => {
        const tt = this.title(g);
        return {
          ...g, tt, dd: this.desc(g), cc: this.catLabel(g.category),
          vv: this.views(g), alt: this.tr('card.spriteAlt', { title: tt }),
          isNew: this.isNew(g), n: this.counts[g.slug] ?? 0, pop: false,
        };
      });
      const byViews = (a, b) => b.n - a.n;
      [...vm].sort(byViews).slice(0, 3).forEach((g) => { g.pop = true; });

      const words = norm(this.q).split(/\s+/).filter(Boolean);
      const list = vm.filter((g) => {
        if (this.cat !== 'all' && g.category !== this.cat) return false;
        if (!words.length) return true;
        return words.every((w) => norm([g.tt, g.title, g.dd, g.cc, ...g.tags].join(' ')).includes(w));
      });
      const by = {
        popular: byViews,
        alpha: (a, b) => a.tt.localeCompare(b.tt, this.lang),
        recent: (a, b) => b.added.localeCompare(a.added),
      }[this.sort];
      // Con el orden por popularidad, las guías con portada van primero.
      this.filtered = list.sort(this.sort === 'popular' ? (a, b) => Number(!!b.image) - Number(!!a.image) || byViews(a, b) : by);
      // Una fila por objetivo (solo las que tienen resultados), conservando el orden elegido.
      this.groups = this.goals
        .map((go) => ({ id: go.id, title: this.goalTitle(go.id), desc: this.goalDesc(go.id), list: this.filtered.filter((g) => g.goal === go.id) }))
        .filter((go) => go.list.length);
    },

    get resultsText() { return this.tr('results.count', { count: this.filtered.length }); },

    // --- acciones ---
    setCat(id) { this.cat = id; },
    pickCat(id) { this.cat = id; this.menuOpen = false; document.getElementById('galeria')?.scrollIntoView(); },
    reset() { this.qInput = this.q = ''; this.cat = 'all'; this.sort = 'popular'; },
    goToResults() {
      this.menuOpen = false;
      this.q = this.qInput.trim();
      document.getElementById('galeria')?.scrollIntoView();
    },
    syncUrl() {
      const p = new URLSearchParams();
      if (this.q) p.set('q', this.q);
      if (this.cat !== 'all') p.set('cat', this.cat);
      if (this.sort !== 'popular') p.set('sort', this.sort);
      const qs = p.toString();
      history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}`);
    },
  }));

  window.Alpine = Alpine;
  Alpine.start();
}
