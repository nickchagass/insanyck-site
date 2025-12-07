// INSANYCK STEP MP-02 + FASE F-01 + F-04
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { getPaymentById } from '@/lib/mp';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env.server';

// INSANYCK FASE F-01 — Preparar para validação de assinatura futura
// Desabilitando bodyParser para processar raw body quando necessário
export const config = {
  api: {
    bodyParser: false,
  },
};

// INSANYCK FASE F-04 — Helper para ler body (compatível com bodyParser: false)
// Retorna tanto o raw (para HMAC) quanto o JSON parseado
async function readBody(req: NextApiRequest): Promise<{ raw: string; json: any }> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        const json = data ? JSON.parse(data) : {};
        resolve({ raw: data, json });
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// INSANYCK FASE F-04 — Validação de assinatura do webhook do Mercado Pago
// Ref: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
function verifyMPWebhookSignature(opts: {
  dataId: string;
  signatureHeader: string | string[] | undefined;
  requestId: string | string[] | undefined;
  secret: string;
}): boolean {
  const { dataId, signatureHeader, requestId, secret } = opts;

  // INSANYCK STEP F-04.1 — Fail-closed se não houver secret
  if (!secret) {
    return false;
  }

  // Validar que headers existem
  if (!signatureHeader || !requestId) {
    return false;
  }

  const xSignature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
  const xRequestId = Array.isArray(requestId) ? requestId[0] : requestId;

  // Parse x-signature para extrair ts e v1
  // Formato esperado: "ts=1234567890,v1=abcdef..."
  const parts = xSignature.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=');
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
  }, {} as Record<string, string>);

  const ts = parts.ts;
  const v1 = parts.v1;

  if (!ts || !v1) {
    return false;
  }

  // Construir manifest conforme documentação do MP
  // manifest = "id:{data.id};request-id:{x-request-id};ts:{ts};"
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  // Calcular HMAC-SHA256
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(manifest);
  const hash = hmac.digest('hex');

  // Comparação timing-safe
  try {
    const expectedBuffer = Buffer.from(hash, 'hex');
    const receivedBuffer = Buffer.from(v1, 'hex');

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch {
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // INSANYCK FASE F-01 — backend disabled guard
  if (env.BACKEND_DISABLED === "1") {
    return res.status(503).json({ error: 'Backend temporarily disabled' });
  }

  // INSANYCK STEP E-01
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // INSANYCK STEP E-01 — Headers em APIs sensíveis
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Vary", "Authorization");

  // INSANYCK FASE F-04 — Validação de assinatura do webhook
  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];

  try {
    let paymentId: string | undefined;

    // INSANYCK FASE F-04 — ler body uma única vez
    if (req.method === 'POST') {
      const { json } = await readBody(req);
      const { data } = json || {};
      paymentId = data?.id;

      // Validar assinatura em produção
      const secret = env.MP_WEBHOOK_SECRET;
      const isProd = process.env.NODE_ENV === "production";

      // INSANYCK STEP F-04.1 — Garantir fail-closed em produção se não houver secret
      if (isProd && !secret) {
        console.error('[MP Webhook] MP_WEBHOOK_SECRET is not configured in production');
        return res.status(500).json({ error: 'Server misconfigured' });
      }

      if (isProd) {
        if (!paymentId) {
          console.error('[MP Webhook] Missing payment ID for signature validation');
          return res.status(400).json({ error: 'Missing payment ID' });
        }

        const valid = verifyMPWebhookSignature({
          dataId: String(paymentId),
          signatureHeader: xSignature,
          requestId: xRequestId,
          secret,
        });

        if (!valid) {
          console.error('[MP Webhook] Invalid signature or missing headers');
          return res.status(401).json({ error: 'Invalid signature' });
        }
      } else {
        // Em dev: se não tiver secret, apenas logar que está pulando validação
        if (!secret) {
          console.warn('[MP Webhook] Skipping signature validation (no MP_WEBHOOK_SECRET in dev)');
        }
      }
    } else if (req.method === 'GET') {
      const { 'data.id': dataId } = req.query;
      paymentId = Array.isArray(dataId) ? dataId[0] : dataId;
    }

    if (!paymentId) {
      console.error('[MP Webhook] Missing payment ID');
      return res.status(400).json({ error: 'Missing payment ID' });
    }

    // INSANYCK STEP MP-02
    const payment = await getPaymentById(paymentId);

    if (payment.status !== 'approved') {
      return res.status(200).json({ ok: true, skipped: 'not_approved' });
    }

    const external_reference = payment.external_reference;
    if (!external_reference) {
      console.error('[MP Webhook] Missing external_reference in payment');
      return res.status(400).json({ error: 'Missing external_reference' });
    }

    // INSANYCK STEP F-03 — Idempotência robusta baseada em mpPaymentId
    const mpPaymentRef = String(paymentId);
    const paidOrder = await prisma.order.findFirst({
      where: {
        mpPaymentId: mpPaymentRef,
        status: 'paid',
      },
    });

    if (paidOrder) {
      // INSANYCK FASE F-04 — Idempotência: não logar em produção
      return res.status(200).json({ ok: true, skipped: 'duplicate_payment' });
    }

    // INSANYCK FASE F-01 — Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: external_reference },
    });

    if (!existingOrder) {
      console.error(`[MP Webhook] Order ${external_reference} not found`);
      return res.status(404).json({ error: 'Order not found' });
    }

    // INSANYCK STEP F-03 — Update order status usando campos próprios de MP
    await prisma.order.update({
      where: { id: external_reference },
      data: {
        status: 'paid',
        paymentProvider: 'mercadopago',
        mpPaymentId: mpPaymentRef,
      },
    });

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('[MP Webhook] Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}