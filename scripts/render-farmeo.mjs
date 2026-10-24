// Guía "Farmeo de Gimnasios": HTML estático desde scripts/content/farmeo-gimnasios.json.
// assets/js/farmeo.js añade las pestañas por región (sin JS se ven todas las regiones seguidas).
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, img, teamCard, consumables, itemIcon, SPRITE } from './lib/cards.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Una misma plantilla sirve a varias guías de farmeo: slug → archivo de contenido y carpeta de mapas.
const GUIDES = {
  'farmeo-gimnasios': { file: 'farmeo-gimnasios.json', maps: 'farmeo' },
  'farmeo-gimnasios-2026': { file: 'farmeo-gimnasios-2026.json', maps: 'farmeo26', pdf: 'guia-farmeo-gimnasios-2026.pdf' },
};
let data; // contenido de la guía que se está generando
let cfg;
// Sprite del líder: Pokémon Showdown (igual que antes). Si no carga, copia local del PDF (public/img/trainers) y, si no, un emoji.
const trainerSrc = (id) => `${TRAINER}${id}.png`;
const trainerLocal = (id) => (existsSync(resolve(root, 'public/img/trainers', `${id}.webp`)) ? `../img/trainers/${id}.webp` : '');
const MON_HL = { Meloetta: 'g', Weezing: 'p', Typhlosion: 'r', Blastoise: 'b', Heatran: 'o' };
const TRAINER = 'https://play.pokemonshowdown.com/sprites/trainers/';
const TYPE_EMOJI = { Bicho: '🐛', Fuego: '🔥', Planta: '🌿', Agua: '💧', Volador: '🕊️', Eléctrico: '⚡', Hielo: '❄️', Dragón: '🐉', Tierra: '⛰️', Acero: '⚙️', Roca: '🪨', Lucha: '🥊', Normal: '⚪' };

// Color de cada movimiento = color del tipo de su Pokémon (campo `type` de data.mons). Para otro tipo, añade su letra aquí (colores en styles.css: .hl-*).
const TYPE_HL = { Hielo: 'c', Agua: 'b', Normal: 'n', Fuego: 'o', Veneno: 'p', Planta: 'g', Eléctrico: 'y', Psíquico: 'm', Lucha: 'r', Volador: 'k' };

// Pokémon que aparecen en las notas → n.º de Pokédex (sprite animado Gen 5). Formas sin sprite caen a texto (ver spriteChip).
const DEX = {
  Aerodactyl: 142, Arcanine: 59, Blastoise: 9, Blissey: 242, Cradily: 346, Dragonite: 149, Drifblim: 426, Electrode: 101, Emboar: 500,
  Emolga: 587, Excadrill: 530, Floatzel: 419, Galvantula: 596, Garchomp: 445, Gigalith: 526, Heatran: 485, Hippowdon: 450, Houndoom: 229,
  Infernape: 392, Jolteon: 135, Jumpluff: 189, Kingdra: 230, Lanturn: 171, Lapras: 131, Leavanny: 542, Ledian: 166, Ludicolo: 272,
  Magcargo: 219, Mamoswine: 473, Meloetta: 648, Metagross: 376, Mienshao: 620, Milotic: 350, Mismagius: 429, Moltres: 146, Pelipper: 279,
  Pidgeot: 18, Pikachu: 25, Politoed: 186, Probopass: 476, Raichu: 26, Rapidash: 78, Relicanth: 369, 'Rotom-Podadora': 10012, Sableye: 302,
  Samurott: 503, Scyther: 123, Sharpedo: 319, Slowbro: 80, Swampert: 260, Swanna: 581, Togekiss: 468, Torterra: 389, Typhlosion: 157,
  Tyranitar: 248, Unfezant: 521, Vanilluxe: 584, Weezing: 110, Whimsicott: 547, Zapdos: 145,
};
const NAME_RE = new RegExp(`\\b(${Object.keys(DEX).join('|')})\\b`, 'g');
const FALLBACK_JS = "if(this.src.includes('cdn.jsdelivr.net')){this.src=this.src.replace('https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/','https://raw.githubusercontent.com/PokeAPI/sprites/master/');return}";
/** Sprite en línea de un Pokémon: aro azul = tu equipo, aro rojo = rival. Si no carga, queda el nombre en texto con el mismo aro. */
function spriteChip(name, ally) {
  const ring = ally ? 'ring-sky-500' : 'ring-red-500';
  const role = ally ? 'Tu equipo' : 'Rival';
  return `<img src="${SPRITE}${DEX[name]}.gif" alt="${role}: ${name}" title="${role}: ${name}" width="96" height="96" loading="lazy" decoding="async" data-own-error `
    + `class="mx-0.5 inline-block h-9 w-9 rounded-full bg-bg/60 object-contain align-middle ring-2 ${ring} [image-rendering:pixelated]" `
    + `onerror="${FALLBACK_JS}this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${name}',className:'mx-0.5 rounded-full px-1.5 font-semibold ring-2 ${ring}'}))" />`;
}
const isAlly = (name) => Object.values(data.mons).some((m) => m.name === name);

