// INSANYCK STEP MV-03 — Showroom Grid V2 (Com Suporte a Paginação)
// Resolve o erro "initialProducts does not exist" e mantém o visual Museum.

import { ProductCardData } from "@/types/product";
import ProductCard from "./ProductCard"; // Nosso Adaptador Blindado
import { useTranslation } from "next-i18next";

// Interface exata que a página loja.tsx exige
interface ShowroomGridProps {
  initialProducts: ProductCardData[]; // O nome correto da prop é este
  onLoadMore?: () => Promise<void>;   // Opcional para não quebrar outras páginas
  hasMore?: boolean;
  loading?: boolean;
}

export default function ShowroomGrid({ 
  initialProducts, 
  onLoadMore, 
  hasMore = false, 
  loading = false 
}: ShowroomGridProps) {
  const { t } = useTranslation("common");
  
  // Garante que não quebra se vier nulo
  const products = initialProducts || [];

  if (products.length === 0 && !loading) {
    return (
      <div className="py-32 text-center flex flex-col items-center justify-center opacity-60">
        <p className="text-lg font-light tracking-wide">{t("no_products_found", "Nenhum produto encontrado")}</p>
        <span className="mt-2 text-sm text-white/40">Tente ajustar seus filtros</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-16">
      {/* Grid Responsivo Museum Edition */}
      <div className="grid grid-cols-1 gap-y-12 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {products.map((product, index) => (
          <ProductCard
            key={product.id || product.slug || index}
            product={product}
            // As 4 primeiras carregam instantâneo (LCP), o resto lazy
            priority={index < 4}
            variant="standard"
          />
        ))}
      </div>

      {/* Botão Carregar Mais (Estilo Titanium) */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-8 pb-12">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="
              group relative px-8 py-3 
              text-sm font-medium tracking-widest text-white/80 uppercase
              bg-white/5 border border-white/10 rounded-full
              transition-all duration-300
              hover:bg-white/10 hover:border-white/20 hover:text-white hover:scale-105
              active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
              </span>
            ) : (
              <span>{t("load_more", "Carregar Mais")}</span>
            )}
            
            {/* Glow sutil no hover */}
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/5 blur-lg -z-10" />
          </button>
        </div>
      )}
    </div>
  );
}