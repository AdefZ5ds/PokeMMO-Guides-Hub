# Cambios de esta versión

## Ronda 5c · Tamaño fijo de líderes (rusheo)
- Todos los sprites de líderes miden 72×72 en PC y 48×48 en móvil.

## Ronda 5b · Rusheo: sprites grandes y nombres de lugares
- Sprites de líderes más grandes, a la izquierda del paso (≈3 líneas de alto; ≈2 si el paso es corto). Nuevos: Ciudad Teja (Brycen), Ciudad Arborada (Winona), Ciudad Azafrán (Sabrina), Ciudad Canal (Byron).
- Nombres de lugares corregidos según WikiDex (solo en la guía de rusheo): Esmalta→Esmalte, Algararia→Algaria, Ciudad Arrecípolis→Arrecípolis, Ciudad Lavacalda→Pueblo Lavacalda, Jubilife→Jubileo, Canalave→Canal, Celestic→Caelestis, Pueblo Villa Raíz→Villa Raíz, Belsprout→Bellsprout, Radio Torre→Torre Radio, Faro Olivo→Faro de Olivo, Beturia→Vetusta/Vetusto, Tormellera→Teja (deducido por el contexto).

## Ronda 5 · Rusheo: líderes y botón por tramo
- Guía de rusheo: sprite del líder junto a cada "Gimnasio de …" (mismo tamaño que los Pokémon 1-4). Tabla `LEADERS` en `scripts/render-rusheo.mjs`; sin sprite (por dudas): Ciudad Arborada, Ciudad Tormellera, Ciudad Algararia y Ciudad Azafrán.
- Botón "Marcar/Desmarcar tramo" en cada uno de los 30 tramos; se guarda con el progreso.

## Ronda 4c · Pestañas en el lateral
- Las pestañas de las guías (secciones, regiones, jugadores PJ1-4) ahora viven en el índice lateral y cambian el contenido; ya no hay barras de pestañas arriba. Las guías sin pestañas enlazan a sus títulos.
- Guía de RED: el índice solo muestra Resumen, Equipo y Estrategia (sin "Generación 1-5").
- La pestaña seleccionada ahora se ve resaltada (antes no tenía estilo).

## Ronda 4b · Índice lateral y velocidad
- Todas las guías con 2+ secciones tienen índice lateral fijo a la izquierda (escritorio) o botones en filas (móvil), con la sección activa resaltada (`assets/js/toc.js`).
- Portada: sprites estáticos (antes 26 GIF animados a la vez), vídeo (≈7 MB) se pide solo al terminar de cargar y no en conexión lenta/ahorro de datos, fuentes sin bloquear el pintado, módulos cargados en paralelo.
- Guías: las secciones fuera de pantalla no se pintan hasta acercarse (`content-visibility`).

## Ronda 4 · Rediseño por objetivos
- Portada nueva: texto de presentación, buscador + botón "Filtros" (solo orden) y vídeo en un marco; debajo, 5 objetivos con su fila de portadas en cuadrícula (sin barra de desplazamiento horizontal).
- Objetivos: Derrotar jefes y raids · Farmear · Completar regiones · Criar y entrenar · Aprender lo básico. Cada guía tiene `goal` en `assets/data/guides.json` (cambia ahí el reparto).
- Plantilla de guías: migas de pan y etiqueta apuntan al objetivo; nuevas tipografías (Bricolage Grotesque + Hanken Grotesk).
- Textos nuevos en es/en/zh (`goals.*`, `hero.*`). Tema por defecto: el del sistema (claro si no hay preferencia).
- Las categorías antiguas ya no se muestran en la interfaz (siguen en los datos).

