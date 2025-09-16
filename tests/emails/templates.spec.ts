// INSANYCK STEP 4 · Lote 4 — Email templates test (conditional)
import { test, expect } from '@playwright/test';

// Only run these tests if EMAIL_PREVIEW_TOKEN is set
const EMAIL_PREVIEW_TOKEN = process.env.EMAIL_PREVIEW_TOKEN;

test.describe.configure({ mode: 'serial' });

test.describe('Email Templates', () => {
  test.skip(!EMAIL_PREVIEW_TOKEN, 'EMAIL_PREVIEW_TOKEN not set, skipping email tests');

  const emailTypes = [
    'welcome',
    'order-confirmation',
    'shipping-notification',
    'password-reset'
  ];

  for (const emailType of emailTypes) {
    test(`should render ${emailType} email template`, async ({ request }) => {
      const response = await request.get(`/api/emails/preview?type=${emailType}&token=${EMAIL_PREVIEW_TOKEN}`);
      
      // Should return 200 and HTML content
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('text/html');
      
      const html = await response.text();
      
      // Should contain basic HTML structure
      expect(html).toContain('<html');
      expect(html).toContain('<body');
      expect(html).toContain('</html>');
      
      // Should contain some email-specific content
      expect(html.length).toBeGreaterThan(100);
      
      // Should not contain obvious error messages
      expect(html).not.toContain('Error:');
      expect(html).not.toContain('404');
      expect(html).not.toContain('Not Found');
    });
  }

  test('should reject requests without valid token', async ({ request }) => {
    const response = await request.get('/api/emails/preview?type=welcome&token=invalid');
    
    // Should return 401 or 403
    expect([401, 403]).toContain(response.status());
  });

  test('should reject requests without token', async ({ request }) => {
    const response = await request.get('/api/emails/preview?type=welcome');
    
    // Should return 401 or 403
    expect([401, 403]).toContain(response.status());
  });

  test('should handle unknown email types gracefully', async ({ request }) => {
    const response = await request.get(`/api/emails/preview?type=nonexistent&token=${EMAIL_PREVIEW_TOKEN}`);
    
    // Should return 400 or 404
    expect([400, 404]).toContain(response.status());
  });
});