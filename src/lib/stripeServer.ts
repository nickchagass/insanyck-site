// INSANYCK — Stripe server client pinned
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error("Missing STRIPE_SECRET_KEY");

// Usa exatamente a versão definida no .env (ex.: 2025-07-30.basil).
// O cast para any evita conflito de tipos caso @types/stripe ainda não conheça esta string.
const apiVersion = (process.env.STRIPE_API_VERSION as any) || null;

export const stripe = new Stripe(key, { apiVersion });

if (process.env.NODE_ENV === "development") {
  // Ajuda a confirmar no console do dev
  // eslint-disable-next-line no-console
  console.log("[INSANYCK][Stripe] API version:", process.env.STRIPE_API_VERSION || "(account default)");
}
