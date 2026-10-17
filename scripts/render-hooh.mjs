// Guía "Farmeo de Ho-Oh": HTML estático desde scripts/content/farmeo-hooh.json.
// Reutiliza assets/js/farmeo.js (pestañas) mediante #farmeo-guide + data-region.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, img, teamCard } from './lib/cards.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const d = JSON.parse(readFileSync(resolve(root, 'scripts/content/farmeo-hooh.json'), 'utf8'));
const cell = (key, [text, note]) => {
  const m = d.mons[key];
  return `<td class="min-w-0 p-1 text-center align-top sm:p-2"><div class="flex flex-col items-center">${img(m.name, m.dex)}<span class="text-xs font-semibold text-muted sm:hidden">${esc(m.name)}</span><span class="text-sm font-semibold">${esc(text)}</span>${note ? `<span class="text-xs text-muted">(${esc(note)})</span>` : ''}</div></td>`;
};

export function renderHooh() {
  const team = d.team.map((m) => teamCard(m, d.statLabels)).join('');
  return `<div id="farmeo-guide" data-tabs-label="Secciones">
    <div id="region-controls"></div>

    <section id="reg-resumen" data-region="resumen" aria-labelledby="reg-resumen-t" class="scroll-mt-24">
      <h3 id="reg-resumen-t" class="!mt-8 text-xl font-bold">Resumen</h3>
      <figure class="my-4"><img src="../img/farmeo/hooh-portada.webp" alt="Portada de la guía: Ho-Oh con Pelipper, Rotom (Horno) y Chandelure como equipo recomendado" width="1065" height="599" decoding="async" class="mx-auto w-full max-w-2xl rounded-xl border border-line" /></figure>
      <p>${esc(d.intro)}</p>
      <ul class="!pl-0 !list-none grid grid-cols-3 gap-3" aria-label="Cifras según el autor (sin verificar)">${d.stats.map((s) =>
        `<li class="rounded-xl border border-line bg-surface p-3 text-center"><span class="block text-2xl font-bold">${esc(s.value)}</span><span class="text-sm text-muted">${esc(s.label)}</span></li>`).join('')}</ul>
      <p class="text-sm text-muted">Cifras según el autor; no las verifiqué.</p>
      <h4 class="!mt-6 font-bold">Consumibles</h4>
      <ul class="!pl-0 !list-none grid gap-2 sm:grid-cols-2">${d.consumables.map((c) =>
        `<li class="rounded-xl border border-line bg-surface p-3"><label class="flex items-center gap-2"><input type="checkbox" class="h-5 w-5" /><span><strong>${esc(c.name)}</strong> · ${esc(c.min)}</span></label></li>`).join('')}</ul>
    </section>

    <section id="reg-equipo" data-region="equipo" aria-labelledby="reg-equipo-t" class="scroll-mt-24">
      <h3 id="reg-equipo-t" class="!mt-8 text-xl font-bold">Equipo</h3>
      <p class="text-sm text-muted">Un guion («—») en una estadística significa que no es relevante.</p>
      <ul class="!pl-0 !list-none grid gap-4 md:grid-cols-2">${team}</ul>
    </section>

    <section id="reg-turnos" data-region="turnos" aria-labelledby="reg-turnos-t" class="scroll-mt-24">
      <h3 id="reg-turnos-t" class="!mt-8 text-xl font-bold">Turnos</h3>
      <!-- En móvil cada turno es una tarjeta de 3 columnas (sin scroll horizontal); desde sm vuelve a ser tabla -->
      <table class="block w-full text-sm sm:table"><caption class="sr-only">Acciones de cada Pokémon en los 10 turnos</caption>
        <thead class="sr-only sm:not-sr-only sm:table-header-group"><tr><th scope="col" class="p-2 text-left">Turno</th>${Object.values(d.mons).map((m) => `<th scope="col" class="p-2 text-center">${esc(m.name)}</th>`).join('')}</tr></thead>
        <tbody class="block sm:table-row-group">${d.turns.map((t) => `<tr class="mb-3 grid grid-cols-3 rounded-xl border border-line bg-surface p-2 sm:mb-0 sm:table-row sm:rounded-none sm:border-0 sm:border-t sm:bg-transparent sm:p-0"><th scope="row" class="col-span-3 p-1 text-left text-base font-bold text-accent-text sm:table-cell sm:p-2">T${t.t}</th>${cell('P', t.P)}${cell('R', t.R)}${cell('C', t.C)}</tr>`).join('')}</tbody></table>
    </section>

    <aside class="callout mt-8" aria-labelledby="credits-title">
      <p id="credits-title" class="!mb-1 font-bold"><span aria-hidden="true">🙏</span> Créditos</p>
      <p class="!mb-1">Guía de ${esc(d.author)} (PokeMMO). Estrategia creada por ${esc(d.strategyBy)} (canal de YouTube).</p>
      <p class="!mb-0 text-muted">Última actualización del documento: ${esc(d.updated)}.</p>
    </aside>
    <div class="callout"><p class="!mb-2 font-bold"><span aria-hidden="true">⚠️</span> Datos por verificar</p><ul class="!mb-0">${d.verify.map((v) => `<li>${esc(v)}</li>`).join('')}</ul></div>
  </div>`;
}
