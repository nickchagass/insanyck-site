// INSANYCK STEP 7 — Checkout SPA (Checkout Sessions)
// src/pages/checkout.tsx
"use client";

import React, { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import AddressForm, { AddressFields } from "@/components/AddressForm";
import ShippingSelector from "@/components/ShippingSelector";
import OrderSummary from "@/components/OrderSummary";
import { useCartStore, useCartSubtotal } from "@/store/cart";

export default function CheckoutPage() {
  const { t, i18n } = useTranslation(["checkout", "bag"]);
  const locale = i18n.language?.startsWith("en") ? "en" : "pt";
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const subtotalCents = useCartSubtotal();

  const [shipping, setShipping] = useState<"standard" | "express">("standard");
  const shippingCents = shipping === "express" ? 2490 : 0;

  const [address, setAddress] = useState<Partial<AddressFields>>({
    country: locale === "en" ? "USA" : "Brasil",
    state: locale === "en" ? "CA" : "SP",
  });
  const [loading, setLoading] = useState(false);

  const canPay = items.length > 0 && subtotalCents >= 0;

  async function handlePay() {
    if (!canPay) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingCents,
          locale,
          address, // (opcional, para metadata futura)
        }),
      });
      if (!res.ok) throw new Error("Checkout API error");
      const { url } = await res.json();
      if (!url) throw new Error("No session url");
      // Stripe redireciona; se voltar cancelado, usuário volta pra /sacola.
      window.location.href = url;
    } catch (e) {
      console.error(e);
      alert(t("checkout:error", "Não foi possível iniciar o pagamento."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>{t("checkout:title", "Checkout")} — INSANYCK</title>
        <meta name="description" content={t("checkout:subtitle", "Finalize sua compra com segurança.") as string} />
      </Head>

      <main className="mx-auto max-w-[1200px] px-6 pt-[120px] pb-20">
        <h1 className="text-white/90 text-3xl font-semibold">{t("checkout:title", "Checkout")}</h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-black/40 p-8 text-white/70">
            <p>{t("bag:empty", "Sua sacola está vazia.")}</p>
            <Link href="/loja" className="mt-4 inline-block underline underline-offset-4 hover:text-white">
              {t("bag:goShop", "Ir para a loja")}
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna esquerda */}
            <section className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <h2 className="text-white/90 font-medium mb-4">
                  {t("checkout:sections.customer", "Seus dados")}
                </h2>
                <AddressForm
                  register={(/* compat mock */) => ({ name: "", onChange: () => {} } as any)}
                  errors={{} as any}
                />
                <h2 className="text-white/90 font-medium mt-6 mb-3">
                  {t("checkout:sections.shipping", "Entrega")}
                </h2>
                <ShippingSelector value={shipping} onChange={setShipping} locale={locale as any} />
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <h2 className="text-white/90 font-medium mb-3">
                  {t("checkout:sections.payment", "Pagamento")}
                </h2>
                <p className="text-white/60 text-sm">
                  {t("checkout:payment.fake", "Pagamento via Stripe Checkout (seguro).")}
                </p>
                <button
                  onClick={handlePay}
                  disabled={loading || !canPay}
                  className="mt-4 rounded-xl px-4 py-3 font-semibold bg-white text-black hover:brightness-95 transition disabled:opacity-60"
                >
                  {loading ? t("checkout:processing", "Processando...") : t("checkout:placeOrder", "Finalizar pedido")}
                </button>
              </div>
            </section>

            {/* Resumo */}
            <aside className="lg:col-span-1 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <h3 className="text-white/80 font-medium mb-3">{t("bag:items", "Itens")}</h3>
                <ul className="space-y-3">
                  {items.map((it) => (
                    <li key={it.id} className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={it.image || "/products/placeholder/front.webp"}
                        alt={it.title}
                        className="w-14 h-14 rounded-lg object-cover border border-white/10"
                        loading="lazy"
                        decoding="async"
                        width={56}
                        height={56}
                      />
                      <div className="flex-1">
                        <div className="text-white/80 text-sm">{it.title}</div>
                        {it.variant ? <div className="text-white/50 text-xs">{it.variant}</div> : null}
                      </div>
                      <div className="text-white/70 text-sm">
                        {new Intl.NumberFormat(locale === "en" ? "en-US" : "pt-BR", {
                          style: "currency",
                          currency: locale === "en" ? "USD" : "BRL",
                        }).format((it.priceCents * it.qty) / 100)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <OrderSummary
                subtotalCents={subtotalCents}
                shippingCents={shippingCents}
                discountCents={0}
                locale={locale as any}
              />
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "pt", ["common", "nav", "bag", "checkout"])),
    },
  };
}
