import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { backendDisabled } from "@/lib/backendGuard";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const bodySchema = z.object({
  items: z.array(z.object({
    variantId: z.string().optional(),
    sku: z.string().optional(),
    qty: z.number().int().min(1).max(10),
  })).min(1),
  currency: z.literal('BRL'),
  successUrl: z.string().url().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (backendDisabled) return res.status(503).json({ error: "Backend disabled for preview/dev" });
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  res.setHeader("Cache-Control", "no-store");

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
  }

  const session = await getServerSession(req, res, authOptions);
  const { items, currency, successUrl } = parsed.data;

  // Resolve itens contra o banco
  const resolved: Array<{
    variantId: string;
    sku: string | null;
    slug: string;
    title: string;
    image?: string;
    unit_amount: number;
    qty: number;
  }> = [];

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const variant = it.variantId
      ? await prisma.variant.findUnique({
          where: { id: it.variantId },
          include: {
            product: { include: { images: true } },
            price: true,
          },
        })
      : it.sku
      ? await prisma.variant.findUnique({
          where: { sku: it.sku },
          include: {
            product: { include: { images: true } },
            price: true,
          },
        })
      : null;

    if (!variant || !variant.price) {
      return res.status(422).json({ error: "Variant not found", at: i });
    }

    resolved.push({
      variantId: variant.id,
      sku: variant.sku,
      slug: variant.product.slug,
      title: variant.title || variant.product.title,
      image: variant.product.images[0]?.url,
      unit_amount: variant.price.cents,
      qty: it.qty,
    });
  }

  if (resolved.length === 0) {
    return res.status(400).json({ error: "No valid items" });
  }

  try {
    const line_items = resolved.map((r) => ({
      price_data: {
        currency: currency.toLowerCase(),
        unit_amount: r.unit_amount,
        product_data: {
          name: r.title,
          images: r.image ? [r.image] : undefined,
          metadata: {
            variantId: r.variantId,
            sku: r.sku || "",
            slug: r.slug,
            variant: r.title || "",
          },
        },
      },
      quantity: r.qty,
    }));

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const success_url = (successUrl || `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`);
    const cancel_url = `${baseUrl}/checkout/cancel`;

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url,
      cancel_url,
      customer_email: session?.user?.email || undefined,
      metadata: {
        source: "checkout_create_session",
        itemCount: String(resolved.length),
      },
    });

    return res.status(200).json({ url: stripeSession.url });
  } catch (err: any) {
    console.error('Stripe session creation error:', err);
    return res.status(500).json({ error: err?.message ?? "Failed to create checkout session" });
  }
}