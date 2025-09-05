// INSANYCK STEP 4 · Lote 3 — A11y testing for home page
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { blockThirdParties } from './_utils/network';

test.describe('Home Page A11y', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/pt');
    await blockThirdParties(page);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('main', { state: 'visible' });
    await page.waitForSelector('h1', { timeout: 5000 }).catch(()=>{});

    // INSANYCK STEP 4 · Lote 3 — Run axe scan with serious/critical violations only
    const results = await new AxeBuilder({ page }).include('main').analyze();
    expect(results.violations).toEqual([]);
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/pt');
    await blockThirdParties(page);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('main', { state: 'visible' });

    // INSANYCK STEP 4 · Lote 3 — Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Check that focus is visible
    const focusedElement = await page.locator(':focus').first();
    await expect(focusedElement).toBeVisible();

    // INSANYCK STEP 4 · Lote 3 — Test that focused element has proper outline/ring
    const focusedStyles = await focusedElement.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow
      };
    });

    // Should have either outline or box-shadow for focus indicator
    const hasFocusIndicator = 
      focusedStyles.outline !== 'none' || 
      focusedStyles.outlineWidth !== '0px' ||
      focusedStyles.boxShadow.includes('rgb') ||
      focusedStyles.boxShadow !== 'none';

    expect(hasFocusIndicator).toBe(true);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/pt');
    await blockThirdParties(page);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('main', { state: 'visible' });
    await page.waitForSelector('h1', { timeout: 5000 }).catch(()=>{});

    // INSANYCK STEP 4 · Lote 3 — Check heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const headingLevels = [];

    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const level = parseInt(tagName.replace('h', ''));
      headingLevels.push(level);
    }

    // Should have at least one h1
    expect(headingLevels.filter(level => level === 1).length).toBeGreaterThanOrEqual(1);

    // Check that heading levels don't skip (no h3 without h2, etc.)
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1];
      expect(diff).toBeLessThanOrEqual(1);
    }
  });

  test('should have accessible images', async ({ page }) => {
    await page.goto('/pt');
    await blockThirdParties(page);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('main', { state: 'visible' });

    // INSANYCK STEP 4 · Lote 3 — Check that critical images have alt text
    const images = await page.locator('img[src*="logo"], img[src*="hero"], img[src*="product"]').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const role = await img.getAttribute('role');
      
      // Should have alt text or aria-label, unless decorative (role="presentation")
      if (role !== 'presentation' && role !== 'none') {
        expect(alt || ariaLabel).toBeTruthy();
        if (alt) {
          expect(alt.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });
});