// {r:texto} → texto coloreado (movimientos). Todo nombre de Pokémon, coloreado o no, se muestra como sprite (aliado o rival).
const hl = (s) => esc(s).replace(new RegExp(`\\{([a-z]):([^}]+)\\}|${NAME_RE.source}`, 'g'), (m, c, t, bare) => {
  if (bare) return spriteChip(bare, isAlly(bare));
  const inner = String(t).trim();
  return DEX[inner] ? spriteChip(inner, isAlly(inner)) : `<span class="hl hl-${c}">${t}</span>`;
});

const list = (items, level = 0) => `<ul class="${level ? '!mt-1 ' : ''}!mb-0 space-y-1">${items.map((i) =>
  typeof i === 'string' ? `<li>${hl(i)}</li>` : `<li>${hl(i.t)}${i.sub ? list(i.sub, level + 1) : ''}</li>`).join('')}</ul>`;

function gym(g, n) {
  const emoji = TYPE_EMOJI[g.type] ?? '🏟️';
  const [a, b] = g.duo.map(([k, move]) => ({ ...data.mons[k], move }));
  const duoCell = (m) => `<li class="flex flex-col items-center text-center">${img(m.name, m.dex, 80)}<span class="text-xs text-muted">${esc(m.name)}</span><span class="text-sm hl hl-${m.hl ?? TYPE_HL[m.type] ?? 'n'}">${esc(m.move)}</span></li>`;
  return `<div class="card !items-stretch !gap-3 flex-1">
    <div class="flex flex-col items-center gap-1 text-center">
      <img src="${trainerSrc(g.leader)}" data-local="${trainerLocal(g.leader)}" data-own-error alt="Líder del gimnasio de ${esc(g.city)} (${esc(g.type)})" width="96" height="96" loading="lazy" decoding="async"
           class="h-24 w-24 shrink-0 object-contain [image-rendering:pixelated]"
           onerror="if(this.dataset.local&&!this.dataset.tried){this.dataset.tried=1;this.src=this.dataset.local;return}this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${emoji}',className:'text-5xl',role:'img',ariaLabel:'${esc(g.type)}'}))" />
      <h5 class="!m-0 text-lg font-bold"><span class="text-accent-text">${n}.</span> ${esc(g.city)}</h5>
      <p class="!m-0"><span class="badge-muted"><span aria-hidden="true">${emoji}</span> Gimnasio ${esc(g.type)}</span></p>
    </div>
    <ul class="!pl-0 !list-none flex items-end justify-center gap-3" aria-label="Dúo recomendado">${duoCell(a)}<li aria-hidden="true" class="pb-8 text-2xl font-bold">+</li>${duoCell(b)}</ul>
    ${g.notes ? `<div class="text-sm">${list(g.notes)}</div>` : ''}
    ${g.check ? `<p class="callout !m-0 !p-3" role="note"><span aria-hidden="true">⚠️</span> ${hl(g.check)}</p>` : ''}
  </div>`;
}

const swap = ({ item, to }) => `<p class="!m-0 rounded-xl border-2 border-accent bg-accent/10 px-3 py-2 text-center text-sm font-bold" role="note"><span aria-hidden="true">🔁</span> ¡¡Cambiar a ${itemIcon(item)} ${esc(item)} → ${DEX[to] ? spriteChip(to, true) : esc(to)}!!</p>`;

const reset = () => `<p class="!m-0 rounded-xl border-2 border-red-500 bg-red-500/10 px-3 py-2 text-center text-sm font-bold" role="note"><span aria-hidden="true">❤️</span> RESET en el CP (Centro Pokémon)</p>`;

// Cada gimnasio es una card; los RESET y «Cambiar a…» que le siguen quedan pegados debajo de ella (como barras finas).
function gymItems(entries) {
  const items = [];
  for (const e of entries) {
    if (e.reset || e.swap) {
      if (!items.length) items.push({ gym: null, extras: [] });
      items[items.length - 1].extras.push(e);
    } else items.push({ gym: e, extras: [] });
  }
  return items;
}

