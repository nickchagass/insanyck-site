// INSANYCK STEP 4 · Lote 3 — Playwright A11y config
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/a11y',
  timeout: 30 * 1000,

  // INSANYCK STEP 4 · Lote 3 — A11y com DOM estável (timeout estendido)
  expect: { timeout: 10000 },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['list'], ['html', { outputFolder: 'playwright-report-a11y' }]]
    : 'list',

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3001',
    locale: 'pt-BR',
    viewport: { width: 1366, height: 900 },
    trace: 'retain-on-failure',
    video: 'off',
    screenshot: 'only-on-failure',
    actionTimeout: 15 * 1000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: {
    command: 'npm run build && npm start',
    port: 3000,
    reuseExistingServer: true,
  },

  outputDir: 'test-results-a11y/',
});