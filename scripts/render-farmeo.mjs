// Guía "Farmeo de Gimnasios": HTML estático desde scripts/content/farmeo-gimnasios.json.
// assets/js/farmeo.js añade las pestañas por región (sin JS se ven todas las regiones seguidas).
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, img, teamCard, consumables } from './lib/cards.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(resolve(root, 'scripts/content/farmeo-gimnasios.json'), 'utf8'));
const TRAINER = 'https://play.pokemonshowdown.com/sprites/trainers/';
const TYPE_EMOJI = { Bicho: '🐛', Fuego: '🔥', Planta: '🌿', Agua: '💧', Volador: '🕊️', Eléctrico: '⚡', Hielo: '❄️', Dragón: '🐉', Tierra: '⛰️', Acero: '⚙️', Roca: '🪨', Lucha: '🥊', Normal: '⚪' };

// Color de cada movimiento = color del tipo de su Pokémon (campo `type` de data.mons). Para otro tipo, añade su letra aquí (colores en styles.css: .hl-*).
const TYPE_HL = { Hielo: 'c', Agua: 'b', Normal: 'n', Fuego: 'o', Veneno: 'p', Planta: 'g', Eléctrico: 'y', Psíquico: 'm', Lucha: 'r', Volador: 'k' };

// {r:texto} → texto coloreado (el color es un refuerzo; el texto ya nombra al Pokémon/movimiento)
const hl = (s) => esc(s).replace(/\{([a-z]):([^}]+)\}/g, (_, c, t) => `<span class="hl hl-${c}">${t}</span>`);

const list = (items, level = 0) => `<ul class="${level ? '!mt-1 ' : ''}!mb-0 space-y-1">${items.map((i) =>
  typeof i === 'string' ? `<li>${hl(i)}</li>` : `<li>${hl(i.t)}${i.sub ? list(i.sub, level + 1) : ''}</li>`).join('')}</ul>`;

function gym(g, n) {
  const emoji = TYPE_EMOJI[g.type] ?? '🏟️';
  const [a, b] = g.duo.map(([k, move]) => ({ ...data.mons[k], move }));
  const duoCell = (m) => `<li class="flex flex-col items-center text-center">${img(m.name, m.dex, 80)}<span class="text-xs text-muted">${esc(m.name)}</span><span class="text-sm hl hl-${TYPE_HL[m.type] ?? 'n'}">${esc(m.move)}</span></li>`;
  return `<li class="card !items-stretch !gap-3">
    <div class="flex flex-col items-center gap-1 text-center">
      <img src="${TRAINER}${g.leader}.png" alt="Líder del gimnasio de ${esc(g.city)} (${esc(g.type)})" width="96" height="96" loading="lazy" decoding="async"
           class="h-24 w-24 shrink-0 object-contain [image-rendering:pixelated]"
           onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${emoji}',className:'text-5xl',role:'img',ariaLabel:'${esc(g.type)}'}))" />
      <h5 class="!m-0 text-lg font-bold"><span class="text-accent-text">${n}.</span> ${esc(g.city)}</h5>
      <p class="!m-0"><span class="badge-muted"><span aria-hidden="true">${emoji}</span> Gimnasio ${esc(g.type)}</span></p>
    </div>
    <ul class="!pl-0 !list-none flex items-end justify-center gap-3" aria-label="Dúo recomendado">${duoCell(a)}<li aria-hidden="true" class="pb-8 text-2xl font-bold">+</li>${duoCell(b)}</ul>
    ${g.notes ? `<div class="text-sm">${list(g.notes)}</div>` : ''}
    ${g.check ? `<p class="callout !m-0 !p-3" role="note"><span aria-hidden="true">⚠️</span> ${esc(g.check)}</p>` : ''}
  </li>`;
}

const reset = () => `<li class="md:col-span-full rounded-xl border-2 border-red-500 bg-red-500/10 p-3 text-center font-bold" role="note"><span aria-hidden="true">❤️</span> RESET en el CP (Centro Pokémon)</li>`;

function region(r, next) {
  let n = 0;
  return `<section id="reg-${r.id}" data-sub="${r.id}" aria-labelledby="reg-${r.id}-t" class="scroll-mt-24">
    <h4 id="reg-${r.id}-t" class="!mt-6 text-xl font-bold">${esc(r.name)}</h4>
    <figure class="my-4"><img src="../img/farmeo/${r.map}" alt="Mapa de ${esc(r.name)} del PDF con la ruta numerada del 1 al ${r.id === 'teselia' ? 7 : r.id === 'sinnoh' ? 5 : r.id === 'johto' ? 5 : r.id === 'hoenn' ? 6 : 2}" loading="lazy" decoding="async" class="mx-auto w-full max-w-2xl rounded-xl border border-line" />
      <figcaption class="mt-1 text-center text-sm text-muted">Mapa tomado del PDF. Los números del mapa no están explicados en el PDF.</figcaption></figure>
    <ol class="!pl-0 !list-none grid gap-4 md:grid-cols-2">${r.gyms.map((g) => (g.reset ? reset() : gym(g, ++n))).join('')}</ol>
    ${next ? `<p class="mt-6 text-center"><a href="#${next.id}" data-next-sub class="btn-primary !px-6 !py-3 !text-base">Ir a ${esc(next.name)} <span aria-hidden="true">→</span></a></p>` : ''}
  </section>`;
}

export function renderFarmeo() {
  const team = data.team.map((m) => teamCard({ ...m, ability: m.ability === '-' ? 'Habilidad no relevante' : m.ability }, data.statLabels)).join('');
  return `<div id="farmeo-guide" data-tabs-label="Secciones">
    <div id="region-controls"></div>

    <section id="reg-resumen" data-region="resumen" aria-labelledby="reg-resumen-t" class="scroll-mt-24">
      <h3 id="reg-resumen-t" class="!mt-8 text-xl font-bold">Resumen</h3>
      <p>Ruta de farmeo de gimnasios por región y qué hacer en cada situación, con un equipo fijo de cinco Pokémon.</p>
      <aside class="callout" aria-labelledby="credits-title">
        <p id="credits-title" class="!mb-1 font-bold"><span aria-hidden="true">🙏</span> Créditos</p>
        <p class="!mb-1">Guía de farmeo de gimnasios por ${esc(data.author)} (PokeMMO).</p>
        <p class="!mb-0 text-muted">Última actualización del documento: ${esc(data.updated)}.<br>Nick: xXZarcAndXx</p>
      </aside>

      <h4 class="!mt-6 font-bold">Consumibles</h4>
      ${consumables(data.consumables)}

      <h4 class="!mt-6 font-bold">Equipo (PokePaste)</h4>
      <p class="text-sm text-muted">Un guion («—») en una estadística significa que no es relevante y puedes asignarle cualquier valor.</p>
      <ul class="!pl-0 !list-none grid gap-4 md:grid-cols-2">${team}
        <li class="card !gap-2"><h5 class="!m-0 text-lg font-bold"><span aria-hidden="true">❔</span> Sexto espacio libre</h5><p class="!m-0 text-sm">${esc(data.freeSlot)}</p></li>
      </ul>
    </section>

    <section id="reg-rutas" data-region="rutas" data-tab="Rutas por región" aria-labelledby="reg-rutas-t" class="scroll-mt-24">
      <h3 id="reg-rutas-t" class="!mt-8 text-xl font-bold">Rutas por región</h3>
      <div id="sub-controls" class="scroll-mt-20"></div>
      ${data.regions.map((r, i) => region(r, data.regions[i + 1])).join('\n')}
    </section>

    <div class="callout">
      
  </div>`;
}
