// INSANYCK — Stripe server client pinned
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error("Missing STRIPE_SECRET_KEY");

// Pinned + type-safe: se STRIPE_API_VERSION não vier, usa 2025-07-30.basil (sua versão)
const apiVersion = (
  process.env.STRIPE_API_VERSION ?? "2025-07-30.basil"
) as Stripe.StripeConfig["apiVersion"];

export const stripe = new Stripe(key, { apiVersion });

if (process.env.NODE_ENV === "development") {
  // Loga a versão efetiva (útil para garantir que está pinado corretamente)
  // eslint-disable-next-line no-console
  console.log("[INSANYCK][Stripe] API version:", apiVersion);
}
