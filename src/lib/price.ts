// INSANYCK STEP 6
// src/lib/price.ts

export function formatPrice(
    valueCents: number,
    locale: "pt" | "en" = "pt",
    currency?: "BRL" | "USD"
  ) {
    const curr = currency ?? (locale === "en" ? "USD" : "BRL");
    const amount = (valueCents || 0) / 100;
    return new Intl.NumberFormat(locale === "en" ? "en-US" : "pt-BR", {
      style: "currency",
      currency: curr,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  
  // Auxiliar para transformar "R$199" ou "199" em centavos
  export function parseToCents(input: string | number): number {
    if (typeof input === "number") return Math.round(input * 100);
    const clean = input.replace(/[^\d,\.]/g, "").replace(/\.(?=\d{3,})/g, "");
    const normalized = clean.replace(",", ".");
    const num = Number(normalized);
    if (Number.isNaN(num)) return 0;
    return Math.round(num * 100);
  }
  