// INSANYCK STEP 6/7 + FASE G-01 — Utilitários de preço centralizados
// src/lib/price.ts

export type Locale = "pt" | "en";
export type Currency = "BRL" | "USD" | "EUR";

/** Formata valores em centavos respeitando locale/moeda */
export function formatPrice(
  valueCents: number,
  locale: Locale = "pt",
  currency?: Currency
) {
  const curr = currency ?? (locale === "en" ? "USD" : "BRL");
  const amount = (Math.max(0, valueCents || 0)) / 100;
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "pt-BR", {
    style: "currency",
    currency: curr,
    maximumFractionDigits: 2,
  }).format(amount);
}

// INSANYCK FASE G-01 — Helper genérico de currency
/** Formata valores em centavos para qualquer moeda (wrapper de formatPrice) */
export function formatCurrency(
  cents: number,
  currency: Currency = "BRL",
  locale: Locale = "pt"
): string {
  return formatPrice(cents, locale, currency);
}

// INSANYCK FASE G-01 — Helper específico para BRL
/** Formata valores em centavos para Real Brasileiro (pt-BR padrão) */
export function formatBRL(cents: number, locale: Locale = "pt"): string {
  return formatPrice(cents, locale, "BRL");
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

// INSANYCK FASE G-01 — Serialização Next-safe (evita erros de hidratação)
/** Remove propriedades não serializáveis (funções, undefined, etc.) */
export function safeSerialize<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
