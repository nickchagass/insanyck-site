// INSANYCK STEP 4 · Lote 4 — PWA manifest test
import { test, expect } from '@playwright/test';

test.describe('PWA Manifest', () => {
  test('should have manifest link in HTML head', async ({ page }) => {
    await page.goto('/');
    
    // Check for manifest link
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);
    
    const href = await manifestLink.getAttribute('href');
    expect(href).toBe('/manifest.json');
  });

  test('should serve valid manifest.json', async ({ page, request }) => {
    // Fetch the manifest
    const response = await request.get('/manifest.json');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    
    const manifest = await response.json();
    
    // Check required PWA manifest fields
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBeTruthy();
    expect(manifest.theme_color).toBeTruthy();
    expect(manifest.background_color).toBeTruthy();
    
    // Check icons array
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThan(0);
    
    // Validate each icon has required properties
    for (const icon of manifest.icons) {
      expect(icon.src).toBeTruthy();
      expect(icon.sizes).toBeTruthy();
      expect(icon.type).toBeTruthy();
    }
  });

  test('should have valid icon paths', async ({ page, request }) => {
    // Get manifest first
    const manifestResponse = await request.get('/manifest.json');
    const manifest = await manifestResponse.json();
    
    // Check that icon files actually exist
    for (const icon of manifest.icons) {
      const iconResponse = await request.get(icon.src);
      expect(iconResponse.status()).toBe(200);
      expect(iconResponse.headers()['content-type']).toMatch(/image\/(png|jpeg|webp|svg)/);
    }
  });

  test('should have valid screenshots if present', async ({ page, request }) => {
    const manifestResponse = await request.get('/manifest.json');
    const manifest = await manifestResponse.json();
    
    // Screenshots are optional, but if present should be valid
    if (manifest.screenshots && manifest.screenshots.length > 0) {
      for (const screenshot of manifest.screenshots) {
        expect(screenshot.src).toBeTruthy();
        expect(screenshot.sizes).toBeTruthy();
        expect(screenshot.type).toBeTruthy();
        
        // Check that screenshot files exist
        const screenshotResponse = await request.get(screenshot.src);
        expect(screenshotResponse.status()).toBe(200);
        expect(screenshotResponse.headers()['content-type']).toMatch(/image\/(png|jpeg|webp)/);
      }
    }
  });

  test('should have proper start_url that loads correctly', async ({ page, request }) => {
    const manifestResponse = await request.get('/manifest.json');
    const manifest = await manifestResponse.json();
    
    // Navigate to the start_url
    await page.goto(manifest.start_url);
    
    // Should load successfully
    await expect(page).toHaveTitle(/.+/); // Should have some title
    await page.waitForLoadState('domcontentloaded');
    
    // Should not be an error page
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('404');
    expect(bodyText).not.toContain('Not Found');
  });
});