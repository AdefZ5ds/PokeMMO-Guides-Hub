// Contador de visitas por slug.
//
// Modos (VITE_COUNTER_MODE):
//   remote → CounterAPI (por defecto en producción)
//   local  → solo localStorage, por navegador (por defecto en `npm run dev`)
//
// ⚠️ CONCLUSIÓN (16/10/2026): el panel de CounterAPI V2 muestra TODOS sus endpoints (up, down, get, stats)
//    con «Authorization: Bearer YOUR_API_KEY». Sumar visitas desde una web estática exigiría publicar
//    esa clave, así que el modo por defecto pasa a 'local' (popularidad semilla + visitas de este navegador).
//    El modo 'remote' queda disponible por si se usa un proxy propio (VITE_COUNTER_BASE).
//
// Estado de verificación (15/10/2026):
//  - La documentación de CounterAPI (docs.counterapi.dev) indica que la API V1 está
//    deprecada y ya no disponible, así que se usa V2: GET /v2/:workspace/:name y
//    /v2/:workspace/:name/up.
//  - NO verificado en vivo (el entorno de desarrollo no puede llegar a ese host):
//    la forma del JSON de respuesta (la doc no la describe; parseCount acepta varias),
//    si un contador público se crea solo al primer /up, y si V2 exige API key
//    (la doc dice que sí para contadores privados). NO pongas una API key en este código:
//    quedaría visible para cualquiera.
//  - Si algo falla, el sitio sigue funcionando con la popularidad semilla de guides.json.
//    Ajusta VITE_COUNTER_BASE o `parseCount` si hace falta.

const NS = import.meta.env.VITE_COUNTER_NS || 'pokemmo-guides-hub'; // workspace en CounterAPI V2
const BASE = (import.meta.env.VITE_COUNTER_BASE || 'https://api.counterapi.dev/v2').replace(/\/$/, '');
const MODE = import.meta.env.VITE_COUNTER_MODE || 'local'; // remoto solo si se activa a propósito (ver nota)
const TTL_MS = 10 * 60 * 1000; // caché de lecturas remotas
const TIMEOUT_MS = 4000;
const CACHE_KEY = 'pmmo-views-cache-v1';
const LOCAL_KEY = 'pmmo-views-local-v1';

const read = (store, key, fallback) => {
  try { return JSON.parse(store.getItem(key)) ?? fallback; } catch { return fallback; }
};
const write = (store, key, value) => {
  try { store.setItem(key, JSON.stringify(value)); } catch { /* sin almacenamiento */ }
};

const parseCount = (d) => {
  const n = Number(d?.count ?? d?.value ?? d?.data?.count ?? d?.data?.up_count ?? d?.up_count ?? d?.current_value);
  if (!Number.isFinite(n)) throw new Error('Respuesta inesperada del contador');
  return n;
};

async function request(slug, action = '') {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}/${NS}/${encodeURIComponent(slug)}${action ? `/${action}` : ''}`, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseCount(await res.json());
  } finally {
    clearTimeout(timer);
  }
}

function setCache(slug, n) {
  const cache = read(localStorage, CACHE_KEY, {});
  cache[slug] = { n, ts: Date.now() };
  write(localStorage, CACHE_KEY, cache);
}

const localCount = (slug) => read(localStorage, LOCAL_KEY, {})[slug] || 0;
function bumpLocal(slug) {
  const all = read(localStorage, LOCAL_KEY, {});
  all[slug] = (all[slug] || 0) + 1;
  write(localStorage, LOCAL_KEY, all);
  return all[slug];
}

/**
 * Lee los contadores de varias guías.
 * @param {{slug:string, popularity:number}[]} guides
 * @returns {Promise<{counts: Record<string, number>, source: 'remote'|'local'}>}
 */
export async function loadViews(guides) {
  const seedFallback = () => ({
    counts: Object.fromEntries(guides.map((g) => [g.slug, g.popularity + localCount(g.slug)])),
    source: 'local',
  });
  if (MODE !== 'remote') return seedFallback();

  const cache = read(localStorage, CACHE_KEY, {});
  const fresh = (c) => c && Date.now() - c.ts < TTL_MS;
  const results = await Promise.all(
    guides.map(async (g) => {
      if (fresh(cache[g.slug])) return [g.slug, cache[g.slug].n];
      try {
        const n = await request(g.slug);
        setCache(g.slug, n);
        return [g.slug, n];
      } catch {
        return [g.slug, null];
      }
    })
  );
  // Si ninguna lectura funcionó → semilla. Si alguna sí, los que fallan (p. ej.
  // contadores aún sin crear) cuentan como 0 para no mezclar semillas y reales.
  if (results.every(([, n]) => n === null)) return seedFallback();
  return { counts: Object.fromEntries(results.map(([s, n]) => [s, n ?? 0])), source: 'remote' };
}

/**
 * Registra una visita (máx. 1 por pestaña/sesión y guía) y devuelve el total.
 * @returns {Promise<number|null>}
 */
export async function hit(slug, seed = 0) {
  const flag = `pmmo-hit-${slug}`;
  let already = false;
  try { already = sessionStorage.getItem(flag) === '1'; sessionStorage.setItem(flag, '1'); } catch { /* noop */ }

  if (MODE === 'remote') {
    try {
      const n = await request(slug, already ? '' : 'up');
      setCache(slug, n);
      return n;
    } catch { /* cae a local */ }
  }
  return seed + (already ? localCount(slug) : bumpLocal(slug));
}

export const counterMode = MODE;
