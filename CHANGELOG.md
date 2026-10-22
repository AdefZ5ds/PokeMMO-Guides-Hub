# Cambios de esta versión

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
