// src/lib/email.ts
// INSANYCK AUTH-03-RESEND-LUXURY — Email Service (Edge-safe)
// Provider: Resend | Fallback: Console (dev)

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

/**
 * Infer locale from magic link URL
 * Rules:
 * 1. Path starts with /en → 'en'
 * 2. Query param lng=en OR locale=en → 'en'
 * 3. Default → 'pt'
 */
function inferLocaleFromUrl(url: string): Locale {
  try {
    const parsed = new URL(url);

    // Check path
    if (parsed.pathname.startsWith('/en')) {
      return 'en';
    }

    // Check query params
    const lng = parsed.searchParams.get('lng') || parsed.searchParams.get('locale');
    if (lng === 'en') {
      return 'en';
    }

    return 'pt';
  } catch {
    return 'pt';
  }
}

// ===== RESEND CLIENT (Lazy Init) =====

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (resendClient) return resendClient;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[INSANYCK EMAIL] RESEND_API_KEY not configured');
    return null;
  }

  resendClient = new Resend(apiKey);
  return resendClient;
}

// ===== CORE SEND FUNCTION =====

async function sendMail({ to, subject, html, text }: EmailParams): Promise<boolean> {
  const resend = getResendClient();
  const from = process.env.EMAIL_FROM || 'INSANYCK <no-reply@insanyck.com>';

  // Resend (primary)
  if (resend) {
    try {
      const result = await resend.emails.send({
        from,
        to,
        subject,
        html,
        text,
      });

      // Structured log (NO sensitive data)
      console.log(JSON.stringify({
        event: 'email:sent',
        provider: 'resend',
        success: true,
        id: result.data?.id,
      }));

      return true;
    } catch (error) {
      // Structured error log (NO sensitive data)
      console.error(JSON.stringify({
        event: 'email:error',
        provider: 'resend',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));

      // Fail-open: don't throw, just return false
      return false;
    }
  }

  // Dev fallback (console)
  if (process.env.NODE_ENV === 'development') {
    console.log(JSON.stringify({
      event: 'email:dev',
      provider: 'console',
      subject,
      preview: `Email would be sent to: ${to.split('@')[0]}@***`,
    }));
    return true;
  }

  console.error(JSON.stringify({
    event: 'email:no_provider',
    message: 'No email provider configured',
  }));

  return false;
}

// ===== PUBLIC API =====

/**
 * Send Magic Link email for authentication
 * Used by NextAuth EmailProvider
 */
export async function sendSignInEmail({ to, url, locale }: SignInEmailParams): Promise<void> {
  // Infer locale if not provided
  const resolvedLocale = locale || inferLocaleFromUrl(url);

  // Render template
  const { subject, html, text } = renderMagicLinkEmail({
    url,
    locale: resolvedLocale,
  });

  // Send
  const success = await sendMail({ to, subject, html, text });

  // Log (structured, safe)
  console.log(JSON.stringify({
    event: 'email:magic_link',
    locale: resolvedLocale,
    success,
  }));

  // Don't throw even on failure (fail-open)
  // NextAuth will handle the error gracefully
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
