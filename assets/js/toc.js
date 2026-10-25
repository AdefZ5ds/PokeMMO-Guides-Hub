// Índice lateral de cada guía: se construye con los títulos reales de la guía.
// Escritorio: columna fija a la izquierda. Móvil: botones que se reparten en filas (sin scroll horizontal).
import { t } from './i18n.js';

export function buildToc() {
  const body = document.getElementById('guide-body');
  const slot = document.getElementById('guide-toc');
  if (!body || !slot) return;
  let heads = [...body.querySelectorAll('h2')];
  if (heads.length < 2) heads = [...body.querySelectorAll('h3[id]')];
  heads = heads.filter((h) => h.textContent.trim());
  if (heads.length < 2) return;

  const list = document.createElement('ul');
  list.className = 'toc-list';
  const links = heads.map((h, i) => {
    if (!h.id) h.id = `sec-${i + 1}`;
    h.classList.add('scroll-mt-24');
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${h.id}`;
    a.textContent = h.textContent.trim();
    li.append(a);
    list.append(li);
    return a;
  });
  const label = slot.querySelector('[data-toc-label]');
  const paintLabel = () => { if (label) label.textContent = t('guide.toc'); };
  paintLabel();
  window.addEventListener('langchange', paintLabel);
  slot.append(list);
  slot.hidden = false;
  document.getElementById('guide-wrap')?.classList.add('has-toc');

  // Resalta la sección visible
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.removeAttribute('aria-current'));
      byId.get(e.target.id)?.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-15% 0px -75% 0px' });
  heads.forEach((h) => io.observe(h));
}
