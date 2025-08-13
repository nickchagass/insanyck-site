// INSANYCK STEP 5
// src/components/ProductHeroImageKit.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { ReactNode } from "react";

export type ProductHeroProps = {
  title: string;
  subtitle?: string;
  price?: string;
  image: string;                 // ex.: /products/<slug>/front.webp
  imageAlt?: string;
  views?: { front?: string; back?: string; detail?: string }; // opcional
  ctaBuy?: () => void;
  ctaDetails?: () => void;
  // slots opcionais – mantêm visual existente sem impor layout:
  left?: ReactNode;
  right?: ReactNode;
};

export default function ProductHeroImageKit({
  title,
  subtitle,
  price,
  image,
  imageAlt = title,
  ctaBuy,
  ctaDetails,
  left,
  right,
}: ProductHeroProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="relative w-full overflow-hidden"
      aria-labelledby="pdp-hero-title"
    >
      {/* Fundo premium: vinheta + halo sutil */}
      {/* INSANYCK STEP 5 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(80% 120% at 50% 20%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 22%, rgba(0,0,0,0) 55%)",
          WebkitMaskImage:
            "radial-gradient(90% 120% at 50% 40%, #000 0%, #000 70%, transparent 100%)",
          maskImage:
            "radial-gradient(90% 120% at 50% 40%, #000 0%, #000 70%, transparent 100%)",
        }}
      />

      {/* Conteúdo central – mantém tipografia INSANYCK */}
      {/* Você pode posicionar os textos via "left"/"right" conforme o seu layout atual */}
      <div className="mx-auto max-w-[1200px] px-6 pt-20 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8">
          <div className="lg:col-span-5">
            {left ?? (
              <div className="text-center lg:text-left">
                <h1
                  id="pdp-hero-title"
                  className="text-white/95 text-[44px] leading-tight font-semibold tracking-[-0.01em]"
                >
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-3 text-white/70 text-lg">{subtitle}</p>
                ) : null}
                {price ? (
                  <div className="mt-5 text-white/85 text-xl font-semibold">
                    {price}
                  </div>
                ) : null}

                {/* CTAs – estilização segue os botões existentes (sólido + ghost) */}
                <div className="mt-6 flex items-center gap-3 justify-center lg:justify-start">
                  <button
                    onClick={ctaBuy}
                    className="bg-white text-black rounded-xl px-6 py-3 font-semibold hover:brightness-95 transition will-change-transform"
                    aria-label="Comprar agora"
                  >
                    {/* Texto vem do i18n na página – aqui é só o recipiente */}
                    Comprar agora
                  </button>
                  <button
                    onClick={ctaDetails}
                    className="rounded-xl px-6 py-3 font-semibold border border-white/20 text-white hover:bg-white/5 transition"
                    aria-label="Ver detalhes"
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 relative">
            {/* Pedestal (CSS puro) */}
            {/* INSANYCK STEP 5 */}
            <div className="relative">
              <div className="mx-auto h-[440px] w-full max-w-[760px] relative">
                {/* sombra da peça + pedestal via pseudo-elementos */}
                <style jsx>{`
                  .pedestal:before {
                    content: "";
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    bottom: 18px;
                    width: 72%;
                    height: 26px;
                    border-radius: 999px;
                    background: radial-gradient(
                      60% 120% at 50% 50%,
                      rgba(0, 0, 0, 0.6) 0%,
                      rgba(0, 0, 0, 0.35) 40%,
                      rgba(0, 0, 0, 0.0) 80%
                    );
                    filter: blur(8px);
                  }
                  .pedestal:after {
                    content: "";
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    bottom: 0;
                    width: 78%;
                    height: 34px;
                    border-radius: 999px;
                    background: linear-gradient(
                      180deg,
                      rgba(20, 20, 20, 1) 0%,
                      rgba(10, 10, 10, 1) 100%
                    );
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04),
                      0 10px 40px rgba(0, 0, 0, 0.45);
                  }
                `}</style>
                <div className="pedestal absolute inset-0" aria-hidden />

                {/* Iluminação de estúdio no topo */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 -top-10 h-40"
                  style={{
                    background:
                      "radial-gradient(60% 100% at 50% 0%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.0) 70%)",
                  }}
                />

                {/* Imagem (LCP) com microflutuação */}
                <motion.div
                  initial={{ y: prefersReducedMotion ? 0 : -2, rotate: 0 }}
                  animate={{
                    y: prefersReducedMotion ? 0 : [-2, -6, -2],
                    rotate: prefersReducedMotion ? 0 : [0, -0.8, 0.6, 0],
                  }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 6,
                    ease: "easeInOut",
                    repeat: prefersReducedMotion ? 0 : Infinity,
                  }}
                  className="relative h-full w-full flex items-end justify-center"
                >
                  {/* Fallback para imagens sem alpha: blend + máscara suave */}
                  <div className="relative w-[90%] max-w-[720px] aspect-[3/4]">
                    <Image
                      src={image}
                      alt={imageAlt}
                      priority
                      sizes="(min-width:1024px) 800px, 100vw"
                      fill
                      className="object-contain [mix-blend-mode:multiply] [mask-image:radial-gradient(100%_100%_at_50%_50%,#000_60%,transparent_100%)]"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Slot opcional à direita – por ex. FPS, ícones – preserva seu layout se quiser injetar algo */}
        {right ? <div className="mt-6">{right}</div> : null}
      </div>
    </section>
  );
}
