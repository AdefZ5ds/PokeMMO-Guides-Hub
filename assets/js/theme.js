// Tema claro/oscuro. La clase inicial se aplica con un script inline en <head>
// (evita el "flash"); aquí solo se gestiona el botón y la persistencia.
import { t } from './i18n.js';

const KEY = 'pmmo-theme';
const root = document.documentElement;

export const isDark = () => root.classList.contains('dark');

function save(value) {
  try { localStorage.setItem(KEY, value); } catch { /* modo privado: ignorar */ }
}

export function updateThemeLabel() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.setAttribute('aria-label', t(isDark() ? 'a11y.themeToLight' : 'a11y.themeToDark'));
  btn.setAttribute('aria-pressed', String(isDark()));
}

export function initTheme() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    root.classList.toggle('dark');
    save(isDark() ? 'dark' : 'light');
    updateThemeLabel();
  });
  // Si el usuario nunca eligió, seguir los cambios del sistema.
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', (e) => {
    let stored = null;
    try { stored = localStorage.getItem(KEY); } catch { /* noop */ }
    if (!stored) { root.classList.toggle('dark', e.matches); updateThemeLabel(); }
  });
  updateThemeLabel();
}