## Pedidos
- **GIF en Android**: los sprites animados ahora están dentro del proyecto (`public/img/sprites/`) y ya no dependen de raw.githubusercontent.com. Además, ya no se congelan solos con «reducir movimiento» (Android lo activa con el ahorro de batería o «quitar animaciones»): hay un botón 🎞️ en la barra para pausarlos, y la preferencia se guarda en el navegador. Causa no comprobada en un Android real: se probó con una emulación móvil con «reducir movimiento» activado.
- **Rusheo**: sprites de objetos en los objetos equipados (Restos, Cint. Negra, Antederretir, Pañl. Seda…) y en los objetos de inventario citados en pasos y consejos (MO Corte/Surf/Golpe Roca/Fuerza/Vuelo…, Bici, Bici Acrobática, Regadera, Repelente, Poción Secreta, Té, Dientes de Oro, Llaves).
- **Inicio (móvil/tablet, < 1024 px)**: botón hamburguesa que despliega bajo la barra la Lista de Guías, el buscador, los filtros por categoría y el orden.
- **Guías nuevas** (solo español, con aviso en en/zh): *Raid de Cresselia V2 (12 turnos)* y *Farmeo de gimnasios 2026 · Dancing Volcano*. Cada una incluye el PDF original en `public/docs/`.

## Bugs corregidos
- La portada llamaba a `spriteError`, que no existía (error de Alpine en consola al fallar un sprite). Ahora existe y muestra el emoji de respaldo.
- Las portadas hacían peticiones vacías (`src=""`) a imágenes ocultas.
- La guía de farmeo de gimnasios dejaba una caja vacía (`callout`) al final.
- El crédito de la guía de farmeo de gimnasios decía «Adef» (autor del archivo PDF); el banner del PDF y la descripción dicen «Ander».

## Pendiente / a tener en cuenta
- «Farmeo de gimnasios 2026» es una versión nueva (29/08/2026) de la misma guía de Ander que ya estaba publicada, con otro equipo (entra Heatran). Se agregó aparte, como se pidió.
- En ambas guías nuevas, varios objetos equipados aparecen en el PDF solo como icono y no se transcribieron (se indica en la página).
- Texto de Heatran en el PDF de farmeo: marrón oscuro sobre fondo oscuro, difícil de leer; revisar contra el PDF.
- **Líderes de gimnasio**: la guía nueva usa los sprites de Pokémon Showdown, igual que la otra guía de farmeo. Si uno no carga, se usa una copia local extraída del PDF (public/img/trainers) y, en último caso, un emoji.

## Segunda ronda
- **Cards de farmeo (las dos guías)**: cada gimnasio es una card alta; los «RESET en el CP» y «Cambiar a…» quedan como barras finas pegadas debajo de la card a la que siguen. 2 columnas en tablet/escritorio, 1 en móvil.
- **Sprites 100 % desde librería**: Pokémon (GIF) y objetos se cargan de jsDelivr (PokeAPI/sprites); si falla, de raw.githubusercontent y luego el PNG estático. Líderes: Pokémon Showdown. Se borraron `public/img/sprites/pokemon`, `still` y los iconos de objetos. Se quedan solo las dos Ocarinas y `public/img/trainers` (copias de respaldo de líderes extraídas del PDF).
- **Créditos**: la guía «Farmeo de gimnasios 2026» cita a parzivalmmo · Dancing Meloetta (enlace) como fuente original.
- **Inicio**: categorías y orden quedan ocultos tras un botón «Filtros» desplegable (cerrado por defecto).
- **Limpieza**: eliminadas las carpetas `.git` y `.github` (publicas con `npm run build`).

## Tercera ronda
- **Cards de farmeo**: las dos cards de una misma fila ahora miden lo mismo (la corta se estira) y las barras de RESET / cambio de objeto quedan debajo de su card.
- **Sprites en las notas (las dos guías de farmeo)**: cada vez que un texto nombra un Pokémon (notas, avisos de «Curar…» y cambios de objeto) se muestra solo su sprite, sin aro (aliado/rival solo consta en el texto alternativo del sprite). Si un sprite no carga (o no existe, como Rotom-Podadora), aparece el nombre en texto.
