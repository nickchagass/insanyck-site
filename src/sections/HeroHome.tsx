// INSANYCK STEP G-09 — Hero PLATINUM: centralização matemática + alinhamento perfeito
"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "next-i18next";

export default function HeroHome() {
  const { t } = useTranslation("home");

  // INSANYCK G-05.HERO_PUREBLACK — Scroll Lock (garantia absoluta sem scroll)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Salvar estilos originais
    const htmlOriginalOverflow = document.documentElement.style.overflow;
    const htmlOriginalHeight = document.documentElement.style.height;
    const bodyOriginalOverflow = document.body.style.overflow;
    const bodyOriginalHeight = document.body.style.height;

    // Aplicar scroll lock
    document.documentElement.style.height = '100%';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
    if ('overscrollBehavior' in document.body.style) {
      (document.body.style as any).overscrollBehavior = 'none';
    }

    // Forçar scroll para topo
    window.scrollTo(0, 0);

    // Cleanup: restaurar estilos originais
    return () => {
      document.documentElement.style.overflow = htmlOriginalOverflow;
      document.documentElement.style.height = htmlOriginalHeight;
      document.body.style.overflow = bodyOriginalOverflow;
      document.body.style.height = bodyOriginalHeight;
    };
  }, []);

  return (
    <section
      className="relative w-full h-[100svh] overflow-hidden bg-[color:var(--ins-bg-base)]"
      aria-labelledby="hero-home"
      style={{ margin: 0, padding: 0 }}
    >
      {/* INSANYCK G-09 — Content flutuando no preto infinito (centralização matemática) */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 sm:px-6 gap-6">
        {/* INSANYCK G-09 — Logo INSANYCK (centralização perfeita) */}
        <h2 id="hero-home" className="select-none w-full text-center">
          <div className="flex justify-center items-center w-full">
            <Image
              src="/brand/insanyck.png"
              alt="INSANYCK"
              width={1600}
              height={300}
              priority={true}
              sizes="(max-width: 640px) 92vw, 900px"
              className="w-full h-auto max-w-[min(900px,92vw)] max-h-[220px] object-contain"
              style={{
                filter: 'none',
              }}
            />
          </div>
          <span className="sr-only">INSANYCK</span>
        </h2>

        {/* Tagline + Subline (ARQUITETURA DE PRESENÇA) */}
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="select-none text-[14px] sm:text-[15px] md:text-[16px] leading-tight font-medium tracking-[0.14em] uppercase text-white/85 max-w-[85%]">
            {t("manifesto.tagline", "ARQUITETURA DE PRESENÇA.")}
          </p>
          <p className="select-none text-[11px] sm:text-[12px] leading-relaxed font-normal tracking-[0.08em] text-white/60 max-w-[85%]">
            {t("manifesto.subline", "Luxo Negro. Zero concessões.")}
          </p>
        </div>

        {/* CTAs (Titanium Jewel Buttons com Specular Gradient) */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-3 w-full sm:w-auto max-w-[90%]">
          <Link
            href="/loja"
            prefetch={true}
            className="hero-cta hero-cta-primary w-full sm:w-auto"
          >
            {t("cta.shop", "Entrar na loja")}
          </Link>
          <Link
            href="/manifesto"
            prefetch={true}
            className="hero-cta hero-cta-secondary w-full sm:w-auto"
          >
            {t("cta.manifesto", "Manifesto")}
          </Link>
        </div>
      </div>

      {/* Media Queries para max-height do logo em telas muito baixas */}
      <style jsx>{`
        @media (max-height: 700px) {
          h2 img {
            max-height: 180px !important;
          }
        }

        @media (max-height: 600px) {
          h2 img {
            max-height: 140px !important;
          }
        }
      `}</style>
    </section>
  );
}
