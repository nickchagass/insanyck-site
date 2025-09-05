import { test, expect } from '@playwright/test';

test.describe('Favoritos (Wishlist) Page', () => {
  test('should load favorites page successfully', async ({ page }) => {
    await page.goto('/pt/favoritos');
    
    // Check page loads successfully
    expect(page.url()).toContain('/favoritos');
    
    // Check essential elements are present
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('should handle empty or populated wishlist state', async ({ page }) => {
    await page.goto('/pt/favoritos');
    await page.waitForLoadState('networkidle');
    
    // Check for either empty state or wishlist items
    const emptyState = page.locator('[data-testid="empty-wishlist"], .empty-wishlist, [class*="empty"]');
    const wishlistItems = page.locator('[data-testid="wishlist-items"], .wishlist-items, [class*="wishlist-item"]');
    const productGrid = page.locator('[data-testid="product-grid"], .product-grid, [class*="grid"]');
    
    // Either empty state or wishlist content should be present
    await expect(
      emptyState.or(wishlistItems).or(productGrid)
    ).toBeVisible();
    
    // Take visual snapshot
    // INSANYCK STEP 4 · Lote 3 — reduced motion and wait
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(100);
    await expect(page.locator('main')).toHaveScreenshot('wishlist-main.png');
  });

  test('should display page title correctly', async ({ page }) => {
    await page.goto('/pt/favoritos');
    
    // Check for page title/heading
    const titleSelectors = [
      'h1',
      '[data-testid="page-title"]',
      'text="Favoritos"',
      'text="Wishlist"',
      'text="Lista de Desejos"'
    ];
    
    let hasTitleElement = false;
    for (const selector of titleSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0 && await element.first().isVisible()) {
        hasTitleElement = true;
        break;
      }
    }
    
    // At least one title element should be present
    expect(hasTitleElement).toBe(true);
  });
});