// Índice lateral de cada guía.
//  · Guías con pestañas (RED, Ho-Oh, Gimnasios, Rusheo, Raids…): las barras de pestañas que crean farmeo.js / raid.js
//    se MUEVEN al índice lateral, así que las pestañas funcionan igual pero ya no están arriba del contenido.
//  · Guías sin pestañas: enlaces a los títulos (h2, o h3 con id) que siempre están visibles.
// Escritorio: columna fija a la izquierda. Móvil: botones en filas encima del contenido.
import { t } from './i18n.js';

const BARS = ['region-controls', 'pj-controls', 'sub-controls'];

export function buildToc() {
  const slot = document.getElementById('guide-toc');
  const body = document.getElementById('guide-body');
  if (!slot || !body) return;

  const bars = BARS.map((id) => document.getElementById(id)?.querySelector('[role=tablist]')).filter(Boolean);
  const label = slot.querySelector('[data-toc-label]');
  const paintLabel = () => { if (label) label.textContent = t('guide.toc'); };
  paintLabel();
  window.addEventListener('langchange', paintLabel);

  // 1) Pestañas de la guía → índice lateral
  bars.forEach((bar, i) => {
    if (i > 0) {
      const sub = document.createElement('p');
      sub.className = 'toc-title toc-sub';
      sub.textContent = bar.getAttribute('aria-label') || '';
      slot.append(sub);
    }
    bar.classList.add('toc-tabs');
    slot.append(bar);
  });

  // 2) Títulos siempre visibles (los que no están dentro de una pestaña oculta)
  let heads = [...body.querySelectorAll('h2')];
  if (heads.length < 2 && !bars.length) heads = [...body.querySelectorAll('h3[id]')];
  heads = heads.filter((h) => h.textContent.trim() && !h.closest('[role=tabpanel]'));
  if (heads.length >= 2 || (heads.length && bars.length)) {
    const list = document.createElement('ul');
    list.className = 'toc-list';
    const links = heads.map((h, i) => {
      if (!h.id) h.id = `sec-${i + 1}`;
      h.classList.add('scroll-mt-24');
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${h.id}`;
      a.textContent = h.textContent.trim();
      li.append(a); list.append(li);
      return a;
    });
    // Los enlaces de títulos van arriba, antes de las pestañas
    label.after(list);
    const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.removeAttribute('aria-current'));
      byId.get(e.target.id)?.setAttribute('aria-current', 'true');
    }), { rootMargin: '-15% 0px -75% 0px' });
    heads.forEach((h) => io.observe(h));
  }

  if (slot.querySelector('.toc-list, .toc-tabs')) {
    slot.hidden = false;
    document.getElementById('guide-wrap')?.classList.add('has-toc');
  }
}
