// INSANYCK STEP 8 — create-payment-intent robusto (erros claros + Allow + idempotência)
// src/pages/api/create-payment-intent.ts

import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

// ===== util: parse seguro de valores (aceita "R$ 199,90", 199.9, "19990") =====
function toCents(input: number | string | null | undefined): number {
  if (input == null) return 0;
  if (typeof input === "number" && Number.isFinite(input)) {
    // Se veio número decimal (ex.: 199.9), converte para centavos
    return Math.round(input * 100);
  }
  const raw = String(input).trim();
  if (!raw) return 0;
  // remove tudo que não for dígito, vírgula, ponto ou sinal
  const norm = raw.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const val = Number(norm);
  return Number.isFinite(val) ? Math.round(val * 100) : 0;
}

type Data =
  | { clientSecret: string; paymentIntentId: string }
  | { error: string; details?: string; code?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  // Nunca cachear resposta de API de pagamento
  res.setHeader("Cache-Control", "no-store, max-age=0");

  // CORS/preflight básico (se necessário, você pode remover o OPTIONS)
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Verificações de ambiente
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return res.status(500).json({
      error: "Stripe não configurado",
      details: "STRIPE_SECRET_KEY ausente no ambiente",
    });
  }

  // Instância do Stripe (API version estável)
  const stripe = new Stripe(secret, { apiVersion: "2024-06-20" });

  try {
    const {
      amount,            // number | string | centavos
      currency,          // "brl" (padrão)
      description,       // descrição opcional
      metadata,          // record opcional
      receipt_email,     // e-mail opcional p/ recibo
      idempotencyKey,    // opcional: string para idempotência
      capture_method,    // opcional: "automatic" | "manual"
      customer,          // opcional: id do customer já existente
    } = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};

    // Moeda padrão
    const cur = (currency || "brl").toString().toLowerCase();

    // Converte valor em centavos de forma robusta
    const amountInCents =
      typeof amount === "number" && Number.isInteger(amount) && amount > 0
        ? amount
        : toCents(amount);

    if (!amountInCents || amountInCents < 100) {
      return res.status(400).json({
        error: "Valor inválido",
        details: "Informe um amount válido (mínimo R$1,00 → 100 centavos).",
      });
    }

    // Monta criação do PaymentIntent
    const createParams: Stripe.PaymentIntentCreateParams = {
      amount: amountInCents,
      currency: cur as Stripe.Checkout.SessionCreateParams.PaymentMethodConfigurationDataPaymentMethodOptionsInstallmentsCurrency,
      description,
      receipt_email,
      customer,
      metadata: metadata && typeof metadata === "object" ? metadata : undefined,
      // Habilita métodos automáticos (boleto, cartão, pix — Stripe habilita conforme conta/país)
      automatic_payment_methods: { enabled: true },
    };

    // capture_method opcional
    if (capture_method === "manual" || capture_method === "automatic") {
      createParams.capture_method = capture_method as Stripe.PaymentIntentCreateParams.CaptureMethod;
    }

    // Idempotência (opcional, recomendado pelo Stripe)
    const headers: Stripe.RequestOptions = {};
    if (idempotencyKey && typeof idempotencyKey === "string" && idempotencyKey.length > 0) {
      headers.idempotencyKey = idempotencyKey;
    }

    const pi = await stripe.paymentIntents.create(createParams, headers);

    if (!pi.client_secret) {
      // Situação rara: Stripe não retornou client_secret
      return res.status(502).json({
        error: "Falha ao criar PaymentIntent",
        details: "Stripe não retornou client_secret",
      });
    }

    return res.status(200).json({
      clientSecret: pi.client_secret,
      paymentIntentId: pi.id,
    });
  } catch (err: any) {
    // Tratamento amigável, sem vazar segredos
    // StripeError tipada
    if (err && typeof err === "object" && err.type === "StripeCardError") {
      return res.status(402).json({
        error: "Pagamento recusado",
        details: err.message,
        code: err.code,
      });
    }

    if (err && typeof err === "object" && err.raw && err.raw.type === "invalid_request_error") {
      return res.status(400).json({
        error: "Requisição inválida ao Stripe",
        details: err.raw.message,
        code: err.raw.code,
      });
    }

    // Log seguro no servidor
    console.error("[create-payment-intent] error:", {
      message: err?.message || String(err),
      code: err?.code,
      type: err?.type,
    });

    return res.status(500).json({
      error: "Erro interno ao criar PaymentIntent",
      details: "Tente novamente em instantes",
      code: err?.code,
    });
  }
}
