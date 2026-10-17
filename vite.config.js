import { defineConfig } from 'vite';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Multipágina: index.html + todo guides/*.html se detectan solos,
// así añadir una guía no obliga a tocar esta configuración.
const guidesDir = resolve(__dirname, 'guides');
const guideEntries = Object.fromEntries(
  readdirSync(guidesDir)
    .filter((f) => f.endsWith('.html'))
    .map((f) => [`guides/${f.replace('.html', '')}`, resolve(guidesDir, f)])
);

export default defineConfig({
  // Debe coincidir con el nombre del repositorio en GitHub Pages.
  base: '/PokeMMO-Guides-Hub/',
  build: {
    rollupOptions: {
      input: { main: resolve(__dirname, 'index.html'), ...guideEntries },
    },
  },
});
