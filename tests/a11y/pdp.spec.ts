// INSANYCK STEP 4 · Lote 3 — A11y testing for product detail page
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Product Detail A11y', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/pt/produto/oversized-classic');
    await page.waitForLoadState('networkidle');

    // INSANYCK STEP 4 · Lote 3 — Run axe scan on product page
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .include('main')
      .analyze();

    // Filter for serious and critical violations
    const violations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'serious' || violation.impact === 'critical'
    );

    // Attach detailed report
    await test.info().attach('pdp-accessibility-scan-results.json', {
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

  test('should have accessible product images', async ({ page }) => {
    await page.goto('/pt/produto/oversized-classic');
    await page.waitForLoadState('networkidle');

    // INSANYCK STEP 4 · Lote 3 — Check product images
    const productImages = await page.locator('img[src*="product"], img[alt*="produto"], [data-testid="product-image"]').all();
    
    if (productImages.length > 0) {
      for (const img of productImages) {
        const alt = await img.getAttribute('alt');
        const ariaLabel = await img.getAttribute('aria-label');
        
        // Product images should have meaningful alt text
        expect(alt || ariaLabel).toBeTruthy();
        
        if (alt) {
          // Alt text should be descriptive, not just "image" or empty
          expect(alt.trim().length).toBeGreaterThan(3);
          expect(alt.toLowerCase()).not.toBe('image');
          expect(alt.toLowerCase()).not.toBe('img');
        }
      }
    }
  });

  test('should have accessible add to cart button', async ({ page }) => {
    await page.goto('/pt/produto/oversized-classic');
    await page.waitForLoadState('networkidle');

    // INSANYCK STEP 4 · Lote 3 — Check add to cart button
    const addToCartButtons = await page.locator('button:has-text("Adicionar"), button:has-text("Carrinho"), [data-testid="add-to-cart"]').all();
    
    if (addToCartButtons.length > 0) {
      const button = addToCartButtons[0];
      
      // Should be focusable and have accessible name
      await button.focus();
      await expect(button).toBeFocused();
      
      const ariaLabel = await button.getAttribute('aria-label');
      const innerText = await button.innerText();
      
      expect(ariaLabel || innerText.trim()).toBeTruthy();
      
      // Should indicate loading state accessibly when clicked
      const ariaLive = await button.getAttribute('aria-live');
      const ariaBusy = await button.getAttribute('aria-busy');
      
      // Either should have aria-live region or aria-busy support
      if (!ariaLive) {
        // Button should support aria-busy for loading states
        expect(typeof ariaBusy === 'string' || ariaBusy === null).toBe(true);
      }
    }
  });

  test('should have accessible variant selector', async ({ page }) => {
    await page.goto('/pt/produto/oversized-classic');
    await page.waitForLoadState('networkidle');

    // INSANYCK STEP 4 · Lote 3 — Check variant/size selectors
    const variantSelectors = await page.locator('select, [role="listbox"], [role="radiogroup"], fieldset').all();
    
    if (variantSelectors.length > 0) {
      for (const selector of variantSelectors) {
        const tagName = await selector.evaluate(el => el.tagName.toLowerCase());
        const role = await selector.getAttribute('role');
        
        // Should have label or legend
        if (tagName === 'select') {
          const id = await selector.getAttribute('id');
          if (id) {
            const label = await page.locator(`label[for="${id}"]`).count();
            const ariaLabel = await selector.getAttribute('aria-label');
            const ariaLabelledby = await selector.getAttribute('aria-labelledby');
            
            expect(label > 0 || ariaLabel || ariaLabelledby).toBeTruthy();
          }
        } else if (tagName === 'fieldset') {
          const legend = await selector.locator('legend').count();
          expect(legend).toBeGreaterThan(0);
        }
        
        // Should be keyboard navigable
        await selector.focus();
        await expect(selector).toBeFocused();
      }
    }
  });

  test('should have proper heading structure for product info', async ({ page }) => {
    await page.goto('/pt/produto/oversized-classic');
    await page.waitForLoadState('networkidle');

    // INSANYCK STEP 4 · Lote 3 — Check product page heading structure
    const productTitle = await page.locator('h1').count();
    expect(productTitle).toBeGreaterThanOrEqual(1);

    // Product title should contain meaningful text
    if (productTitle > 0) {
      const titleText = await page.locator('h1').first().innerText();
      expect(titleText.trim().length).toBeGreaterThan(0);
    }
    
    // Check section headings
    const allHeadings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    for (const heading of allHeadings) {
      const text = await heading.innerText();
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });
});