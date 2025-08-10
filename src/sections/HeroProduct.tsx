// INSANYCK STEP 3 — Produto (switch entre estático e 3D)
"use client";

import { CTA } from "@/components/CTA";
import Product3DView from "@/components/Product3DView";
import ProductImageView from "@/components/ProductImageView";
import { useState } from "react";
import { useTranslation } from "next-i18next"; // INSANYCK STEP 4

type Variant = "front" | "back" | "detail";

// mude para false se quiser voltar ao 3D
const USE_STATIC_VIEW = true;

export default function HeroProduct() {
  const [variant, setVariant] = useState<Variant>("front");
  const { t } = useTranslation(["product"]); // INSANYCK STEP 4

  return (
    <section className="relative pt-[120px] pb-[60px]" aria-labelledby="hero-prod">
      <div className="mx-auto max-w-[1200px] px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Viewer (imagens estáticas ou 3D) */}
        <div className="relative">
          {USE_STATIC_VIEW ? (
            <ProductImageView initial={variant} />
          ) : (
            <Product3DView modelUrl="/models/shirt.glb" variant={variant} />
          )}
        </div>

        {/* textos e CTAs */}
        <div className="text-center lg:text-left">
          <h2 className="text-white/92 text-[56px] md:text-[64px] font-semibold leading-tight">
            {t("product:title", "Oversized Classic") /* INSANYCK STEP 4 */}
          </h2>
          <p className="mt-3 text-white/75 text-[20px]">
            {t("product:subtitle", "Drop-shoulder • 100% algodão premium") /* INSANYCK STEP 4 */}
          </p>

          <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
            <CTA>{t("product:cta.buyNow", "Comprar agora") /* INSANYCK STEP 4 */}</CTA>
            <CTA variant="ghost">{t("product:cta.viewDetails", "Ver detalhes") /* INSANYCK STEP 4 */}</CTA>
          </div>

          <div className="mt-6 text-white/75">
            {/* instrução muda conforme viewer */}
            {USE_STATIC_VIEW
              ? t("product:hint.thumbs", "Use as miniaturas para ver frente/verso/detalhes")
              : t("product:hint.drag", "Arraste para girar — passe o mouse") /* INSANYCK STEP 4 */}
          </div>

          {/* botões de texto (Frente/Verso) como na ref */}
          <div className="mt-8 flex gap-6 justify-center lg:justify-start text-white/85">
            {[
              { k: "front", label: t("product:thumbs.front", "Frente") },
              { k: "back", label: t("product:thumbs.back", "Verso") },
            ].map((o) => (
              <button
                key={o.k}
                onClick={() => setVariant(o.k as Variant)}
                className={o.k === variant ? "underline underline-offset-4" : "opacity-80 hover:opacity-100"}
                aria-pressed={o.k === variant}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
