// INSANYCK STEP 7 — Checkout SPA (Checkout Sessions)
// src/pages/checkout.tsx

import React, { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

import dynamic from "next/dynamic";
import { AddressFields } from "@/components/AddressForm";
import { useCartStore, useCartSubtotal } from "@/store/cart";

const AddressForm = dynamic(() => import("@/components/AddressForm"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-white/5 rounded-xl" />,
});

const ShippingSelector = dynamic(() => import("@/components/ShippingSelector"), {
  ssr: false,
  loading: () => <div className="h-[100px] w-full animate-pulse bg-white/5 rounded-xl" />,
});

const OrderSummary = dynamic(() => import("@/components/OrderSummary"), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full animate-pulse bg-white/5 rounded-xl" />,
});
import { seoCheckout } from "@/lib/seo";

export default function CheckoutPage() {
  const { t, i18n } = useTranslation(["checkout", "bag"]);
  const locale = i18n.language?.startsWith("en") ? "en" : "pt";

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
      // ETAPA 11D — Adaptar para nova API /api/checkout com variantId/sku/qty do cart v2
      const checkoutItems = items.map((item) => ({
        variantId: item.variantId,
        sku: item.sku,
        qty: item.qty,
      }));

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: checkoutItems,
          currency: "BRL",
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
        <h1 className="text-white/90 text-3xl font-semibold">{t("checkout:title", "Checkout")}</h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-black/40 p-8 text-white/70">
            <p>{t("bag:empty", "Sua sacola está vazia.")}</p>
            <Link
              href="/loja"
              className="mt-4 inline-block underline underline-offset-4 hover:text-white"
            >
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
                  register={(/* compat mock */) => ({ name: "", onChange: () => {} }) as any}
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
                  className="mt-4 rounded-xl px-4 py-3 font-semibold bg-white text-black hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition disabled:opacity-60"
                >
                  {loading
                    ? t("checkout:processing", "Processando...")
                    : t("checkout:placeOrder", "Finalizar pedido")}
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
                      <Image
                        src={it.image || "/products/placeholder/front.webp"}
                        alt={it.title}
                        width={56}
                        height={56}
                        sizes="56px"
                        className="rounded-lg object-cover border border-white/10"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <div className="text-white/80 text-sm">{it.title}</div>
                        {it.options?.variant ? (
                          <div className="text-white/50 text-xs">{it.options.variant}</div>
                        ) : null}
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

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "pt", ["common", "nav", "bag", "checkout"])),
    },
  };
}
