// Piezas HTML compartidas por los renderizadores de guías (tarjetas de equipo, sprites).
export const SPRITE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// "-" / "x" = estadística no relevante (según las guías)
const cell = (v) => (v === '-' || v === 'x' ? '<span aria-label="no relevante">—</span>' : esc(v));

export const img = (name, dex, size = 56) =>
  `<img src="${SPRITE}${dex}.png" alt="${esc(name)}" width="96" height="96" loading="lazy" decoding="async" class="${size === 56 ? 'h-14 w-14' : 'h-20 w-20'} shrink-0 [image-rendering:pixelated]" />`;

const statRow = (label, values) =>
  `<tr><th scope="row" class="py-1 pr-2 text-left font-semibold">${label}</th>${values.map((v) => `<td class="px-1 py-1 text-center tabular-nums">${cell(v)}</td>`).join('')}</tr>`;

/**
 * Tarjeta de un Pokémon del equipo.
 * m: { name, dex, level, item, ability, nature, ivs[6]|null, ivsText?, evs[6], moves[], critical?, check?, alt? }
 */
export function teamCard(m, statLabels) {
  const head = statLabels.map((s) => `<th scope="col" class="px-1 pb-1 text-center text-xs font-semibold text-muted">${esc(s)}</th>`).join('');
  return `<li class="card !gap-2${m.critical ? ' !border-gold' : ''}">
    <div class="flex items-center gap-3">${img(m.name, m.dex, 80)}
      <div><h3 class="!m-0 text-lg font-bold">${esc(m.name)} <span class="text-sm font-normal text-muted">Nv. ${m.level}</span>${m.alt ? ' <span class="badge-muted">Alternativa</span>' : ''}${m.badge ? ' <span class="badge-gold">Provisional</span>' : ''}</h3>
      <p class="!m-0 text-sm text-muted">${esc(m.item)} · ${esc(m.ability)} · Naturaleza ${esc(m.nature)}</p></div>
    </div>
    <div class="overflow-x-auto"><table class="w-full text-sm"><caption class="sr-only">IVs y EVs de ${esc(m.name)}</caption>
      <thead><tr><td></td>${head}</tr></thead>
      <tbody>${m.ivs ? statRow('IVs', m.ivs) : `<tr><th scope="row" class="py-1 pr-2 text-left font-semibold">IVs</th><td colspan="6" class="px-1 py-1">${esc(m.ivsText)}</td></tr>`}${statRow('EVs', m.evs)}</tbody>
    </table></div>
    <ul class="!m-0 flex flex-wrap gap-1.5 !pl-0 !list-none" aria-label="Movimientos">${m.moves.map((mv) => `<li class="badge-muted !text-sm">${esc(mv)}</li>`).join('')}</ul>
    ${m.critical ? `<p class="!m-0 flex gap-2 rounded-lg bg-gold/15 p-2 text-sm" role="note"><span class="badge-gold shrink-0 self-start">Crítico</span><span>${esc(m.critical)}</span></p>` : ''}
    ${m.check ? `<p class="callout !m-0 !p-3" role="note"><span aria-hidden="true">⚠️</span> ${esc(m.check)}</p>` : ''}
  </li>`;
}

/** Texto con los Pokémon del equipo como "chips" (sprite sobre el nombre), igual que la galería interactiva. */
export function chips(text, team) {
  const re = new RegExp(`\\b(${team.map((m) => m.name).join('|')})\\b`, 'g');
  const dex = Object.fromEntries(team.map((m) => [m.name, m.dex]));
  return esc(text).replace(re, (n) => `<span class="mx-0.5 my-0.5 inline-flex flex-col items-center rounded-lg border border-line bg-surface px-1.5 py-0.5 align-middle leading-none"><img src="${SPRITE}${dex[n]}.png" alt="" width="96" height="96" loading="lazy" class="h-10 w-10 [image-rendering:pixelated]" /><span class="text-xs font-semibold">${n}</span></span>`);
}
