// INSANYCK STEP 4
// next-i18next configuration centralizada para Pages Router (SSR/SSG)
const path = require('path');

const config = {
  // Parte lida pelo Next (routing / locale prefix)
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en'],
  },

  // Parte lida pelo i18next/next-i18next
  // Namespaces e opções de fallback
  defaultNS: 'common',
  ns: ['common', 'nav', 'home', 'product'],
  fallbackLng: 'en', // EN é o fallback global
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  localePath: path.resolve('./public/locales'),
  returnNull: false, // evita retornar null em chaves não encontradas
};

module.exports = config;
