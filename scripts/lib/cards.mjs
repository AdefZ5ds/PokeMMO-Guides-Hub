// Piezas HTML compartidas por los renderizadores de guías (tarjetas de equipo, sprites).
export const SPRITE = '../img/sprites/pokemon/';
export const ITEM_SPRITE = '../img/sprites/items/';
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Objeto (nombre en español) → nombre del icono en PokeAPI. Solo los que están comprobados;
// un objeto sin entrada aquí (o con icono inexistente) se muestra solo con su nombre.
const ITEM_ICON = {
  'Restos': 'leftovers', 'Casco Dentado': 'rocky-helmet', 'Banda Focus': 'focus-sash', 'Vidaesfera': 'life-orb',
  'Cinta Elección': 'choice-band', 'Cinta Elegida': 'choice-band', 'Gafas Elección': 'choice-specs', 'Gafas Elegidas': 'choice-specs',
  'Pañuelo Elección': 'choice-scarf', 'Pañuelo Elegido': 'choice-scarf', 'Cinta Experta': 'expert-belt', 'Cint. Negro': 'black-belt',
  'Gafas de Sol': 'black-glasses', 'Llamaesfera': 'flame-orb', 'Flecha Veneno': 'poison-barb', 'Hechizo': 'spell-tag',
  'Bola Férrea': 'iron-ball', 'Gema (Voladora)': 'flying-gem', 'Baya Jaboca': 'jaboca-berry', 'Dados Trucados': 'loaded-dice',
  // Consumibles de las guías de farmeo (Zanama = Leppa Berry según WikiDex)
  'Pociones': 'potion', 'Zanama': 'leppa-berry', 'Especial X': 'x-sp-atk', 'Repelente': 'repel',
};
// Alias de nombres tal como aparecen en los PokePaste de las guías («Objeto Restos», «Cint. Negra»…).
Object.assign(ITEM_ICON, {
  'Cint. Negra': 'black-belt', 'Antederretir': 'never-melt-ice', 'Pañl. Seda': 'silk-scarf', 'Pañuelo Seda': 'silk-scarf',
  'Carbón': 'charcoal', 'Pañuelo Elegido': 'choice-scarf', 'Velocidad X': 'x-speed', 'Chaleco Asalto': 'assault-vest',
  'Baya Zidra': 'sitrus-berry', 'Ocarina de Vuelo': 'ocarina-fly', 'Ocarina de Teletrans.': 'ocarina-teleport', 'Mineral Evolutivo': 'eviolite',
});
const one = (file, size) => `<img src="${ITEM_SPRITE}${file}.png" alt="" width="32" height="32" loading="lazy" decoding="async" class="inline ${size} shrink-0 object-contain [image-rendering:pixelated]" onerror="this.remove()" />`;
/** Icono(s) de un objeto equipado. Admite el prefijo «Objeto » y alternativas «A o B». */
export const itemIcon = (name, size = 'h-6 w-6') => String(name).replace(/^Objeto\s+/, '').split(/\s+o\s+/)
  .map((n) => (ITEM_ICON[n.trim()] ? one(ITEM_ICON[n.trim()], size) : '')).join('');

// Objetos de inventario citados en los pasos de una guía: texto → icono (PokeAPI). Las MO usan el icono de su tipo.
const BAG = [
  ['MO Golpe Roca', 'hm-fighting'], ['MO Corte', 'hm-normal'], ['MO Surf', 'hm-water'], ['MO Destello', 'hm-normal'],
  ['MO Fuerza', 'hm-normal'], ['MO Despejar', 'hm-flying'], ['MO Vuelo', 'hm-flying'], ['MO Cascada', 'hm-water'],
  ['MO Buceo', 'hm-water'], ['MO Treparrocas', 'hm-normal'], ['Bici Acrobática', 'acro-bike'], ['Poción Secreta', 'secret-potion'],
  ['Dientes de Oro', 'gold-teeth'], ['Llave Tarjeta', 'card-key'], ['Llave del Subsuelo', 'basement-key'],
  ['Regadera', 'squirt-bottle'], ['Repelentes', 'repel'], ['Repelente', 'repel'], ['Bici', 'bicycle'], ['Té', 'tea'],
];
const BAG_RE = new RegExp(`(?<!Bono )(?<![\\p{L}])(${BAG.map(([k]) => k).join('|')})(?![\\p{L}])`, 'gu');
const BAG_MAP = Object.fromEntries(BAG);
/** Texto ya escapado → mismo texto con el icono del objeto tras cada mención (MO, Bici, Repelente…). */
export const bagIcons = (html) => html.replace(BAG_RE, (m) => `${m}${one(BAG_MAP[m], 'mx-0.5 h-6 w-6 align-middle')}`);

// "-" / "x" = estadística no relevante (según las guías). 31 de IV y 252 de EV se resaltan en verde lima.
const cell = (v, max) => (v === '-' || v === 'x' ? '<span aria-label="no relevante">—</span>' : `<span${v === max ? ' class="stat-max"' : ''}>${esc(v)}</span>`);

