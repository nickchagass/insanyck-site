// src/lib/stripe.ts
import Stripe from "stripe";

// Usa exatamente a versão definida no .env (ex.: 2025-07-30.basil)
const apiVersion = (process.env.STRIPE_API_VERSION as any) || null;

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion, // <- trava a versão da API
});

// Log útil em dev
if (process.env.NODE_ENV === "development") {
  // Isso confirma no console qual versão está sendo usada
  console.log("[INSANYCK][Stripe] API version:", process.env.STRIPE_API_VERSION || "(account default)");
}
