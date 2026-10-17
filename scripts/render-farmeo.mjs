// Guía "Farmeo de Gimnasios": HTML estático desde scripts/content/farmeo-gimnasios.json.
// assets/js/farmeo.js añade las pestañas por región (sin JS se ven todas las regiones seguidas).
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, img, teamCard } from './lib/cards.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(resolve(root, 'scripts/content/farmeo-gimnasios.json'), 'utf8'));
const TRAINER = 'https://play.pokemonshowdown.com/sprites/trainers/';
const TYPE_EMOJI = { Bicho: '🐛', Fuego: '🔥', Planta: '🌿', Agua: '💧', Volador: '🕊️', Eléctrico: '⚡', Hielo: '❄️', Dragón: '🐉', Tierra: '⛰️', Acero: '⚙️', Roca: '🪨', Lucha: '🥊', Normal: '⚪' };

// {r:texto} → texto coloreado (el color es un refuerzo; el texto ya nombra al Pokémon/movimiento)
const hl = (s) => esc(s).replace(/\{([a-z]):([^}]+)\}/g, (_, c, t) => `<span class="hl hl-${c}">${t}</span>`);

const list = (items, level = 0) => `<ul class="${level ? '!mt-1 ' : ''}!mb-0 space-y-1">${items.map((i) =>
  typeof i === 'string' ? `<li>${hl(i)}</li>` : `<li>${hl(i.t)}${i.sub ? list(i.sub, level + 1) : ''}</li>`).join('')}</ul>`;

function gym(g, region) {
  const emoji = TYPE_EMOJI[g.type] ?? '🏟️';
  const [a, b] = g.duo.map(([k, move]) => ({ ...data.mons[k], move }));
  const duoCell = (m) => `<li class="flex flex-col items-center text-center">${img(m.name, m.dex, 80)}<span class="text-xs text-muted">${esc(m.name)}</span><span class="text-sm font-bold">${esc(m.move)}</span></li>`;
  return `<li class="card !gap-3">
    <div class="flex items-center gap-3">
      <img src="${TRAINER}${g.leader}.png" alt="Líder del gimnasio de ${esc(g.city)} (${esc(g.type)})" width="64" height="64" loading="lazy" decoding="async"
           class="h-16 w-16 shrink-0 object-contain [image-rendering:pixelated]"
           onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${emoji}',className:'text-4xl',role:'img',ariaLabel:'${esc(g.type)}'}))" />
      <div><h4 class="!m-0 text-lg font-bold">${esc(g.city)}</h4>
        <p class="!m-0"><span class="badge-muted"><span aria-hidden="true">${emoji}</span> ${esc(g.type)}</span></p></div>
    </div>
    <ul class="!pl-0 !list-none flex items-end justify-center gap-3" aria-label="Dúo recomendado">${duoCell(a)}<li aria-hidden="true" class="pb-8 text-2xl font-bold">+</li>${duoCell(b)}</ul>
    ${g.notes ? `<div class="text-sm">${list(g.notes)}</div>` : ''}
    ${g.check ? `<p class="callout !m-0 !p-3" role="note"><span aria-hidden="true">⚠️</span> ${esc(g.check)}</p>` : ''}
  </li>`;
}

const reset = () => `<li class="rounded-xl border-2 border-red-500 bg-red-500/10 p-3 text-center font-bold" role="note"><span aria-hidden="true">❤️</span> RESET en el CP (Centro Pokémon)</li>`;

function region(r) {
  return `<section id="reg-${r.id}" data-region="${r.id}" aria-labelledby="reg-${r.id}-t" class="scroll-mt-24">
    <h3 id="reg-${r.id}-t" class="!mt-8 text-xl font-bold">${esc(r.name)}</h3>
    <figure class="my-4"><img src="../img/farmeo/${r.map}" alt="Mapa de ${esc(r.name)} del PDF con la ruta numerada del 1 al ${r.id === 'teselia' ? 7 : r.id === 'sinnoh' ? 5 : r.id === 'johto' ? 5 : r.id === 'hoenn' ? 6 : 2}" loading="lazy" decoding="async" class="mx-auto max-h-[28rem] w-auto rounded-xl border border-line" />
      <figcaption class="mt-1 text-center text-sm text-muted">Mapa tomado del PDF. Los números del mapa no están explicados en el PDF.</figcaption></figure>
    <ol class="!pl-0 !list-none space-y-4">${r.gyms.map((g) => (g.reset ? reset() : gym(g, r))).join('')}</ol>
  </section>`;
}

export function renderFarmeo() {
  const team = data.team.map((m) => teamCard({ ...m, ability: m.ability === '-' ? 'Habilidad no relevante' : m.ability }, data.statLabels)).join('');
  return `<div id="farmeo-guide">
    <p>Ruta de farmeo de gimnasios por región y qué hacer en cada situación, con un equipo fijo de cinco Pokémon.</p>
    <aside class="callout" aria-labelledby="credits-title">
      <p id="credits-title" class="!mb-1 font-bold"><span aria-hidden="true">🙏</span> Créditos</p>
      <p class="!mb-1">Guía de farmeo de gimnasios por ${esc(data.author)} (PokeMMO).</p>
      <p class="!mb-0 text-muted">Última actualización del documento: ${esc(data.updated)}.</p>
    </aside>

    <h2>Consumibles</h2>
    <ul class="!pl-0 !list-none grid gap-2 sm:grid-cols-3">${data.consumables.map((c, i) =>
      `<li class="rounded-xl border border-line bg-surface p-3"><label class="flex items-center gap-2"><input type="checkbox" class="h-5 w-5" /><span><strong>${esc(c.name)}</strong> · mín. ${c.min}</span></label></li>`).join('')}</ul>

    <h2>Equipo (PokePaste)</h2>
    <p class="text-sm text-muted">Un guion («—») en una estadística significa que no es relevante y puedes asignarle cualquier valor.</p>
    <ul class="!pl-0 !list-none grid gap-4 md:grid-cols-2">${team}
      <li class="card !gap-2"><h3 class="!m-0 text-lg font-bold"><span aria-hidden="true">❔</span> Sexto espacio libre</h3><p class="!m-0 text-sm">${esc(data.freeSlot)}</p></li>
    </ul>

    <h2 id="rutas">Rutas por región</h2>
    <div id="region-controls"></div>
    ${data.regions.map(region).join('\n')}

    <div class="callout">
      <p class="!mb-2 font-bold"><span aria-hidden="true">⚠️</span> Datos por verificar</p>
      <ul class="!mb-0">${data.verify.map((v) => `<li>${esc(v)}</li>`).join('')}</ul>
    </div>
    <p class="text-sm text-muted">Sprites de entrenadores: directorio de sprites de Pokémon Showdown (muchos no son de los juegos; créditos a sus artistas). No se aloja el PDF original.</p>
  </div>`;
}
