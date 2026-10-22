// Lucide tree-shaken: solo se empaquetan los iconos importados aquí.
import {
  Search, Sun, Moon, Eye, Flame, Sparkles, Inbox, ChevronRight, ExternalLink,
  Languages, ArrowRight, ArrowLeft, Info, X, TriangleAlert, House, ArrowDown, Pause, Play, Menu,
} from 'lucide';

const ICONS = {
  search: Search, sun: Sun, moon: Moon, eye: Eye, flame: Flame, sparkles: Sparkles,
  inbox: Inbox, 'chevron-right': ChevronRight, 'external-link': ExternalLink,
  languages: Languages, 'arrow-right': ArrowRight, 'arrow-left': ArrowLeft,
  info: Info, x: X, 'alert': TriangleAlert, home: House, 'arrow-down': ArrowDown, pause: Pause, play: Play, menu: Menu,
};

/** Devuelve un <svg> decorativo (aria-hidden) como string. */
export function icon(name, cls = 'icon') {
  const node = ICONS[name];
  if (!node) return '';
  const inner = node
    .map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')}/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
}

/** Sustituye <span data-icon="nombre"> por su SVG. */
export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    el.innerHTML = icon(el.dataset.icon, el.dataset.iconClass || 'icon');
  });
}
