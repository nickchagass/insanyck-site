// INSANYCK STEP 4 · Lote 3 — Optimized image component for zero CLS
"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  aspectRatio?: string;
  fallbackSrc?: string;
  skeletonClassName?: string;
}

export default function OptimizedImage({
  src,
  alt,
  aspectRatio = "3/4",
  fallbackSrc = "/products/placeholder/front.webp",
  skeletonClassName,
  className = "",
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    if (!hasError && fallbackSrc && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
      setIsLoading(true); // Reset loading state for fallback
    } else {
      setIsLoading(false);
      setHasError(true);
    }
  };

  return (
    <div 
      className={`relative overflow-hidden bg-black/20 ${aspectRatio ? `aspect-[${aspectRatio}]` : ''}`}
      style={!aspectRatio && props.fill ? undefined : {}}
    >
      {/* INSANYCK STEP 4 · Lote 3 — Loading skeleton with subtle animation */}
      {isLoading && (
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 ${skeletonClassName || ''}`}
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      )}

      {/* INSANYCK STEP 4 · Lote 3 — Optimized image with error handling */}
      <Image
        src={currentSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />

      {/* INSANYCK STEP 4 · Lote 3 — Error state fallback */}
      {hasError && currentSrc === fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 border border-white/10">
          <div className="text-white/40 text-sm text-center">
            <div className="w-8 h-8 mx-auto mb-2 opacity-40">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
            Imagem indisponível
          </div>
        </div>
      )}
    </div>
  );
}