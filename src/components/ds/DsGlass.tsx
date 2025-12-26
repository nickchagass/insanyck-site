// INSANYCK STEP G-05C — DsGlass: GHOST TITANIUM (vidro fantasma etéreo)
import React, { ReactNode, CSSProperties } from "react";

export interface DsGlassProps {
  children: ReactNode;
  className?: string;
  /**
   * Noise cinematográfico (textura fractal sutil)
   * Default: false
   */
  noise?: boolean;
  /**
   * Tone: perfil do Ghost Glass
   * - "ghost" (default): vidro fantasma padrão (bg-white/[0.04] + blur-2xl)
   * - "ghostDense": mais presença visual (bg-white/[0.06] + blur-2xl)
   * - "ghostSoft": quase invisível (bg-white/[0.02] + blur-xl)
   * - "default", "dense": retrocompatibilidade (mapeiam para ghost/ghostDense)
   */
  tone?: "ghost" | "ghostDense" | "ghostSoft" | "default" | "dense";
  /**
   * Padding interno customizado (substitui default p-8 lg:p-12)
   */
  padding?: string;
  /**
   * Border radius customizado (substitui default rounded-3xl)
   */
  rounded?: string;
  /**
   * Tag HTML semântica
   */
  as?: "div" | "section" | "article" | "aside";
  /**
   * Style inline adicional
   */
  style?: CSSProperties;
  /**
   * Data attributes para tracking/reveal
   */
  [key: `data-${string}`]: unknown;
}

/**
 * DsGlass — GHOST TITANIUM
 *
 * Sistema de superfície premium etérea para INSANYCK (Static Luxury):
 * - Vidro fantasma (leve, alto blur, borda quase invisível)
 * - Specular highlight sutil (lâmina de luz h-24 from-white/[0.16])
 * - Profundidade interna (inset shadow + hairline top)
 * - Noise cinematográfico opcional (opacity 0.08)
 * - SEM sombras externas pesadas (zero "bloco")
 *
 * @example
 * <DsGlass>Conteúdo ghost padrão</DsGlass>
 * <DsGlass tone="ghostDense" noise>Destaque com textura</DsGlass>
 * <DsGlass tone="ghostSoft">Camada quase invisível</DsGlass>
 */
export default function DsGlass({
  children,
  className = "",
  noise = false,
  tone = "ghost",
  padding = "p-8 lg:p-12",
  rounded = "rounded-3xl",
  as: Component = "div",
  style,
  ...dataProps
}: DsGlassProps) {
  // INSANYCK STEP G-05C — Mapeamento Ghost Titanium (retrocompatibilidade)
  const normalizedTone =
    tone === "default" ? "ghost" :
    tone === "dense" ? "ghostDense" :
    tone;

  // INSANYCK STEP G-05C — Ghost Titanium (blur real + tint mínimo)
  const toneClasses = {
    ghost: "bg-white/[0.04] backdrop-blur-2xl",
    ghostDense: "bg-white/[0.06] backdrop-blur-2xl",
    ghostSoft: "bg-white/[0.02] backdrop-blur-xl",
  };

  const baseClasses = `
    relative ${rounded} ${toneClasses[normalizedTone as keyof typeof toneClasses]}
    border border-white/[0.05]
    shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
    shadow-[inset_0_-12px_24px_rgba(0,0,0,0.35)]
    overflow-hidden ${padding}
  `.trim().replace(/\s+/g, " ");

  return (
    <Component
      className={`${baseClasses} ${className}`}
      style={style}
      {...dataProps}
    >
      {/* INSANYCK G-05C — Hairline top interno (definição sem borda grossa) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.08]"
      />

      {/* Specular highlight (lâmina de luz sutil) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.16] via-white/[0.06] to-transparent"
      />

      {/* Vinheta cinematográfica (profundidade bottom) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-black/0 via-black/0 to-black/30"
      />

      {/* Noise texture (opcional, muito sutil) */}
      {noise && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
          style={{ backgroundImage: "url('/textures/noise.svg')" }}
        />
      )}

      {/* Content (z-index above overlays) */}
      <div className="relative z-10">{children}</div>
    </Component>
  );
}
