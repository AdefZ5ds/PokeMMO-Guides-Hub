// Mejora progresiva de la guía de la raid de Meloetta:
//  - pestañas por jugador (PJ1–PJ4), sin recordar la elección;
//  - "Modo combate": un turno a la vez con Anterior/Siguiente y flechas.
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

// ---------- Modo combate ----------
const wrap = document.getElementById('turns');
const turnEls = [...wrap.querySelectorAll('[data-turn]')];
const ctrl = document.getElementById('turn-controls');
let mode = 'list';
let cur = 0;

ctrl.innerHTML = `
  <div class="flex flex-wrap items-center gap-2">
    <div role="group" aria-label="Tipo de vista" class="flex gap-2">
      <button type="button" class="chip" data-mode="list">Lista</button>
      <button type="button" class="chip" data-mode="combat">Modo combate</button>
    </div>
    <div data-nav hidden class="flex flex-wrap items-center gap-2">
      <button type="button" class="btn-ghost !py-1.5" data-prev>← Anterior</button>
      <span class="text-sm" role="status" aria-live="polite" data-pos></span>
      <button type="button" class="btn-primary !py-1.5" data-next>Siguiente →</button>
    </div>
  </div>`;
const nav = ctrl.querySelector('[data-nav]');
const pos = ctrl.querySelector('[data-pos]');

function render() {
  wrap.dataset.mode = mode;
  ctrl.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  nav.hidden = mode !== 'combat';
  turnEls.forEach((el, i) => { el.hidden = mode === 'combat' && i !== cur; });
  pos.textContent = `Turno ${cur + 1} de ${turnEls.length}`;
  ctrl.querySelector('[data-prev]').disabled = cur === 0;
  ctrl.querySelector('[data-next]').disabled = cur === turnEls.length - 1;
}
const go = (d) => { cur = Math.min(turnEls.length - 1, Math.max(0, cur + d)); render(); };
ctrl.addEventListener('click', (e) => {
  const m = e.target.closest('[data-mode]');
  if (m) { mode = m.dataset.mode; render(); return; }
  if (e.target.closest('[data-prev]')) go(-1);
  if (e.target.closest('[data-next]')) go(1);
});
// Flechas del teclado en modo combate (sin interferir con las pestañas ni con campos de texto)
document.addEventListener('keydown', (e) => {
  if (mode !== 'combat' || e.target.closest('input, select, textarea, [role=tab]')) return;
  if (e.key === 'ArrowRight') go(1);
  if (e.key === 'ArrowLeft') go(-1);
});
render();
