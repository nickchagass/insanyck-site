// INSANYCK PAYMENTS-P0 — Checkout Session Facade
// ===============================================
// Thin router that delegates to specialized flow handlers.
// CONTRACT: Request/response shapes UNCHANGED from original.

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { backendDisabled } from '@/lib/backendGuard';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { handleStripeCheckout, handleMpPix, handleMpCardRedirect, handleMpBricks } from '@/lib/checkout/flows';
import { generateRequestId, createCheckoutLogger } from '@/lib/checkout/observability';
import type { ResolvedItem, CheckoutContext, FlowError } from '@/lib/checkout/types';

// INSANYCK PAYMENTS-P0 — bodySchema UNCHANGED from original
const bodySchema = z.object({
  items: z.array(z.object({
    variantId: z.string().optional(),
    sku: z.string().optional(),
    qty: z.number().int().min(1).max(10),
  })).min(1),
  currency: z.literal('BRL'),
  successUrl: z.string().url().optional(),
  provider: z.enum(['stripe', 'mercadopago']).optional(),
  method: z.enum(['pix', 'card', 'card_bricks']).optional(),
  email: z.string().email().optional(),
});

type CheckoutBody = z.infer<typeof bodySchema>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ══════════════════════════════════════════════════════════════════
  // SECTION 1: Guards & Headers (UNCHANGED)
  // ══════════════════════════════════════════════════════════════════
  if (backendDisabled) return res.status(503).json({ error: 'Backend disabled for preview/dev' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vary', 'Authorization');
  res.setHeader('Content-Type', 'application/json');

  // ══════════════════════════════════════════════════════════════════
  // SECTION 2: Body Parsing (UNCHANGED — tolerant fallback preserved)
  // ══════════════════════════════════════════════════════════════════
  const rawBody = typeof req.body === 'string'
    ? (() => {
        try { return JSON.parse(req.body); }
        catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[INSANYCK CHECKOUT API] Failed to parse JSON body', err);
          }
          return null;
        }
      })()
    : req.body;

  if (!rawBody || typeof rawBody !== 'object') {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const parsed = bodySchema.safeParse(rawBody);
  let body: CheckoutBody;

  if (parsed.success) {
    body = parsed.data;
  } else {
    const flattened = parsed.error.flatten();
    if (process.env.NODE_ENV === 'development') {
      console.error('[INSANYCK CHECKOUT API] Body validation error:', JSON.stringify(flattened, null, 2));
    }

    const fallback = rawBody as Record<string, unknown>;
    const itemsFromBody = Array.isArray(fallback.items) ? fallback.items : [];

    if (itemsFromBody.length === 0) {
      return res.status(400).json({ error: 'Checkout items are missing or invalid.', details: flattened });
    }

    body = {
      items: itemsFromBody.map((it: Record<string, unknown>) => ({
        variantId: typeof it.variantId === 'string' ? it.variantId : undefined,
        sku: typeof it.sku === 'string' ? it.sku : undefined,
        qty: typeof it.qty === 'number' ? it.qty : Number(it.qty ?? 1) || 1,
      })),
      currency: 'BRL',
      successUrl: typeof fallback.successUrl === 'string' ? fallback.successUrl : undefined,
      provider: (fallback.provider === 'stripe' || fallback.provider === 'mercadopago') ? fallback.provider : undefined,
      method: (fallback.method === 'pix' || fallback.method === 'card' || fallback.method === 'card_bricks') ? fallback.method : undefined,
      email: typeof fallback.email === 'string' ? fallback.email : undefined,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // SECTION 3: Session & Item Resolution (UNCHANGED)
  // ══════════════════════════════════════════════════════════════════
  const session = await getServerSession(req, res, authOptions);
  const { items, currency, successUrl } = body;

  const resolved: ResolvedItem[] = [];

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const variant = it.variantId
      ? await prisma.variant.findUnique({
          where: { id: it.variantId },
          include: { product: { include: { images: true } }, price: true },
        })
      : it.sku
      ? await prisma.variant.findUnique({
          where: { sku: it.sku },
          include: { product: { include: { images: true } }, price: true },
        })
      : null;

    if (!variant || !variant.price) {
      return res.status(422).json({ error: 'Variant not found', at: i });
    }

    resolved.push({
      variantId: variant.id,
      sku: variant.sku,
      slug: variant.product.slug,
      title: variant.title || variant.product.title,
      image: variant.product.images[0]?.url,
      unit_amount: variant.price.cents,
      qty: it.qty,
    });
  }

  if (resolved.length === 0) {
    return res.status(400).json({ error: 'No valid items' });
  }

  // ══════════════════════════════════════════════════════════════════
  // SECTION 4: Provider/Method Determination (UNCHANGED)
  // ══════════════════════════════════════════════════════════════════
  const requestId = generateRequestId();
  const logger = createCheckoutLogger(requestId);

  const featureFlag = process.env.NEXT_PUBLIC_CHECKOUT_PROVIDER || 'stripe';
  const requestedProvider = body.provider || 'stripe';
  const requestedMethod = body.method;

  logger.log('request_received', { provider: requestedProvider, metadata: { method: requestedMethod || 'default' } });

  const finalProvider = featureFlag === 'hybrid' ? requestedProvider : 'stripe';

  if (requestedProvider === 'mercadopago' && finalProvider !== 'mercadopago') {
    if (process.env.NODE_ENV === 'development') {
      console.error('[MP-DESKTOP-02] forced_stripe_reason:', { feature_flag: featureFlag, blocked_reason: 'feature_flag_not_hybrid' });
    }
    return res.status(400).json({
      error: 'MercadoPago payments not enabled. Please set NEXT_PUBLIC_CHECKOUT_PROVIDER=hybrid',
      details: process.env.NODE_ENV === 'development' ? { featureFlag, requestedProvider, requestedMethod } : undefined,
    });
  }

  const payerEmail = session?.user?.email || body.email;

  if (finalProvider === 'mercadopago' && !payerEmail) {
    return res.status(400).json({ error: 'Email is required for MercadoPago payments' });
  }
  if (finalProvider === 'mercadopago' && typeof payerEmail !== 'string') {
    return res.status(500).json({ error: 'Internal error: email validation failed' });
  }

  // ══════════════════════════════════════════════════════════════════
  // SECTION 5: Flow Routing (DELEGATED to flow handlers)
  // ══════════════════════════════════════════════════════════════════
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const origin = (req.headers.origin as string) || baseUrl;

  const ctx: CheckoutContext = {
    session,
    payerEmail: payerEmail ?? null,
    baseUrl,
    currency,
    requestId,
    origin,
  };

  try {
    // ─────────────────────────────────────────────────────────────────
    // MercadoPago Flows
    // ─────────────────────────────────────────────────────────────────
    if (finalProvider === 'mercadopago') {
      if (!process.env.MP_ACCESS_TOKEN) {
        console.error('[MP-PROD-LOCK-01] CRITICAL mp_token_missing');
        return res.status(500).json({ error: 'Payment configuration error' });
      }
      if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SITE_URL) {
        console.error('[MP-MOBILE-01] CRITICAL missing_site_url');
        return res.status(500).json({ error: 'Payment configuration error' });
      }

      const totalCents = resolved.reduce((sum, r) => sum + r.unit_amount * r.qty, 0);
      const method = body.method || 'pix';

      // Create Order (UNCHANGED logic)
      const order = await prisma.order.create({
        data: {
          status: 'pending',
          amountTotal: totalCents,
          currency: currency.toUpperCase(),
          paymentProvider: 'mercadopago',
          userId: session?.user?.id || null,
          email: payerEmail as string,
          items: {
            create: resolved.map((r) => ({
              slug: r.slug,
              title: r.title,
              qty: r.qty,
              priceCents: r.unit_amount,
              variantId: r.variantId,
              sku: r.sku,
            })),
          },
        },
      });

      // Route to appropriate MP flow handler
      if (method === 'card_bricks') {
        const result = await handleMpBricks(ctx, resolved, order, logger);
        return res.status(200).json(result);
      }
      if (method === 'card') {
        const result = await handleMpCardRedirect(ctx, resolved, order, logger);
        return res.status(200).json(result);
      }
      // Default: PIX
      const result = await handleMpPix(ctx, resolved, order, logger);
      return res.status(200).json(result);
    }

    // ─────────────────────────────────────────────────────────────────
    // Stripe Flow
    // ─────────────────────────────────────────────────────────────────
    const result = await handleStripeCheckout(ctx, resolved, { successUrl }, logger);
    return res.status(200).json(result);

  } catch (err: unknown) {
    // Handle FlowError from handlers
    if (err && typeof err === 'object' && 'error' in err) {
      const flowError = err as FlowError;
      return res.status(500).json(flowError);
    }

    // Generic error fallback
    const error = err as { code?: string; param?: string; message?: string };
    if (process.env.NODE_ENV === 'development') {
      console.error('[INSANYCK][CHECKOUT] Error:', { code: error?.code, message: error?.message });
    }
    return res.status(500).json({ error: error?.message ?? 'Failed to create checkout session' });
  }
}
