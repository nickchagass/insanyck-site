// INSANYCK STEP 4 · Lote 3 — Optimized image component for zero CLS
"use client";
import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad"> {
  aspectRatio?: `${number}/${number}` | string; // ex: "3/4"
  fallbackSrc?: string;
}

export default function OptimizedImage({
  aspectRatio = "3/4",
  fallbackSrc,
  alt,
  ...rest
}: OptimizedImageProps) {
  const [src, setSrc] = useState(rest.src as string);

  return (
    <div
      aria-label={alt}
      style={{ aspectRatio }}
      className="relative w-full overflow-hidden rounded-2xl"
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Image
          {...rest}
          alt={alt}
          src={src}
          fill
          sizes={(rest as any).sizes ?? "(max-width: 768px) 100vw, 50vw"}
          onError={() => {
            if (fallbackSrc && src !== fallbackSrc) setSrc(fallbackSrc);
          }}
          style={{ objectFit: (rest as any).objectFit ?? "cover" }}
          priority={(rest as any).priority ?? false}
        />
      </motion.div>
    </div>
  );
}