export const img = (name, dex, size = 56) =>
  `<img src="${SPRITE}${dex}.gif" alt="${esc(name)}" width="96" height="96" loading="lazy" decoding="async" class="${size === 56 ? 'h-14 w-14' : 'h-20 w-20'} shrink-0 object-contain [image-rendering:pixelated]" />`;

const statRow = (label, values, max) =>
  `<tr><th scope="row" class="py-1 pr-2 text-left font-semibold">${label}</th>${values.map((v) => `<td class="px-1 py-1 text-center tabular-nums">${cell(v, max)}</td>`).join('')}</tr>`;

const placeholder = (v) => /\(editar\)/.test(v);
const field = (label, value, icon = '') =>
  `<div class="flex items-center gap-2"><dt class="w-24 shrink-0 text-muted">${label}</dt><dd class="!m-0 flex items-center gap-1.5 font-semibold${placeholder(value) ? ' !font-normal text-muted' : ''}">${icon}${esc(value)}</dd></div>`;

/**
 * Tarjeta de un Pokémon del equipo (PokePaste).
 * m: { name, dex, level, item, ability, nature, ivs[6]|null, ivsText?, evs[6], moves[], critical?, check?, alt?, badge? }
 */
export function teamCard(m, statLabels) {
  const head = statLabels.map((s) => `<th scope="col" class="px-1 pb-1 text-center text-xs font-semibold text-muted">${esc(s)}</th>`).join('');
  return `<li class="card !gap-3${m.critical ? ' !border-gold' : ''}">
    <div class="flex items-center gap-3">${img(m.name, m.dex, 80)}
      <h3 class="!m-0 text-lg font-bold leading-snug">${esc(m.name)} <span class="text-sm font-normal text-muted">Nv. ${m.level}${m.speed ? ` · ${m.speed} Vel` : ''}</span>${m.alt ? ' <span class="badge-muted">Alternativa</span>' : ''}${m.badge ? ' <span class="badge-gold">Provisional</span>' : ''}</h3>
    </div>
    <dl class="!m-0 space-y-1 text-sm">${field('Objeto', m.item, itemIcon(m.item))}${field('Habilidad', m.ability)}${field('Naturaleza', m.nature)}</dl>
    <div class="overflow-x-auto"><table class="w-full text-sm"><caption class="sr-only">IVs y EVs de ${esc(m.name)}</caption>
      <thead><tr><td></td>${head}</tr></thead>
      <tbody>${m.ivs ? statRow('IVs', m.ivs, '31') : `<tr><th scope="row" class="py-1 pr-2 text-left font-semibold">IVs</th><td colspan="6" class="px-1 py-1">${esc(m.ivsText)}</td></tr>`}${statRow('EVs', m.evs, '252')}</tbody>
    </table></div>
    <ol class="!m-0 !list-none space-y-1.5 !pl-0" aria-label="Movimientos">${m.moves.map((mv) => `<li class="rounded-lg border border-line bg-bg px-3 py-1.5 text-sm font-medium">${esc(mv)}</li>`).join('')}</ol>
    ${m.critical ? `<p class="!m-0 flex gap-2 rounded-lg bg-gold/15 p-2 text-sm" role="note"><span class="badge-gold shrink-0 self-start">Crítico</span><span>${esc(m.critical)}</span></p>` : ''}
    ${m.check ? `<p class="callout !m-0 !p-3" role="note"><span aria-hidden="true">⚠️</span> ${esc(m.check)}</p>` : ''}
  </li>`;
}

/** Sprite pequeño en línea (sin caja ni nombre visible; el nombre queda como texto alternativo). */
export const inlineSprite = (name, dex, label = name) =>
  `<img src="${SPRITE}${dex}.gif" alt="${esc(label)}" title="${esc(label)}" width="96" height="96" loading="lazy" decoding="async" class="mx-0.5 inline-block h-9 w-9 align-middle object-contain [image-rendering:pixelated]" />`;

/** Texto donde los Pokémon del equipo se sustituyen por su sprite en línea. */
export function chips(text, team) {
  const re = new RegExp(`\\b(${team.map((m) => m.name).join('|')})\\b`, 'g');
  const dex = Object.fromEntries(team.map((m) => [m.name, m.dex]));
  return esc(text).replace(re, (n) => inlineSprite(n, dex[n]));
}

/** Lista compacta de consumibles: icono del objeto + nombre + cantidad mínima (sin casillas). */
export const consumables = (items, cols = 'sm:grid-cols-3') =>
  `<ul class="!pl-0 !list-none grid gap-2 ${cols}">${items.map((c) =>
    `<li class="flex items-center gap-3 rounded-xl border border-line bg-surface p-2.5">${itemIcon(c.name, 'h-10 w-10') || '<span aria-hidden="true" class="text-2xl">🎒</span>'}<span><strong>${esc(c.name)}</strong><br><span class="text-sm text-muted">${/^mín/i.test(String(c.min)) ? '' : 'mín. '}${esc(c.min)}</span></span></li>`).join('')}</ul>`;
