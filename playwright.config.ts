// INSANYCK STEP 4 · Lote 3 — Playwright E2E/Visual config final
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? "http://localhost:3001";

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,

  expect: {
    timeout: 5000,
    toHaveScreenshot: {
      // 0,3% de tolerância visual
      threshold: 0.003,
      maxDiffPixels: 1000,
    },
  },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['list'], ['html', { outputFolder: 'playwright-report' }]]
    : 'list',

  use: {
    baseURL,
    locale: 'pt-BR',
    viewport: { width: 1366, height: 900 },
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 15 * 1000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: process.env.CI ? undefined : {
    command: 'npm run dev -- -p 3001',
    port: 3001,
    reuseExistingServer: !process.env.CI,
  },

  outputDir: 'test-results/',
});