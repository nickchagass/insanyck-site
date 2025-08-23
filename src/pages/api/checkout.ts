// INSANYCK STEP 11 — API /api/checkout with Type-Safe Env
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { env, isServerEnvReady } from "@/lib/env.server";

// Zod schema para validação
const CheckoutSchema = z.object({
  items: z.array(z.object({
    variantId: z.string().optional(),
    sku: z.string().optional(),
    qty: z.number().min(1),
  })).min(1),
  currency: z.literal("BRL"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // INSANYCK STEP 11 — Runtime guards for environment
  if (!isServerEnvReady()) {
    console.error('[INSANYCK][Checkout] Server environment not ready');
    return res.status(500).json({ 
      error: "Serviço temporariamente indisponível",
      code: "ENV_NOT_READY" 
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Validar entrada
    const { items, currency } = CheckoutSchema.parse(req.body);

    // TODO: Para cada item, ler preço do DB (variant.price.cents) e estoque
    // Mock temporário - implementar integração com DB real
    const line_items = await Promise.all(
      items.map(async (item) => {
        // MOCK: buscar dados reais do produto/variante
        const mockPrice = 9900; // R$ 99,00 em centavos
        const mockName = item.variantId ? `Produto ${item.variantId}` : `SKU ${item.sku}`;
        
        // Verificar estoque (mock)
        const stockAvailable = 100; // mock
        if (item.qty > stockAvailable) {
          throw new Error(`Estoque insuficiente para ${mockName}`);
        }

        return {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: { 
              name: mockName,
              metadata: {
                variantId: item.variantId || "",
                sku: item.sku || "",
                productSlug: "mock-slug", // buscar do DB
              }
            },
            unit_amount: mockPrice,
          },
          quantity: item.qty,
        };
      })
    );

    // Metadata da sessão
    const cartHash = Math.random().toString(36).substring(7);
    const sessionMetadata = {
      cartHash,
      itemCount: items.length.toString(),
    };

    // Criar Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      metadata: sessionMetadata,
      success_url: `${env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_URL}/checkout/cancel`,
    });

    res.status(200).json({ url: session.url });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Dados inválidos", 
        details: (error as any).errors 
      });
    }

    console.error("Checkout error:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      detail: process.env.NODE_ENV === "development" ? error : undefined
    });
  }
}
