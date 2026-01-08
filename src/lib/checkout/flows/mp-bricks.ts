// INSANYCK PAYMENTS-P0 — MercadoPago Bricks Flow Handler
// =======================================================
// Handles MercadoPago Card Bricks payment (in-page card form).
// Extracted from create-session.ts for testability.
// CONTRACT: Output shape UNCHANGED (MpBricksFlowResult)

import type { CheckoutContext, ResolvedItem, MpBricksFlowResult, CheckoutOrder, FlowError } from '../types';
import type { CheckoutLogger } from '../observability';

/**
 * Build preference items for MercadoPago API.
 */
function buildPreferenceItems(items: ResolvedItem[]) {
  return items.map((r) => ({
    title: r.title,
    quantity: r.qty,
    unit_price: r.unit_amount / 100,
    currency_id: 'BRL',
  }));
}

/**
 * Calculate total amount in cents from resolved items.
 */
function calculateTotalCents(items: ResolvedItem[]): number {
  return items.reduce((sum, r) => sum + r.unit_amount * r.qty, 0);
}

/**
 * Handle MercadoPago Bricks flow.
 * Creates a preference and returns the preference_id for in-page card form.
 *
 * @param ctx - Checkout context with session, email, baseUrl
 * @param items - Resolved items from database
 * @param order - Order created in database (must have id)
 * @param logger - Optional observability logger
 * @returns MpBricksFlowResult with preference_id
 * @throws FlowError on failure
 */
export async function handleMpBricks(
  ctx: CheckoutContext,
  items: ResolvedItem[],
  order: CheckoutOrder,
  logger?: CheckoutLogger
): Promise<MpBricksFlowResult> {
  const startTime = logger?.start('mercadopago', 'mp_bricks') ?? Date.now();
  const totalCents = calculateTotalCents(items);

  try {
    // Call create-preference endpoint
    const preferenceRes = await fetch(`${ctx.baseUrl}/api/mp/create-preference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id,
        items: buildPreferenceItems(items),
        payer: {
          email: ctx.payerEmail as string,
        },
      }),
    });

    if (!preferenceRes.ok) {
      const errorText = await preferenceRes.text();

      if (process.env.NODE_ENV === 'development') {
        console.error('[MP-BRICKS] Preference creation failed:', {
          status: preferenceRes.status,
          statusText: preferenceRes.statusText,
          body: errorText,
        });
      }

      logger?.error('mp_bricks', 'preference_creation_failed', startTime);

      const error: FlowError = {
        error: 'Failed to create MercadoPago preference for Bricks',
        details: process.env.NODE_ENV === 'development' ? errorText : undefined,
      };
      throw error;
    }

    const preferenceData = await preferenceRes.json();

    if (!preferenceData.id || typeof preferenceData.id !== 'string') {
      if (process.env.NODE_ENV === 'development') {
        console.error('[MP-BRICKS] Invalid preference response (missing id):', {
          status: preferenceRes.status,
          preferenceData: {
            id: preferenceData.id,
            received_fields: Object.keys(preferenceData),
          },
        });
      }

      logger?.error('mp_bricks', 'missing_preference_id', startTime);

      const error: FlowError = {
        error: 'MercadoPago preference missing ID',
        details: process.env.NODE_ENV === 'development'
          ? { received_fields: Object.keys(preferenceData) }
          : undefined,
      };
      throw error;
    }

    // INSANYCK MP-HOTFIX-03 — Dev diagnostics
    if (process.env.NODE_ENV === 'development') {
      console.log('[MP-BRICKS] Preference created successfully:', {
        preference_id: preferenceData.id,
        order_id: order.id,
        amount_cents: totalCents,
      });
    }

    logger?.success('mp_bricks', startTime);

    // INSANYCK MP-HOTFIX-03 — Return preference_id for Bricks initialization
    return {
      provider: 'mercadopago',
      method: 'card_bricks',
      order_id: order.id,
      preference_id: preferenceData.id,
      amount: totalCents,
    };
  } catch (err: unknown) {
    // If it's already a FlowError, re-throw
    if (err && typeof err === 'object' && 'error' in err) {
      throw err;
    }

    const bricksError = err as { message?: string };

    if (process.env.NODE_ENV === 'development') {
      console.error('[MP-BRICKS] Card Bricks preparation error:', bricksError);
    }

    logger?.error('mp_bricks', 'bricks_preparation_failed', startTime);

    const error: FlowError = {
      error: 'Failed to prepare Bricks card payment',
      details: process.env.NODE_ENV === 'development' ? bricksError?.message : undefined,
    };
    throw error;
  }
}
