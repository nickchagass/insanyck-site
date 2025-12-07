// INSANYCK STEP MP-02 + FASE F-01
import { env } from '@/lib/env.server';

export interface MPPreferenceItem {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

export interface MPPreferencePayer {
  email?: string;
}

export interface MPBackUrls {
  success: string;
  failure: string;
  pending: string;
}

export interface MPPreferencePayload {
  items: MPPreferenceItem[];
  external_reference: string;
  notification_url: string;
  back_urls: MPBackUrls;
  auto_return: string;
  payer?: MPPreferencePayer;
}

export interface MPPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export interface MPPayment {
  id: number;
  status: string;
  external_reference: string;
  transaction_amount: number;
  currency_id: string;
}

export async function createPreference(payload: MPPreferencePayload): Promise<MPPreferenceResponse> {
  // INSANYCK FASE F-01 — usar env tipado
  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`MP API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getPaymentById(id: string): Promise<MPPayment> {
  // INSANYCK FASE F-01 — usar env tipado
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${env.MP_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`MP API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}