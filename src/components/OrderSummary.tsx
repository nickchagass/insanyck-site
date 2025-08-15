// INSANYCK STEP 7 — Order Summary refinado (usa lib/price, mantém sua API)
// src/components/OrderSummary.tsx
"use client";

import * as React from "react";
import { useTranslation } from "next-i18next";
import { formatPrice, Locale } from "@/lib/price";

export type OrderSummaryProps = {
  subtotalCents: number;
  shippingCents?: number;
  discountCents?: number;
  locale?: Locale;
  className?: string;
  noteBelow?: React.ReactNode;
};

export default function OrderSummary({
  subtotalCents,
  shippingCents = 0,
  discountCents = 0,
  locale = "pt",
  className = "",
  noteBelow,
}: OrderSummaryProps) {
  const { t } = useTranslation(["bag", "checkout"]);
  const total = Math.max(0, subtotalCents + shippingCents - discountCents);

  return (
    <aside
      className={`rounded-2xl border border-white/10 bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-5 ${className}`}
      aria-label={t("bag:summary", "Resumo do pedido")}
    >
      <h2 className="text-white/90 text-lg font-semibold">
        {t("checkout:orderSummary", "Resumo do pedido")}
      </h2>

      <div className="mt-4 space-y-3 text-white/80 text-sm">
        <div className="flex items-center justify-between">
          <span>{t("bag:subtotal", "Subtotal")}</span>
          <span className="font-medium">{formatPrice(subtotalCents, locale)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>{t("bag:shipping", "Frete")}</span>
          <span>
            {shippingCents > 0 ? formatPrice(shippingCents, locale) : t("bag:free", "Grátis")}
          </span>
        </div>
        {discountCents > 0 && (
          <div className="flex items-center justify-between text-emerald-400/90">
            <span>{t("bag:discount", "Desconto")}</span>
            <span>-{formatPrice(discountCents, locale)}</span>
          </div>
        )}
        <div className="h-px bg-white/10 my-2" />
        <div className="flex items-center justify-between text-white">
          <span className="font-semibold">{t("bag:total", "Total")}</span>
          <span className="font-semibold">{formatPrice(total, locale)}</span>
        </div>
      </div>

      {noteBelow ? <p className="mt-3 text-xs text-white/50">{noteBelow}</p> : null}
    </aside>
  );
}
