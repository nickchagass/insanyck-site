// INSANYCK HOTFIX CHECKOUT URGENTE — Fazer o dinheiro entrar HOJE
// INSANYCK STEP G-04.2.1 — Checkout Tokenizado (sem cores literais)
// src/pages/checkout.tsx

import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";

import { AddressFields } from "@/components/AddressForm";
import { useCartStore, useCartSubtotal } from "@/store/cart";
import DsButton from "@/components/ds/DsButton";

import dynamic from "next/dynamic";

const AddressForm = dynamic(() => import("@/components/AddressForm"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-[color:var(--ds-surface-soft)] rounded-xl" />,
});

const ShippingSelector = dynamic(() => import("@/components/ShippingSelector"), {
  ssr: false,
  loading: () => <div className="h-[100px] w-full animate-pulse bg-[color:var(--ds-surface-soft)] rounded-xl" />,
});

const OrderSummary = dynamic(() => import("@/components/OrderSummary"), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full animate-pulse bg-[color:var(--ds-surface-soft)] rounded-xl" />,
});

import { seoCheckout } from "@/lib/seo";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";

export default function CheckoutPage() {
  const { t, i18n } = useTranslation(["checkout", "bag"]);
  const locale = i18n.language?.startsWith("en") ? "en" : "pt";

  const items = useCartStore((s) => s.items);
  const subtotalCents = useCartSubtotal();

  // HOTFIX: Corrigir estado de shipping para aceitar priceCents também
  const [shipping, setShipping] = useState<"standard" | "express">("standard");
  const [shippingCents, setShippingCents] = useState(0);

  // HOTFIX: Captura real de dados do endereço usando react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFields>({
    defaultValues: {
      country: locale === "en" ? "USA" : "Brasil",
      state: locale === "en" ? "CA" : "SP",
    },
  });

  const [loading, setLoading] = useState(false);

  const canPay = items.length > 0 && subtotalCents >= 0;

  // HOTFIX: Handler corrigido do ShippingSelector
  const handleShippingChange = (id: "standard" | "express", priceCents: number) => {
    setShipping(id);
    setShippingCents(priceCents);
  };

  // HOTFIX: Validação e logs detalhados
  async function handlePay(addressData: AddressFields) {
    if (!canPay) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[INSANYCK CHECKOUT] Tentativa de checkout sem itens no carrinho");
      }
      return;
    }

    setLoading(true);

    try {
      // HOTFIX: Validar items antes de enviar
      const invalidItems = items.filter((item) => !item.variantId && !item.sku);
      if (invalidItems.length > 0) {
        if (process.env.NODE_ENV === "development") {
          console.error("[INSANYCK CHECKOUT] Itens sem variantId/sku:", invalidItems);
        }
        throw new Error("Alguns itens do carrinho estão inválidos. Por favor, remova-os e tente novamente.");
      }

      // HOTFIX: Construir payload com validação
      const checkoutItems = items.map((item) => ({
        variantId: item.variantId,
        sku: item.sku,
        qty: Number(item.qty) || 1, // Garantir que qty é number
      }));

      const payload = {
        items: checkoutItems,
        currency: "BRL" as const,
        // TODO(INSANYCK): Adicionar addressData quando backend estiver pronto
        // address: addressData,
        // shipping: { method: shipping, cents: shippingCents },
      };

      // HOTFIX: Log detalhado no dev
      if (process.env.NODE_ENV === "development") {
        console.log("[INSANYCK CHECKOUT] =====================================");
        console.log("[INSANYCK CHECKOUT] Payload enviado para /api/checkout/create-session:");
        console.log("[INSANYCK CHECKOUT] - Items:", checkoutItems);
        console.log("[INSANYCK CHECKOUT] - Currency:", payload.currency);
        console.log("[INSANYCK CHECKOUT] - Endereço:", addressData);
        console.log("[INSANYCK CHECKOUT] - Frete:", { method: shipping, cents: shippingCents });
        console.log("[INSANYCK CHECKOUT] =====================================");
      }

      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));

        // HOTFIX: Log detalhado do erro
        if (process.env.NODE_ENV === "development") {
          console.error("[INSANYCK CHECKOUT] =====================================");
          console.error("[INSANYCK CHECKOUT] Erro ao criar sessão de checkout:");
          console.error("[INSANYCK CHECKOUT] - Status:", res.status);
          console.error("[INSANYCK CHECKOUT] - Erro:", errorData);
          console.error("[INSANYCK CHECKOUT] =====================================");
        }

        throw new Error(errorData.error || `Erro ${res.status}: Não foi possível iniciar o pagamento.`);
      }

      const { url } = await res.json();

      if (!url) {
        throw new Error("A API não retornou uma URL de checkout válida.");
      }

      // HOTFIX: Log de sucesso
      if (process.env.NODE_ENV === "development") {
        console.log("[INSANYCK CHECKOUT] ✅ Sessão criada com sucesso! Redirecionando para:", url);
      }

      // Redirecionar para Stripe Checkout
      window.location.href = url;
    } catch (e: any) {
      // HOTFIX: Mensagem de erro melhorada com detalhes
      const errorMessage = e?.message || "Não foi possível iniciar o pagamento.";

      if (process.env.NODE_ENV === "development") {
        console.error("[INSANYCK CHECKOUT] ❌ Erro final:", e);
      }

      alert(`${errorMessage}\n\nPor favor, verifique os dados e tente novamente.`);
    } finally {
      setLoading(false);
    }
  }

  const seo = seoCheckout(locale);

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        {seo.meta.map((tag, i) => (
          <meta key={i} {...tag} />
        ))}
        {seo.link.map((l, i) => (
          <link key={i} {...l} />
        ))}
      </Head>

      <main className="mx-auto max-w-[1200px] px-6 pt-[120px] pb-20">
        {/* HOTFIX: Progress Indicator */}
        <CheckoutSteps current={1} />

        <h1 className="text-display-xl mt-4">
          {t("checkout:title", "Checkout")}
        </h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-[color:var(--ds-border-subtle)] bg-[color:var(--ds-surface)] p-8 text-[color:var(--text-secondary)]">
            <p>{t("bag:empty", "Sua sacola está vazia.")}</p>
            <Link
              href="/loja"
              className="mt-4 inline-block underline underline-offset-4 hover:text-[color:var(--ds-accent)] transition-colors"
            >
              {t("bag:goShop", "Ir para a loja")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handlePay)}>
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* HOTFIX: Seções claras (One-Page) */}
              <section className="lg:col-span-2 space-y-6">
                {/* Seção 1: Dados */}
                <div id="dados" className="glass-card rounded-2xl p-5">
                  <h2 className="text-[color:var(--ds-accent)] font-medium mb-4">
                    1. {t("checkout:sections.customer", "Seus dados")}
                  </h2>
                  <AddressForm register={register} errors={errors} />
                </div>

                {/* Seção 2: Entrega */}
                <div id="entrega" className="glass-card rounded-2xl p-5">
                  <h2 className="text-[color:var(--ds-accent)] font-medium mb-4">
                    2. {t("checkout:sections.shipping", "Entrega")}
                  </h2>
                  <ShippingSelector
                    value={shipping}
                    onChange={handleShippingChange}
                    locale={locale as any}
                  />
                </div>

                {/* Seção 3: Pagamento */}
                <div id="pagamento" className="glass-card rounded-2xl p-5">
                  <h2 className="text-[color:var(--ds-accent)] font-medium mb-4">
                    3. {t("checkout:sections.payment", "Pagamento")}
                  </h2>
                  <p className="text-[color:var(--text-secondary)] text-sm mb-4">
                    {t("checkout:payment.fake", "Pagamento seguro via parceiro financeiro (Stripe).")}
                  </p>
                  <DsButton
                    type="submit"
                    disabled={loading || !canPay}
                    variant="primary"
                    size="lg"
                    className="w-full"
                    state={loading ? "loading" : "default"}
                  >
                    {loading
                      ? t("checkout:processing", "Processando...")
                      : t("checkout:placeOrder", "Finalizar pedido")}
                  </DsButton>
                </div>
              </section>

              {/* HOTFIX: Resumo lateral com itens e totais */}
              <aside className="lg:col-span-1 space-y-4">
                {/* Card de Itens */}
                <div className="glass-card rounded-2xl p-4">
                  <h3 className="text-[color:var(--ds-accent-soft)] font-medium mb-3">
                    {t("bag:items", "Itens")}
                  </h3>
                  <ul className="space-y-3">
                    {items.map((it) => (
                      <li key={it.id} className="flex items-center gap-3">
                        <Image
                          src={it.image || "/products/placeholder/front.webp"}
                          alt={it.title}
                          width={56}
                          height={56}
                          sizes="56px"
                          className="rounded-lg object-cover border border-[color:var(--ds-border-subtle)]"
                          loading="lazy"
                        />
                        <div className="flex-1">
                          <div className="text-[color:var(--ds-accent-soft)] text-sm">{it.title}</div>
                          {it.options?.variant ? (
                            <div className="text-[color:var(--text-muted)] text-xs">{it.options.variant}</div>
                          ) : null}
                          <div className="text-[color:var(--text-muted)] text-xs">Qtd: {it.qty}</div>
                        </div>
                        <div className="text-[color:var(--text-secondary)] text-sm">
                          {new Intl.NumberFormat(locale === "en" ? "en-US" : "pt-BR", {
                            style: "currency",
                            currency: locale === "en" ? "USD" : "BRL",
                          }).format((it.priceCents * it.qty) / 100)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card de Resumo */}
                <OrderSummary
                  subtotalCents={subtotalCents}
                  shippingCents={shippingCents}
                  discountCents={0}
                  locale={locale as any}
                />
              </aside>
            </div>
          </form>
        )}
      </main>
    </>
  );
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "pt", ["common", "nav", "bag", "checkout"])),
    },
  };
}
