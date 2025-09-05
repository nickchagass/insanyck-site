import { test, expect } from '@playwright/test';

test.describe('Sacola (Cart) Page', () => {
  test('should load cart page successfully', async ({ page }) => {
    await page.goto('/pt/sacola');
    
    // Check page loads successfully
    expect(page.url()).toContain('/sacola');
    
    // Check essential elements are present
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    
    // Check for cart content or empty state
    const emptyState = page.locator('[data-testid="empty-cart"], .empty-cart, [class*="empty"]');
    const cartItems = page.locator('[data-testid="cart-items"], .cart-items, [class*="cart-item"]');
    
    // Either empty state or cart items should be present
    await expect(
      emptyState.or(cartItems)
    ).toBeVisible();
  });

  test('should show empty cart state correctly', async ({ page }) => {
    await page.goto('/pt/sacola');
    await page.waitForLoadState('networkidle');
    
    // Look for empty cart indicators
    const emptyIndicators = [
      '[data-testid="empty-cart"]',
      '.empty-cart',
      '[class*="empty"]',
      'text="carrinho vazio"',
      'text="sacola vazia"',
      'text="Sua sacola está vazia"',
      'text="Seu carrinho está vazio"'
    ];
    
    let hasEmptyState = false;
    for (const selector of emptyIndicators) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        hasEmptyState = true;
        break;
      }
    }
    
    // If cart is empty, should have continue shopping link
    if (hasEmptyState) {
      const continueShoppingLink = page.locator(
        'a[href*="loja"], a[href*="produto"], [data-testid="continue-shopping"]'
      );
      
      if (await continueShoppingLink.count() > 0) {
        await expect(continueShoppingLink.first()).toBeVisible();
      }
    }
    
    // Take visual snapshot of cart page
    // INSANYCK STEP 4 · Lote 3 — reduced motion and wait
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(100);
    await expect(page.locator('main')).toHaveScreenshot('cart-main.png');
  });
});