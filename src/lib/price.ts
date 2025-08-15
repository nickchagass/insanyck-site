// INSANYCK STEP 6/7 — Utilitários de preço
// src/lib/price.ts

export type Locale = "pt" | "en";

/** Formata valores em centavos respeitando locale/moeda */
export function formatPrice(
  valueCents: number,
  locale: Locale = "pt",
  currency?: "BRL" | "USD"
) {
  const curr = currency ?? (locale === "en" ? "USD" : "BRL");
  const amount = (Math.max(0, valueCents || 0)) / 100;
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "pt-BR", {
    style: "currency",
    currency: curr,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Converte string "R$199" ou number 199 em centavos */
export function parseToCents(input: string | number): number {
  if (typeof input === "number") return Math.round(input * 100);
  const clean = input.replace(/[^\d,\.]/g, "").replace(/\.(?=\d{3,})/g, "");
  const normalized = clean.replace(",", ".");
  const num = Number(normalized);
  if (Number.isNaN(num)) return 0;
  return Math.round(num * 100);
}
