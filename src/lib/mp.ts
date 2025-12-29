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

// INSANYCK STEP F-MP — Interfaces para PIX Payment API
export interface MPPixPaymentPayload {
  transaction_amount: number;
  description: string;
  payment_method_id: 'pix';
  payer: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  external_reference: string;
  notification_url?: string;
}

export interface MPPixPaymentResponse {
  id: number;
  status: string;
  status_detail: string;
  transaction_amount: number;
  currency_id: string;
  external_reference: string;
  date_created: string;
  date_of_expiration: string;
  point_of_interaction: {
    type: string;
    transaction_data: {
      qr_code: string;
      qr_code_base64: string;
      ticket_url: string;
    };
  };
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

// INSANYCK STEP F-MP — Criar pagamento PIX com QR Code
export async function createPixPayment(payload: MPPixPaymentPayload): Promise<MPPixPaymentResponse> {
  const response = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.MP_ACCESS_TOKEN}`,
      'X-Idempotency-Key': `pix-${payload.external_reference}-${Date.now()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `MP PIX Payment API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
    );
  }

  return response.json();
}