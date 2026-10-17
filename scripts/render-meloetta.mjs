// Guía "Raid de Meloetta" (4 jugadores): HTML estático desde scripts/content/raid-meloetta.json.
// assets/js/raid.js añade pestañas por jugador y el "modo combate" turno a turno.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, img, teamCard } from './lib/cards.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(resolve(root, 'scripts/content/raid-meloetta.json'), 'utf8'));
const move = (a) => `${esc(a.move)}${a.target ? ` <span class="text-xs text-muted">(${esc(a.target)})</span>` : ''}`;

const note = (n) => typeof n === 'string'
  ? `<li>${esc(n)}</li>`
  : `<li><span class="badge-gold">Texto incompleto en el PDF</span> ${esc(n.text)}</li>`;

function myTurns(pj) {
  return `<details class="mt-4 rounded-xl border border-line bg-surface p-3 open:border-accent">
    <summary class="cursor-pointer font-semibold">Mis acciones por turno (PJ${pj})</summary>
    <ol class="!mb-0 mt-2 !list-none !pl-0 space-y-1">${data.turns.map((t) => {
      const a = t.actions[pj - 1];
      return `<li class="flex items-center gap-2"><span class="w-9 shrink-0 font-bold text-accent-text">T${t.t}</span>${img(a.mon, a.dex)}<span><strong>${esc(a.mon)}</strong>: ${move(a)}</span></li>`;
    }).join('')}</ol></details>`;
}

function player(p) {
  const alt = p.alt
    ? `<h4 class="!mb-2 !mt-6 font-semibold">Reemplazo de Arcanine</h4><p class="text-sm text-muted">${esc(p.altNote)}</p><ul class="!pl-0 !list-none grid gap-4 md:grid-cols-2">${teamCard(p.alt, data.statLabels)}</ul>`
    : '';
  return `<section id="pj-${p.n}" data-pj="${p.n}" aria-labelledby="pj-${p.n}-title" class="scroll-mt-24">
    <h3 id="pj-${p.n}-title" class="!mt-8 text-xl font-bold">Jugador ${p.n} (PJ${p.n})</h3>
    <ul class="!pl-0 !list-none grid gap-4 md:grid-cols-2">${p.team.map((m) => teamCard(m, data.statLabels)).join('')}</ul>
    ${alt}
    <div class="callout"><p class="!mb-2 font-bold"><span aria-hidden="true">📌</span> Datos de importancia · PJ${p.n}</p><ul class="!mb-0">${p.notes.map(note).join('')}</ul></div>
    ${myTurns(p.n)}
  </section>`;
}

