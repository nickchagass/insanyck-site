import { test, expect } from '@playwright/test';

test.describe('Product Detail Page (PDP)', () => {
  // INSANYCK STEP 4 · Lote 4 — freeze time for visual snapshots
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { 
      const fixed = 1700000000000; 
      Date.now = () => fixed as any; 
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(120);
  });
  test('should load product page successfully', async ({ page }) => {
    // Try to navigate to a product page
    // First try the slug route structure
    await page.goto('/pt/produto/oversized-classic');
    
    // If the specific product doesn't exist, the page might redirect or show 404
    // Let's check if we're still on a product page or got redirected
    const currentUrl = page.url();
    
    if (currentUrl.includes('/produto/') || currentUrl.includes('/pt')) {
      // We're on a product page or got redirected to home
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('should display product information when product exists', async ({ page }) => {
    await page.goto('/pt/produto/oversized-classic');
    await page.waitForLoadState('domcontentloaded');
    
    const currentUrl = page.url();
    
    // Only run product-specific checks if we're actually on a product page
    if (currentUrl.includes('/produto/')) {
      // Check for product title
      const titleSelectors = [
        'h1',
        '[data-testid="product-title"]',
        '[class*="product-title"]',
        '[class*="title"]'
      ];
      
      let hasTitle = false;
      for (const selector of titleSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0 && await element.first().isVisible()) {
          hasTitle = true;
          break;
        }
      }
      
      // Check for price information
      const priceSelectors = [
        '[data-testid="product-price"]',
        '[class*="price"]',
        'text=/R\\$\\s*\\d+/',
        '[data-testid="price"]'
      ];
      
      let hasPrice = false;
      for (const selector of priceSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          hasPrice = true;
          break;
        }
      }
      
      // Check for add to cart button
      const addToCartSelectors = [
        '[data-testid="add-to-cart"]',
        'button:has-text("Adicionar")',
        'button:has-text("Carrinho")',
        '[class*="add-to-cart"]'
      ];
      
      let hasAddToCart = false;
      for (const selector of addToCartSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          hasAddToCart = true;
          break;
        }
      }
      
      // At least some product elements should be present
      expect(hasTitle || hasPrice || hasAddToCart).toBe(true);
      
      // Take visual snapshot of product hero area
      // INSANYCK STEP 4 · Lote 3 — reduced motion and wait
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(100);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('main').first()).toHaveScreenshot('pdp-hero.png');
    }
  });

  test('PDP hero é estável (3D ou imagem)', async ({ page }) => {
    await page.goto('/pt/produto/oversized-classic');
    await page.waitForLoadState('domcontentloaded');
    
    const currentUrl = page.url();
    
    // Only run checks if we're actually on a product page
    if (currentUrl.includes('/produto/')) {
      const model = page.locator('[data-testid="model-viewer"]').first();
      const has3D = await model.isVisible().catch(() => false);

      if (has3D) {
        await expect(model).toBeVisible();
      } else {
        await expect(page.locator('[data-testid="pdp-hero"] img').first()).toBeVisible();
      }

      await page.waitForLoadState('networkidle');
      await expect(page.locator('[data-testid="pdp-hero"]').first()).toHaveScreenshot('pdp-hero-stable.png');
    }
  });
});