// Mejora progresiva de la guía de farmeo de gimnasios: pestañas por región.
// Sin JS se ven todas las regiones seguidas. Se recuerda solo vía el hash (#teselia…).
const root = document.getElementById('farmeo-guide');
const sections = [...root.querySelectorAll('[data-region]')];
const bar = document.createElement('div');
bar.setAttribute('role', 'tablist');
bar.setAttribute('aria-label', root.dataset.tabsLabel || 'Región');
bar.className = 'flex flex-wrap gap-2';
const tabs = sections.map((s) => {
  const b = document.createElement('button');
  b.type = 'button'; b.role = 'tab'; b.className = 'chip';
  b.id = `tab-${s.dataset.region}`;
  b.dataset.id = s.dataset.region;
  b.textContent = s.querySelector('h3').textContent;
  b.setAttribute('aria-controls', s.id);
  s.setAttribute('role', 'tabpanel');
  s.setAttribute('aria-labelledby', b.id);
  bar.append(b);
  return b;
});
function show(id, focus = false) {
  tabs.forEach((t) => {
    const on = t.dataset.id === id;
    t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
    if (on && focus) t.focus();
  });
  sections.forEach((s) => { s.hidden = s.dataset.region !== id; });
  history.replaceState(null, '', `#${id}`);
}
bar.addEventListener('click', (e) => { const t = e.target.closest('[role=tab]'); if (t) show(t.dataset.id); });
bar.addEventListener('keydown', (e) => {
  const i = tabs.indexOf(document.activeElement);
  const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
  if (i < 0 || next === undefined) return;
  e.preventDefault();
  show(tabs[(next + tabs.length) % tabs.length].dataset.id, true);
});
document.getElementById('region-controls').append(bar);
const ids = sections.map((s) => s.dataset.region);
const fromHash = () => (ids.includes(location.hash.slice(1)) ? location.hash.slice(1) : null);
show(fromHash() ?? ids[0]);
window.addEventListener('hashchange', () => { const h = fromHash(); if (h) show(h); });
