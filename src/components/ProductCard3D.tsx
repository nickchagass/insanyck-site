// src/components/ProductCard3D.tsx
import React, { Suspense, useRef, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface ProductCard3DProps {
  glbUrl: string;        // Caminho do modelo 3D (.glb DRACO)
  image: string;         // Imagem fallback
  name: string;
  price: string;
  isNew?: boolean;
  isFeatured?: boolean;
  onDetails: () => void;
}

function Model({ url, onLoaded }: { url: string; onLoaded?: () => void }) {
  const { scene } = useGLTF(url, true);
  React.useEffect(() => {
    if (onLoaded) onLoaded();
  }, [onLoaded]);
  return <primitive object={scene} />;
}

export const ProductCard3D: React.FC<ProductCard3DProps> = ({
  glbUrl, image, name, price, isNew, isFeatured, onDetails
}) => {
  // Usar namespace "product" para tradução modular
  const { t } = useTranslation("product");
  const [is3d, setIs3d] = useState(false);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  // Evita múltiplos triggers do loader
  const handleModelLoaded = useCallback(() => setLoading(false), []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 340, damping: 32, mass: 0.7 }}
      className="relative rounded-[24px] p-6 bg-black/70 backdrop-blur-xl shadow-2xl border border-neutral-800 overflow-hidden"
      style={{ minWidth: 300, maxWidth: 370 }}
      tabIndex={0}
      aria-label={name}
      onMouseEnter={() => setIs3d(true)}
      onMouseLeave={() => { setIs3d(false); setLoading(true); }} // Reseta loader ao sair do card
      onFocus={() => setIs3d(true)}
      onBlur={() => { setIs3d(false); setLoading(true); }}
      role="region"
    >
      {/* TAGS */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-20 pointer-events-none">
        {isFeatured && (
          <motion.span
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-1 rounded-full text-xs font-extrabold animate-pulse shadow-md"
            style={{ letterSpacing: 1, boxShadow: "0 2px 10px #ffd70055" }}
          >
            {t("common:featured")}
          </motion.span>
        )}
        {isNew && (
          <motion.span
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse"
          >
            {t("common:new")}
          </motion.span>
        )}
      </div>

      {/* VISUALIZAÇÃO 3D */}
      <div
        className="w-full h-64 rounded-xl mb-5 bg-gradient-to-br from-neutral-900 to-black flex items-center justify-center overflow-hidden relative"
        aria-label={t("common:view3D")}
      >
        <Suspense
          fallback={
            <div className="animate-pulse text-yellow-400 text-lg font-bold">
              {t("common:loading")}
            </div>
          }
        >
          {is3d ? (
            <Canvas
              camera={{ position: [0, 0, 2.2], fov: 40 }}
              shadows
              style={{ width: "100%", height: "100%" }}
            >
              <ambientLight intensity={0.7} />
              <spotLight position={[5, 15, 10]} angle={0.2} penumbra={1} intensity={2.2} castShadow />
              <Environment preset="city" />
              <Model url={glbUrl} onLoaded={handleModelLoaded} />
              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2.2} />
            </Canvas>
          ) : (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-contain"
              loading="lazy"
              style={{ filter: "brightness(1.05) drop-shadow(0 0 18px #000a)" }}
              onLoad={() => setLoading(false)}
            />
          )}
        </Suspense>
        {/* SKELETRON LOADER */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 animate-pulse shadow-lg" />
          </div>
        )}
      </div>

      {/* INFOS */}
      <h3 className="font-bold text-xl text-yellow-300 mb-2">{name}</h3>
      <span className="block text-neutral-300 font-medium mb-4">{price}</span>

      <motion.button
        className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-extrabold py-3 rounded-xl shadow-md mt-2 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-yellow-400/70"
        onClick={onDetails}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        aria-label={t("common:viewDetails")}
      >
        {t("common:viewDetails")}
      </motion.button>
    </motion.div>
  );
};
