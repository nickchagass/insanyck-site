// src/lib/email.ts
// INSANYCK HOTFIX-EMAIL-DIAGNOSTIC — Verbose Logging Version
// ⚠️ TEMPORARY: Remove verbose logs after fixing

import { Resend } from 'resend';
import { renderMagicLinkEmail, type Locale } from '@/emails/MagicLinkEmail';

// ===== TYPES =====

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface SignInEmailParams {
  to: string;
  url: string;
  locale?: Locale;
}

interface OrderEmailParams {
  to: string;
  order: any;
  locale: Locale;
  trackingCode?: string;
}

// ===== LOCALE INFERENCE =====

function inferLocaleFromUrl(url: string): Locale {
  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith('/en')) return 'en';
    const lng = parsed.searchParams.get('lng') || parsed.searchParams.get('locale');
    if (lng === 'en') return 'en';
    return 'pt';
  } catch {
    return 'pt';
  }
}

// ===== RESEND CLIENT (WITH DIAGNOSTIC) =====

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (resendClient) return resendClient;

  const apiKey = process.env.RESEND_API_KEY;

  // DIAGNOSTIC: Log API key status (NOT the key itself!)
  console.log('[INSANYCK EMAIL DIAGNOSTIC]', JSON.stringify({
    event: 'resend:init',
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPrefix: apiKey?.substring(0, 8) || 'MISSING', // First 8 chars only (safe)
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV || 'not-vercel',
    timestamp: new Date().toISOString(),
  }));

  if (!apiKey) {
    console.error('[INSANYCK EMAIL] ❌ RESEND_API_KEY is MISSING!');
    console.error('[INSANYCK EMAIL] Check: Vercel Dashboard > Settings > Environment Variables');
    console.error('[INSANYCK EMAIL] Variable name: RESEND_API_KEY');
    console.error('[INSANYCK EMAIL] Should start with: re_');
    return null;
  }

  // Validate API key format (should start with 're_')
  if (!apiKey.startsWith('re_')) {
    console.error('[INSANYCK EMAIL] ❌ RESEND_API_KEY has INVALID FORMAT!');
    console.error('[INSANYCK EMAIL] Current prefix:', apiKey.substring(0, 3));
    console.error('[INSANYCK EMAIL] Expected prefix: re_');
    console.error('[INSANYCK EMAIL] Go to: https://resend.com/api-keys to generate new key');
    return null;
  }

  console.log('[INSANYCK EMAIL] ✅ Resend client initialized successfully');
  resendClient = new Resend(apiKey);
  return resendClient;
}

// ===== CORE SEND FUNCTION (DIAGNOSTIC VERSION) =====

