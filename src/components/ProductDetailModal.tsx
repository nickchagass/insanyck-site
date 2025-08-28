// src/components/ProductDetailModal/ProductDetailModal.tsx
import React, { useRef, useState, useEffect, Suspense, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { XR, ARButton, Controllers, useHitTest } from "@react-three/xr";
import { OrbitControls, Environment, Html, useTexture, useGLTF } from "@react-three/drei";
import { AnimatePresence, motion } from "@framer-motion";
import { useTranslation } from "react-i18next";
import * as tf from "@tensorflow/tfjs";

// --- TYPES
interface BodyMeasurements {
  size: string;
  height: number;
  chest: number;
  waist: number;
  hips: number;
}

interface TextureVariant {
  id: string;
  name: string;
  color: string;
  textureSet: string[]; // [base, normal, roughness]
}

interface Product3DModel {
  glb: string;
  textures: {
    base: string;
    normal: string;
    roughness: string;
    variants: TextureVariant[];
  };
}

interface ARConfig {
  scale: number;
  anchorType: "floor" | "face" | "image";
  placementHint: string;
}

interface TryOnData {
  bodyMeasurements: boolean;
  sizeRecommendation: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  model3D: Product3DModel;
  arConfig: ARConfig;
  tryOnData?: TryOnData;
}

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

// --- Loader & Error UI
function Loader3D() {
  return (
    <Html center>
      <div className="text-yellow-400 font-bold text-lg animate-pulse">
        Carregando modelo 3D...
      </div>
    </Html>
  );
}

function ErrorFallback({ message }: { message: string }) {
  return (
    <Html center>
      <div className="text-red-500 bg-black/70 p-4 rounded-xl font-bold">
        Erro ao carregar modelo: {message}
      </div>
    </Html>
  );
}

// --- Componente 3D + texturização
function ProductModel({
  modelUrl,
  textureVariant,
}: {
  modelUrl: string;
  textureVariant: TextureVariant;
}) {
  const { scene } = useGLTF(modelUrl) as any;
  const textures = useTexture(textureVariant.textureSet);

  // Aplica texturas e cor
  useEffect(() => {
    if (!scene) return;
    scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        child.material.map = textures[0];
        child.material.normalMap = textures[1];
        child.material.roughnessMap = textures[2];
        child.material.needsUpdate = true;
        child.material.color.set(textureVariant.color);
      }
    });
  }, [scene, textures, textureVariant.color]);

  if (!scene) return <Loader3D />;
  return <primitive object={scene} dispose={null} />;
}

// --- ARView
function ARView({ product }: { product: Product }) {
  const arGroup = useRef<any>();
  useHitTest((hitMatrix) => {
    if (!arGroup.current) return;
    arGroup.current.matrix.fromArray(hitMatrix);
  });

  return (
    <group ref={arGroup}>
      <ProductModel
        modelUrl={product.model3D.glb}
        textureVariant={product.model3D.textures.variants[0]}
      />
      <Html position={[0, 0.5, 0]} className="ar-hint">
        {product.arConfig.placementHint}
      </Html>
    </group>
  );
}

// --- TryOnView (IA)
function TryOnView({ measurements }: { measurements: BodyMeasurements }) {
  return (
    <Html center className="bg-black/70 p-8 rounded-2xl text-yellow-400 text-lg font-bold">
      <div>
        👕 Seu tamanho estimado:{" "}
        <span className="text-white">{measurements.size}</span>
      </div>
      <div className="mt-4">
        Altura: {measurements.height} cm <br />
        Peito: {measurements.chest} cm <br />
        Cintura: {measurements.waist} cm <br />
        Quadril: {measurements.hips} cm
      </div>
      <div className="mt-4">
        <em>* Recomendação automática gerada por IA</em>
      </div>
    </Html>
  );
}

