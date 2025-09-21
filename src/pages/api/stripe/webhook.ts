// INSANYCK STEP 11 — Webhook Stripe with Type-Safe Env
import type { NextApiRequest, NextApiResponse } from "next";
import { backendDisabled, missingEnv } from "@/lib/backendGuard";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { env, isServerEnvReady } from "@/lib/env.server";

// INSANYCK STEP 4 · Lote 4 — Idempotência em memória (com TTL)
const __seenStripeEvents = new Map<string, number>();
const __SEEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

function __rememberStripe(id: string) {
  const now = Date.now();
  __seenStripeEvents.set(id, now);
  if (__seenStripeEvents.size % 50 === 0) {
    const cutoff = now - __SEEN_TTL_MS;
    for (const [k, t] of __seenStripeEvents) if (t < cutoff) __seenStripeEvents.delete(k);
  }
}

function __alreadyProcessedStripe(id: string) {
  const t = __seenStripeEvents.get(id);
  return !!t && Date.now() - t < __SEEN_TTL_MS;
}

export const config = { api: { bodyParser: false } };

function readBuffer(readable: any) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    readable.on("data", (c: Uint8Array) => chunks.push(Buffer.from(c)));
    readable.on("end", () => resolve(Buffer.concat(chunks)));
    readable.on("error", reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Guards de runtime (não derrubam preview/dev)
  if (backendDisabled) {
    res.status(503).json({ error: "Backend disabled for preview/dev" });
    return;
  }
  if (!isServerEnvReady()) {
    console.error("[INSANYCK][Webhook] Server environment not ready");
    res.status(500).json({ error: "Server configuration error" });
    return;
  }
  const need = missingEnv("STRIPE_WEBHOOK_SECRET");
  if (!need.ok) {
    res.status(503).json({ error: "Missing env", missing: need.absent });
    return;
  }

  // Permitir HEAD para health checks
  if (req.method === "HEAD") {
    res.status(200).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) {
    res.status(400).json({ error: "Missing stripe-signature" });
    return;
  }

  const buf = await readBuffer(req);
  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, String(sig), env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // INSANYCK STEP 4 · Lote 4 — Short-circuit se evento já processado
  if (__alreadyProcessedStripe(event.id)) {
    return res.status(200).json({ ok: true, skipped: "duplicate" });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      // Idempotência
      const exists = await prisma.order.findFirst({ where: { stripeSessionId: session.id } });
      if (exists) {
        res.status(200).json({ ok: true, skipped: "duplicate" });
        return;
      }

      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ["data.price.product"],
      });

      const email = session.customer_details?.email ?? "";
      const currency = (session.currency || "brl").toUpperCase();
      const amountTotal = session.amount_total ?? 0;
      const user = email ? await prisma.user.findFirst({ where: { email } }) : null;

      // Criar pedido e decrementar estoque em transação
      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            userId: user?.id ?? null,
            email,
            stripeSessionId: session.id,
            status: "paid",
            currency,
            amountTotal,
            items: {
              create: (lineItems.data || []).map((li: any) => {
                const qty = li.quantity ?? 1;
                const title = (li.description ?? "Produto").toString();
                const unit = Math.max(0, Math.floor((li.amount_total ?? 0) / qty));
                const product = (li.price?.product as any) || {};
                const slug =
                  product?.metadata?.slug ||
                  title
                    .toLowerCase()
                    .replace(/[^\w]+/g, "-")
                    .replace(/(^-|-$)/g, "");
                const image = Array.isArray(product?.images) ? product.images[0] : undefined;

                const variantId = product?.metadata?.variantId;
                const sku = product?.metadata?.sku;

                return {
                  slug,
                  title,
                  priceCents: unit,
                  qty,
                  image,
                  variant: product?.metadata?.variant || undefined,
                  variantId,
                  sku,
                };
              }),
            },
          },
        });

        // Decrementar estoque por variantId (quando houver)
        for (const li of lineItems.data || []) {
          const product = (li.price?.product as any) || {};
          const variantId = product?.metadata?.variantId;
          const qty = li.quantity ?? 1;

          if (variantId) {
            try {
              await tx.inventory.updateMany({
                where: { variantId, quantity: { gte: qty } },
                data: { quantity: { decrement: qty } },
              });
              // Estoque decrementado (log removed for ESLint)
            } catch (error) {
              console.warn(`Erro ao decrementar estoque para variantId ${variantId}:`, error);
              // Não falha a transação
            }
          }
        }

        return newOrder;
      });

      __rememberStripe(event.id);
      res.status(200).json({ ok: true, orderId: order.id });
      return;
    }
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as any;
      console.warn(`Payment failed for intent: ${paymentIntent.id}`, {
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        lastPaymentError: paymentIntent.last_payment_error,
      });
      __rememberStripe(event.id);
      res.status(200).json({ ok: true, logged: "payment_failed" });
      return;
    }

    // INSANYCK STEP 4 · Lote 4 — Eventos adicionais (logs leves)
    if (event.type === "payment_intent.succeeded") {
      const _pi = event.data.object as any;
      // Payment intent succeeded (log removed for ESLint)
      __rememberStripe(event.id);
      return res.status(200).json({ ok: true, logged: "payment_intent.succeeded" });
    }

    if (event.type === "charge.refunded") {
      const _charge = event.data.object as any;
      // Charge refunded (log removed for ESLint)
      __rememberStripe(event.id);
      return res.status(200).json({ ok: true, logged: "charge.refunded" });
    }

    __rememberStripe(event.id);
    res.status(200).json({ received: true });
    return;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("[stripe/webhook]", err);
    __rememberStripe(event.id);
    res.status(500).json({ error: err?.message || "Webhook handler error" });
    return;
  }
}