function turn(t) {
  const bar = t.hp == null
    ? '<span class="text-sm text-muted">PS de Meloetta: el PDF no indica el valor</span>'
    : `<span class="text-sm font-semibold">Meloetta ${t.hp}% PS</span><span role="img" aria-label="Meloetta con ${t.hp}% de PS" class="block h-2 w-28 rounded bg-line"><span class="block h-2 rounded bg-accent-strong" style="width:${t.hp}%"></span></span>`;
  const sprite = 'h-14 w-14 group-data-[mode=combat]:h-24 group-data-[mode=combat]:w-24';
  return `<li data-turn="${t.t}" class="rounded-xl border border-line bg-surface p-3">
    <div class="flex flex-wrap items-center justify-between gap-2"><h3 class="!m-0 text-lg font-bold">Turno ${t.t}</h3><div class="flex items-center gap-2">${bar}</div></div>
    <ul class="!pl-0 !list-none mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">${t.actions.map((a) =>
      `<li class="flex flex-col items-center rounded-lg bg-bg p-2 text-center"><span class="text-xs font-bold text-accent-text">PJ${a.pj}</span><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${a.dex}.png" alt="${esc(a.mon)}" width="96" height="96" loading="lazy" decoding="async" class="${sprite} [image-rendering:pixelated]" /><span class="text-xs text-muted">${esc(a.mon)}</span><span class="text-sm font-semibold">${move(a)}</span></li>`).join('')}</ul>
    ${t.alert ? `<p class="callout !mb-0 !mt-3 !p-3 ${t.kind === 'reset' ? '!border-red-500 !bg-red-500/10' : ''}" role="note"><strong>${t.kind === 'reset' ? '⚠️ Al terminar el turno:' : 'ℹ️ Nota:'}</strong> ${esc(t.alert)}</p>` : ''}
  </li>`;
}

export function renderMeloetta() {
  const sp = data.speed;
  return `<div id="raid-guide">
    <p>Estrategia de 4 jugadores para derrotar la raid de Meloetta: elige tu jugador para ver tu equipo y tus acciones, y usa los turnos para seguir la raid.</p>
    <aside class="callout" aria-labelledby="credits-title">
      <p id="credits-title" class="!mb-1 font-bold"><span aria-hidden="true">🙏</span> Créditos</p>
      <p class="!mb-1">${esc(data.credits)}</p>
      <p class="!mb-0 text-muted">Última actualización del documento: ${esc(data.updated)}.</p>
    </aside>
    <p><a class="btn-ghost" href="${esc(data.video)}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">▶️</span> Guía en video (YouTube)<span class="sr-only"> (nueva pestaña)</span></a></p>

    <h2>Equipos por jugador</h2>
    <p class="text-sm text-muted">${esc(data.legend)}</p>
    <div id="pj-controls"></div>
    ${data.players.map(player).join('\n')}

    <h2 id="turnos">Turnos</h2>
    <div id="turn-controls"></div>
    <div id="turns" class="group" data-mode="list"><ol class="!pl-0 !list-none space-y-3">${data.turns.map(turn).join('')}</ol></div>

    <h2>Orden de velocidad</h2>
    <p>${esc(sp.intro)}</p>
    <ul class="!pl-0 !list-none grid gap-2 sm:grid-cols-2">${sp.items.map((i) =>
      `<li class="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">${img(i.mon, i.dex)}<span><strong>${esc(i.mon)} · PJ${i.pj}</strong><br>Velocidad: <strong>${esc(i.value)}</strong>${i.note ? `<br><span class="text-sm text-muted">${esc(i.note)}</span>` : ''}</span></li>`).join('')}</ul>
    <p class="mt-3 text-sm text-muted">Reglas de velocidad entre Slowbros (de las notas por jugador): el Slowbro del PJ2 es el más lento de los 4; el del PJ3 es más rápido que el del PJ2 y más lento que el del PJ4; el del PJ1 es más rápido que el del PJ2; Reuniclus (PJ4) es más lento que todos los Slowbros.</p>

    <h2>Más datos de importancia</h2>
    <p>${esc(data.damage.intro)}</p>
    <div class="overflow-x-auto"><table class="w-full text-sm"><caption class="sr-only">Daño estimado del Slowbro según el aumento de Meloetta y los IVs</caption>
      <thead><tr><th scope="col" class="p-2 text-left">Caso</th><th scope="col" class="p-2 text-left">Salmuera</th><th scope="col" class="p-2 text-left">Psíquico</th></tr></thead>
      <tbody>${data.damage.rows.map((r) => `<tr class="border-t border-line"><th scope="row" class="p-2 text-left font-semibold">${esc(r[0])}</th><td class="p-2 tabular-nums">${esc(r[1])}</td><td class="p-2 tabular-nums">${esc(r[2])}</td></tr>`).join('')}</tbody></table></div>
    <p class="text-sm text-muted">Valores leídos de una captura de una calculadora de daño dentro del PDF; el PDF no explica qué representa exactamente cada porcentaje.</p>

    <div class="callout">
      <p class="!mb-2 font-bold"><span aria-hidden="true">⚠️</span> Datos por verificar</p>
      <ul class="!mb-0">
        <li>Partes del PDF están cortadas o dentro de imágenes (marcadas «Texto incompleto en el PDF»). No se completaron.</li>
        <li>Slowbro PJ1: el PDF superpone «Despiste» y «Ritmo Propio»; además, su nota habla de una Velocidad «5» mientras su IV de Velocidad indica 10.</li>
        <li>Orden de velocidad: el texto del PDF rotula a PJ2 y PJ4 como «Crawdaunt», pero los sprites son Escavalier; aquí se muestran como Escavalier.</li>
        <li>«Re o» del texto del PDF se leyó como «Reflejo» (el movimiento aparece así en la tabla de turnos); se corrigió ortografía menor (Psíquico, Plácida, Metálico…).</li>
        <li>La fila del turno 11 no indica el % de PS de Meloetta.</li>
        <li>No se reproduce el enlace «PokePaste» del PDF (aparece como imagen). No se verificó el contenido del video.</li>
      </ul>
    </div>
  </div>`;
}
