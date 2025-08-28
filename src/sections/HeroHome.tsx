"use client";

import { CTA } from "@/components/CTA";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "next-i18next"; // INSANYCK STEP 4

// INSANYCK STEP 4 — tipagem das chaves usadas neste componente
type HomeKey =
  | "carousel.dropZero"
  | "carousel.oversizedClassic"
  | "carousel.regatas"
  | "carousel.acessorios";

// INSANYCK STEP 4 — não repita o namespace no item; usamos useTranslation("home")
const ITEMS: ReadonlyArray<{ titleKey: HomeKey; img: string }> = [
  { titleKey: "carousel.dropZero",         img: "/thumbs/drop-zero.png" },
  { titleKey: "carousel.oversizedClassic", img: "/thumbs/oversized-classic.png" },
  { titleKey: "carousel.regatas",          img: "/thumbs/regatas.png" },
  { titleKey: "carousel.acessorios",       img: "/thumbs/acessorios.png" },
] as const;

export default function HeroHome() {
  const scroller = useRef<HTMLDivElement>(null);
  const { t } = useTranslation("home"); // INSANYCK STEP 4 — use string única, não array

  return (
    <section
      className="relative pt-[120px] pb-[80px] overflow-hidden"
      aria-labelledby="hero-home"
    >
      {/* Halo/aneis de fundo (leve) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 35%, rgba(0,0,0,0) 60%)",
          maskImage:
            "radial-gradient(60% 60% at 50% 40%, #000 0%, #000 55%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(60% 60% at 50% 40%, #000 0%, #000 55%, transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-[1200px] px-6">
        {/* H1 caps com tracking exato */}
        <h1
          id="hero-home"
          className="text-center text-[120px] leading-[1] font-semibold tracking-[0.25em] text-white/90 select-none"
          style={{ textTransform: "uppercase" }}
        >
          {/* Mantém o wordmark como texto simples, não traduzimos o nome da marca */}
          INSANYCK
        </h1>

        {/* Manifesto */}
        <p className="mt-8 text-center text-[28px] leading-[1.4] text-white/80">
          {/* INSANYCK STEP 4 — sem prefixo 'home:' porque o namespace já está resolvido */}
          {t("manifesto.line1", "Desconstruir o ordinário.")}
          <br />
          {t("manifesto.line2", "Reconstruir o extraordinário.")}
        </p>

        {/* CTAs */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/loja">
            <CTA>
              {t("cta.shop", "Entrar na loja") /* INSANYCK STEP 4 */}
            </CTA>
          </Link>
          <Link href="/manifesto">
            <CTA variant="ghost">
              {t("cta.manifesto", "Manifesto") /* INSANYCK STEP 4 */}
            </CTA>
          </Link>
        </div>

        {/* "Role para explorar" + bullets - MAIS ESPAÇO */}
        <div className="mt-20 text-center text-white/70">
          {t("scrollToExplore", "Role para explorar") /* INSANYCK STEP 4 */}
        </div>
        <div className="mt-3 flex justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
        </div>

        {/* Carrossel CENTRALIZADO e com mais espaço */}
        <div className="mt-16 flex justify-center">
          <div
            ref={scroller}
            className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] max-w-fit"
            style={{ WebkitOverflowScrolling: "touch" }}
            aria-label={t("aria.carousel", "Carrossel de coleções") /* INSANYCK STEP 4 */}
          >
            <style jsx global>{`
              /* esconder scrollbar; mantém acessibilidade por teclado */
              .snap-x::-webkit-scrollbar { display: none; }
            `}</style>
            {ITEMS.map((it, index) => (
              <motion.article
                key={it.titleKey}
                whileHover={{ y: -2 }}
                className="snap-start shrink-0 w-[220px] h-[140px] rounded-2xl bg-[#0f0f10] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] relative overflow-hidden"
              >
              {/* INSANYCK STEP 4 — alt usa a chave tipada do carrossel */}
              <Image
                src={it.img}
                alt={t(it.titleKey)}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                className="object-cover opacity-[0.92]"
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
              />

                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)]" />
                <div className="absolute bottom-3 left-4 text-white/90 text-sm font-medium">
                  {t(it.titleKey) /* INSANYCK STEP 4 — exibirá 'Drop Zero', etc. */}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
