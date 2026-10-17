# PokeMMO Guides Hub

Sitio estático multipágina con guías de la comunidad de PokeMMO. Español (principal), inglés y chino simplificado; tema oscuro/claro; buscador, filtros por categoría, orden y contador de visitas por guía.

> Sitio comunitario no oficial. Sin afiliación con PokeMMO, Nintendo ni Game Freak.

## Stack y decisiones técnicas

| Pieza | Elección | Por qué |
|---|---|---|
| Bundler | Vite (multipágina) | `guides/*.html` se detectan solos en `vite.config.js`. |
| CSS | Tailwind v3 + variables CSS | Los colores del tema viven en variables (`styles.css`), así no se duplican clases `dark:`. |
| i18n | i18next + language-detector | Los 3 JSON se empaquetan (sin peticiones extra). Orden de detección: elección guardada → idioma del navegador → `es`. |
| Interactividad | Alpine.js solo en la portada | Se carga con `import()` dinámico; las guías no lo descargan. |
| Iconos | `lucide` (tree-shaken) | Solo se empaquetan los iconos usados (`assets/js/icons.js`). |
| Sprites | PokeAPI sprites, `loading="lazy"` | Si falla la imagen, se muestra el emoji de la guía. |
| Guías | Generadas con `scripts/generate-guides.mjs` | Una única plantilla; los HTML se versionan en `guides/`. |

## Uso

```bash
npm install
npm run dev        # servidor de desarrollo
npm run build      # genera las guías y construye dist/
npm run preview    # sirve dist/ en local
```

`npm run gen` regenera solo `guides/*.html`.

## Contador de visitas

Servicio elegido: **CounterAPI** (`assets/js/counter.js`), un contador por slug con espacio de nombres `pokemmo-guides-hub`.

- **Por defecto (`local`):** popularidad semilla de `guides.json` + visitas de ese navegador. **Modo `remote`:** opt-in con `VITE_COUNTER_MODE=remote`; hoy no recomendado (ver aviso).
- **Desarrollo:** modo `local` (localStorage) para no contaminar los datos reales.
- **Fallback:** si la API falla, se usa la `popularity` de `guides.json` + visitas locales.
- Variables: `VITE_COUNTER_MODE` (`remote`|`local`) y `VITE_COUNTER_BASE` (ver `.env.example`).

> ⚠️ **Contador, estado a 16/10/2026:** la API V1 de CounterAPI está deprecada (según su documentación). En V2 la prueba del autor del proyecto dio `404 Workspace not found` en el navegador y el propio panel de CounterAPI (pestaña «API Usage» del contador `prueba`) muestra todas las operaciones (`up`, `down`, get y `stats`) con `Authorization: Bearer YOUR_API_KEY`. Sumar visitas desde una web estática exigiría publicar esa clave, así que **no se usa** y el modo por defecto es `local`. Pendiente: elegir otra solución (proxy propio, p. ej. un Worker, u otro proveedor); ninguna está verificada todavía.

## Despliegue en GitHub Pages

1. Crea el repositorio `PokeMMO-Guides-Hub` (el nombre debe coincidir con `base` en `vite.config.js`; si usas otro, cámbialo).
2. En *Settings → Pages* elige **Source: GitHub Actions**.
3. Haz push a `main`: `.github/workflows/deploy.yml` construye y publica.

## Cómo añadir una guía

1. Añade una entrada en `assets/data/guides.json` → `guides`: `slug`, `title`, `description` (ES), `category`, `tags`, `lang`, `sprite` (nº de Pokédex para PokeAPI), `emoji`, `added` (YYYY-MM-DD), `popularity` (semilla) y, si es externa, `externalUrl`.
2. Escribe su contenido en `scripts/guide-bodies.mjs` (`intro`, `sections`, `verify`). Si es solo un enlace externo, no hace falta.
3. Añade título y descripción en `locales/en.json` y `locales/zh.json` bajo `guides.<slug>`. Si falta una traducción se muestra el texto en español.
4. Ejecuta `npm run gen`. El contador se inicia solo con el slug.

Las guías externas de ejemplo usan `example.com` (`placeholderUrl: true`): **reemplázalas por enlaces reales** y quita ese campo.

## Guías interactivas a partir de un PDF

`derrotar-red` se generó desde un PDF de la comunidad (créditos en la propia guía). Sus datos están en `scripts/content/derrotar-red.json` y se renderizan con `scripts/render-red.mjs`; `assets/js/gallery.js` (componente reutilizable) construye la galería de sprites con detalle desplegable, filtro por generación, vista Galería/Lista y enlaces directos (`#excadrill`); sin JS se ve la lista. El PDF original se sirve desde `public/docs/`. Para otra guía con diseño propio: crea su JSON + renderizador y regístralo en `custom` dentro de `scripts/generate-guides.mjs`.

`raid-meloetta` (raid de 4 jugadores) usa `scripts/content/raid-meloetta.json` + `scripts/render-meloetta.mjs` + `assets/js/raid.js` (pestañas por jugador y «modo combate» turno a turno). Las tarjetas de equipo son compartidas (`scripts/lib/cards.mjs`). No se aloja su PDF original (el documento no indica permiso de redistribución).

