// INSANYCK STEP 3 — Viewer estático (sem WebGL), troca Frente/Verso/Detalhe
"use client";
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import Image from "next/image";

type Variant = "front" | "back" | "detail";

const SRC: Record<Variant, string> = {
  front:  "/hero/front.webp",
  back:   "/hero/back.webp",
  detail: "/hero/detail.webp",
};

export default function ProductImageView({
  initial = "front",
  className,
}: { initial?: Variant; className?: string }) {
  const [variant, setVariant] = useState<Variant>(initial);
  
  // INSANYCK STEP 4 · Lote 3 — Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== document.body) return; // Only when no input is focused
      
      const variants: Variant[] = ["front", "back", "detail"];
      const currentIndex = variants.indexOf(variant);
      
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const nextIndex = currentIndex > 0 ? currentIndex - 1 : variants.length - 1;
        setVariant(variants[nextIndex]);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = currentIndex < variants.length - 1 ? currentIndex + 1 : 0;
        setVariant(variants[nextIndex]);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [variant]);

  return (
    <div
      className={clsx(
        "w-full aspect-[4/3] rounded-2xl bg-black/50 border border-white/10 overflow-hidden relative",
        className
      )}
    >
      {/* Selo no canto (no 3D era '60 FPS') */}
      <div className="absolute right-4 top-3 z-10 text-white/70 text-sm select-none">
        Studio HDR
      </div>

      {/* imagem principal com fade suave */}
      <div className="absolute inset-0">
        <Image
          key={variant}
          src={SRC[variant]}
          alt={`Produto INSANYCK - ${variant === "front" ? "Frente" : variant === "back" ? "Verso" : "Detalhes"}`}
          fill
          priority
          className="object-contain transition-opacity duration-300 opacity-100"
          sizes="(min-width: 1024px) 640px, 100vw"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/thumbs/placeholder.webp";
          }}
        />
      </div>

      {/* miniaturas/variantes iguais ao mock */}
      <div className="absolute right-4 bottom-4 flex gap-4">
        {([
          { k: "front",  label: "Frente"  },
          { k: "back",   label: "Verso"   },
          { k: "detail", label: "Detalhes"},
        ] as const).map((o) => (
          <button
            key={o.k}
            onClick={() => setVariant(o.k)}
            className={clsx(
              "w-[92px] h-[92px] rounded-xl border text-white/85 text-sm bg-white/[0.04] overflow-hidden relative transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
              "hover:border-white/25 hover:bg-white/[0.06]",
              variant === o.k ? "border-white/40 bg-white/[0.08] ring-2 ring-white/20" : "border-white/10"
            )}
            aria-label={`Ver ${o.label.toLowerCase()}`}
            aria-pressed={variant === o.k}
          >
            <Image
              src={`/hero/thumbs/${o.k}.webp`}
              alt={`Thumbnail ${o.label.toLowerCase()}`}
              width={92}
              height={92}
              className="w-full h-full object-cover opacity-95"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/thumbs/placeholder.webp";
              }}
            />
            <div className="absolute inset-x-0 bottom-1 text-center drop-shadow-[0_1px_1px_rgba(0,0,0,.8)]">
              {o.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
