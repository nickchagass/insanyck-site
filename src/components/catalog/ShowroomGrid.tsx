// INSANYCK STEP MV-03 — Grid de Showroom (Conectado ao Adaptador)
// Este grid limpa a bagunça visual antiga e usa apenas o <ProductCard /> padronizado.

import { useState } from "react";
import { ProductCardData } from "@/types/product";
import ProductCard from "./ProductCard"; // Importa nosso Adaptador (Bridge)
import { useTranslation } from "next-i18next";

interface ShowroomGridProps {
  products: ProductCardData[];
}

export default function ShowroomGrid({ products }: ShowroomGridProps) {
  const { t } = useTranslation("common");

  // Se não houver produtos, não quebra a tela
  if (!products || products.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-white/60">{t("no_products_found", "Nenhum produto encontrado.")}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Grid Responsivo: 1 coluna (mobile) -> 2 colunas (tablet) -> 3 ou 4 (desktop) */}
      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {products.map((product, index) => (
          <ProductCard
            key={product.id || product.slug}
            product={product}
            // Passamos priority para as primeiras imagens carregarem instantaneamente (LCP)
            priority={index < 4}
            // Opcional: define variante se necessário, mas o oficial usa o padrão
            variant="standard"
          />
        ))}
      </div>
    </div>
  );
}