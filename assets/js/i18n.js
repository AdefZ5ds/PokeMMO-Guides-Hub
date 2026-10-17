// i18n con i18next. Los 3 idiomas se empaquetan (≈ pocos KB) para evitar
// peticiones extra y parpadeos de texto sin traducir.
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import es from '../../locales/es.json';
import en from '../../locales/en.json';
import zh from '../../locales/zh.json';

export const SUPPORTED = ['es', 'en', 'zh'];
export const LANG_KEY = 'pmmo-lang';

export const ready = i18next.use(LanguageDetector).init({
  resources: { es: { translation: es }, en: { translation: en }, zh: { translation: zh } },
  fallbackLng: 'es', // español = idioma principal
  supportedLngs: SUPPORTED,
  nonExplicitSupportedLngs: true, // "zh-CN" → "zh", "en-US" → "en"
  load: 'languageOnly',
  interpolation: { escapeValue: false },
  detection: {
    // 1) elección guardada, 2) idioma del navegador, 3) fallback es.
    // Para forzar siempre español en la primera visita: order: ['localStorage'].
    order: ['localStorage', 'navigator'],
    lookupLocalStorage: LANG_KEY,
    caches: ['localStorage'],
  },
});

export const t = (key, opts) => i18next.t(key, opts);
export const currentLang = () => {
  const l = (i18next.resolvedLanguage || i18next.language || 'es').slice(0, 2);
  return SUPPORTED.includes(l) ? l : 'es';
};

/** Traduce todo [data-i18n] / [data-i18n-attr="attr:clave;attr2:clave2"] bajo `root`. */
export function applyTranslations(root = document) {
  document.documentElement.lang = currentLang();
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    // data-i18n-default: texto canónico (ES) si falta la clave en el idioma activo
    el.textContent = t(el.dataset.i18n, { defaultValue: el.dataset.i18nDefault });
  });
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    });
  });
  const select = document.getElementById('lang-select');
  if (select) select.value = currentLang();
}

export async function setLang(lng) {
  if (!SUPPORTED.includes(lng)) return;
  await i18next.changeLanguage(lng); // el detector lo persiste en localStorage
  applyTranslations();
  window.dispatchEvent(new CustomEvent('langchange', { detail: currentLang() }));
}
