// Punto de entrada común a todas las páginas.
import '../css/styles.css';
import { ready, setLang, applyTranslations, currentLang, t } from './i18n.js';
import { initTheme, updateThemeLabel } from './theme.js';
import { hydrateIcons } from './icons.js';

// Los módulos de cada página se piden en paralelo con i18n (antes iban uno detrás de otro)
const pageMods = {
  hub: document.getElementById('hub') ? import('./hub.js') : null,
  toc: document.getElementById('guide-toc') ? import('./toc.js') : null,
};
await ready;

// --- Sprites animados (GIF Gen 5 alojados en /img/sprites) ---
// · Los GIF se ven siempre por defecto. Antes se congelaban con «reducir movimiento», y Android lo activa
//   solo (modo ahorro de batería, «quitar animaciones»), por eso en el móvil salían estáticos.
// · El botón de la barra («Animaciones») los pausa; la preferencia se guarda en este navegador.
// · Si un GIF no carga, se usa su PNG estático.
const ANIM = 'black-white/animated/';
const KEY_ANIM = 'pmmo-anim';
const RAW = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/';
const JSD = 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/';
const still = (src) => src.replace('versions/generation-v/black-white/animated/', '').replace(/\.gif$/, '.png');
const live = (src) => src.replace('/sprites/pokemon/', '/sprites/pokemon/versions/generation-v/black-white/animated/').replace(/\.png$/, '.gif');
const isLive = (src) => src.includes(ANIM) && src.endsWith('.gif');
const isStill = (src) => src.includes('/sprites/pokemon/') && !src.includes('versions/') && src.endsWith('.png');
let animOn = true;
try { animOn = localStorage.getItem(KEY_ANIM) !== 'off'; } catch { /* sin almacenamiento */ }
const freeze = (img) => { if (!animOn && isLive(img.src)) img.src = still(img.src); };
// Si un sprite falla: jsDelivr → raw.githubusercontent → PNG estático.
document.addEventListener('error', (e) => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement) || img.hasAttribute('data-own-error')) return;
  const src = img.src;
  if (!src.startsWith(JSD) && !src.startsWith(RAW)) return;
  if (src.startsWith(JSD)) img.src = RAW + src.slice(JSD.length);
  else if (isLive(src)) img.src = still(src);
}, true);
const sweep = () => { if (!animOn) document.querySelectorAll(`img[src*="${ANIM}"]`).forEach(freeze); };
new MutationObserver((list) => { if (!animOn) list.forEach((r) => {
  if (r.type === 'attributes') freeze(r.target);
  r.addedNodes.forEach((n) => { if (n.nodeType === 1) { freeze(n); n.querySelectorAll?.(`img[src*="${ANIM}"]`).forEach(freeze); } });
}); }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });
const animButtons = () => document.querySelectorAll('[data-anim-toggle]');
const paintAnim = () => animButtons().forEach((b) => {
  b.setAttribute('aria-pressed', String(!animOn));
  b.setAttribute('aria-label', t(animOn ? 'anim.pause' : 'anim.play'));
  b.title = t(animOn ? 'anim.pause' : 'anim.play');
  b.querySelector('[data-anim-icon]')?.replaceChildren(document.createTextNode(animOn ? '🎞️' : '🖼️'));
});
animButtons().forEach((b) => b.addEventListener('click', () => {
  animOn = !animOn;
  try { localStorage.setItem(KEY_ANIM, animOn ? 'on' : 'off'); } catch { /* ignorar */ }
  document.querySelectorAll('img[src*="/sprites/pokemon/"]').forEach((img) => {
    if (animOn && isStill(img.src)) img.src = live(img.src); else freeze(img);
  });
  paintAnim();
}));
sweep();

// --- Estructura común (navbar, footer): idioma, tema, iconos ---
hydrateIcons();
applyTranslations();
initTheme();
document.getElementById('lang-select')?.addEventListener('change', (e) => setLang(e.target.value));
window.addEventListener('langchange', () => { updateThemeLabel(); paintAnim(); });
paintAnim();

// --- Hero: vídeo de fondo con botón de pausa; sin movimiento si el usuario lo pide ---
const heroVideo = document.getElementById('hero-video');
const heroBtn = document.getElementById('hero-toggle');
if (heroVideo && heroBtn) {
  const { icon } = await import('./icons.js');
  const paint = () => {
    const paused = heroVideo.paused;
    heroBtn.setAttribute('aria-pressed', String(paused));
    heroBtn.setAttribute('aria-label', t(paused ? 'hero.resume' : 'hero.pause'));
    heroBtn.innerHTML = icon(paused ? 'play' : 'pause', 'icon h-5 w-5');
  };
  heroBtn.classList.replace('hidden', 'grid');
  // El vídeo (≈7 MB) no se pide hasta que la página termina de cargar, y no se reproduce solo
  // con «ahorro de datos», conexión lenta o «reducir movimiento»: ahí se queda el póster.
  const conn = navigator.connection || {};
  const slow = conn.saveData || /(^|-)2g|3g/.test(conn.effectiveType || '');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!slow && !calm) {
    const start = () => { heroVideo.preload = 'auto'; heroVideo.play().catch(() => {}); };
    const later = () => (window.requestIdleCallback || ((f) => setTimeout(f, 300)))(start);
    document.readyState === 'complete' ? later() : window.addEventListener('load', later, { once: true });
  }
  heroBtn.addEventListener('click', () => { heroVideo.paused ? heroVideo.play() : heroVideo.pause(); });
  heroVideo.addEventListener('play', paint);
  heroVideo.addEventListener('pause', paint);
  window.addEventListener('langchange', paint);
  paint();
}

// --- Portada: Alpine y la lógica de filtros se cargan solo aquí ---
if (document.getElementById('hub')) {
  const { startHub } = await pageMods.hub;
  startHub();
}

// --- Guías con galería de situaciones (p. ej. RED) ---
if (document.getElementById('gallery-data')) import('./gallery.js').then(sweep);
if (document.getElementById('raid-guide')) import('./raid.js').then(sweep);
if (document.getElementById('farmeo-guide')) import('./farmeo.js').then(sweep);
if (document.getElementById('rush-progress')) import('./rusheo.js').then(sweep);

// --- Páginas de guía: contador y aviso de traducción ---
const guide = document.querySelector('[data-guide]');
if (guide) {
  const { slug, seed } = guide.dataset;
  const viewsEl = document.getElementById('guide-views');
  const notice = document.getElementById('not-translated');
  const titleEl = document.querySelector('h1[data-i18n]');
  let views = null;

  const refresh = () => {
    if (notice) notice.hidden = currentLang() === 'es';
    if (viewsEl && views !== null) viewsEl.textContent = t('card.views', { count: views });
    if (titleEl) document.title = `${titleEl.textContent} · ${t('meta.siteName')}`;
  };
  refresh();
  window.addEventListener('langchange', refresh);

  pageMods.toc?.then((m) => m.buildToc());
  const { hit } = await import('./counter.js');
  hit(slug, Number(seed) || 0).then((n) => { views = n; refresh(); });
}
