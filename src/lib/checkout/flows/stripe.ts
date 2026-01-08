// INSANYCK PAYMENTS-P0 — Stripe Checkout Flow Handler
// ====================================================
// Handles Stripe checkout session creation.
// Extracted from create-session.ts for testability.
// CONTRACT: Output shape UNCHANGED ({ url: string })

import { stripe } from '@/lib/stripe';
import type { CheckoutContext, ResolvedItem, StripeFlowResult } from '../types';
import type { CheckoutLogger } from '../observability';

/**
 * Sanitize image URL for Stripe product data.
 * Ensures URL is absolute and valid.
 * INSANYCK HOTFIX STRIPE-IMG-URL-01 — preserved logic exactly.
 */
function sanitizeImageUrl(image: string | undefined, origin: string): string | undefined {
  if (!image) {
    return undefined;
  }

  try {
    // If already absolute URL (http:// or https://), use directly
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    // If relative path, construct absolute URL
    if (image.startsWith('/')) {
      return new URL(image, origin).toString();
    }
    // Invalid format, omit
    return undefined;
  } catch {
    // If URL construction fails, omit (better than breaking checkout)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[INSANYCK][CHECKOUT] Invalid image URL, omitting:', image);
    }
    return undefined;
  }
}

/**
 * Build Stripe line items from resolved items.
 */
function buildLineItems(
  items: ResolvedItem[],
  currency: string,
  origin: string
) {
  return items.map((r) => {
    const safeImageUrl = sanitizeImageUrl(r.image, origin);

    return {
      price_data: {
        currency: currency.toLowerCase(),
        unit_amount: r.unit_amount,
        product_data: {
          name: r.title,
          ...(safeImageUrl ? { images: [safeImageUrl] } : {}),
          metadata: {
            variantId: r.variantId,
            sku: r.sku || '',
            slug: r.slug,
            variant: r.title || '',
          },
        },
      },
      quantity: r.qty,
    };
  });
}

export interface StripeFlowOptions {
  successUrl?: string;
}

/**
 * Handle Stripe checkout flow.
 * Creates a Stripe Checkout Session and returns the redirect URL.
 *
 * @param ctx - Checkout context with session, email, baseUrl
 * @param items - Resolved items from database
 * @param options - Optional success URL override
 * @param logger - Optional observability logger
 * @returns StripeFlowResult with checkout URL
 */
export async function handleStripeCheckout(
  ctx: CheckoutContext,
  items: ResolvedItem[],
  options?: StripeFlowOptions,
  logger?: CheckoutLogger
): Promise<StripeFlowResult> {
  const startTime = logger?.start('stripe', 'stripe') ?? Date.now();

  try {
    const line_items = buildLineItems(items, ctx.currency, ctx.origin);

    const success_url = options?.successUrl ||
      `${ctx.baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${ctx.baseUrl}/checkout/cancel`;

    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url,
      cancel_url,
      customer_email: ctx.session?.user?.email || undefined,
      metadata: {
        source: 'checkout_create_session',
        itemCount: String(items.length),
      },
    });

    logger?.success('stripe', startTime);

    return { url: stripeSession.url! };
  } catch (err: unknown) {
    const error = err as { code?: string; param?: string; message?: string };

    // INSANYCK HOTFIX STRIPE-IMG-URL-01 — dev-only detailed logging
    if (process.env.NODE_ENV === 'development') {
      console.error('[INSANYCK][CHECKOUT] Stripe session creation error:', {
        code: error?.code,
        param: error?.param,
        message: error?.message,
      });
    }

    logger?.error('stripe', error?.code || 'stripe_error', startTime);

    throw new Error(error?.message ?? 'Failed to create checkout session');
  }
}
