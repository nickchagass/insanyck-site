// INSANYCK PAYMENTS-P0 — Shared Checkout Types
// ==============================================
// Single source of truth for checkout flow types.
// Used by facade and all flow handlers.
// CONTRACT: These types match the existing API request/response shapes EXACTLY.

import type { Session } from 'next-auth';
import type { Order } from '@prisma/client';

/**
 * Item resolved from database with all required fields for checkout.
 * Matches existing resolved array shape in create-session.ts.
 */
export interface ResolvedItem {
  variantId: string;
  sku: string | null;
  slug: string;
  title: string;
  image?: string;
  unit_amount: number;  // cents
  qty: number;
}

/**
 * Context passed to all flow handlers.
 * Contains everything needed to process a checkout.
 */
export interface CheckoutContext {
  session: Session | null;
  payerEmail: string | null;
  baseUrl: string;
  currency: 'BRL';
  requestId: string;  // For observability
  origin: string;     // For image URL sanitization
}

/**
 * Stripe flow result — redirect URL.
 * Matches existing: { url: string }
 */
export interface StripeFlowResult {
  url: string;
}

/**
 * MercadoPago PIX flow result — QR code data.
 * Matches existing snake_case response shape EXACTLY.
 */
export interface MpPixFlowResult {
  provider: 'mercadopago';
  method: 'pix';
  payment_id: number;
  order_id: string;
  qr_code: string;
  qr_code_base64: string;
  expires_at: string;
  amount: number;       // BRL decimal (backward compat)
  amount_cents: number; // Integer cents (preferred)
}

/**
 * MercadoPago Card redirect flow result — init_point URL.
 * Matches existing response shape EXACTLY.
 */
export interface MpCardRedirectFlowResult {
  provider: 'mercadopago';
  method: 'card';
  order_id: string;
  init_point: string;
  preference_id?: string;
}

/**
 * MercadoPago Bricks flow result — preference_id for in-page form.
 * Matches existing response shape EXACTLY.
 */
export interface MpBricksFlowResult {
  provider: 'mercadopago';
  method: 'card_bricks';
  order_id: string;
  preference_id: string;
  amount: number;  // cents
}

/**
 * Union of all possible flow results.
 */
export type FlowResult =
  | StripeFlowResult
  | MpPixFlowResult
  | MpCardRedirectFlowResult
  | MpBricksFlowResult;

/**
 * Error result shape (consistent across flows).
 * Matches existing error response shape.
 */
export interface FlowError {
  error: string;
  details?: unknown;
}

/**
 * Order with minimal fields needed by flow handlers.
 */
export type CheckoutOrder = Pick<Order, 'id'>;
