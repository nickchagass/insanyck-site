// INSANYCK HOTFIX G-11.3 — Remove motion.div (fix lazy load opacity bug)
"use client";
import Image, { ImageProps } from "next/image";
import { useState, useCallback } from "react";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  aspectRatio?: `${number}/${number}` | string;
  fallbackSrc?: string;
}

export default function OptimizedImage({
  aspectRatio = "3/4",
  fallbackSrc,
  alt,
  className,
  ...rest
}: OptimizedImageProps) {
  const [src, setSrc] = useState(rest.src as string);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // INSANYCK HOTFIX G-11.3 — Handle image load completion
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  // INSANYCK HOTFIX G-11.3 — Handle image error with fallback
  const handleError = useCallback(() => {
    if (fallbackSrc && src !== fallbackSrc) {
      setSrc(fallbackSrc);
      setHasError(false); // Reset error state for fallback attempt
    } else {
      setHasError(true);
    }
  }, [fallbackSrc, src]);

  return (
    <div
      aria-label={alt}
      style={{ aspectRatio }}
      className="relative w-full overflow-hidden rounded-2xl bg-white/[0.02]"
    >
      {/* INSANYCK HOTFIX G-11.3 — Direct Image render (NO motion.div wrapper) */}
      {/* INSANYCK STEP P0-CARDS — Improved opacity: fade-in on load, never fully invisible */}
      <Image
        {...rest}
        alt={alt}
        src={src}
        fill
        sizes={(rest as any).sizes ?? "(max-width: 768px) 100vw, 50vw"}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          transition-opacity duration-300 ease-out
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${className || ''}
        `}
        style={{
          objectFit: (rest as any).objectFit ?? "cover",
          ...(rest as any).style
        }}
        priority={(rest as any).priority ?? false}
      />

      {/* INSANYCK HOTFIX G-11.3 — Loading skeleton (visible until image loads) */}
      {/* INSANYCK STEP P0-CARDS — Enhanced skeleton: always visible during loading state */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-white/[0.01] animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* INSANYCK HOTFIX G-11.3 — Error state (premium placeholder) */}
      {/* INSANYCK STEP P0-CARDS — Bulletproof error state: always shows fallback icon */}
      {hasError && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-white/[0.02]"
          aria-hidden="true"
        >
          <svg
            className="w-12 h-12 text-white/20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
