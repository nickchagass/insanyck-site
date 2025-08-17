// src/lib/stripeServer.ts
// INSANYCK — Stripe server client pinned
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
const versionRaw = process.env.STRIPE_API_VERSION; // ex.: 2025-07-30.basil

if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
if (!versionRaw) throw new Error("Missing STRIPE_API_VERSION (ex.: 2025-07-30.basil)");

export const stripe = new Stripe(key, {
  // usar 'as any' evita quebra quando os tipos ainda não conhecem essa versão
  apiVersion: versionRaw as any,
});

if (process.env.NODE_ENV === "development") {
  console.log("[INSANYCK][Stripe] API version:", versionRaw);
}
