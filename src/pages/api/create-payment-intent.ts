// INSANYCK STEP 7 — Payment Intent (opcional, para Stripe Elements)
// src/pages/api/create-payment-intent.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { items, locale = "pt", shippingCents = 0 } = req.body || {};
    const currency = locale?.toString().startsWith("en") ? "USD" : "BRL";

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items required" });
    }

    const amount =
      items.reduce(
        (acc: number, it: any) => acc + Math.max(0, Math.round(it.priceCents || 0)) * (it.qty || 1),
        0
      ) + Math.max(0, Math.round(shippingCents || 0));

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error("create-payment-intent error", err);
    return res.status(500).json({ error: "Stripe error" });
  }
}
