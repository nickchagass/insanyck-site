// INSANYCK STEP 7 — Shipping selector unificado (compatível com sua assinatura)
// src/components/ShippingSelector.tsx
"use client";

import * as React from "react";
import { useTranslation } from "next-i18next";
import { formatPrice, Locale } from "@/lib/price";

type Id = "standard" | "express";

type Props = {
  value: Id;
  onChange: (id: Id, priceCents: number) => void; // mantém sua assinatura atual
  locale?: Locale;
  className?: string;
};

export default function ShippingSelector({
  value,
  onChange,
  locale = "pt",
  className = "",
}: Props) {
  const { t } = useTranslation(["checkout", "bag"]);

  const options: { id: Id; label: string; priceCents: number; desc: string }[] = [
    {
      id: "standard",
      label: t("checkout:shipping.standard", "Padrão"),
      priceCents: 0,
      desc: t("checkout:shipping.eta5", "5 dias úteis"),
    },
    {
      id: "express",
      label: t("checkout:shipping.express", "Expresso"),
      priceCents: 2490,
      desc: t("checkout:shipping.eta2", "2 dias úteis"),
    },
  ];

  return (
    <div className={`space-y-2 ${className}`} role="group" aria-label={t("checkout:shipping.title", "Frete")}>
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id, o.priceCents)}
            className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 transition
              ${active ? "border-white/30 bg-white/5" : "border-white/10 hover:border-white/20 bg-black/40"}`}
            aria-pressed={active}
          >
            <div className="text-left">
              <div className="text-white/90 font-medium">{o.label}</div>
              <div className="text-white/60 text-sm">{o.desc}</div>
            </div>
            <div className="text-white/80">
              {o.priceCents > 0 ? formatPrice(o.priceCents, locale) : t("bag:free", "Grátis")}
            </div>
          </button>
        );
      })}
    </div>
  );
}
