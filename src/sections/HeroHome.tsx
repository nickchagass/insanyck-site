// INSANYCK STEP G-05.1 — Hero Home com Brushed Platinum Wordmark + Platinum Edge Frame
// INSANYCK HOTFIX G-05.1.4 — CTAs 360px-safe (stack mobile, row desktop)
// INSANYCK HOTFIX G-05.3.1 — CTAs Titanium Shadow (hero-cta classes)
"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "next-i18next";

export default function HeroHome() {
  const { t } = useTranslation("home");

  return (
    <section
      className="hero-titanium relative pt-[140px] pb-[100px] overflow-visible"
      aria-labelledby="hero-home"
    >
      {/* INSANYCK STEP G-05.1 — Platinum Edge Frame (hairline contornando Hero com micro brilho nos cantos) */}
      {/* INSANYCK STEP G-05.2 — Frame V2 com hairline highlight e sombra interna */}
      {/* INSANYCK STEP G-05.3 — Titanium Shadow: card tactile + z-index correto */}
      {/* INSANYCK TITANIUM SHADOW UX — Hero Stage (2 camadas: stage + card, vitrine cinema) */}
      <div className="hero-stage-titanium mx-auto max-w-[900px] px-6 relative">
        {/* Frame hairline (filete quase invisível) */}
        <div
          className="hero-card-titanium absolute inset-0 pointer-events-none rounded-[24px]"
          aria-hidden="true"
        >
          {/* Micro brilho top-left */}
          <div
            className="absolute top-0 left-0 w-[80px] h-[80px] opacity-30"
            style={{
              background: "radial-gradient(circle at top left, rgba(255, 255, 255, 0.15), transparent 60%)",
            }}
          />
          {/* Micro brilho bottom-right */}
          <div
            className="absolute bottom-0 right-0 w-[80px] h-[80px] opacity-30"
            style={{
              background: "radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.15), transparent 60%)",
            }}
          />
        </div>

        {/* Conteúdo do Hero */}
        <div className="relative z-10 py-16">
          {/* INSANYCK STEP G-05.1 — Wordmark "Brushed Platinum" (metal escovado moderno) */}
          {/* INSANYCK HOTFIX G-05.1.1 — Mobile-safe: fontSize min 44px + letterSpacing responsivo */}
          {/* INSANYCK HOTFIX G-05.1.2 — Tracking por breakpoint: premium desktop + safe mobile */}
          {/* INSANYCK STEP G-05.2 — Wordmark V2 "Platinum Neutral" (sem rosa, highlight hairline, sombra interna) */}
          {/* INSANYCK STEP G-05.3 — Wordmark V3 "Titanium Metal Shader" (bevel + specular + edge) */}
          {/* INSANYCK HOTFIX G-05.3.2 — Wordmark PNG (imagem /brand/insanyck.png) */}
          {/* INSANYCK HOTFIX G-05.4 — Logo Stage (occlusion + halo, sem placa retangular) */}
          <h2
            id="hero-home"
            className="text-center select-none"
          >
            <div className="hero-logo-stage inline-block mx-auto w-[min(820px,92vw)] sm:w-[min(900px,90vw)]">
              <Image
                src="/brand/insanyck.png"
                alt=""
                width={1600}
                height={300}
                priority={true}
                sizes="(max-width: 640px) 92vw, 900px"
                className="w-full h-auto relative z-10"
                style={{
                  filter: 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.70)) drop-shadow(0 30px 60px rgba(0, 0, 0, 0.55))'
                }}
              />
            </div>
            <span className="sr-only">INSANYCK</span>
          </h2>

          {/* INSANYCK STEP G-05.1 — Tagline editorial uppercase fina */}
          <p
            className="mt-8 text-center select-none"
            style={{
              fontSize: "clamp(14px, 2vw, 18px)",
              lineHeight: "1.6",
              fontWeight: 400,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(255, 255, 255, 0.65)",
            }}
          >
            {t("manifesto.line1", "Desconstruir o ordinário")}
            {" · "}
            {t("manifesto.line2", "Reconstruir o extraordinário")}
          </p>

          {/* INSANYCK STEP G-05.1 — Botões premium usando DsButton (Primary e Ghost) */}
          {/* INSANYCK HOTFIX G-05.1.4 — Stack mobile, row sm+ */}
          {/* INSANYCK HOTFIX G-05.3.1 — CTAs Titanium Shadow (graphite liquid + hairline) */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-3 w-full sm:w-auto px-6 sm:px-0">
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
      </div>
    </section>
  );
}
