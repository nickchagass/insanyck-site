import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { backendDisabled } from "@/lib/backendGuard";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
// INSANYCK STEP F-MP + MP-HOTFIX-03 — Import para pagamento híbrido
import { createPixPayment, normalizePixResponse } from "@/lib/mp";

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
  // INSANYCK STEP F-MP.2 + MP-HOTFIX-03 — Method para diferenciar PIX vs Card vs Card Bricks
  method: z.enum(['pix', 'card', 'card_bricks']).optional(),
  // INSANYCK STEP F-MP — Email obrigatório para MP quando usuário não estiver logado
  email: z.string().email().optional(),
});

// INSANYCK HOTFIX 1.2 — Tipo inferido do schema
type CheckoutBody = z.infer<typeof bodySchema>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // INSANYCK STEP E-01
  if (backendDisabled) return res.status(503).json({ error: "Backend disabled for preview/dev" });
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  // INSANYCK STEP E-01 + MP-HOTFIX-01 — Headers em APIs sensíveis
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Vary", "Authorization");
  res.setHeader("Content-Type", "application/json");

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

  // INSANYCK STEP F-MP + MP-HOTFIX-04 — Decisão de provider baseada em feature flag
  const featureFlag = process.env.NEXT_PUBLIC_CHECKOUT_PROVIDER || 'stripe';
  const requestedProvider = body.provider || 'stripe';

  // INSANYCK MP-HOTFIX-04 — Debug logging to diagnose routing issues
  if (process.env.NODE_ENV === 'development') {
    console.log('[CreateSession] Payment Router Debug:', {
      featureFlag,
      requestedProvider,
      method: body.method,
      hasEmail: !!body.email,
      itemCount: items.length,
    });
  }

  // Se feature flag !== 'hybrid', forçar Stripe (rollback safety)
  const finalProvider = featureFlag === 'hybrid' ? requestedProvider : 'stripe';

  // INSANYCK MP-HOTFIX-04 — Warn if MP was requested but feature flag is off
  if (requestedProvider === 'mercadopago' && finalProvider !== 'mercadopago') {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[CreateSession] WARNING: MercadoPago requested but feature flag is not "hybrid". Falling back to Stripe.', {
        featureFlag,
        requestedProvider,
        finalProvider,
      });
    }
    return res.status(400).json({
      error: 'MercadoPago payments not enabled. Please set NEXT_PUBLIC_CHECKOUT_PROVIDER=hybrid',
      details: process.env.NODE_ENV === 'development' ? { featureFlag, requestedProvider } : undefined,
    });
  }

  // INSANYCK MP-HOTFIX-04 — Additional debug: final routing decision
  if (process.env.NODE_ENV === 'development') {
    console.log('[CreateSession] Final Provider:', finalProvider);
  }

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

      // INSANYCK MP-HOTFIX-03 — Card Bricks flow (in-page card form, preferred)
      if (method === 'card_bricks') {
        try {
          // Chamar create-preference para obter preference_id (needed by Bricks)
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
            const errorText = await preferenceRes.text();
            if (process.env.NODE_ENV === 'development') {
              console.error('[MP-BRICKS] Preference creation failed:', {
                status: preferenceRes.status,
                statusText: preferenceRes.statusText,
                body: errorText,
              });
            }
            return res.status(500).json({
              error: 'Failed to create MercadoPago preference for Bricks',
              details: process.env.NODE_ENV === 'development' ? errorText : undefined,
            });
          }

          const preferenceData = await preferenceRes.json();

          if (!preferenceData.id || typeof preferenceData.id !== 'string') {
            if (process.env.NODE_ENV === 'development') {
              console.error('[MP-BRICKS] Invalid preference response (missing id):', {
                status: preferenceRes.status,
                preferenceData: {
                  id: preferenceData.id,
                  received_fields: Object.keys(preferenceData),
                },
              });
            }
            return res.status(500).json({
              error: 'MercadoPago preference missing ID',
              details: process.env.NODE_ENV === 'development'
                ? { received_fields: Object.keys(preferenceData) }
                : undefined,
            });
          }

          // INSANYCK MP-HOTFIX-03 — Dev diagnostics
          if (process.env.NODE_ENV === 'development') {
            console.log('[MP-BRICKS] Preference created successfully:', {
              preference_id: preferenceData.id,
              order_id: order.id,
              amount_cents: totalCents,
            });
          }

          // INSANYCK MP-HOTFIX-03 — Return preference_id for Bricks initialization
          return res.status(200).json({
            provider: 'mercadopago',
            method: 'card_bricks',
            order_id: order.id,
            preference_id: preferenceData.id,
            amount: totalCents,
          });
        } catch (bricksError: any) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[MP-BRICKS] Card Bricks preparation error:', bricksError);
          }
          return res.status(500).json({
            error: 'Failed to prepare Bricks card payment',
            details: process.env.NODE_ENV === 'development' ? bricksError.message : undefined,
          });
        }
      }

      // INSANYCK STEP F-MP.2 + MP-HOTFIX-01 — Card redirect flow (legacy, kept for backward compat)
      if (method === 'card') {
        try {
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
            const errorText = await preferenceRes.text();
            if (process.env.NODE_ENV === 'development') {
              console.error('[MP-HOTFIX-01] Preference creation failed:', {
                status: preferenceRes.status,
                statusText: preferenceRes.statusText,
                body: errorText,
              });
            }
            return res.status(500).json({
              error: 'Failed to create MercadoPago preference',
              details: process.env.NODE_ENV === 'development' ? errorText : undefined,
            });
          }

          const preferenceData = await preferenceRes.json();

          // INSANYCK MP-HOTFIX-02 — Normalize init_point (sandbox fallback)
          const initPoint = preferenceData.init_point || preferenceData.sandbox_init_point;

          if (!initPoint || typeof initPoint !== 'string') {
            if (process.env.NODE_ENV === 'development') {
              console.error('[MP-HOTFIX-02] Invalid preference response (missing init_point and sandbox_init_point):', {
                status: preferenceRes.status,
                statusText: preferenceRes.statusText,
                preferenceData: {
                  id: preferenceData.id,
                  init_point: preferenceData.init_point,
                  sandbox_init_point: preferenceData.sandbox_init_point,
                },
              });
            }
            return res.status(500).json({
              error: 'MercadoPago preference missing init_point',
              details: process.env.NODE_ENV === 'development'
                ? { received_fields: Object.keys(preferenceData) }
                : undefined,
            });
          }

          // INSANYCK MP-HOTFIX-02 — Dev diagnostics
          if (process.env.NODE_ENV === 'development') {
            console.log('[MP-HOTFIX-02] Card preference created successfully:', {
              preference_id: preferenceData.id,
              init_point: initPoint,
              is_sandbox: !!preferenceData.sandbox_init_point,
            });
          }

          // INSANYCK MP-HOTFIX-02 — Stable JSON contract (snake_case to match MP conventions)
          return res.status(200).json({
            provider: 'mercadopago',
            method: 'card',
            order_id: order.id,
            init_point: initPoint,
            preference_id: preferenceData.id || undefined,
          });
        } catch (cardError: any) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[MP-HOTFIX-01] Card payment creation error:', cardError);
          }
          return res.status(500).json({
            error: 'Failed to process card payment',
            details: process.env.NODE_ENV === 'development' ? cardError.message : undefined,
          });
        }
      }

      // INSANYCK STEP F-MP + MP-HOTFIX-03 — PIX flow (normalized + robust)
      try {
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

        // INSANYCK MP-HOTFIX-03 — Use normalized extractor
        const normalized = normalizePixResponse(pixPayment);

        if (!normalized) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[MP-PIX] Invalid PIX response (missing required fields):', {
              payment_id: pixPayment?.id,
              status: pixPayment?.status,
              has_qr_code: !!pixPayment?.point_of_interaction?.transaction_data?.qr_code,
              has_qr_code_base64: !!pixPayment?.point_of_interaction?.transaction_data?.qr_code_base64,
              point_of_interaction_keys: pixPayment?.point_of_interaction
                ? Object.keys(pixPayment.point_of_interaction)
                : 'missing',
              transaction_data_keys: pixPayment?.point_of_interaction?.transaction_data
                ? Object.keys(pixPayment.point_of_interaction.transaction_data)
                : 'missing',
            });
          }
          return res.status(500).json({
            error: 'MercadoPago PIX payment missing QR code',
            details: process.env.NODE_ENV === 'development'
              ? { payment_status: pixPayment?.status }
              : undefined,
          });
        }

        // INSANYCK MP-HOTFIX-03 — Dev diagnostics
        if (process.env.NODE_ENV === 'development') {
          console.log('[MP-PIX] Payment created successfully:', {
            payment_id: normalized.payment_id,
            order_id: order.id,
            has_qr_code: !!normalized.qr_code,
            has_qr_code_base64: !!normalized.qr_code_base64,
            expires_at: normalized.expires_at,
          });
        }

        // Atualizar Order com mpPaymentId
        await prisma.order.update({
          where: { id: order.id },
          data: { mpPaymentId: String(normalized.payment_id) },
        });

        // INSANYCK MP-HOTFIX-03 — Stable JSON contract (snake_case)
        return res.status(200).json({
          provider: 'mercadopago',
          method: 'pix',
          payment_id: normalized.payment_id,
          order_id: order.id,
          qr_code: normalized.qr_code,
          qr_code_base64: normalized.qr_code_base64,
          expires_at: normalized.expires_at,
          amount: totalBRL,
        });
      } catch (pixError: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[MP-PIX] Payment creation error:', {
            error_name: pixError?.name,
            error_message: pixError?.message,
            error_cause: pixError?.cause,
            error_stack: pixError?.stack?.split('\n').slice(0, 3),
          });
        }
        return res.status(500).json({
          error: 'Failed to create PIX payment',
          details: process.env.NODE_ENV === 'development' ? pixError.message : undefined,
        });
      }
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