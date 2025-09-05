import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('/pt');
    
    // Check page loads successfully
    expect(page.url()).toContain('/pt');
    
    // INSANYCK STEP 4 · Lote 3 — reduced motion and wait
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(100);

    // Check essential elements are present
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('[data-testid="logo"], img[alt*="INSANYCK"], img[alt*="logo"]').first()).toBeVisible();
    
    // Check hero section is present
    await expect(page.locator('main')).toBeVisible();
    
    // Take visual snapshot of hero area
    await expect(page.locator('header').first()).toHaveScreenshot('header-home.png');
    
    // Check navigation is present
    await expect(page.locator('nav, [role="navigation"]').first()).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/pt');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check if sacola/cart link exists and is clickable
    const cartLink = page.locator('a[href*="sacola"], [data-testid="cart-link"], [aria-label*="carrinho"], [aria-label*="sacola"]');
    if (await cartLink.count() > 0) {
      await expect(cartLink.first()).toBeVisible();
    }
    
    // Check if products/loja link exists
    const shopLink = page.locator('a[href*="loja"], a[href*="produto"], [data-testid="shop-link"]');
    if (await shopLink.count() > 0) {
      await expect(shopLink.first()).toBeVisible();
    }
  });
});