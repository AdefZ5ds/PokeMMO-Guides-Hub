// Progreso de la guía de rusheo: casillas por paso guardadas en este navegador (localStorage).
// Sin JS (o sin almacenamiento) la guía se lee igual; solo no se recuerda el progreso.
const KEY = 'pmmo-rusheo-v1';
const box = document.getElementById('rush-progress');
const checks = [...document.querySelectorAll('input[data-step]')];
let saved = new Set();
try { saved = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { /* sin almacenamiento */ }
const total = checks.length;

box.innerHTML = `<div class="flex flex-wrap items-center gap-3">
  <div class="min-w-[10rem] flex-1">
    <div role="progressbar" aria-label="Progreso de la ruta" aria-valuemin="0" aria-valuemax="${total}" class="h-3 overflow-hidden rounded bg-line"><div data-bar class="h-3 rounded bg-accent-strong" style="width:0%"></div></div>
    <p class="!m-0 mt-1 text-sm" role="status" aria-live="polite" data-label></p>
  </div>
  <button type="button" class="btn-ghost !py-1.5" data-reset>Reiniciar progreso</button>
</div>`;
const bar = box.querySelector('[data-bar]');
const label = box.querySelector('[data-label]');
const meter = box.querySelector('[role=progressbar]');

function paint() {
  const n = checks.filter((c) => c.checked).length;
  bar.style.width = `${Math.round((n / total) * 100)}%`;
  meter.setAttribute('aria-valuenow', n);
  label.textContent = `${n} de ${total} pasos (${Math.round((n / total) * 100)} %)`;
}
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(checks.filter((c) => c.checked).map((c) => c.dataset.step))); } catch { /* ignorar */ }
}
checks.forEach((c) => { c.checked = saved.has(c.dataset.step); });
document.addEventListener('change', (e) => { if (e.target.matches('input[data-step]')) { persist(); paint(); } });
box.querySelector('[data-reset]').addEventListener('click', () => {
  if (!confirm('¿Reiniciar todo el progreso de esta guía?')) return;
  checks.forEach((c) => { c.checked = false; });
  persist(); 
// Botón general de cada tramo: marca o desmarca todos sus pasos de una vez (se guarda como el resto).
const legBtns = [...document.querySelectorAll('[data-leg-toggle]')];
const legOf = (btn) => [...btn.closest('li').querySelectorAll('input[data-step]')];
function paintLegs() {
  legBtns.forEach((btn) => {
    const boxes = legOf(btn);
    const all = boxes.length > 0 && boxes.every((c) => c.checked);
    btn.setAttribute('aria-pressed', String(all));
    btn.querySelector('[data-leg-label]').textContent = all ? 'Desmarcar tramo' : 'Marcar tramo';
    btn.querySelector('[data-leg-icon]').textContent = all ? '⬜' : '☑️';
  });
}
legBtns.forEach((btn) => {
  btn.hidden = false;
  btn.addEventListener('click', () => {
    const boxes = legOf(btn);
    const all = boxes.every((c) => c.checked);
    boxes.forEach((c) => { c.checked = !all; });
    persist(); paint(); paintLegs();
  });
});
document.addEventListener('change', (e) => { if (e.target.matches('input[data-step]')) paintLegs(); });
box.querySelector('[data-reset]').addEventListener('click', () => setTimeout(paintLegs));
paint();
paintLegs();
});

// Botón general de cada tramo: marca o desmarca todos sus pasos de una vez (se guarda como el resto).
const legBtns = [...document.querySelectorAll('[data-leg-toggle]')];
const legOf = (btn) => [...btn.closest('li').querySelectorAll('input[data-step]')];
function paintLegs() {
  legBtns.forEach((btn) => {
    const boxes = legOf(btn);
    const all = boxes.length > 0 && boxes.every((c) => c.checked);
    btn.setAttribute('aria-pressed', String(all));
    btn.querySelector('[data-leg-label]').textContent = all ? 'Desmarcar tramo' : 'Marcar tramo';
    btn.querySelector('[data-leg-icon]').textContent = all ? '⬜' : '☑️';
  });
}
legBtns.forEach((btn) => {
  btn.hidden = false;
  btn.addEventListener('click', () => {
    const boxes = legOf(btn);
    const all = boxes.every((c) => c.checked);
    boxes.forEach((c) => { c.checked = !all; });
    persist(); paint(); paintLegs();
  });
});
document.addEventListener('change', (e) => { if (e.target.matches('input[data-step]')) paintLegs(); });
box.querySelector('[data-reset]').addEventListener('click', () => setTimeout(paintLegs));
paint();
paintLegs();

// ---------- Galería «Mundo Distorsión»: ancho fijo, alto variable, botones anterior/siguiente ----------
document.querySelectorAll('[data-dw]').forEach((box) => {
  const slides = [...box.querySelectorAll('[data-dw-slide]')];
  const toggle = document.querySelector(`[data-dw-toggle="${box.dataset.dw}"]`);
  if (!slides.length || !toggle) return;
  let cur = 0;
  const nav = document.createElement('div');
  nav.className = 'dw-nav';
  nav.innerHTML = `<button type="button" class="btn-ghost !px-3 !py-1.5" data-prev aria-label="Imagen anterior">◀ Anterior</button>
    <p class="!m-0 text-sm font-semibold" role="status" aria-live="polite" data-pos></p>
    <button type="button" class="btn-ghost !px-3 !py-1.5" data-next aria-label="Imagen siguiente">Siguiente ▶</button>`;
  box.append(nav);
  box.setAttribute('role', 'region');
  box.setAttribute('aria-label', 'Galería del Mundo Distorsión');
  const pos = nav.querySelector('[data-pos]');
  const show = (n) => {
    cur = Math.min(slides.length - 1, Math.max(0, n));
    slides.forEach((s, i) => { s.hidden = i !== cur; });
    pos.textContent = `${cur + 1} de ${slides.length}`;
    nav.querySelector('[data-prev]').disabled = cur === 0;
    nav.querySelector('[data-next]').disabled = cur === slides.length - 1;
    const next = slides[cur + 1]?.querySelector('img'); // precarga la siguiente
    if (next) next.loading = 'eager';
  };
  nav.addEventListener('click', (e) => {
    if (e.target.closest('[data-prev]')) show(cur - 1);
    if (e.target.closest('[data-next]')) show(cur + 1);
  });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(cur + 1);
    if (e.key === 'ArrowLeft') show(cur - 1);
  });
  // Se abre/cierra al pulsar «Mundo Distorsión» (empieza cerrada)
  const open = (on) => {
    box.hidden = !on;
    toggle.setAttribute('aria-expanded', String(on));
    toggle.querySelector('[data-dw-chevron]').textContent = on ? '▴' : '▾';
    if (on) show(cur);
  };
  toggle.setAttribute('aria-controls', box.dataset.dw);
  box.id = box.dataset.dw;
  toggle.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); open(box.hidden); });
  open(false);
});
