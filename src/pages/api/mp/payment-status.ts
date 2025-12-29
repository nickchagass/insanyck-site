// INSANYCK STEP F-MP — API para polling de status do pagamento PIX
import type { NextApiRequest, NextApiResponse } from 'next';
import { getPaymentById } from '@/lib/mp';
import { backendDisabled } from '@/lib/backendGuard';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // INSANYCK STEP E-01 — Backend disabled guard
  if (backendDisabled) {
    return res.status(503).json({ error: 'Backend disabled for preview/dev' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // INSANYCK STEP E-01 — Headers em APIs sensíveis
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vary', 'Authorization');

  const { paymentId } = req.query;

  if (!paymentId || typeof paymentId !== 'string') {
    return res.status(400).json({ error: 'Missing paymentId' });
  }

  try {
    const payment = await getPaymentById(paymentId);

    return res.status(200).json({
      status: payment.status,
      statusDetail: payment.external_reference,
      transactionAmount: payment.transaction_amount,
      currencyId: payment.currency_id,
    });
  } catch (error) {
    console.error('[MP payment-status] Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch payment status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
