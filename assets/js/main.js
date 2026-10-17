// Punto de entrada común a todas las páginas.
import '../css/styles.css';
import { ready, setLang, applyTranslations, currentLang, t } from './i18n.js';
import { initTheme, updateThemeLabel } from './theme.js';
import { hydrateIcons } from './icons.js';

await ready;

// --- Estructura común (navbar, footer): idioma, tema, iconos ---
hydrateIcons();
applyTranslations();
initTheme();
document.getElementById('lang-select')?.addEventListener('change', (e) => setLang(e.target.value));
window.addEventListener('langchange', updateThemeLabel);

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
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) heroVideo.pause();
  heroBtn.addEventListener('click', () => { heroVideo.paused ? heroVideo.play() : heroVideo.pause(); });
  heroVideo.addEventListener('play', paint);
  heroVideo.addEventListener('pause', paint);
  window.addEventListener('langchange', paint);
  paint();
}

// --- Portada: Alpine y la lógica de filtros se cargan solo aquí ---
if (document.getElementById('hub')) {
  const { startHub } = await import('./hub.js');
  startHub();
}

// --- Guías con galería de situaciones (p. ej. RED) ---
if (document.getElementById('gallery-data')) import('./gallery.js');
if (document.getElementById('raid-guide')) import('./raid.js');
if (document.getElementById('farmeo-guide')) import('./farmeo.js');
if (document.getElementById('rush-progress')) import('./rusheo.js');

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

  const { hit } = await import('./counter.js');
  hit(slug, Number(seed) || 0).then((n) => { views = n; refresh(); });
}
