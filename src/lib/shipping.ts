// src/lib/shipping.ts
export type ShippingQuote = {
    priceCents: number;
    etaDays: number;
    label: "standard" | "express";
  };
  
  export function simulate(cep: string): ShippingQuote {
    const clean = (cep || "").replace(/\D/g, "");
    // mock simples: CEPs terminados em par => expresso; ímpar => padrão
    const isExpress = clean && Number(clean.slice(-1)) % 2 === 0;
    return isExpress
      ? { priceCents: 2490, etaDays: 2, label: "express" }
      : { priceCents: 0, etaDays: 5, label: "standard" };
  }
  