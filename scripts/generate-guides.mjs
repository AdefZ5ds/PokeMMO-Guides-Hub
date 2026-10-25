// Genera guides/<slug>.html a partir de assets/data/guides.json (+ guide-bodies.mjs).
// Uso: npm run gen   (también se ejecuta automáticamente en `npm run build`)
// Así todas las guías comparten una plantilla única y es fácil mantenerlas.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bodies } from './guide-bodies.mjs';
import { renderRed } from './render-red.mjs';
import { IMG_FALLBACK } from './lib/cards.mjs';
import { renderMeloetta } from './render-meloetta.mjs';
import { renderCresselia } from './render-cresselia.mjs';
import { renderFarmeo } from './render-farmeo.mjs';
import { renderHooh } from './render-hooh.mjs';
import { renderRusheo } from './render-rusheo.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { guides, categories, goals } = JSON.parse(readFileSync(resolve(root, 'assets/data/guides.json'), 'utf8'));
const es = JSON.parse(readFileSync(resolve(root, 'locales/es.json'), 'utf8'));
const catName = (id) => es.categories[id];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SPRITE = 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/versions/generation-v/black-white/animated/';

// Guías con contenido interactivo propio (slug → renderizador)
const custom = { 'derrotar-red': renderRed, 'raid-meloetta': renderMeloetta, 'farmeo-gimnasios': renderFarmeo, 'farmeo-gimnasios-2026': renderFarmeo, 'raid-cresselia': renderCresselia, 'farmeo-hooh': renderHooh, 'rusheo-multiregion': renderRusheo };

function bodyHtml(g) {
  if (custom[g.slug]) return custom[g.slug](g);
  const b = bodies[g.slug];
  const ext = g.externalUrl
    ? `<aside class="my-6 rounded-xl border-2 border-accent bg-accent/10 p-5">
        <h2 class="!mt-0 text-lg font-bold" data-i18n="guide.external.title">${es.guide.external.title}</h2>
        <p class="mt-1 text-sm text-muted" data-i18n="guide.external.text">${es.guide.external.text}</p>
        <a class="btn-primary mt-4 !text-white" href="${esc(g.externalUrl)}" target="_blank" rel="noopener noreferrer">
          <span data-i18n="guide.external.cta">${es.guide.external.cta}</span><span data-icon="external-link"></span>
          <span class="sr-only" data-i18n="a11y.newTab">${es.a11y.newTab}</span>
        </a>
        ${g.placeholderUrl ? `<p class="mt-3 text-sm font-semibold" data-i18n="guide.external.placeholder">${es.guide.external.placeholder}</p>` : ''}
      </aside>`
    : '';
  if (!b) return `<p>${esc(g.description)}</p>${ext}`;
  const tabbed = b.sections.length >= 2; // con 2 o más secciones: pestañas (mismo componente que las demás guías)
  const sections = tabbed
    ? `<div id="farmeo-guide" data-tabs-label="Secciones"><div id="region-controls"></div>${[['Introducción', null], ...b.sections].map(([h, items], i) =>
        `<section id="reg-${i}" data-region="s${i}" aria-labelledby="reg-${i}-t" class="scroll-mt-24"><h3 id="reg-${i}-t" class="!mt-8 text-xl font-bold">${esc(h)}</h3>${items ? `<ul>${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p>${esc(b.intro)}</p>`}</section>`).join('')}</div>`
    : b.sections.map(([h, items]) => `<h2>${esc(h)}</h2><ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`).join('\n');
  const verify = b.verify?.length
    ? `<div class="callout" role="note"><p class="!mb-2 font-bold"><span aria-hidden="true">⚠️</span> <span data-i18n="guide.verify">${es.guide.verify}</span></p><ul class="!mb-0">${b.verify.map((v) => `<li>${esc(v)}</li>`).join('')}</ul></div>`
    : '';
  return `${tabbed ? '' : `<p>${esc(b.intro)}</p>`}${ext}${sections}${verify}`;
}

