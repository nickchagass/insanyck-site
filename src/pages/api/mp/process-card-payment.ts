// INSANYCK MP-HOTFIX-03 — Process Mercado Pago Bricks Card Payment
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { backendDisabled } from '@/lib/backendGuard';
import { env } from '@/lib/env.server';
import { prisma } from '@/lib/prisma';

const bodySchema = z.object({
  formData: z.object({
    token: z.string(),
    issuer_id: z.string().optional(),
    payment_method_id: z.string(),
    transaction_amount: z.number(),
    installments: z.number(),
    payer: z.object({
      email: z.string().email(),
      identification: z.object({
        type: z.string().optional(),
        number: z.string().optional(),
      }).optional(),
    }),
  }),
  orderId: z.string(),
  preferenceId: z.string(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // INSANYCK MP-HOTFIX-03 — Guards
  if (backendDisabled) return res.status(503).json({ error: 'Backend disabled for preview/dev' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json');

  try {
    const body = bodySchema.parse(req.body);
    const { formData, orderId } = body;

    // INSANYCK MP-HOTFIX-03 — Verify order exists and is pending
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order is not pending' });
    }

    // INSANYCK MP-HOTFIX-03 — Process payment with Mercado Pago API
    const paymentPayload = {
      token: formData.token,
      issuer_id: formData.issuer_id,
      payment_method_id: formData.payment_method_id,
      transaction_amount: formData.transaction_amount,
      installments: formData.installments,
      description: `INSANYCK Order ${orderId}`,
      payer: {
        email: formData.payer.email,
        ...(formData.payer.identification && {
          identification: formData.payer.identification,
        }),
      },
      external_reference: orderId,
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_URL}/api/mp/webhook`,
    };

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': `card-${orderId}-${Date.now()}`,
      },
      body: JSON.stringify(paymentPayload),
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json().catch(() => ({}));

      if (process.env.NODE_ENV === 'development') {
        console.error('[MP-HOTFIX-03] Card payment API error:', {
          status: mpResponse.status,
          statusText: mpResponse.statusText,
          error: errorData,
        });
      }

      return res.status(500).json({
        error: 'Payment processing failed',
        details: process.env.NODE_ENV === 'development' ? errorData : undefined,
      });
    }

    const paymentResult = await mpResponse.json();

    // INSANYCK MP-HOTFIX-03 — Update order with payment info
    await prisma.order.update({
      where: { id: orderId },
      data: {
        mpPaymentId: String(paymentResult.id),
        status: paymentResult.status === 'approved' ? 'paid' : 'pending',
      },
    });

    // INSANYCK MP-HOTFIX-03 — Dev diagnostics
    if (process.env.NODE_ENV === 'development') {
      console.log('[MP-HOTFIX-03] Card payment processed:', {
        payment_id: paymentResult.id,
        status: paymentResult.status,
        status_detail: paymentResult.status_detail,
        order_id: orderId,
      });
    }

    return res.status(200).json({
      paymentId: paymentResult.id,
      status: paymentResult.status,
      statusDetail: paymentResult.status_detail,
      orderId: orderId,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: process.env.NODE_ENV === 'development' ? err.flatten() : undefined,
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('[MP-HOTFIX-03] Card payment processing error:', err);
    }

    return res.status(500).json({
      error: err?.message || 'Failed to process card payment',
    });
  }
}