function region(r, next) {
  let n = 0;
  return `<section id="reg-${r.id}" data-sub="${r.id}" aria-labelledby="reg-${r.id}-t" class="scroll-mt-24">
    <h4 id="reg-${r.id}-t" class="!mt-6 text-xl font-bold">${esc(r.name)}</h4>
    <figure class="my-4"><img src="../img/${cfg.maps}/${r.map}" alt="Mapa de ${esc(r.name)} del PDF con la ruta numerada del 1 al ${r.mapCount ?? (r.id === 'teselia' ? 7 : r.id === 'sinnoh' ? 5 : r.id === 'johto' ? 5 : r.id === 'hoenn' ? 6 : 2)}" loading="lazy" decoding="async" class="mx-auto w-full max-w-2xl rounded-xl border border-line" />
      <figcaption class="mt-1 text-center text-sm text-muted">Mapa tomado del PDF. Los números del mapa no están explicados en el PDF.</figcaption></figure>
    <p class="!mb-2 text-sm text-muted"><span class="inline-block h-4 w-4 rounded-full align-middle ring-2 ring-sky-500"></span> aro azul = tu equipo · <span class="inline-block h-4 w-4 rounded-full align-middle ring-2 ring-red-500"></span> aro rojo = Pokémon rival</p>
    <ol class="!pl-0 !list-none grid gap-4 md:grid-cols-2">${gymItems(r.gyms).map((it) => `<li class="flex flex-col gap-2">${it.gym ? gym(it.gym, ++n) : ''}${it.extras.map((x) => (x.reset ? reset() : swap(x.swap))).join('')}</li>`).join('')}</ol>
    ${next ? `<p class="mt-6 text-center"><a href="#${next.id}" data-next-sub class="btn-primary !px-6 !py-3 !text-base">Ir a ${esc(next.name)} <span aria-hidden="true">→</span></a></p>` : ''}
  </section>`;
}

export function renderFarmeo(guide = { slug: 'farmeo-gimnasios' }) {
  cfg = GUIDES[guide.slug];
  data = JSON.parse(readFileSync(resolve(root, 'scripts/content', cfg.file), 'utf8'));
  const team = data.team.map((m) => teamCard({ ...m, ability: m.ability === '-' ? 'Habilidad no relevante' : m.ability }, data.statLabels)).join('');
  return `<div id="farmeo-guide" data-tabs-label="Secciones">
    <div id="region-controls"></div>

    <section id="reg-resumen" data-region="resumen" aria-labelledby="reg-resumen-t" class="scroll-mt-24">
      <h3 id="reg-resumen-t" class="!mt-8 text-xl font-bold">Resumen</h3>
      <p>Ruta de farmeo de gimnasios por región y qué hacer en cada situación, con un equipo fijo de cinco Pokémon.</p>
      <aside class="callout" aria-labelledby="credits-title">
        <p id="credits-title" class="!mb-1 font-bold"><span aria-hidden="true">🙏</span> Créditos</p>
        <p class="!mb-1">Guía de farmeo de gimnasios por ${esc(data.author)} (PokeMMO).</p>
        ${data.source ? `<p class="!mb-1"><strong>Fuente original:</strong> <a class="font-medium" href="${esc(data.source.url)}" target="_blank" rel="noopener noreferrer">${esc(data.source.name)}<span class="sr-only"> (nueva pestaña)</span></a>. ${esc(data.source.note)}</p>` : ''}
        <p class="!mb-0 text-muted">Última actualización del documento: ${esc(data.updated)}.${data.nick === null ? '' : '<br>Nick: xXZarcAndXx'}</p>
      </aside>

      ${cfg.pdf ? `<p><a class="btn-ghost" href="../docs/${cfg.pdf}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">📄</span> Ver el PDF original<span class="sr-only"> (nueva pestaña)</span></a></p>` : ''}
      ${data.legibility ? `<p class="callout !p-3 text-sm" role="note"><span aria-hidden="true">⚠️</span> ${esc(data.legibility)}</p>` : ''}
      ${data.objects
    ? `<h4 class="!mt-6 font-bold">Objetos necesarios</h4><p class="text-sm text-muted">El PDF lista estos objetos sin indicar cantidades.</p><ul class="!pl-0 !list-none grid gap-2 sm:grid-cols-3">${data.objects.map((o) => `<li class="flex items-center gap-3 rounded-xl border border-line bg-surface p-2.5">${itemIcon(o, 'h-10 w-10') || '<span aria-hidden="true" class="text-2xl">🎒</span>'}<strong>${esc(o)}</strong></li>`).join('')}</ul>`
    : `<h4 class="!mt-6 font-bold">Consumibles</h4>
      ${consumables(data.consumables)}`}

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

  </div>`;
}
