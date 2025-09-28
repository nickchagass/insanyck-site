// INSANYCK · PDP 3D fallback estável (sem deps, zero-CLS)
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import OptimizedImage from "@/components/ui/OptimizedImage";

// Use o viewer 3D já existente no repo (ajuste o path se necessário):
const Product3DView = dynamic(() => import("@/components/three/Product3DView"), { 
  ssr: false,
  loading: () => (
    <div className="w-full bg-white/5 rounded-2xl flex items-center justify-center" style={{ aspectRatio: "3 / 4" }}>
      <div className="text-white/60 text-sm animate-pulse">Carregando 3D...</div>
    </div>
  )
});

const BACKEND_DISABLED =
  process.env.NEXT_PUBLIC_BACKEND_DISABLED === "1" || process.env.BACKEND_DISABLED === "1";

interface Product {
  id: string;
  title: string;
  image: string | null;
  model3d?: { url: string };
}

export default function PdpGallery({ product }: { product: Product }) {
  const [can3D, setCan3D] = useState(false);
  const [has3DError, setHas3DError] = useState(false);

  const hero = product?.image || "/products/placeholder/front.webp";
  const modelUrl = product?.model3d?.url;

  useEffect(() => {
    if (BACKEND_DISABLED) return setCan3D(false);
    if (typeof window === "undefined") return setCan3D(false);
    setCan3D(!!(window as any).WebGLRenderingContext);
  }, []);

  const show3D = can3D && !!modelUrl && !has3DError;

  const handleModelError = () => {
    if (!BACKEND_DISABLED) console.error("3D model failed to load, falling back to image");
    setHas3DError(true);
  };

  return (
    <section aria-label="Galeria do produto" className="overflow-hidden rounded-2xl bg-white/5">
      <div className="relative w-full" style={{ aspectRatio: "3 / 4" }} data-testid="pdp-hero">
        {show3D ? (
          <div data-testid="model-viewer" className="w-full h-full">
            {/* ATENÇÃO: use o nome de prop correto do componente real; na base costuma ser `modelUrl` */}
            <Product3DView
              modelUrl={modelUrl!}
              onError={handleModelError}
              onLoadError={handleModelError}
            />
          </div>
        ) : (
          <OptimizedImage
            src={hero}
            alt={`${product?.title} — Imagem do produto`}
            aspectRatio="3/4"
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            priority
            loading="eager"
            fallbackSrc="/products/placeholder/front.webp"
          />
        )}
      </div>
      {/* não alterar thumbs/controles existentes */}
    </section>
  );
}