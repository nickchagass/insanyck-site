import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { backendDisabled } from "@/lib/backendGuard";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
// INSANYCK STEP F-MP — Import para pagamento híbrido
import { createPixPayment } from "@/lib/mp";

const bodySchema = z.object({
  items: z.array(z.object({
    variantId: z.string().optional(),
    sku: z.string().optional(),
    qty: z.number().int().min(1).max(10),
  })).min(1),
  currency: z.literal('BRL'),
  successUrl: z.string().url().optional(),
  // INSANYCK STEP F-MP — Provider opcional (stripe | mercadopago)
  provider: z.enum(['stripe', 'mercadopago']).optional(),
  // INSANYCK STEP F-MP.2 — Method para diferenciar PIX vs Card
  method: z.enum(['pix', 'card']).optional(),
  // INSANYCK STEP F-MP — Email obrigatório para MP quando usuário não estiver logado
  email: z.string().email().optional(),
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

  // INSANYCK STEP F-MP — Decisão de provider baseada em feature flag
  const featureFlag = process.env.NEXT_PUBLIC_CHECKOUT_PROVIDER || 'stripe';
  const requestedProvider = body.provider || 'stripe';

  // Se feature flag !== 'hybrid', forçar Stripe (rollback safety)
  const finalProvider = featureFlag === 'hybrid' ? requestedProvider : 'stripe';

  // INSANYCK STEP F-MP.2 — Email validation (HARDENED: no non-null assertions)
  const payerEmail = session?.user?.email || body.email;

  if (finalProvider === 'mercadopago' && !payerEmail) {
    return res.status(400).json({
      error: "Email is required for MercadoPago payments"
    });
  }

  // INSANYCK STEP F-MP.2 — Email validation PASSED - safe to use
  if (finalProvider === 'mercadopago' && typeof payerEmail !== 'string') {
    return res.status(500).json({
      error: "Internal error: email validation failed"
    });
  }

  try {
    // INSANYCK STEP F-MP.2 — Fluxo híbrido: MercadoPago (PIX or Card)
    if (finalProvider === 'mercadopago') {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

      // Calcular total
      const totalCents = resolved.reduce((sum, r) => sum + r.unit_amount * r.qty, 0);
      const totalBRL = totalCents / 100;

      // INSANYCK STEP F-MP.2 — Method default: pix
      const method = body.method || 'pix';

      // Criar Order no banco (status: pending)
      // INSANYCK STEP F-MP.2 — Email agora é garantido (não usa !)
      const order = await prisma.order.create({
        data: {
          status: 'pending',
          amountTotal: totalCents,
          currency: currency.toUpperCase(),
          paymentProvider: 'mercadopago',
          userId: session?.user?.id || null,
          email: payerEmail as string,
          items: {
            create: resolved.map((r) => ({
              slug: r.slug,
              title: r.title,
              qty: r.qty,
              priceCents: r.unit_amount,
              variantId: r.variantId,
              sku: r.sku,
            })),
          },
        },
      });

      // INSANYCK STEP F-MP.2 — Card redirect flow
      if (method === 'card') {
        // Chamar create-preference para obter init_point
        const preferenceRes = await fetch(`${baseUrl}/api/mp/create-preference`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            items: resolved.map((r) => ({
              title: r.title,
              quantity: r.qty,
              unit_price: r.unit_amount / 100,
              currency_id: 'BRL',
            })),
            payer: {
              email: payerEmail as string,
            },
          }),
        });

        if (!preferenceRes.ok) {
          throw new Error('Failed to create MP preference');
        }

        const preferenceData = await preferenceRes.json();

        return res.status(200).json({
          provider: 'mercadopago',
          method: 'card',
          orderId: order.id,
          initPoint: preferenceData.init_point,
        });
      }

      // INSANYCK STEP F-MP — PIX flow (original, mas sem !)
      const pixPayment = await createPixPayment({
        transaction_amount: totalBRL,
        description: `INSANYCK Order ${order.id}`,
        payment_method_id: 'pix',
        payer: {
          email: payerEmail as string,
        },
        external_reference: order.id,
        notification_url: `${baseUrl}/api/mp/webhook`,
      });

      // Atualizar Order com mpPaymentId
      await prisma.order.update({
        where: { id: order.id },
        data: { mpPaymentId: String(pixPayment.id) },
      });

      // Retornar dados do PIX para o frontend
      return res.status(200).json({
        provider: 'mercadopago',
        method: 'pix',
        paymentId: pixPayment.id,
        orderId: order.id,
        qrCode: pixPayment.point_of_interaction.transaction_data.qr_code,
        qrCodeBase64: pixPayment.point_of_interaction.transaction_data.qr_code_base64,
        expiresAt: pixPayment.date_of_expiration,
        amount: totalBRL,
      });
    }

    // INSANYCK STEP F-MP — Fluxo original: Stripe (preservado 100%)
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