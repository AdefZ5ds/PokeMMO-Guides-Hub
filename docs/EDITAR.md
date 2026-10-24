# Cómo editar el sitio (emojis, colores, estilos, imágenes…)

Guía rápida para tocar lo visual sin perderte. Regla general: **editas un archivo → corres `npm run dev` para verlo en vivo (o `npm run build` para generar todo) → subes con Git.**

> Las páginas de `guides/` se **generan** desde `scripts/` y `assets/data/guides.json`. No las edites a mano: tus cambios se pierden en el siguiente `npm run build`.

## 1. Emojis

| Qué quieres cambiar | Dónde |
|---|---|
| Emoji de una guía (aparece si falla su sprite) | `assets/data/guides.json` → campo `"emoji"` de esa guía |
| Emoji de una categoría (chips de filtro) | `assets/data/guides.json` → lista `"categories"` → `"emoji"` |
| Emojis de los tipos de gimnasio (🔥💧🌿…) | `scripts/render-farmeo.mjs` → constante `TYPE_EMOJI` |
| Emojis de las regiones del rusheo (🌸🏙️🌊…) | `scripts/render-rusheo.mjs` → constante `REGION_EMOJI` |
| Emojis sueltos de títulos y avisos (🙏 Créditos, ⚠️ Datos por verificar, 🔥 …) | Búscalos con `Ctrl+Shift+F` (por ejemplo `🙏`) dentro de `scripts/` e `index.html` y cámbialos |
| Iconos de interfaz (lupa, sol/luna, flechas) | No son emojis: son iconos Lucide, en `assets/js/icons.js` |

## 2. Colores

- **Colores del tema (claro/oscuro):** `assets/css/styles.css`, bloques `:root { … }` (claro) y `:root.dark { … }` (oscuro). Están en formato RGB con espacios (`59 130 246`). Cambiando `--accent`, `--accent-strong` y `--accent-text` cambias el azul de toda la web. Mantén buen contraste (texto normal ≥ 4,5:1).
- **Colores de resaltado en las guías** (`{r:texto}` en los JSON de `scripts/content/`): clases `.hl-r`, `.hl-g`, `.hl-b`, `.hl-p`, `.hl-c`, `.hl-k`, `.hl-y`, `.hl-o`, `.hl-m`, `.hl-n` al final de `styles.css`. Cada una tiene su versión para modo oscuro (`.dark .hl-…`).
- **Color de los movimientos en «Gimnasios → Rutas por región»:** sale del tipo del Pokémon. En `scripts/content/farmeo-gimnasios.json`, cada Pokémon de `"mons"` tiene un `"type"` (Hielo, Agua, Fuego…). La tabla tipo → color es `TYPE_HL` en `scripts/render-farmeo.mjs`.
- **Degradados de las guías sin portada:** clases `.cov-basics`, `.cov-breeding`… en `styles.css` (`--c1` y `--c2` son los dos colores).
- **IVs 31 / EVs 252 en verde lima:** clase `.stat-max` en `styles.css`.

## 3. Estilos y diseño

- **Botones, chips, tarjetas, avisos:** `styles.css`, sección `@layer components` (`.btn-primary`, `.chip`, `.card`, `.callout`, `.badge-gold`…).
- **Hero del inicio (video, velo, botones de cristal):** `index.html` (sección «HERO») y, en `styles.css`, `.hero-veil` (oscuridad del velo) y `.glass`.
- **Fondo general del inicio:** `styles.css`, bloque `body.home-bg`. El número `.86` es la opacidad del velo: sube → fondo más apagado; baja → se ve más la imagen. Para quitar el fondo, borra `class="home-bg"` de `<body>` en `index.html`.
- **Banner de cada guía:** plantilla en `scripts/generate-guides.mjs` (busca `Banner estilo Netflix`). Alturas: `min-h-[15rem] sm:min-h-[20rem] lg:min-h-[24rem]`.
- **Footer:** estructura en `index.html` y en `scripts/generate-guides.mjs` (busca `<footer`); textos en `locales/es.json`, `en.json` y `zh.json` bajo `"footer"`.
- **Tipografía:** Inter desde Google Fonts (enlace en el `<head>` de `index.html` y de `generate-guides.mjs`) y `fontFamily` en `tailwind.config.js`.
- **Clases de Tailwind:** se escriben directo en el HTML (por ejemplo `text-xl font-bold rounded-xl`). Escríbelas completas (no armes nombres con variables) o Tailwind no las detecta.

## 4. Imágenes, video y sprites

| Qué | Dónde |
|---|---|
| Video del hero | `public/video/hero.mp4` (sin audio) y su imagen de respaldo `public/video/hero-poster.webp` |
| Fondo general del inicio | `public/img/fondo-inicio.webp` (se enlaza en `styles.css`) |
| Portada de una guía (galería del inicio) | `public/img/portadas/<nombre>.webp` |
| Banner de una guía | `public/img/banners/<nombre>.webp` |
| Asociar portada/banner a una guía | `assets/data/guides.json` → campo `"image": "<nombre>"` (sin extensión) |
| Sprite de una guía (cuando no tiene portada) | `guides.json` → campo `"sprite"` = número de Pokédex |
| Sprites animados (GIF Gen 5) | Alojados en `public/img/sprites/pokemon/<dex>.gif` (estáticos de respaldo en `sprites/still/<dex>.png`). Para un Pokémon nuevo, copia ahí su GIF y su PNG de PokeAPI |
| Iconos de objetos | Archivos en `public/img/sprites/items/`; el nombre en español → archivo se define en `scripts/lib/cards.mjs` (`ITEM_ICON`, y `BAG` para MO, Bici, Repelente… dentro de los pasos del rusheo) |
| Sprites de líderes de gimnasio | `public/img/trainers/<id>.webp` (se usan si existen; si no, Pokémon Showdown) |

Convertir una imagen a WebP ligero (necesitas Python con Pillow): abre la imagen, redimensiónala y guárdala con `quality=80`. Para recomprimir el video con ffmpeg:

```bash
ffmpeg -i entrada.mp4 -an -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart public/video/hero.mp4
```

## 5. Textos y traducciones

- **Texto en español de cada guía:** `assets/data/guides.json` (título y descripción) y, para guías con contenido propio, `scripts/content/*.json`. Las generales cortas están en `scripts/guide-bodies.mjs`.
- **Inglés y chino:** `locales/en.json` y `locales/zh.json` (títulos/descripciones bajo `guides.<slug>`).
- **Textos de la interfaz:** `locales/*.json`.

## 6. Datos de las tarjetas de equipo (PokePaste)

Los equipos viven en los JSON de `scripts/content/` (por ejemplo, el de rusheo es `rusheo.json`; sus datos son **provisionales**). Cada Pokémon lleva `name`, `dex` (número de Pokédex), `level`, `item`, `ability`, `nature`, `ivs`, `evs` y `moves`. Un guion `"-"` significa «no relevante». Los IVs `"31"` y EVs `"252"` salen en verde lima solos.

## 7. Comandos útiles

```bash
npm run dev      # servidor local con recarga automática
npm run gen      # regenera solo guides/
npm run build    # genera guías + compila a dist/
npm run preview  # sirve dist/ para probar el resultado final
```

Para publicar: `npm run build` y sube el contenido de `dist/` a tu hosting (se quitó el despliegue automático de GitHub Actions).