// --- MODAL PRINCIPAL
export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const ns = ["common", "pdp", "product"] as const;
  const { t } = useTranslation(ns) as any;
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
  const [mode, setMode] = useState<"3d" | "ar" | "try-on">("3d");
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurements | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentTextureVariant = product.model3D.textures.variants[currentVariantIndex];

  // Libera câmera se sair do modal (boa prática mobile)
  const cleanupCamera = useCallback(() => {
    const video = document.querySelector("video");
    if (video && video.srcObject) {
      const tracks = (video.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      video.srcObject = null;
    }
  }, []);

  useEffect(() => cleanupCamera, [cleanupCamera]);

  // IA simulada (mock) — trocar depois por modelo real!
  const startBodyScan = async () => {
    setIsLoadingAI(true);
    await tf.ready();
    // Simula análise corporal
    const measurements: BodyMeasurements = { size: "M", height: 175, chest: 95, waist: 80, hips: 100 };
    setTimeout(() => {
      setBodyMeasurements(measurements);
      setMode("try-on");
      setIsLoadingAI(false);
    }, 1800);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.08 },
    },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
  };

  // --- Fallback para browsers sem WebXR
  const [xrSupported, setXrSupported] = useState(false);
  useEffect(() => {
    if (navigator.xr && navigator.xr.isSessionSupported) {
      navigator.xr.isSessionSupported("immersive-ar").then(setXrSupported);
    }
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
      >
        <div className="absolute inset-0 backdrop-blur-2xl pointer-events-none"></div>
        <motion.div
          className="relative w-full max-w-6xl h-[90vh] bg-gradient-to-br from-neutral-900 to-black rounded-3xl border-2 border-yellow-500/40 shadow-2xl overflow-hidden"
          variants={{ hidden: { y: 60 }, visible: { y: 0 } }}
        >
          {/* BOTÃO FECHAR */}
          <motion.button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 text-yellow-400 text-2xl bg-black/60 rounded-full w-12 h-12 flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            aria-label={t("fechar")}
          >
            ✕
          </motion.button>

          {/* BOTÕES DE MODO */}
          <div className="absolute top-6 left-6 z-50 flex gap-3">
            <motion.button
              onClick={() => setMode("3d")}
              className={`px-4 py-2 rounded-full font-bold ${
                mode === "3d"
                  ? "bg-yellow-400 text-black"
                  : "bg-white/10 text-white hover:bg-yellow-400/70"
              }`}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
            >
              {t("modo3D")}
            </motion.button>
            {xrSupported && (
              <ARButton
                aria-label="Visualizar produto em realidade aumentada"
                sessionInit={{
                  requiredFeatures: ["hit-test"],
                  optionalFeatures: ["dom-overlay"],
                  domOverlay: { root: canvasRef.current },
                }}
                className="bg-purple-500 text-white px-4 py-2 rounded-full font-bold"
                onClick={() => setMode("ar")}
              >
                {t("verEmAR")}
              </ARButton>
            )}
            {product.tryOnData && (
              <motion.button
                onClick={startBodyScan}
                className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                disabled={isLoadingAI}
              >
                {isLoadingAI ? t("carregando") : t("experimentar")}
              </motion.button>
            )}
          </div>

          {/* CANVAS 3D PRINCIPAL */}
          <div className="w-full h-full">
            <Canvas
              ref={canvasRef}
              shadows
              camera={{ position: [0, 0, 2.6], fov: 44 }}
              gl={{ preserveDrawingBuffer: true }}
              style={{ background: "transparent" }}
            >
              <XR store={null as any}>
                <Suspense fallback={<Html center>{t("carregando")}</Html>}>
                  <ambientLight intensity={0.89} />
                  <spotLight position={[12, 16, 18]} angle={0.17} penumbra={1} />
                  {mode === "3d" && currentTextureVariant && (
                    <>
                      <ProductModel
                        modelUrl={product.model3D.glb}
                        textureVariant={currentTextureVariant}
                      />
                      <OrbitControls
                        enableZoom
                        enablePan
                        minPolarAngle={Math.PI / 4}
                        maxPolarAngle={Math.PI / 1.4}
                      />
                      <Environment preset="city" />
                    </>
                  )}
                  {mode === "ar" && xrSupported && <ARView product={product} />}
                  {mode === "try-on" && bodyMeasurements && (
                    <TryOnView measurements={bodyMeasurements} />
                  )}
                </Suspense>
                <Controllers />
              </XR>
            </Canvas>
          </div>

          {/* RODAPÉ/INFOS */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-lg p-4 border-t border-yellow-400/20"
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">{product.name}</h2>
                <p className="text-white mb-4 max-w-2xl">{product.description}</p>
              </div>
              <div className="text-2xl font-bold text-white">
                R$ {product.price.toFixed(2)}
              </div>
            </div>
            <div className="mt-4 flex gap-3 flex-wrap">
              {product.model3D.textures.variants.map((variant, idx) => (
                <motion.button
                  key={variant.id}
                  onClick={() => setCurrentVariantIndex(idx)}
                  className={`px-4 py-2 rounded-full font-medium ${
                    currentVariantIndex === idx
                      ? "bg-yellow-400 text-black"
                      : "bg-white/10 text-white hover:bg-yellow-400/70"
                  }`}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {variant.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Traduções (pode deixar em outro arquivo depois)
export const resources = {
  pt: {
    fechar: "Fechar",
    modo3D: "Modo 3D",
    verEmAR: "Ver em AR",
    experimentar: "Experimentar",
    carregando: "Carregando experiência...",
  },
  en: {
    fechar: "Close",
    modo3D: "3D Mode",
    verEmAR: "View in AR",
    experimentar: "Try On",
    carregando: "Loading experience...",
  },
};
