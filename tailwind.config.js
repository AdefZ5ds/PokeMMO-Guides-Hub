/** @type {import('tailwindcss').Config} */
// Los colores salen de variables CSS (ver assets/css/styles.css) para que el
// cambio claro/oscuro no obligue a duplicar clases `dark:` en cada elemento.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './guides/**/*.html',
    './assets/js/**/*.js',
    './scripts/**/*.mjs',
  ],
  theme: {
    extend: {
      colors: {
        bg: v('bg'),
        surface: v('surface'),
        line: v('line'),
        fg: v('fg'),
        muted: v('muted'),
        accent: v('accent'),
        'accent-strong': v('accent-strong'),
        'accent-text': v('accent-text'),
        gold: v('gold'),
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
