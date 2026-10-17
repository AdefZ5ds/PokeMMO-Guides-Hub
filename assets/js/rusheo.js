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
  persist(); paint();
});
paint();
