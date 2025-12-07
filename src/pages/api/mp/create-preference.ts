// INSANYCK STEP MP-02 + FASE F-01 + F-03
import type { NextApiRequest, NextApiResponse } from 'next';
import { createPreference, type MPPreferenceItem, type MPPreferencePayer } from '@/lib/mp';
import { env } from '@/lib/env.server';
import { prisma } from '@/lib/prisma';

interface CreatePreferenceRequest {
  orderId: string;
  items: MPPreferenceItem[];
  payer?: MPPreferencePayer;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // INSANYCK FASE F-01 — backend disabled guard
  if (env.BACKEND_DISABLED === "1") {
    return res.status(503).json({ error: 'Backend temporarily disabled' });
  }

  // INSANYCK STEP E-01
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // INSANYCK STEP E-01 — Headers em APIs sensíveis
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Vary", "Authorization");

  try {
    const { orderId, items, payer }: CreatePreferenceRequest = req.body;

    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields: orderId, items' });
    }

    // INSANYCK FASE F-01 — usar env tipado + notification_url configurável
    const base = env.NEXT_PUBLIC_URL;
    const notification_url = env.MP_NOTIFICATION_URL || `${base}/api/mp/webhook`;
    const back_urls = {
      success: `${base}/checkout/success`,
      failure: `${base}/checkout/cancel`,
      pending: `${base}/checkout/success`,
    };

    const body = {
      items,
      external_reference: orderId,
      notification_url,
      back_urls,
      auto_return: 'approved' as const,
      ...(payer && { payer }),
    };

    const preference = await createPreference(body);

    // INSANYCK STEP F-03 — Gravar mpPreferenceId na Order
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          mpPreferenceId: preference.id,
          paymentProvider: 'mercadopago',
        },
      });
    } catch (dbError) {
      console.error(`[MP Create-Preference] Failed to update order ${orderId}:`, dbError);
      // Não falha a requisição se o update falhar, apenas loga
    }

    return res.status(200).json({
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    });
  } catch (error) {
    console.error('Error creating MP preference:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}