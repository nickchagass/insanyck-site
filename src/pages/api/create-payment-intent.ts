// INSANYCK STEP 11 — Payment Intent with Type-Safe Env
import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripe";
import { env, isServerEnvReady } from "@/lib/env.server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // INSANYCK STEP 11 — Runtime guards for environment
  if (!isServerEnvReady()) {
    console.error("[INSANYCK][PaymentIntent] Server environment not ready");
    return res.status(500).json({
      error: "Serviço temporariamente indisponível",
      code: "ENV_NOT_READY",
    });
  }

  // ✅ Segurança: só permite POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { cart, email, fraudScore = 0 } = req.body;

    // ✅ Validação forte
    if (!Array.isArray(cart) || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Dados inválidos fornecidos" });
    }

    // ✅ Antifraude básica (pode evoluir com IA depois)
    if (fraudScore > 6) {
      return res.status(403).json({ error: "Atividade suspeita detectada. Pagamento bloqueado." });
    }

    // ✅ Calcula o total (em centavos)
    const amount = cart.reduce((total: number, item: any) => {
      const preco = typeof item.preco === "number" ? item.preco : 0;
      return total + Math.round(preco * 100);
    }, 0);

    if (amount <= 0) {
      return res.status(400).json({ error: "Carrinho vazio ou valor inválido" });
    }

    // ✅ Criação do PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "brl",
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
      metadata: {
        origem: "checkout-insanyck",
        email,
        produtos: cart.length.toString(),
        fraudScore: fraudScore.toString(),
        timestamp: Date.now().toString(),
      },
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("[STRIPE_ERROR]", error);

    // ✅ Resposta segura para erro genérico
    return res.status(500).json({
      error: "Falha ao processar pagamento. Tente novamente mais tarde.",
    });
  }
}
