import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil" as const,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const { items, email } = req.body;
  const line_items = items.map((item: any) => ({
    price_data: {
      currency: "brl",
      product_data: { name: item.nome },
      unit_amount: Math.round(item.preco * 100),
    },
    quantity: 1,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      customer_email: email,
      success_url: `${process.env.NEXT_PUBLIC_URL}/sucesso`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/carrinho`,
    });
    res.status(200).json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: "Stripe error", detail: e });
  }
}
