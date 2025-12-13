// INSANYCK STEP G-05.1 — Hero Home com Brushed Platinum Wordmark + Platinum Edge Frame
// INSANYCK HOTFIX G-05.1.4 — CTAs 360px-safe (stack mobile, row desktop)
"use client";

import DsButton from "@/components/ds/DsButton";
import Link from "next/link";
import { useTranslation } from "next-i18next";

export default function HeroHome() {
  const { t } = useTranslation("home");

  return (
    <section
      className="relative pt-[140px] pb-[100px] overflow-visible"
      aria-labelledby="hero-home"
    >
      {/* INSANYCK STEP G-05.1 — Platinum Edge Frame (hairline contornando Hero com micro brilho nos cantos) */}
      <div className="mx-auto max-w-[900px] px-6 relative">
        {/* Frame hairline (filete quase invisível) */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[24px]"
          style={{
            border: "1px solid rgba(255, 255, 255, 0.06)",
            boxShadow: "0 1px 0 rgba(255, 255, 255, 0.04) inset",
          }}
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
        <div className="relative py-16">
          {/* INSANYCK STEP G-05.1 — Wordmark "Brushed Platinum" (metal escovado moderno) */}
          {/* INSANYCK HOTFIX G-05.1.1 — Mobile-safe: fontSize min 44px + letterSpacing responsivo */}
          {/* INSANYCK HOTFIX G-05.1.2 — Tracking por breakpoint: premium desktop + safe mobile */}
          <h2
            id="hero-home"
            className="text-center select-none tracking-[0.12em] sm:tracking-[0.18em] lg:tracking-[0.25em]"
            style={{
              fontSize: "clamp(44px, 11vw, 120px)",
              lineHeight: "1",
              fontWeight: 700,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              background: `
                linear-gradient(135deg, rgba(220, 220, 225, 0.95) 0%, rgba(200, 200, 210, 0.90) 25%, rgba(220, 220, 225, 0.95) 50%, rgba(200, 200, 210, 0.90) 75%, rgba(220, 220, 225, 0.95) 100%),
                repeating-linear-gradient(90deg, transparent 0px, rgba(255, 255, 255, 0.03) 1px, transparent 2px, transparent 4px)
              `,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            }}
          >
            INSANYCK
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
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-6 sm:px-0">
            <Link href="/loja" prefetch={true} className="w-full sm:w-auto">
              <DsButton variant="primary" size="lg" className="w-full sm:w-auto">
                {t("cta.shop", "Entrar na loja")}
              </DsButton>
            </Link>
            <Link href="/manifesto" prefetch={true} className="w-full sm:w-auto">
              <DsButton variant="ghost" size="lg" className="w-full sm:w-auto">
                {t("cta.manifesto", "Manifesto")}
              </DsButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
