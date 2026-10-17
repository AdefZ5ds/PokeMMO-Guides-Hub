// Mejora progresiva de la guía de la raid de Meloetta:
//  - pestañas por jugador (PJ1–PJ4), sin recordar la elección;
//  - bajo el PokePaste de cada jugador: pestañas «Mis turnos», «Modo combate» (un turno a la vez) y «Lista».
// Sin JS se ve todo el contenido en lista.
const root = document.getElementById('raid-guide');

// ---------- Pestañas por jugador ----------
const sections = [...root.querySelectorAll('[data-pj]')];
const pjBar = document.createElement('div');
pjBar.setAttribute('role', 'tablist');
pjBar.setAttribute('aria-label', 'Jugador');
pjBar.className = 'flex flex-wrap gap-2';
const pjTabs = sections.map((s) => {
  const b = document.createElement('button');
  b.type = 'button'; b.role = 'tab'; b.className = 'chip';
  b.dataset.n = s.dataset.pj; b.textContent = `PJ${s.dataset.pj}`;
  b.setAttribute('aria-controls', s.id);
  pjBar.append(b);
  return b;
});
function showPj(n, focus = false) {
  pjTabs.forEach((t) => {
    const on = t.dataset.n === String(n);
    t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
    if (on && focus) t.focus();
  });
  sections.forEach((s) => { s.hidden = s.dataset.pj !== String(n); });
  history.replaceState(null, '', `#pj${n}`);
}
pjBar.addEventListener('click', (e) => { const t = e.target.closest('[role=tab]'); if (t) showPj(t.dataset.n); });
pjBar.addEventListener('keydown', (e) => {
  const i = pjTabs.indexOf(document.activeElement);
  const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: pjTabs.length - 1 }[e.key];
  if (i < 0 || next === undefined) return;
  e.preventDefault();
  showPj(pjTabs[(next + pjTabs.length) % pjTabs.length].dataset.n, true);
});
document.getElementById('pj-controls').append(pjBar);
const pjHash = location.hash.match(/^#pj([1-4])$/);
showPj(pjHash ? pjHash[1] : '1');
history.replaceState(null, '', location.pathname + (pjHash ? location.hash : ''));

// ---------- Pestañas bajo el PokePaste de cada jugador: Mis turnos / Modo combate / Lista ----------
for (const sec of sections) {
  const n = sec.dataset.pj;
  const host = sec.querySelector('[data-ptabs]');
  const panels = [...host.querySelectorAll('[data-ptab]')];
  const heads = panels.map((p) => p.querySelector('h4'));
  heads.forEach((h) => h.classList.add('sr-only')); // con pestañas, la pestaña ya nombra el panel

  const bar = document.createElement('div');
  bar.setAttribute('role', 'tablist');
  bar.setAttribute('aria-label', `Turnos del PJ${n}`);
  bar.className = 'flex flex-wrap gap-2';
  const tabs = panels.map((p) => {
    const b = document.createElement('button');
    b.type = 'button'; b.role = 'tab'; b.className = 'chip';
    b.id = `tab-${p.id}`; b.dataset.key = p.dataset.ptab; b.textContent = p.dataset.label;
    b.setAttribute('aria-controls', p.id);
    p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', b.id);
    bar.append(b);
    return b;
  });
  host.querySelector('[data-ptab-controls]').append(bar);

  // Modo combate: un turno a la vez
  const combat = panels.find((p) => p.dataset.ptab === 'combat');
  const turnEls = [...combat.querySelectorAll('[data-turn]')];
  const pos = combat.querySelector('[data-pos]');
  let cur = 0;
  const paintCombat = () => {
    turnEls.forEach((el, i) => { el.hidden = i !== cur; });
    pos.textContent = `Turno ${cur + 1} de ${turnEls.length}`;
    combat.querySelector('[data-prev]').disabled = cur === 0;
    combat.querySelector('[data-next]').disabled = cur === turnEls.length - 1;
  };
  const step = (d) => { cur = Math.min(turnEls.length - 1, Math.max(0, cur + d)); paintCombat(); };
  combat.addEventListener('click', (e) => {
    if (e.target.closest('[data-prev]')) step(-1);
    if (e.target.closest('[data-next]')) step(1);
  });
  document.addEventListener('keydown', (e) => {
    if (combat.hidden || sec.hidden || e.target.closest('input, select, textarea, [role=tab]')) return;
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });

  const showTab = (key, focus = false) => {
    tabs.forEach((t) => {
      const on = t.dataset.key === key;
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panels.forEach((p) => { p.hidden = p.dataset.ptab !== key; });
  };
  bar.addEventListener('click', (e) => { const t = e.target.closest('[role=tab]'); if (t) showTab(t.dataset.key); });
  bar.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (i < 0 || next === undefined) return;
    e.preventDefault();
    showTab(tabs[(next + tabs.length) % tabs.length].dataset.key, true);
  });
  paintCombat();
  showTab('mine');
}
