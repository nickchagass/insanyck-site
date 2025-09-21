// INSANYCK STEP 11 — Stripe Client Centralized and Type-Safe
import Stripe from "stripe";
import { env } from './env.server';

// Single Stripe instance with validated environment
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: env.STRIPE_API_VERSION as Stripe.StripeConfig['apiVersion'],
});

// Stripe initialized for development (log removed for ESLint)
