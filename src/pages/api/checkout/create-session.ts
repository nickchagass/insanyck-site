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

// INSANYCK HOTFIX 1.2 — Tipo inferido do schema
type CheckoutBody = z.infer<typeof bodySchema>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // INSANYCK STEP E-01
  if (backendDisabled) return res.status(503).json({ error: "Backend disabled for preview/dev" });
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  // INSANYCK STEP E-01 — Headers em APIs sensíveis
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Vary", "Authorization");

  // INSANYCK HOTFIX 1.1 — Normalizar body (string → objeto)
  const rawBody =
    typeof req.body === "string"
      ? (() => {
          try {
            return JSON.parse(req.body);
          } catch (err) {
            if (process.env.NODE_ENV === "development") {
              console.error(
                "[INSANYCK CHECKOUT API] Failed to parse JSON body",
                err,
                req.body
              );
            }
            return null;
          }
        })()
      : req.body;

  if (!rawBody || typeof rawBody !== "object") {
    return res.status(400).json({
      error: "Invalid request body",
    });
  }

  // INSANYCK HOTFIX 1.2 — Fluxo tolerante com fallback
  const parsed = bodySchema.safeParse(rawBody);
  let body: CheckoutBody;

  if (parsed.success) {
    body = parsed.data;
  } else {
    const flattened = parsed.error.flatten();

    // INSANYCK HOTFIX 1.2 — Log detalhado em desenvolvimento
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[INSANYCK CHECKOUT API] Body validation error:",
        JSON.stringify(flattened, null, 2)
      );
      console.error(
        "[INSANYCK CHECKOUT API] Raw body received:",
        JSON.stringify(rawBody, null, 2)
      );
    }

    // INSANYCK HOTFIX 1.2 — Construir fallback body tolerante
    const fallback = rawBody as any;
    const itemsFromBody = Array.isArray(fallback.items) ? fallback.items : [];

    if (itemsFromBody.length === 0) {
      return res.status(400).json({
        error: "Checkout items are missing or invalid.",
        details: flattened,
      });
    }

    body = {
      items: itemsFromBody.map((it: any) => ({
        variantId: typeof it.variantId === "string" ? it.variantId : undefined,
        sku: typeof it.sku === "string" ? it.sku : undefined,
        qty:
          typeof it.qty === "number"
            ? it.qty
            : Number(it.qty ?? 1) || 1,
      })),
      currency: "BRL",
      successUrl: typeof fallback.successUrl === "string" ? fallback.successUrl : undefined,
    };
  }

  const session = await getServerSession(req, res, authOptions);
  const { items, currency, successUrl } = body;

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
    // INSANYCK HOTFIX STRIPE-IMG-URL-01 — obter origin confiável para URLs absolutas
    const origin =
      req.headers.origin ||
      process.env.NEXT_PUBLIC_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const line_items = resolved.map((r) => {
      // INSANYCK HOTFIX STRIPE-IMG-URL-01 — sanitizar URL da imagem
      let safeImageUrl: string | undefined = undefined;

      if (r.image) {
        try {
          // Se já é uma URL absoluta (http:// ou https://), usar diretamente
          if (r.image.startsWith('http://') || r.image.startsWith('https://')) {
            safeImageUrl = r.image;
          }
          // Se é caminho relativo, construir URL absoluta
          else if (r.image.startsWith('/')) {
            safeImageUrl = new URL(r.image, origin).toString();
          }
          // Se não é nem relativo nem absoluto válido, omitir
          else {
            safeImageUrl = undefined;
          }
        } catch (err) {
          // Se falhar ao construir URL, omitir imagem (melhor que quebrar o checkout)
          console.warn('[INSANYCK][CHECKOUT] Invalid image URL, omitting:', r.image, err);
          safeImageUrl = undefined;
        }
      }

      return {
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: r.unit_amount,
          product_data: {
            name: r.title,
            ...(safeImageUrl ? { images: [safeImageUrl] } : {}),
            metadata: {
              variantId: r.variantId,
              sku: r.sku || "",
              slug: r.slug,
              variant: r.title || "",
            },
          },
        },
        quantity: r.qty,
      };
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
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
    // INSANYCK HOTFIX STRIPE-IMG-URL-01 — log detalhado para debug
    console.error('[INSANYCK][CHECKOUT] Stripe session creation error:', {
      code: err?.code,
      param: err?.param,
      message: err?.message,
    });
    return res.status(500).json({ error: err?.message ?? "Failed to create checkout session" });
  }
}