async function sendMail({ to, subject, html, text }: EmailParams): Promise<boolean> {
  const resend = getResendClient();
  const from = process.env.EMAIL_FROM || 'INSANYCK <no-reply@insanyck.com>';

  // DIAGNOSTIC: Log configuration
  console.log('[INSANYCK EMAIL DIAGNOSTIC]', JSON.stringify({
    event: 'email:send_attempt',
    from,
    to: `${to.split('@')[0]}@***`, // Mask email for privacy
    subject,
    hasResendClient: !!resend,
    emailFromEnv: process.env.EMAIL_FROM || 'NOT_SET (using default)',
    htmlLength: html.length,
    hasText: !!text,
    timestamp: new Date().toISOString(),
  }));

  if (!resend) {
    console.error('[INSANYCK EMAIL] ❌ CRITICAL: No Resend client available!');
    console.error('[INSANYCK EMAIL] This means RESEND_API_KEY is missing or invalid');
    console.error('[INSANYCK EMAIL] Email will NOT be sent!');

    // In development, be loud about this
    if (process.env.NODE_ENV === 'development') {
      console.error('\n===========================================');
      console.error('⚠️  EMAIL NOT SENT - RESEND NOT CONFIGURED');
      console.error('===========================================');
      console.error('Add RESEND_API_KEY to your .env.local file');
      console.error('Get your key from: https://resend.com/api-keys\n');
    }

    return false;
  }

  try {
    console.log('[INSANYCK EMAIL] 📤 Attempting to send via Resend API...');

    const startTime = Date.now();
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });
    const duration = Date.now() - startTime;

    // DIAGNOSTIC: Log FULL response
    console.log('[INSANYCK EMAIL DIAGNOSTIC] Resend API Response:', JSON.stringify({
      event: 'resend:response',
      success: !result.error,
      durationMs: duration,
      data: result.data,
      error: result.error,
      timestamp: new Date().toISOString(),
    }, null, 2)); // Pretty print for readability

    // Check for Resend-specific errors in response
    if (result.error) {
      console.error('[INSANYCK EMAIL] ❌ RESEND API RETURNED ERROR:', JSON.stringify({
        event: 'resend:api_error',
        errorName: result.error.name,
        errorMessage: result.error.message,
        fullError: result.error,
      }, null, 2));

      // Provide specific guidance based on error
      if (result.error.message?.includes('domain')) {
        console.error('[INSANYCK EMAIL] 🌐 DOMAIN VERIFICATION ISSUE DETECTED!');
        console.error('[INSANYCK EMAIL] Go to: https://resend.com/domains');
        console.error('[INSANYCK EMAIL] Verify domain: insanyck.com');
        console.error('[INSANYCK EMAIL] Add DNS records (SPF, DKIM) to Cloudflare');
      }

      if (result.error.message?.includes('API key')) {
        console.error('[INSANYCK EMAIL] 🔑 API KEY ISSUE DETECTED!');
        console.error('[INSANYCK EMAIL] Check if key is valid at: https://resend.com/api-keys');
        console.error('[INSANYCK EMAIL] Generate new key if needed');
      }

      return false;
    }

    console.log('[INSANYCK EMAIL] ✅ EMAIL SENT SUCCESSFULLY!', JSON.stringify({
      emailId: result.data?.id,
      duration: `${duration}ms`,
      to: `${to.split('@')[0]}@***`,
    }));

    // Check Resend Dashboard for delivery
    console.log('[INSANYCK EMAIL] 📊 Check delivery status at: https://resend.com/emails');

    return true;

  } catch (error) {
    // DIAGNOSTIC: Log FULL error with stack trace
    console.error('[INSANYCK EMAIL] ❌ EXCEPTION CAUGHT DURING SEND:', JSON.stringify({
      event: 'resend:exception',
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined,
      timestamp: new Date().toISOString(),
    }, null, 2));

    // Provide specific guidance based on error type
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.error('[INSANYCK EMAIL] 🔑 API Key issue detected!');
        console.error('[INSANYCK EMAIL] Verify RESEND_API_KEY in Vercel environment variables');
      }
      if (error.message.includes('domain')) {
        console.error('[INSANYCK EMAIL] 🌐 Domain verification issue detected!');
        console.error('[INSANYCK EMAIL] Check domain status at: https://resend.com/domains');
      }
      if (error.message.includes('from')) {
        console.error('[INSANYCK EMAIL] 📧 FROM address issue detected!');
        console.error('[INSANYCK EMAIL] Current FROM:', from);
        console.error('[INSANYCK EMAIL] Use verified domain or onboarding@resend.dev for testing');
      }
      if (error.message.includes('rate limit')) {
        console.error('[INSANYCK EMAIL] ⏱️ Rate limit exceeded!');
        console.error('[INSANYCK EMAIL] Free plan: 100 emails/day, 1 email/second');
      }
    }

    return false;
  }
}

// ===== PUBLIC API =====

/**
 * Send Magic Link email for authentication
 * Used by NextAuth EmailProvider
 */
export async function sendSignInEmail({ to, url, locale }: SignInEmailParams): Promise<void> {
  const resolvedLocale = locale || inferLocaleFromUrl(url);

  console.log('[INSANYCK EMAIL] 🚀 Starting sendSignInEmail...', JSON.stringify({
    to: `${to.split('@')[0]}@***`,
    locale: resolvedLocale,
    urlPath: new URL(url).pathname,
    timestamp: new Date().toISOString(),
  }));

  // Render template
  const { subject, html, text } = renderMagicLinkEmail({
    url,
    locale: resolvedLocale,
  });

  console.log('[INSANYCK EMAIL] 📝 Email template rendered:', JSON.stringify({
    subject,
    htmlLength: html.length,
    textLength: text.length,
  }));

  // Send
  const success = await sendMail({ to, subject, html, text });

  // Final result
  console.log('[INSANYCK EMAIL]', JSON.stringify({
    event: 'email:magic_link_complete',
    locale: resolvedLocale,
    success,
    status: success ? '✅ SENT' : '❌ FAILED',
    timestamp: new Date().toISOString(),
  }));

  // Don't throw even on failure (fail-open)
  // But log clearly what happened
  if (!success) {
    console.error('[INSANYCK EMAIL] ⚠️ Email failed to send but auth flow will continue');
    console.error('[INSANYCK EMAIL] User will see "check your email" but email was NOT sent');
    console.error('[INSANYCK EMAIL] FIX THE ISSUE ABOVE before production use!');
  }
}

/**
 * Send Order Confirmation email
 */
export async function sendOrderConfirmation({ to, order, locale }: OrderEmailParams): Promise<void> {
  const { getOrderConfirmedTemplate } = await import('@/emails/order-confirmed');
  const subject = locale === 'pt' ? 'Pedido confirmado — INSANYCK' : 'Order confirmed — INSANYCK';
  const html = getOrderConfirmedTemplate({ order, locale });
  await sendMail({ to, subject, html });
}

/**
 * Send Order Shipped email
 */
export async function sendOrderShipped({ to, order, trackingCode, locale }: OrderEmailParams): Promise<void> {
  const { getOrderShippedTemplate } = await import('@/emails/order-shipped');
  const subject = locale === 'pt' ? 'Pedido enviado — INSANYCK' : 'Order shipped — INSANYCK';
  const html = getOrderShippedTemplate({ order, trackingCode, locale });
  await sendMail({ to, subject, html });
}
