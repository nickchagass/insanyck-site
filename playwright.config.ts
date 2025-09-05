import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI 
    ? [['list'], ['html', { outputFolder: 'playwright-report' }]]
    : 'list',
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    locale: 'pt-BR',
    viewport: { width: 1366, height: 900 },
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 15 * 1000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },

  // Configure snapshots
  expect: {
    toHaveScreenshot: {
      threshold: 0.3,
      maxDiffPixels: 1000,
    },
  },

  // INSANYCK STEP 4 · Lote 3 — Global test directory includes both e2e and a11y
  testDir: './tests',
  testMatch: ['**/*.spec.ts'],

  outputDir: 'test-results/',
});