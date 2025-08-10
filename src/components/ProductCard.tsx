import React, { useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF } from "@react-three/drei";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

// Loader skeleton ultra-premium
function ProductSkeleton() {
  return (
    <div className="w-full h-60 flex items-center justify-center rounded-[24px] backdrop-blur-md bg-gradient-to-br from-yellow-200/10 to-neutral-900/90 shadow-2xl animate-pulse" aria-busy="true">
      <span className="text-yellow-400 text-xl font-bold">Carregando...</span>
    </div>
  );
}

// 3D Model Loader - otimizado para lazy loading/polígonos
function Product3D({ url }: { url: string }) {
  const { scene } = useGLTF(url, true);
  return <primitive object={scene} />;
}

// Main Card
interface ProductCardProps {
  product: {
    id: string;
    nome: string;
    preco: number;
    glb: string; // Caminho do modelo 3D
    destaque?: boolean;
    novidade?: boolean;
  };
  onDetails: (id: string) => void;
}

export const ProductCard = React.memo(function ProductCard({ product, onDetails }: ProductCardProps) {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);

  // Estados de animação Framer Motion (hover, foco, flip)
  const variants = {
    initial: { rotateY: 0, scale: 1 },
    hover: { rotateY: 15, scale: 1.04, boxShadow: "0 12px 36px #FFD70055" },
    tap: { scale: 0.98 },
    focus: { scale: 1.02, outline: "3px solid #FFD700" }
  };

  // Efeitos visuais e a11y
  return (
    <motion.div
      ref={cardRef}
      className="rounded-[24px] bg-gradient-to-br from-[#FFD700]/30 to-[#FFA500]/20 shadow-2xl p-5 relative overflow-hidden backdrop-blur-md focus:outline-none"
      tabIndex={0}
      role="group"
      aria-label={t("produtoCard", { name: product.nome })}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      whileFocus="focus"
      variants={variants}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      onKeyDown={e => (e.key === "Enter" ? onDetails(product.id) : null)}
      onClick={() => onDetails(product.id)}
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 pointer-events-none select-none">
        {product.destaque && (
          <motion.div
            className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-400 text-black shadow-md"
            animate={{ scale: [1, 1.15, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.3, repeat: Infinity }}
            aria-label={t("destaque")}
          >
            {t("destaque")}
          </motion.div>
        )}
        {product.novidade && (
          <motion.div
            className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md"
            animate={{ scale: [1, 1.1, 1], opacity: [1, 0.9, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
            aria-label={t("novidade")}
          >
            {t("novidade")}
          </motion.div>
        )}
      </div>

      {/* Visualização 3D interativa */}
      <div className="h-60 w-full rounded-[20px] overflow-hidden bg-neutral-900 border border-yellow-300/10 shadow-lg mb-5">
        <Suspense fallback={<ProductSkeleton />}>
          <Canvas camera={{ position: [0, 0, 2.4], fov: 38 }}>
            <ambientLight intensity={0.85} />
            <directionalLight intensity={1.2} position={[4, 5, 6]} />
            <Product3D url={product.glb} />
            <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={2.5} />
          </Canvas>
        </Suspense>
      </div>

      {/* Dados e botão */}
      <div className="text-center">
        <h3 className="text-xl font-extrabold text-yellow-400 drop-shadow mb-2">{product.nome}</h3>
        <div className="font-bold text-white/95 text-lg mb-3">R$ {product.preco.toFixed(2)}</div>
        <motion.button
          type="button"
          tabIndex={0}
          className="rounded-full px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-neutral-900 font-extrabold text-base shadow-lg hover:scale-105 active:scale-97 focus:outline-yellow-400 transition-all"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
          aria-label={t("verDetalhes")}
        >
          {t("verDetalhes")}
        </motion.button>
      </div>
    </motion.div>
  );
});
