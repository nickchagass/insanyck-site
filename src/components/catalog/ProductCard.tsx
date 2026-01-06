// INSANYCK STEP MV-01 — Unificação Definitiva (Museum Edition)
// Fix: Importamos o tipo de dados base para criar a definição aqui mesmo.

import type { ProductCardData } from "@/types/product";

// 1. Exporta o componente visual (A Vitrine de Vidro)
export { default } from "@/components/ProductCard";

// 2. Cria e exporta o Tipo compatível para acalmar o TypeScript
// (Isso evita o erro de "membro não exportado")
export type ProductCardProps = {
  product: ProductCardData;
  // Mantemos opcionais para não quebrar grids antigos que mandam essas props
  variant?: "standard" | "wide"; 
  priority?: boolean;
};