// INSANYCK STEP 7 + 7.1 — Sacola cinematográfica (halo), SSR-safe, cupom+frete

import React, { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";
import { useCartStore, useCartHydrated, useCartSubtotal } from "@/store/cart";

const OrderSummary = dynamic(() => import("@/components/OrderSummary"), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full animate-pulse bg-white/5 rounded-xl" />,
});
import { formatPrice } from "@/lib/price";
import { applyCoupon } from "@/lib/coupon";
import { simulate } from "@/lib/shipping";
import { seoCart } from "@/lib/seo";

export default function SacolaPage() {
  const { t, i18n } = useTranslation(["bag", "checkout", "cart"]);
  const router = useRouter();
  const locale = i18n.language?.startsWith("en") ? "en" : "pt";

  const hydrated = useCartHydrated();
  const items = useCartStore((s) => s.items);
  const inc = useCartStore((s) => s.inc);
  const dec = useCartStore((s) => s.dec);
  const remove = useCartStore((s) => s.removeItem);

  // Subtotal direto do store (centavos, SSR-safe)
  const subtotalCents = useCartSubtotal();

  // Cupom + frete mock
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ discountCents: number; freeShip: boolean }>({
    discountCents: 0,
    freeShip: false,
  });
  const [cep, setCep] = useState("");
  const shippingQuote = useMemo(() => simulate(cep), [cep]);
  const shippingCents = applied.freeShip ? 0 : shippingQuote.priceCents;
  const discountCents = applied.discountCents;

  function onApplyCoupon() {
    const res = applyCoupon(code, subtotalCents);
    if (res.valid && code.trim().toUpperCase() === "FRETEGRATIS") {
      setApplied({ discountCents: 0, freeShip: true });
    } else if (res.valid) {
      setApplied({ discountCents: res.discountCents, freeShip: false });
    } else {
      setApplied({ discountCents: 0, freeShip: false });
      alert(t("checkout:errors.couponInvalid", res.message || "Cupom inválido"));
    }
  }

  if (!hydrated) return null; // evita hydration mismatch

  const seo = seoCart(locale);

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
      <main className="relative pt-[120px] pb-20 px-6 mx-auto max-w-[1200px] section-halo">
        {/* Vinheta/Halo cinematográfico discreto */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(80% 120% at 50% 20%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 22%, rgba(0,0,0,0) 55%)",
            WebkitMaskImage:
              "radial-gradient(90% 120% at 50% 40%, #000 0%, #000 70%, transparent 100%)",
            maskImage: "radial-gradient(90% 120% at 50% 40%, #000 0%, #000 70%, transparent 100%)",
          }}
        />

        <h1 className="text-white text-3xl font-semibold tracking-wide">
          {t("bag:title", "Sua sacola")}
        </h1>

        {items.length === 0 ? (
          <div className="mt-10 text-white/70">
            <p>{t("bag:empty", "Sua sacola está vazia.")}</p>
            <Link
              href="/loja"
              className="inline-block mt-4 underline underline-offset-4 text-white/90 hover:text-white"
            >
              {t("bag:goShop", "Ir para a loja")}
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            {/* Lista de itens */}
            <section aria-label={t("bag:items", "Itens")} className="space-y-4">
              {items.map((it) => (
                <article
                  key={it.id}
                  className="rounded-2xl border border-white/10 bg-black/40 p-4 flex gap-4 items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                >
                  <div className="relative w-[92px] h-[92px] overflow-hidden rounded-xl bg-black/60">
                    <Image
                      src={it.image || "/products/placeholder/front.webp"}
                      alt={it.title}
                      width={92}
                      height={92}
                      sizes="92px"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="insanyck-reset-text">
                        <div className="text-white/90 font-medium truncate">{it.title}</div>
                        {it.options?.variant && (
                          <div className="text-white/60 text-sm mt-0.5">{it.options.variant}</div>
                        )}
                      </div>
                      <button
                        className="ml-2 text-white/60 hover:text-white"
                        aria-label={t("bag:remove", "Remover")}
                        onClick={() => remove(it.id)}
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-xl border border-white/10">
                        <button
                          onClick={() => dec(it.id)}
                          className="px-3 py-1 text-white/80 hover:text-white"
                          aria-label={t("bag:dec", "Diminuir quantidade")}
                        >
                          −
                        </button>
                        <span className="px-3 py-1 text-white/80" aria-live="polite">
                          {t("bag:qty", "Qtd")}: {it.qty}
                        </span>
                        <button
                          onClick={() => inc(it.id)}
                          className="px-3 py-1 text-white/80 hover:text-white"
                          aria-label={t("bag:inc", "Aumentar quantidade")}
                        >
                          +
                        </button>
                      </div>

                      <div className="text-white/80">
                        {formatPrice((it.priceCents || 0) * it.qty, locale as any)}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            {/* Resumo */}
            <aside className="space-y-4">
              {/* Cupom */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <label className="block text-sm text-white/70 mb-2">
                  {t("bag:coupon.label", "Cupom de desconto")}
                </label>
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="INSANY10"
                    aria-label={t("bag:coupon.label", "Cupom de desconto")}
                  />
                  <button
                    onClick={onApplyCoupon}
                    className="rounded-xl px-4 py-2 border border-white/15 text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition"
                  >
                    {t("bag:coupon.apply", "Aplicar")}
                  </button>
                </div>
              </div>

              {/* Frete */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <label className="block text-sm text-white/70 mb-2">
                  {t("bag:shipping.simulate", "Simular frete")}
                </label>
                <div className="flex gap-2">
                  <input
                    value={cep}
                    onChange={(e) => {
                      // mask simples 00000-000
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                      setCep(digits.replace(/^(\d{5})(\d)/, "$1-$2"));
                    }}
                    className="flex-1 rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder={t("bag:shipping.cep", "CEP")}
                    aria-label={t("bag:shipping.cep", "CEP")}
                    maxLength={9}
                    inputMode="numeric"
                  />
                  <span className="inline-flex items-center text-white/70 text-sm px-2">
                    {shippingCents
                      ? formatPrice(shippingCents, locale as any)
                      : t("bag:free", "Grátis")}
                  </span>
                </div>
                <p className="mt-2 text-xs text-white/50">
                  {shippingQuote.label === "express"
                    ? t("checkout:shipping.eta2", "2 dias úteis")
                    : t("checkout:shipping.eta5", "5 dias úteis")}
                </p>
              </div>

              <OrderSummary
                subtotalCents={subtotalCents}
                shippingCents={shippingCents}
                discountCents={discountCents}
                locale={locale as any}
                noteBelow={
                  <span>{t("bag:installments", "Parcele em até 6x sem juros (mock)")}</span>
                }
              />

              <div className="mt-2">
                <Link
                  href="/checkout"
                  className="block text-center rounded-xl px-4 py-3 font-semibold bg-white text-black hover:bg-white/90 transition"
                >
                  {t("bag:checkoutCta", "Ir para checkout")}
                </Link>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined" && router.isReady) {
                      router.push("/loja");
                    }
                  }}
                  className="block w-full text-center mt-2 text-white/70 hover:text-white underline underline-offset-4"
                >
                  {t("bag:continue", "Continuar comprando")}
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

// SSR/i18n
export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "pt", [
        "bag",
        "checkout",
        "cart",
        "nav",
        "common",
      ])),
    },
  };
}
