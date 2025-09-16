// INSANYCK STEP 4 · Lote 3 — A11y network noise block
import { Page } from '@playwright/test';

export async function blockThirdParties(page: Page) {
  const re = /(googletagmanager|google-analytics|analytics|facebook|hotjar|sentry|vercel-analytics|doubleclick)\./i;
  await page.route('**/*', route => {
    const url = route.request().url();
    if (re.test(url)) return route.abort();
    return route.continue();
  });
}