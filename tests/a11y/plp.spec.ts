// INSANYCK STEP 4 · Lote 3 — A11y testing for product listing page
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Product Listing A11y', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/pt/loja');
    await page.waitForLoadState('networkidle');

    // INSANYCK STEP 4 · Lote 3 — Run axe scan focusing on product grid
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .include('main')
      .analyze();

    // Filter for serious and critical violations
    const violations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'serious' || violation.impact === 'critical'
    );

    // Attach detailed report
    await test.info().attach('plp-accessibility-scan-results.json', {
      body: JSON.stringify({
        url: page.url(),
        timestamp: new Date().toISOString(),
        violations: violations,
        summary: {
          total: violations.length,
          critical: violations.filter(v => v.impact === 'critical').length,
          serious: violations.filter(v => v.impact === 'serious').length,
        }
      }, null, 2),
      contentType: 'application/json',
    });

    expect(violations).toEqual([]);
  });

  test('should have accessible product cards', async ({ page }) => {
    await page.goto('/pt/loja');
    await page.waitForLoadState('networkidle');

    // INSANYCK STEP 4 · Lote 3 — Check product cards accessibility
    const productCards = await page.locator('[data-testid="product-card"], article, .product-card').all();
    
    if (productCards.length > 0) {
      for (let i = 0; i < Math.min(3, productCards.length); i++) {
        const card = productCards[i];
        
        // Should have accessible name (either aria-label or inner text)
        const ariaLabel = await card.getAttribute('aria-label');
        const innerText = await card.innerText();
        
        expect(ariaLabel || innerText.trim()).toBeTruthy();
        
        // Should have proper role or semantic element
        const tagName = await card.evaluate(el => el.tagName.toLowerCase());
        const role = await card.getAttribute('role');
        
        // Should be article, section, or have proper role
        const isSemanticElement = ['article', 'section'].includes(tagName);
        const hasProperRole = role && ['article', 'listitem'].includes(role);
        
        expect(isSemanticElement || hasProperRole).toBe(true);
      }
    }
  });

  test('should have keyboard navigable filters', async ({ page }) => {
    await page.goto('/pt/loja');
    await page.waitForLoadState('networkidle');

    // INSANYCK STEP 4 · Lote 3 — Check for filter controls
    const filterButtons = await page.locator('button:has-text("Filtro"), button:has-text("Filter"), [data-testid="filter"], .filter-button').all();
    
    if (filterButtons.length > 0) {
      const firstFilter = filterButtons[0];
      
      // Should be focusable
      await firstFilter.focus();
      await expect(firstFilter).toBeFocused();
      
      // Should have accessible name
      const ariaLabel = await firstFilter.getAttribute('aria-label');
      const innerText = await firstFilter.innerText();
      
      expect(ariaLabel || innerText.trim()).toBeTruthy();
      
      // Should be keyboard activatable
      await firstFilter.press('Enter');
      // Note: We don't check for actual filter panel opening as it depends on implementation
    }
  });

  test('should have proper list structure for products', async ({ page }) => {
    await page.goto('/pt/loja');
    await page.waitForLoadState('networkidle');

    // INSANYCK STEP 4 · Lote 3 — Check if products are in a list structure
    const productContainer = await page.locator('[role="list"], ul, ol, .product-grid, .products-list').first();
    
    if (await productContainer.count() > 0) {
      const role = await productContainer.getAttribute('role');
      const tagName = await productContainer.evaluate(el => el.tagName.toLowerCase());
      
      // Should be a list or have list role
      const isList = ['ul', 'ol'].includes(tagName) || role === 'list';
      expect(isList).toBe(true);
      
      // If it's a list, items should have listitem role or be li elements
      if (isList) {
        const items = await productContainer.locator('li, [role="listitem"]').all();
        expect(items.length).toBeGreaterThan(0);
      }
    }
  });
});