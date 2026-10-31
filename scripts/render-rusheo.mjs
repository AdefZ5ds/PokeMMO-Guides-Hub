// Guía "Rusheo multirregión": HTML estático desde scripts/content/rusheo.json.
// Reutiliza assets/js/farmeo.js (pestañas por fase) y añade assets/js/rusheo.js (progreso guardado).
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { esc, img, teamCard, inlineSprite, bagIcons } from './lib/cards.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const d = JSON.parse(readFileSync(resolve(root, 'scripts/content/rusheo.json'), 'utf8'));
// Líder de cada gimnasio nombrado en los pasos. Sprites: Pokémon Showdown; si no carga, copia local del PDF
// (public/img/trainers) y, si tampoco, 🏆. Solo están los que tengo claros; los dudosos NO llevan sprite
// (Ciudad Tormellera, Ciudad Arborada, Ciudad Algararia, Ciudad Azafrán... revisa y añádelos aquí).
// «PDF» = ciudad/líder confirmados por la guía de farmeo de gimnasios; «mem» = de memoria, sin verificar en un PDF.
const LEADERS = {
  'Ciudad Malva': 'falkner', 'Pueblo Azalea': 'bugsy', 'Ciudad Trigal': 'whitney', 'Ciudad Olivo': 'jasmine', 'Ciudad Endrino': 'clair', 'Pueblo Caoba': 'pryce', // PDF
  'Ciudad Iris': 'morty', 'Ciudad Orquídea': 'chuck', // mem
  'Ciudad Gres': 'cress', 'Ciudad Esmalte': 'lenora', 'Ciudad Porcelana': 'burgh', 'Ciudad Mayólica': 'elesa', 'Ciudad Fayenza': 'clay', 'Ciudad Loza': 'skyla', 'Ciudad Teja': 'brycen', 'Ciudad Caolín': 'iris', // PDF
  'Ciudad Férrica': 'roxanne', 'Pueblo Azuliza': 'brawly', 'Ciudad Malvalona': 'wattson', 'Pueblo Lavacalda': 'flannery', 'Arrecípolis': 'wallace', // PDF
  'Ciudad Petalia': 'norman', 'Ciudad Arborada': 'winona', // mem (Winona: sprite local del PDF)
  'Ciudad Plateada': 'brock', 'Ciudad Carmín': 'ltsurge', 'Ciudad Azulona': 'erika', 'Isla Canela': 'blaine', // PDF
  'Ciudad Celeste': 'misty', 'Ciudad Fucsia': 'koga', 'Ciudad Verde': 'giovanni', 'Ciudad Azafrán': 'sabrina', // mem
  'Ciudad Pirita': 'roark', 'Ciudad Vetusta': 'gardenia', 'Ciudad Rocavelo': 'maylene', 'Ciudad Pradera': 'crasherwake', 'Ciudad Marina': 'volkner', // PDF
  'Ciudad Corazón': 'fantina', 'Ciudad Canal': 'byron', 'Ciudad Puntaneva': 'candice', // mem
};
// Sin sprite a propósito: Ciudad Algaria (dos líderes: Plácido y Vana).
const TRAINER = 'https://play.pokemonshowdown.com/sprites/trainers/';
const trainerLocal = (id) => (existsSync(resolve(root, 'public/img/trainers', `${id}.webp`)) ? `../img/trainers/${id}.webp` : '');
// Sprite del líder a la izquierda del paso: siempre 72×72 en PC (≥768 px) y 48×48 en móvil.
const leaderOf = (text) => {
  const m = text.match(/Gimnasio de ((?:(?:Ciudad|Pueblo|Isla) [^➔.(<]+?)|Arrecípolis)(?=\s*(?:[➔.(<]|$))/);
  const city = m?.[1].trim();
  const id = city && LEADERS[city];
  if (!id) return '';
  const size = 'h-12 w-12 md:h-[72px] md:w-[72px]'; // móvil/Android 48×48, PC 72×72 (igual en todos los líderes)
  return `<img src="${TRAINER}${id}.png" data-local="${trainerLocal(id)}" data-own-error alt="Líder: ${id}" title="Líder del gimnasio de ${esc(city)}" width="96" height="96" loading="lazy" decoding="async" class="${size} shrink-0 object-contain [image-rendering:pixelated]" onerror="if(this.dataset.local&&!this.dataset.tried){this.dataset.tried=1;this.src=this.dataset.local;return}this.replaceWith(Object.assign(document.createElement('span'),{textContent:'🏆',role:'img',ariaLabel:'Líder',className:'text-4xl'}))" />`;
};

const REGION_EMOJI = { Johto: '🌸', Teselia: '🏙️', Hoenn: '🌊', Kanto: '🌿', Sinnoh: '❄️' };

function step(text, id) {
  let badge = '';
  let icon = '▫️';
  if (/^CAMBIA A/.test(text)) { badge = '<span class="badge-muted">Cambio</span>'; icon = '🔄'; }
  else if (/^ADVERTENCIA/.test(text)) { badge = '<span class="badge-gold">Aviso</span>'; icon = '⚠️'; }
  else if (/Alto Mando/.test(text)) { badge = '<span class="badge-gold">Liga</span>'; icon = '👑'; }
  else if (/Gimnasio de/.test(text)) { badge = '<span class="badge-gold">Medalla</span>'; icon = '🏆'; }
  else if (/Barco/.test(text)) icon = '🚢';
  return `<li><label class="flex items-start gap-2 rounded-lg p-1.5 hover:bg-surface"><input type="checkbox" data-step="${id}" class="mt-1 h-5 w-5 shrink-0" />
    ${leaderOf(text) ? `<span class="flex items-start gap-3">${leaderOf(text)}<span>` : '<span>'}<span aria-hidden="true">${icon}</span> ${bagIcons(esc(text)).replace(/Pokémon ([1-4])/g, (_, k) => inlineSprite(d.mons[k].name, d.mons[k].dex, `Pokémon ${k} (${d.mons[k].name})`))} ${badge}${leaderOf(text) ? '</span>' : ''}</span></label></li>`;
}

function chips(leg) {
  if (leg.use) {
    // Solo los Pokémon que se usan en el tramo, en el orden de la guía original (4, 3, 2, 1)
    const used = [...leg.use].sort((x, y) => y - x);
    return `<ul class="!pl-0 !list-none flex flex-wrap gap-2" aria-label="Pokémon a usar y límites de nivel">${used.map((k) => {
      const m = d.mons[k];
      return `<li class="flex items-center gap-2 rounded-xl border border-accent bg-accent/10 px-2 py-1">${img(m.name, m.dex)}<span class="text-sm"><strong>Pokémon ${k}</strong> · ${esc(m.name)}<br><span class="font-semibold">≤ Lv ${esc(leg.caps[k])}</span></span></li>`;
    }).join('')}</ul>`;
  }
  if (leg.cap) return `<p class="!m-0"><span class="badge-gold !text-base">Límite de nivel: Lv ${leg.cap}</span></p>`;
  return '';
}

function leg(l, pi, li, phase) {
  const banner = l.banner ? `<img src="../img/rusheo/${l.banner}.webp" alt="" width="960" height="400" loading="lazy" decoding="async" class="h-28 w-full rounded-xl object-cover sm:h-36" />` : '';
  const num = `${pi + 1}.${li + 1}`;
  return `<li id="${phase.id}-${li}" class="card !gap-3 scroll-mt-24">
    ${banner}
    <div class="flex flex-wrap items-center gap-2">
      <h4 class="!m-0 text-lg font-bold"><span aria-hidden="true">${REGION_EMOJI[l.region]}</span> ${li + 1}. ${esc(l.region)}${l.done ? ' <span class="badge-muted">¡Completada!</span>' : ''}</h4>
      <button type="button" class="btn-ghost ml-auto !px-3 !py-1.5" data-leg-toggle hidden aria-pressed="false"><span aria-hidden="true" data-leg-icon>☑️</span> <span data-leg-label>Marcar tramo</span></button>
    </div>
    ${chips(l)}
    <ol class="!pl-0 !list-none space-y-0.5 text-sm sm:text-base">${l.steps.map((t, si) => step(t, `${phase.id}-${li}-${si}`)).join('')}</ol>
  </li>`;
}

export function renderRusheo() {
  const team = [...d.team].reverse().map((m) => teamCard(m, d.statLabels)).join(''); // orden de la guía original: 4, 3, 2, 1
  const total = d.phases.reduce((n, p) => n + p.legs.reduce((k, l) => k + l.steps.length, 0), 0);
  const index = (p) => `<nav aria-label="Tramos de ${esc(p.name)}" class="my-3"><ul class="!pl-0 !list-none flex flex-wrap gap-1.5">${p.legs.map((l, i) => `<li><a class="chip" href="#${p.id}-${i}">${i + 1}. ${esc(l.region)}</a></li>`).join('')}</ul></nav>`;
  return `<div id="farmeo-guide" data-tabs-label="Fases" data-rush data-total="${total}">
    <p>${esc(d.intro)}</p>
    <div id="rush-progress" data-total="${total}"></div>
    <div id="region-controls" class="mt-4"></div>

    <section id="reg-resumen" data-region="resumen" aria-labelledby="reg-resumen-t" class="scroll-mt-24">
      <h3 id="reg-resumen-t" class="!mt-8 text-xl font-bold">Resumen</h3>
      <h4 class="!mt-4 font-bold"><span aria-hidden="true">💡</span> Consejos generales</h4>
      <ul>${d.tips.map((t) => `<li>${bagIcons(esc(t))}</li>`).join('')}</ul>
      <h4 class="!mt-6 font-bold">Equipo (provisional)</h4>
      <p class="text-sm text-muted">Los Pokémon 1 a 4 son los que indicaste; el resto de datos es de relleno y se edita en <code>scripts/content/rusheo.json</code>.</p>
      <ul class="!pl-0 !list-none grid gap-4 md:grid-cols-2">${team}</ul>
    </section>

    ${d.phases.map((p, pi) => `<section id="reg-${p.id}" data-region="${p.id}" aria-labelledby="reg-${p.id}-t" class="scroll-mt-24">
      <h3 id="reg-${p.id}-t" class="!mt-8 text-xl font-bold">${esc(p.name)}</h3>
      <p class="!mb-0 text-muted">${esc(p.title)}</p>
      ${p.note ? `<p class="callout !mb-0 !mt-3 !p-3" role="note"><span aria-hidden="true">ℹ️</span> ${esc(p.note)}</p>` : ''}
      ${index(p)}
      <ol class="!pl-0 !list-none space-y-4">${p.legs.map((l, li) => leg(l, pi, li, p)).join('')}</ol>
      ${p.id === 'final' ? '<p class="callout mt-4" role="status"><span aria-hidden="true">🎉</span> ¡Felicidades! Has completado todas las regiones de forma paralela y eficiente.</p>' : ''}
    </section>`).join('\n')}

    <aside class="callout mt-8" aria-labelledby="credits-title">
      <p id="credits-title" class="!mb-1 font-bold"><span aria-hidden="true">🙏</span> Créditos</p>
      <p class="!mb-1">${d.creditUrl ? `<a class="font-medium" href="${esc(d.creditUrl)}" target="_blank" rel="noopener noreferrer">${esc(d.credit)}<span class="sr-only"> (nueva pestaña)</span></a>` : esc(d.credit)}</p>
      <p class="!mb-0 text-muted">${esc(d.creditNote)}</p>
    </aside>
  </div>`;
}
