// INSANYCK STEP 10 — Webhook Stripe com gestão de estoque
// INSANYCK STEP 8 + decrementar inventory por variantId
// Webhook unificado usando versão do .env
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripeServer";

export const config = { api: { bodyParser: false } };

function readBuffer(readable: any) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    readable.on("data", (c: Uint8Array) => chunks.push(Buffer.from(c)));
    readable.on("end", () => resolve(Buffer.concat(chunks)));
    readable.on("error", reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const sig = req.headers["stripe-signature"];
  if (!sig) return res.status(400).json({ error: "Missing stripe-signature" });

  const buf = await readBuffer(req);
  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig.toString(), process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      // Idempotência
      const exists = await prisma.order.findFirst({ where: { stripeSessionId: session.id } });
      if (exists) return res.status(200).json({ ok: true, skipped: "duplicate" });

      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ["data.price.product"],
      });

      const email = session.customer_details?.email ?? "";
      const currency = (session.currency || "brl").toUpperCase();
      const amountTotal = session.amount_total ?? 0;
      const user = email ? await prisma.user.findFirst({ where: { email } }) : null;

      // INSANYCK STEP 10 — Criar pedido e decrementar estoque em transação
      const order = await prisma.$transaction(async (tx) => {
        // Criar o pedido
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
                  title.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, "");
                const image = Array.isArray(product?.images) ? product.images[0] : undefined;
                
                // INSANYCK STEP 10 — Capturar variantId e sku do metadata
                const variantId = product?.metadata?.variantId;
                const sku = product?.metadata?.sku;
                
                return { 
                  slug, 
                  title, 
                  priceCents: unit, 
                  qty, 
                  image, 
                  variant: product?.metadata?.variant || undefined,
                  // Novos campos
                  variantId,
                  sku
                };
              }),
            },
          },
        });

        // Decrementar estoque para cada item com variantId
        for (const li of lineItems.data || []) {
          const product = (li.price?.product as any) || {};
          const variantId = product?.metadata?.variantId;
          const qty = li.quantity ?? 1;

          if (variantId) {
            try {
              // Decrementar estoque da variante
              await tx.inventory.updateMany({
                where: { 
                  variantId: variantId,
                  quantity: { gte: qty } // Só decrementa se há estoque suficiente
                },
                data: {
                  quantity: { decrement: qty }
                }
              });

              console.log(`Estoque decrementado: variantId=${variantId}, qty=${qty}`);
            } catch (error) {
              console.warn(`Erro ao decrementar estoque para variantId ${variantId}:`, error);
              // Não falha a transação, apenas loga o erro
            }
          }
        }

        return newOrder;
      });

      return res.status(200).json({ ok: true, orderId: order.id });
    }
    return res.status(200).json({ received: true });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("[stripe/webhook]", err);
    return res.status(500).json({ error: err?.message || "Webhook handler error" });
  }
}
