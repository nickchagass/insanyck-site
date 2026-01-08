// INSANYCK PAYMENTS-P0 — MercadoPago PIX Flow Handler
// ====================================================
// Handles MercadoPago PIX payment creation.
// Extracted from create-session.ts for testability.
// CONTRACT: Output shape UNCHANGED (MpPixFlowResult)

import { createPixPayment, normalizePixResponse } from '@/lib/mp';
import { prisma } from '@/lib/prisma';
import type { CheckoutContext, ResolvedItem, MpPixFlowResult, CheckoutOrder, FlowError } from '../types';
import type { CheckoutLogger } from '../observability';

/**
 * Calculate total amount from resolved items.
 */
function calculateTotal(items: ResolvedItem[]): { cents: number; brl: number } {
  const cents = items.reduce((sum, r) => sum + r.unit_amount * r.qty, 0);
  return { cents, brl: cents / 100 };
}

/**
 * Handle MercadoPago PIX flow.
 * Creates a PIX payment and returns QR code data.
 *
 * @param ctx - Checkout context with session, email, baseUrl
 * @param items - Resolved items from database
 * @param order - Order created in database (must have id)
 * @param logger - Optional observability logger
 * @returns MpPixFlowResult with QR code data
 * @throws FlowError on failure
 */
export async function handleMpPix(
  ctx: CheckoutContext,
  items: ResolvedItem[],
  order: CheckoutOrder,
  logger?: CheckoutLogger
): Promise<MpPixFlowResult> {
  const startTime = logger?.start('mercadopago', 'mp_pix') ?? Date.now();
  const { cents: totalCents, brl: totalBRL } = calculateTotal(items);

  try {
    // Create PIX payment via MercadoPago SDK
    const pixPayment = await createPixPayment({
      transaction_amount: totalBRL,
      description: `INSANYCK Order ${order.id}`,
      payment_method_id: 'pix',
      payer: {
        email: ctx.payerEmail as string,
      },
      external_reference: order.id,
      notification_url: `${ctx.baseUrl}/api/mp/webhook`,
    });

    // INSANYCK MP-MOBILE-01 DO/DIE — Money destination verification (dev-only)
    if (process.env.NODE_ENV === 'development') {
      const paymentAny = pixPayment as unknown as Record<string, unknown>;
      const collectorId = paymentAny.collector_id || paymentAny.merchant_account_id;
      console.log('[MP-MOBILE-01] collector_check', {
        collector_id_present: !!collectorId,
        value_redacted: true,
      });
    }

    // Normalize PIX response
    const normalized = normalizePixResponse(pixPayment);

    if (!normalized) {
      // INSANYCK MP-HOTFIX-03 — Dev diagnostics for missing QR code
      if (process.env.NODE_ENV === 'development') {
        console.error('[MP-PIX] Invalid PIX response (missing required fields):', {
          payment_id: pixPayment?.id,
          status: pixPayment?.status,
          has_qr_code: !!pixPayment?.point_of_interaction?.transaction_data?.qr_code,
          has_qr_code_base64: !!pixPayment?.point_of_interaction?.transaction_data?.qr_code_base64,
          point_of_interaction_keys: pixPayment?.point_of_interaction
            ? Object.keys(pixPayment.point_of_interaction)
            : 'missing',
          transaction_data_keys: pixPayment?.point_of_interaction?.transaction_data
            ? Object.keys(pixPayment.point_of_interaction.transaction_data)
            : 'missing',
        });
      }

      logger?.error('mp_pix', 'missing_qr_code', startTime);

      const error: FlowError = {
        error: 'MercadoPago PIX payment missing QR code',
        details: process.env.NODE_ENV === 'development'
          ? { payment_status: pixPayment?.status }
          : undefined,
      };
      throw error;
    }

    // INSANYCK MP-HOTFIX-03 + MP-MOBILE-01 — Dev diagnostics
    if (process.env.NODE_ENV === 'development') {
      console.log('[MP-PIX] Payment created successfully:', {
        payment_id: normalized.payment_id,
        order_id: order.id,
        has_qr_code: !!normalized.qr_code,
        has_qr_code_base64: !!normalized.qr_code_base64,
        expires_at: normalized.expires_at,
        notification_url: `${ctx.baseUrl}/api/mp/webhook`,
        amount_brl: totalBRL,
        amount_cents: totalCents,
      });
    }

    // Update Order with mpPaymentId
    await prisma.order.update({
      where: { id: order.id },
      data: { mpPaymentId: String(normalized.payment_id) },
    });

    logger?.success('mp_pix', startTime);

    // INSANYCK MP-HOTFIX-03 — Stable JSON contract (snake_case)
    // INSANYCK MP-MOBILE-01 FIX A — Return BOTH amount fields for backward compatibility
    return {
      provider: 'mercadopago',
      method: 'pix',
      payment_id: normalized.payment_id,
      order_id: order.id,
      qr_code: normalized.qr_code,
      qr_code_base64: normalized.qr_code_base64,
      expires_at: normalized.expires_at,
      amount: totalBRL,        // Kept for backward compatibility (BRL decimal)
      amount_cents: totalCents, // INSANYCK MP-MOBILE-01 — Preferred: integer cents
    };
  } catch (err: unknown) {
    // If it's already a FlowError, re-throw
    if (err && typeof err === 'object' && 'error' in err) {
      throw err;
    }

    const pixError = err as { name?: string; message?: string; cause?: unknown; stack?: string };

    if (process.env.NODE_ENV === 'development') {
      console.error('[MP-PIX] Payment creation error:', {
        error_name: pixError?.name,
        error_message: pixError?.message,
        error_cause: pixError?.cause,
        error_stack: pixError?.stack?.split('\n').slice(0, 3),
      });
    }

    logger?.error('mp_pix', 'pix_creation_failed', startTime);

    const error: FlowError = {
      error: 'Failed to create PIX payment',
      details: process.env.NODE_ENV === 'development' ? pixError?.message : undefined,
    };
    throw error;
  }
}