`farmeo-gimnasios` (farmeo por región) usa `scripts/content/farmeo-gimnasios.json` + `scripts/render-farmeo.mjs` + `assets/js/farmeo.js` (pestañas por región con enlace `#region`). Los 5 mapas (`public/img/farmeo/`) se extrajeron del PDF por decisión del autor del proyecto; el PDF no indica permiso de redistribución, así que conviene confirmarlo con el autor (Ander) o quitarlos. Los sprites de líderes vienen del directorio de sprites de entrenadores de Pokémon Showdown (créditos a sus artistas); solo se verificaron 10 nombres de archivo, el resto tiene icono de respaldo.

`farmeo-hooh` usa `scripts/content/farmeo-hooh.json` + `scripts/render-hooh.mjs` y reutiliza `assets/js/farmeo.js` (pestañas Resumen/Equipo/Turnos). La portada (`public/img/farmeo/hooh-portada.webp`) se aloja por decisión del autor del proyecto; el PDF no indica permiso de redistribución. Rotom (Horno) usa el sprite PokeAPI 10008 (verificado visualmente).

`rusheo-multiregion` usa `scripts/content/rusheo.json` + `scripts/render-rusheo.mjs` + `assets/js/rusheo.js` (casillas por paso con progreso guardado en localStorage; pestañas por fase vía `farmeo.js`). El equipo (Starmie, Cloyster, Sawk, Porygon-Z) lo indicó el autor del proyecto; sus datos son provisionales y se editan en el JSON. Las 5 ilustraciones (`public/img/rusheo/`) vienen del PDF, de autor desconocido y sin licencia indicada; conviene confirmar permiso o quitarlas. El enlace oficial está en `creditUrl` del JSON (facilitado por el autor del proyecto, no verificado).

## Accesibilidad

Skip link, `aria-current`, breadcrumbs, `aria-pressed` en chips, región `role="status"` para resultados, foco visible, `prefers-reduced-motion`, `alt` en sprites, `lang` dinámico y contraste AA calculado para la paleta (ver `styles.css`). Esc limpia el buscador. Resultados de Lighthouse en «Estado de verificación».

## Estado de verificación

- ✅ `npm run build` y pruebas con navegador (búsqueda, filtros, URL params, cambio de idioma, tema, contador con fallback, sin errores de consola).
- Lighthouse (`vite preview` local, sin acceso a Google Fonts ni CounterAPI en el entorno de prueba), medido el 15/10/2026 con la portada actual (28+ guías):
  - **Escritorio:** Performance **96–100** (3 mediciones), CLS 0,017. Antes del arreglo era 84 por un desplazamiento de diseño de 0,236 (la lista de populares aparecía tras cargar el JS; ahora se reserva su altura).
  - **Móvil (throttling por defecto):** Performance **76–84**, varía mucho entre mediciones; TBT ≈ 500–980 ms, causado por el script de la portada (Alpine). Se mejoró pintando solo 9 tarjetas al inicio y el resto en reposo, pero **no llega de forma fiable a 90 en móvil**. Si hace falta, el siguiente paso es generar la rejilla como HTML estático y dejar Alpine solo para filtros.
  - Las cifras de Accessibility/Best Practices/SEO de la portada (100/96/100) son de la medición anterior; no las repetí.
  - La carga <2 s en 3G simulado no se midió por separado.
- ⚠️ El contenido de las guías es general y marcado «Datos por verificar»; no contiene datos específicos de PokeMMO confirmados.
- Favicon: SVG (`public/favicon.svg`).

## Créditos

Sprites © PokeAPI; iconos Lucide; tipografía Inter (Google Fonts).

## Carpeta `_legacy/`

Contiene archivos de un intento anterior del proyecto (12/oct) que no se sobrescribieron: guías, `partials/`, scripts y JS antiguos. No se usan en el build; revísalos y borra o reutiliza lo que quieras.

## Cambios de interfaz (octubre 2026)
- **Móvil:** corregido el desborde de la portada (columnas de grid con `minmax(0,1fr)`); la tabla de turnos de Ho-Oh pasa a tarjetas de 3 columnas en pantallas pequeñas (ya se ve Chandelure). Probado sin scroll horizontal a 360, 390 y 768 px.
- **Hero estilo Genshin:** vídeo de fondo (`public/video/hero.mp4`, sin audio, con póster), velo oscuro, botón central y buscador; botón de pausa y respeto de «reducir movimiento».
- **Galería de portadas** en la portada (`public/img/portadas/`). Las guías sin portada usan un degradado por categoría con su sprite. Asociación imagen↔guía: campo `image` en `assets/data/guides.json`.
- **Banner estilo Netflix** en cada guía (`public/img/banners/`); sin imagen, degradado por categoría.
- **Pestañas** en RED y en las guías generales con 2+ secciones (reutiliza `assets/js/farmeo.js`).
- **RED:** los Pokémon del equipo se muestran como chips (sprite sobre el nombre) en todos los pasos; la selección de la galería ya no se guarda (ni en localStorage ni en la URL).
- **Enlaces sin subrayado** en todo el proyecto (solo color; el foco de teclado sigue visible).
- Imágenes convertidas a WebP; el vídeo original (1,3 MB, con audio) se recodificó a ~0,5 MB.
