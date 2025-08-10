// INSANYCK STEP 4
import 'i18next';

import common from '../../public/locales/pt/common.json';
import nav from '../../public/locales/pt/nav.json';
import home from '../../public/locales/pt/home.json';
import product from '../../public/locales/pt/product.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      nav: typeof nav;
      home: typeof home;
      product: typeof product;
    };
  }
}
