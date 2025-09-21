// INSANYCK STEP 11 — Webhook with Type-Safe Env and Runtime Guards
import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { env, isServerEnvReady } from "@/lib/env.server";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // INSANYCK STEP 11 — Runtime guards for environment
  if (!isServerEnvReady()) {
    console.error('[INSANYCK][Webhook] Server environment not ready');
    res.status(500).json({ 
      error: "Service temporarily unavailable",
      code: "ENV_NOT_READY" 
    });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const sig = req.headers["stripe-signature"] as string;
  const buf = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[INSANYCK][Webhook] Signature verification failed:', err);
    res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    return;
  }

  // Exemplo: ação quando pagamento é completado
  if (event.type === "checkout.session.completed") {
    const _session = event.data.object as Stripe.Checkout.Session;
    // Salve no banco de dados, dispare e-mail, etc.
  }

  res.status(200).json({ received: true });
}
