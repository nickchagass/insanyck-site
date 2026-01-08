// INSANYCK PAYMENTS-P0 — MercadoPago Card Redirect Flow Handler
// ==============================================================
// Handles MercadoPago Card redirect payment (legacy flow).
// Extracted from create-session.ts for testability.
// CONTRACT: Output shape UNCHANGED (MpCardRedirectFlowResult)

import type { CheckoutContext, ResolvedItem, MpCardRedirectFlowResult, CheckoutOrder, FlowError } from '../types';
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
 * Handle MercadoPago Card redirect flow.
 * Creates a preference and returns the init_point URL for redirect.
 *
 * @param ctx - Checkout context with session, email, baseUrl
 * @param items - Resolved items from database
 * @param order - Order created in database (must have id)
 * @param logger - Optional observability logger
 * @returns MpCardRedirectFlowResult with init_point URL
 * @throws FlowError on failure
 */
export async function handleMpCardRedirect(
  ctx: CheckoutContext,
  items: ResolvedItem[],
  order: CheckoutOrder,
  logger?: CheckoutLogger
): Promise<MpCardRedirectFlowResult> {
  const startTime = logger?.start('mercadopago', 'mp_card') ?? Date.now();

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
        console.error('[MP-HOTFIX-01] Preference creation failed:', {
          status: preferenceRes.status,
          statusText: preferenceRes.statusText,
          body: errorText,
        });
      }

      logger?.error('mp_card', 'preference_creation_failed', startTime);

      const error: FlowError = {
        error: 'Failed to create MercadoPago preference',
        details: process.env.NODE_ENV === 'development' ? errorText : undefined,
      };
      throw error;
    }

    const preferenceData = await preferenceRes.json();

    // INSANYCK MP-HOTFIX-02 — Normalize init_point (sandbox fallback)
    const initPoint = preferenceData.init_point || preferenceData.sandbox_init_point;

    if (!initPoint || typeof initPoint !== 'string') {
      if (process.env.NODE_ENV === 'development') {
        console.error('[MP-HOTFIX-02] Invalid preference response (missing init_point and sandbox_init_point):', {
          status: preferenceRes.status,
          statusText: preferenceRes.statusText,
          preferenceData: {
            id: preferenceData.id,
            init_point: preferenceData.init_point,
            sandbox_init_point: preferenceData.sandbox_init_point,
          },
        });
      }

      logger?.error('mp_card', 'missing_init_point', startTime);

      const error: FlowError = {
        error: 'MercadoPago preference missing init_point',
        details: process.env.NODE_ENV === 'development'
          ? { received_fields: Object.keys(preferenceData) }
          : undefined,
      };
      throw error;
    }

    // INSANYCK MP-HOTFIX-02 — Dev diagnostics
    if (process.env.NODE_ENV === 'development') {
      console.log('[MP-HOTFIX-02] Card preference created successfully:', {
        preference_id: preferenceData.id,
        init_point: initPoint,
        is_sandbox: !!preferenceData.sandbox_init_point,
      });
    }

    logger?.success('mp_card', startTime);

    // INSANYCK MP-HOTFIX-02 — Stable JSON contract (snake_case)
    return {
      provider: 'mercadopago',
      method: 'card',
      order_id: order.id,
      init_point: initPoint,
      preference_id: preferenceData.id || undefined,
    };
  } catch (err: unknown) {
    // If it's already a FlowError, re-throw
    if (err && typeof err === 'object' && 'error' in err) {
      throw err;
    }

    const cardError = err as { message?: string };

    if (process.env.NODE_ENV === 'development') {
      console.error('[MP-HOTFIX-01] Card payment creation error:', cardError);
    }

    logger?.error('mp_card', 'card_creation_failed', startTime);

    const error: FlowError = {
      error: 'Failed to process card payment',
      details: process.env.NODE_ENV === 'development' ? cardError?.message : undefined,
    };
    throw error;
  }
}
