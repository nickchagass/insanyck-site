// src/pages/api/stripe/checkout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripeServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { items, shippingCents = 0, locale = "pt", email } = (req.body ?? {}) as {
      items: Array<{ qty: number; priceCents: number; title: string; image?: string; slug?: string; variant?: string }>;
      shippingCents?: number;
      locale?: "pt" | "en";
      email?: string;
    };

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items" });
    }

    const currency = locale === "en" ? "usd" : "brl";

    // Origem segura (Vercel/Proxy-friendly)
    const proto = (req.headers["x-forwarded-proto"] as string) || "https";
    const host = (req.headers["x-forwarded-host"] as string) || req.headers.host || "localhost:3000";
    const origin = `${proto}://${host}`;

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      ...items.map((it) => ({
        quantity: Math.max(1, Number(it.qty) || 1),
        price_data: {
          currency,
          unit_amount: Math.max(0, Math.floor(Number(it.priceCents) || 0)), // sempre inteiro
          product_data: {
            name: it.title || "Produto",
            images: it.image ? [it.image] : undefined,
            metadata: { slug: it.slug || "", variant: it.variant || "" },
          },
        },
      })),
      ...(shippingCents > 0
        ? [
            {
              quantity: 1,
              price_data: {
                currency,
                unit_amount: Math.max(0, Math.floor(Number(shippingCents) || 0)),
                product_data: { name: "Frete" },
              },
            } as Stripe.Checkout.SessionCreateParams.LineItem,
          ]
        : []),
    ];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email || undefined,
      // Stripe aceita 'pt-BR' — mantém sua UX
      locale: locale === "en" ? "en" : ("pt-BR" as any),
      line_items,
      allow_promotion_codes: true,
      success_url: `${origin}/pedido/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/sacola`,
      metadata: { locale },
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (err: any) {
    console.error("[stripe/checkout]", err);
    return res.status(500).json({ error: err?.message || "Checkout error" });
  }
}