function page(g) {
  const cat = catName(g.category);
  const goalName = es.goals[g.goal].title;
  return `<!doctype html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(g.title)} · PokeMMO Guides Hub</title>
  <meta name="description" content="${esc(g.description)}" />
  <meta name="theme-color" content="#0f172a" />
  <meta property="og:title" content="${esc(g.title)}" />
  <meta property="og:description" content="${esc(g.description)}" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" onload="this.onload=null;this.rel='stylesheet'" />
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" /></noscript>
  <script>
    try {
      var s = localStorage.getItem('pmmo-theme');
      var dark = s ? s === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', dark);
    } catch (e) {}
  </script>
  <script type="module" src="/assets/js/main.js"></script>
</head>
<body>
  <a href="#main" class="skip-link" data-i18n="a11y.skip">Saltar al contenido principal</a>

  <header class="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur">
    <nav class="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3" aria-label="Navegación principal" data-i18n-attr="aria-label:a11y.mainNav">
      <a href="../index.html" class="flex items-center gap-2 font-bold" aria-label="PokeMMO Guides Hub">
        <img src="/assets/img/logo.svg" alt="" width="28" height="28" />
        <span class="hidden sm:inline">PokeMMO Guides Hub</span>
      </a>
      <form role="search" action="../index.html" method="get" class="ml-auto hidden max-w-xs flex-1 md:block">
        <label for="nav-search" class="sr-only" data-i18n="a11y.search">Buscar guías</label>
        <div class="relative">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" data-icon="search"></span>
          <input id="nav-search" name="q" type="search" class="field pl-9" autocomplete="off" placeholder="Buscar guías…" data-i18n-attr="placeholder:nav.searchPlaceholder" />
        </div>
      </form>
      <div class="ml-auto flex items-center gap-2 md:ml-0">
        <label for="lang-select" class="sr-only" data-i18n="a11y.lang">Idioma</label>
        <select id="lang-select" class="field !w-auto py-1.5">
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="zh" lang="zh-Hans">中文</option>
        </select>
        <button type="button" class="btn-ghost !px-2.5" data-anim-toggle aria-pressed="false" aria-label="Pausar animaciones"><span data-anim-icon aria-hidden="true">🎞️</span></button>
        <button id="theme-toggle" type="button" class="btn-ghost !px-2.5" aria-label="Cambiar tema">
          <span class="hidden dark:inline" data-icon="sun" data-icon-class="icon h-5 w-5"></span>
          <span class="dark:hidden" data-icon="moon" data-icon-class="icon h-5 w-5"></span>
        </button>
      </div>
    </nav>
  </header>

  <main id="main" tabindex="-1">
    <!-- Banner estilo Netflix: imagen a todo el ancho, degradado inferior y título encima (texto siempre claro) -->
    <section class="relative isolate flex min-h-[15rem] items-end overflow-hidden bg-slate-950 text-white sm:min-h-[20rem] lg:min-h-[24rem] ${g.image ? '' : `cov cov-${g.category}`}" aria-labelledby="guide-title">
      ${g.image ? `<img src="../img/banners/${g.image}.webp" alt="" width="1400" height="800" fetchpriority="high" decoding="async" class="absolute inset-0 -z-20 h-full w-full object-cover" />` : `<img src="${SPRITE}${g.sprite}.gif" alt="" width="96" height="96" class="absolute right-6 top-6 -z-10 h-24 w-24 opacity-80 object-contain [image-rendering:pixelated] sm:h-32 sm:w-32" decoding="async" data-own-error onerror="${IMG_FALLBACK}" />`}
      <div class="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/60 to-black/35" aria-hidden="true"></div>
      <div class="mx-auto w-full max-w-3xl px-4 pb-6 pt-16">
        <nav aria-label="Ruta de navegación" data-i18n-attr="aria-label:guide.breadcrumb">
          <ol class="flex flex-wrap items-center gap-1.5 text-sm text-slate-200">
            <li><a class="font-medium text-sky-300" href="../index.html" data-i18n="nav.home">Inicio</a></li>
            <li aria-hidden="true"><span data-icon="chevron-right"></span></li>
            <li><a class="font-medium text-sky-300" href="../index.html#obj-${g.goal}" data-i18n="goals.${g.goal}.title">${esc(goalName)}</a></li>
          </ol>
        </nav>
        <h1 id="guide-title" class="mt-3 text-3xl font-bold leading-tight sm:text-4xl" style="text-shadow:0 2px 12px rgb(0 0 0/.7)" data-i18n="guides.${g.slug}.title" data-i18n-default="${esc(g.title)}">${esc(g.title)}</h1>
        <p class="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-100">
          <span class="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/15 px-2 py-0.5 text-xs font-semibold"><span aria-hidden="true">${goals.find((c) => c.id === g.goal).emoji}</span> <span data-i18n="goals.${g.goal}.title">${esc(goalName)}</span></span>
          ${g.externalUrl ? `<span class="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/15 px-2 py-0.5 text-xs font-semibold" data-i18n="card.external">${es.card.external}</span>` : ''}
          <span><span data-icon="eye"></span> <span id="guide-views" aria-live="polite">…</span></span>
        </p>
      </div>
    </section>

    <div id="guide-wrap" class="guide-wrap mx-auto px-4 py-8">
    <aside id="guide-toc" class="guide-toc" hidden aria-labelledby="toc-title"><p id="toc-title" class="toc-title" data-toc-label>${es.guide.toc}</p></aside>
    <article data-guide data-slug="${g.slug}" data-seed="${g.popularity}">

      <p id="not-translated" class="callout" role="note" hidden data-i18n="guide.notTranslated">${es.guide.notTranslated}</p>

      <!-- El contenido permanece en su idioma original (lang="es") -->
      <div id="guide-body" lang="${g.lang}" class="guide-body mt-6">
        ${bodyHtml(g)}
      </div>

      <p class="mt-10">
        <a class="btn-ghost" href="../index.html"><span data-icon="arrow-left"></span> <span data-i18n="guide.back">${es.guide.back}</span></a>
      </p>
    </article>
    </div>
  </main>

  <footer class="border-t border-line bg-surface">
    <div class="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <p class="flex items-center gap-2 text-base font-bold"><img src="/assets/img/logo.svg" alt="" width="24" height="24" /> PokeMMO Guides Hub</p>
        <p class="mt-3 text-muted" data-i18n="footer.tagline">Hecho con cariño por un jugador para toda la comunidad. Que tus IVs sean altos, tus shinies frecuentes y tus raids sin sorpresas. ¡Buena caza, entrenador!</p>
      </div>
      <nav aria-label="Enlaces del pie">
        <p class="font-semibold" data-i18n="footer.links">Enlaces</p>
        <ul class="mt-3 space-y-2">
          <li><a class="text-accent-text" href="../index.html" data-i18n="nav.home">Inicio</a></li>
          <li><a class="text-accent-text" href="../index.html#galeria" data-i18n="nav.gallery">Lista de Guías</a></li>
          <li><a class="text-accent-text" href="https://pokemmo.com" target="_blank" rel="noopener noreferrer"><span data-i18n="footer.official">Sitio oficial de PokeMMO</span><span class="sr-only" data-i18n="a11y.newTab"> (nueva pestaña)</span></a></li>
        </ul>
      </nav>
      <div>
        <p class="font-semibold" data-i18n="footer.credits">Créditos</p>
        <ul class="mt-3 space-y-2 text-muted">
          <li><span data-i18n="footer.sprites">Sprites: PokeAPI y Pokémon Showdown.</span> <a class="text-accent-text" href="https://pokeapi.co" target="_blank" rel="noopener noreferrer">pokeapi.co<span class="sr-only" data-i18n="a11y.newTab"> (nueva pestaña)</span></a></li>
          <li data-i18n="footer.icons">Iconos: Lucide · Tipografías: Bricolage Grotesque y Hanken Grotesk.</li>
        </ul>
      </div>
    </div>
    <div class="border-t border-line"><p class="mx-auto max-w-6xl px-4 py-4 text-xs text-muted" data-i18n="footer.disclaimer">Sitio comunitario no oficial: no está afiliado a PokeMMO ni a Nintendo/Game Freak. Pokémon y sus nombres pertenecen a sus respectivos dueños. Cada guía pertenece a sus autores, que aparecen en los créditos de cada una.</p></div>
  </footer>
</body>
</html>
`;
}

mkdirSync(resolve(root, 'guides'), { recursive: true });
for (const g of guides) writeFileSync(resolve(root, 'guides', `${g.slug}.html`), page(g));
console.log(`✔ ${guides.length} guías generadas en guides/`);
