// Renderiza (HTML estático) la guía "Cómo derrotar a RED" desde scripts/content/derrotar-red.json.
// Todo el contenido es visible sin JS; assets/js/red.js añade pestañas y enlaces internos.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { SPRITE, esc, img, chips, teamCard as teamCardLib } from './lib/cards.mjs';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(resolve(root, 'scripts/content/derrotar-red.json'), 'utf8'));
const rivalImgs = (r) => `<span class="flex flex-wrap items-center gap-1">${r.map(([n, d]) => `<span class="flex flex-col items-center">${img(n, d)}<span class="text-xs text-muted">${esc(n)}</span></span>`).join('')}</span>`;

function stepsList(steps) {
  return `<ol class="!mb-0 !mt-2 list-decimal space-y-1 !pl-6">${steps.map((s) =>
    typeof s === 'string' ? `<li>${chips(s, data.team)}</li>` : `<li><a href="#${s.ref}" data-ref="${s.ref}">${esc(s.text)}</a></li>`
  ).join('')}</ol>`;
}

function entry(e, type, genN) {
  const id = e.id ? ` id="${e.id}"` : '';
  if (type === 'steps') {
    return `<li><details${id} class="rounded-xl border border-line bg-surface p-3 open:border-accent" data-gen-entry>
      <summary class="flex cursor-pointer items-center gap-3 rounded-lg"><span class="sr-only">Líder rival:</span>${rivalImgs(e.rivals)}</summary>
      ${stepsList(e.steps)}</details></li>`;
  }
  if (type === 'moves') {
    return `<li class="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">${rivalImgs(e.rivals)}<span class="font-semibold">${chips(e.steps[0], data.team)}</span></li>`;
  }
  return `<li class="rounded-xl border border-line bg-surface p-3"><div class="flex flex-wrap items-center gap-2">${rivalImgs(e.rivals)}</div>${e.notes ? `<p class="!mb-0 !mt-2 text-sm">${Object.entries(e.notes).map(([n, t]) => `Contra ${esc(n)}: ${esc(t)}.`).join(' ')}</p>` : ''}</li>`;
}

function generation(g) {
  return `<section id="gen-${g.n}" data-gen="${g.n}" aria-labelledby="gen-${g.n}-title" class="scroll-mt-24">
    <h3 id="gen-${g.n}-title" class="!mt-8 text-xl font-bold">Generación ${g.n}</h3>
    ${g.sections.map((s) => `<h4 class="!mt-5 mb-2 font-semibold text-accent-text">${esc(s.title)}</h4>
    <ul class="!mb-0 grid gap-2 !pl-0 !list-none ${s.type === 'steps' ? '' : 'sm:grid-cols-2'}">${s.entries.map((e) => entry(e, s.type, g.n)).join('')}</ul>`).join('\n')}
  </section>`;
}

export function renderRed(guide) {
  return `<div id="red-guide"><div id="farmeo-guide" data-tabs-label="Secciones">
    <div id="region-controls"></div>

    <section id="reg-resumen" data-region="resumen" aria-labelledby="reg-resumen-t" class="scroll-mt-24">
      <h3 id="reg-resumen-t" class="!mt-8 text-xl font-bold">Resumen</h3>
      <p>Equipo y respuestas para vencer a RED en todas sus variantes: identifica la generación del rival, mira su Pokémon líder y sigue los pasos.</p>
      <aside class="callout" aria-labelledby="credits-title">
        <p id="credits-title" class="!mb-1 font-bold"><span aria-hidden="true">🙏</span> Créditos</p>
        <p class="!mb-1">${esc(data.credits)}</p>
        <p class="!mb-0 text-muted">Última actualización del documento: ${esc(data.updated)}. <a href="../${data.pdf}" target="_blank" rel="noopener noreferrer">Ver PDF original<span class="sr-only"> (nueva pestaña)</span></a></p>
      </aside>
      <h4 class="!mt-6 font-bold">Antes de empezar</h4>
      <ul>${data.considerations.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
    </section>

    <section id="reg-equipo" data-region="equipo" aria-labelledby="reg-equipo-t" class="scroll-mt-24">
      <h3 id="reg-equipo-t" class="!mt-8 text-xl font-bold">Equipo</h3>
      <p class="text-sm text-muted">${esc(data.legend)}</p>
      <ul class="!pl-0 !list-none grid gap-4 md:grid-cols-2">${data.team.map((m) => teamCardLib(m, data.statLabels)).join('')}</ul>
    </section>

    <section id="reg-estrategia" data-region="estrategia" aria-labelledby="reg-estrategia-t" class="scroll-mt-24">
      <h3 id="reg-estrategia-t" class="!mt-8 text-xl font-bold">Estrategia por generación</h3>
      <!-- Galería interactiva (la construye assets/js/gallery.js). Sin JS se ve la lista de abajo. -->
      <div id="gallery-root"></div>
      <div id="list-view">
      ${data.generations.map(generation).join('\n')}
      </div>
      <script type="application/json" id="gallery-data">${JSON.stringify({ team: data.team.map(({ name, dex }) => ({ name, dex })), generations: data.generations }).replace(/</g, '\\u003c')}</script>
    </section>
  </div>

    <div class="callout">
      <p class="!mb-2 font-bold"><span aria-hidden="true">⚠️</span> Datos por verificar</p>
      <ul class="!mb-0">
        <li>Los nombres de los Pokémon rivales se identificaron a partir de los sprites del PDF, que no los rotula.</li>
        <li>No se reproduce el enlace «PokePaste» del PDF (aparece como imagen).</li>
        <li>Se unificó la ortografía de algunos movimientos (p. ej. «Intecambio» → «Intercambio»; «Teleport» → «Teletransporte»; «Ultra Puño» → «Ultrapuño»).</li>
        <li>Los EVs de Honchkrow y los IVs de Breloom: ver las notas en su tarjeta.</li>
      </ul>
    </div>
    <p class="text-sm text-muted">Palabras finales del autor de la traducción: la estrategia original no le pertenece; su objetivo es acercarla a la comunidad hispanohablante. Todos los créditos corresponden a sus creadores originales.</p>
  </div>`;
}
