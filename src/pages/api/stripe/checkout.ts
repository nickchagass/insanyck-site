// INSANYCK STEP 11 — Stripe Checkout (Session) with Type-Safe Env
import type { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { env, isServerEnvReady } from "@/lib/env.server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // INSANYCK STEP 11 — Runtime guards for environment
  if (!isServerEnvReady()) {
    console.error('[INSANYCK][Stripe Checkout] Server environment not ready');
    return res.status(500).json({ 
      error: "Service temporarily unavailable",
      code: "ENV_NOT_READY" 
    });
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  try {
    const { items, shippingCents = 0, locale = "pt", email } = req.body || {};
    const currency = locale === "en" ? "usd" : "brl";

    const origin =
      (req.headers["x-forwarded-proto"] ? `${req.headers["x-forwarded-proto"]}://` : "https://") +
      (req.headers["x-forwarded-host"] || req.headers.host);

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      ...(Array.isArray(items)
        ? items.map((it: any) => ({
            quantity: Math.max(1, Number(it.qty) || 1),
            price_data: {
              currency,
              unit_amount: Number(it.priceCents) || 0,
              product_data: {
                name: it.title || "Produto",
                images: it.image ? [it.image] : undefined,
                metadata: { 
                  slug: it.slug || "", 
                  variant: it.variant || "",
                  // INSANYCK STEP 10 — Metadados para o webhook decrementar estoque
                  variantId: it.variantId || "",
                  sku: it.sku || "",
                  title: it.title || ""
                },
              },
            },
          }))
        : []),
      ...(shippingCents > 0
        ? [{
            quantity: 1,
            price_data: {
              currency,
              unit_amount: Number(shippingCents) || 0,
              product_data: { name: "Frete" },
            },
          }]
        : []),
    ];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email || undefined,
      locale: locale === "en" ? "en" : "pt-BR",
      line_items,
      allow_promotion_codes: true,
      success_url: `${origin}/pedido/{CHECKOUT_SESSION_ID}`, // usa a rota existente /pedido/[id]
      cancel_url: `${origin}/sacola`,
      metadata: { locale },
    });

    // Compatível com seu front atual: redirecione usando `url` OU `sessionId`
    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("[stripe/checkout]", err);
    return res.status(500).json({ error: err?.message || "Checkout error" });
  }
}
