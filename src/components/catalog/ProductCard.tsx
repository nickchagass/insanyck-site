// INSANYCK STEP MV-02 — Adaptador de Compatibilidade (Bridge)
// Este componente serve de "ponte" entre o ShowroomGrid (antigo) e a Vitrine Museum (nova).
// Ele aceita as props 'variant' e 'priority' para não quebrar o build, mas renderiza o card oficial.

import { ProductCardData } from "@/types/product";
import OfficialProductCard from "@/components/ProductCard";

// 1. Definimos o contrato que o ShowroomGrid espera (com as props extras)
export interface ProductCardProps {
  product: ProductCardData;
  variant?: "standard" | "wide" | string;
  priority?: boolean;
}

// 2. O Componente Adaptador
export default function ProductCardAdapter({ product, variant, priority }: ProductCardProps) {
  // A mágica: Recebemos tudo, mas repassamos APENAS o 'product' para a vitrine oficial.
  // Isso elimina o erro de "propriedade não existe".
  return <OfficialProductCard product={product} />;
}