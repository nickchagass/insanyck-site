// INSANYCK STEP 10 — Tipagem estrita i18next (todos os namespaces reais)
import 'i18next';

import common from '../../public/locales/pt/common.json';
import nav from '../../public/locales/pt/nav.json';
import home from '../../public/locales/pt/home.json';
import product from '../../public/locales/pt/product.json';
import pdp from '../../public/locales/pt/pdp.json';
import plp from '../../public/locales/pt/plp.json';
import catalog from '../../public/locales/pt/catalog.json';
import cart from '../../public/locales/pt/cart.json';
import bag from '../../public/locales/pt/bag.json';
import checkout from '../../public/locales/pt/checkout.json';
import account from '../../public/locales/pt/account.json';
import wishlist from '../../public/locales/pt/wishlist.json';
import search from '../../public/locales/pt/search.json';
import order from '../../public/locales/pt/order.json';
import ui from '../../public/locales/pt/ui.json';
import admin from '../../public/locales/pt/admin.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      nav: typeof nav;
      home: typeof home;
      product: typeof product;
      pdp: typeof pdp;
      plp: typeof plp;
      catalog: typeof catalog;
      cart: typeof cart;
      bag: typeof bag;
      checkout: typeof checkout;
      account: typeof account;
      wishlist: typeof wishlist;
      search: typeof search;
      order: typeof order;
      ui: typeof ui;
      admin: typeof admin;
    };
  }
}
