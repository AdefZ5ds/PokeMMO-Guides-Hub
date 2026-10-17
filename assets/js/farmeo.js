// Pestañas reutilizables (Ho-Oh, Gimnasios, Rusheo, RED y guías con 2+ secciones).
//  - Nivel 1: secciones [data-region] → pestañas en #region-controls (etiqueta: data-tab o su primer h3).
//  - Nivel 2 (opcional): secciones [data-sub] dentro de una de ellas → subpestañas en #sub-controls.
//    Los enlaces <a data-next-sub href="#id"> (p. ej. «Ir a Johto →») cambian a la siguiente subpestaña.
// Sin JS se ven todas las secciones seguidas. Solo se recuerda vía el hash (#teselia…).
const root = document.getElementById('farmeo-guide');

function tabset(sections, controls, label, onShow) {
  const bar = document.createElement('div');
  bar.setAttribute('role', 'tablist');
  bar.setAttribute('aria-label', label);
  bar.className = 'flex flex-wrap gap-2';
  const key = (s) => s.dataset.region || s.dataset.sub;
  const tabs = sections.map((s) => {
    const b = document.createElement('button');
    b.type = 'button'; b.role = 'tab'; b.className = 'chip';
    b.id = `tab-${key(s)}`;
    b.dataset.id = key(s);
    b.textContent = s.dataset.tab || s.querySelector('h3, h4').textContent;
    b.setAttribute('aria-controls', s.id);
    s.setAttribute('role', 'tabpanel');
    s.setAttribute('aria-labelledby', b.id);
    bar.append(b);
    return b;
  });
  const ids = sections.map(key);
  function show(id, focus = false) {
    tabs.forEach((t) => {
      const on = t.dataset.id === id;
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    sections.forEach((s) => { s.hidden = key(s) !== id; });
    onShow?.(id);
  }
  bar.addEventListener('click', (e) => { const t = e.target.closest('[role=tab]'); if (t) show(t.dataset.id); });
  bar.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (i < 0 || next === undefined) return;
    e.preventDefault();
    show(tabs[(next + tabs.length) % tabs.length].dataset.id, true);
  });
  controls.append(bar);
  return { show, ids };
}

const regions = [...root.querySelectorAll('[data-region]')];
const subs = [...root.querySelectorAll('[data-sub]')];
const setHash = (id) => history.replaceState(null, '', `#${id}`);

let sub = null;
if (subs.length) {
  sub = tabset(subs, document.getElementById('sub-controls'), 'Región', setHash);
}
const top = tabset(regions, document.getElementById('region-controls'), root.dataset.tabsLabel || 'Secciones', (id) => {
  if (sub && subs.some((s) => s.closest('[data-region]')?.dataset.region === id)) {
    const current = subs.find((s) => !s.hidden) ?? subs[0];
    sub.show(current.dataset.sub);
  } else setHash(id);
});

const fromHash = () => {
  const h = location.hash.slice(1);
  if (top.ids.includes(h)) return () => top.show(h);
  if (sub?.ids.includes(h)) return () => { top.show(subs.find((s) => s.dataset.sub === h).closest('[data-region]').dataset.region); sub.show(h); };
  return null;
};
(fromHash() ?? (() => top.show(top.ids[0])))();
window.addEventListener('hashchange', () => { fromHash()?.(); });

// «Ir a <región> →»: cambia de subpestaña y lleva al inicio de la guía
root.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-next-sub]');
  if (!a || !sub) return;
  e.preventDefault();
  sub.show(a.getAttribute('href').slice(1));
  document.getElementById('sub-controls').scrollIntoView({ block: 'start' });
});
