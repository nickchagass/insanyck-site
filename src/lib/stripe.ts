// INSANYCK STEP 11 — Stripe Client Centralized and Type-Safe
import Stripe from "stripe";
import { env } from './env.server';

// Single Stripe instance with validated environment
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: env.STRIPE_API_VERSION as Stripe.StripeConfig['apiVersion'],
});

// Development logging
if (env.NODE_ENV === 'development') {
  console.log('[INSANYCK][Stripe] Initialized with API version:', env.STRIPE_API_VERSION);
}
