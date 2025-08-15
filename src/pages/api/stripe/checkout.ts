// INSANYCK STEP 7 — Stripe Checkout Sessions (BRL/EN-safe)
// src/pages/api/stripe/checkout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-07-30.basil",
});

type BodyItem = {
  title: string;
  priceCents: number;
  qty: number;
  image?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const origin =
      (process.env.NEXT_PUBLIC_SITE_URL as string) ||
      `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`;

    const { items, locale = "pt", shippingCents = 0 } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items required" });
    }

    const currency = locale?.toString().startsWith("en") ? "USD" : "BRL";

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      ...items.map((it: BodyItem) => ({
        quantity: it.qty || 1,
        price_data: {
          currency,
          product_data: {
            name: it.title,
            images: it.image ? [it.image] : undefined,
          },
          unit_amount: Math.max(0, Math.round(it.priceCents || 0)),
        },
      })),
    ];

    if (shippingCents && shippingCents > 0) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency,
          product_data: { name: locale?.startsWith("en") ? "Shipping" : "Frete" },
          unit_amount: Math.max(0, Math.round(shippingCents)),
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      allow_promotion_codes: true,
      locale: locale?.startsWith("en") ? "en" : "pt",
      success_url: `${origin}/pedido/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/sacola`,
      shipping_address_collection: { allowed_countries: ["BR", "US"] },
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error("Stripe checkout error", err);
    return res.status(500).json({ error: "Stripe error" });
  }
}
