// INSANYCK STEP G-09 — DsGlass: PLATINUM GLASS (vibrant + visible + specular gradient)
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
   * Tone: perfil do Platinum Glass
   * - "ghost" (default): platinum stealth padrão (base 0.02 + blur 20px + saturate 180%)
   * - "ghostDense": mais presença visual (base 0.03 + blur 20px + saturate 180%)
   * - "ghostSoft": quase invisível (base 0.015 + blur 18px + saturate 175%)
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
 * DsGlass — PLATINUM GLASS (INSANYCK STEP G-09)
 *
 * Sistema de superfície premium VIBRANT para INSANYCK:
 * - Platinum Glass: cristal vivo (saturate 180%), bordas visíveis
 * - Linear Triad: Highlight/Shadow/Illumination (física de luz)
 * - Specular Gradient: fade-out nas pontas (joia lapidada)
 * - Noise cinematográfico opcional (opacity 0.06)
 * - Resultado: vidro perceptível mas elegante
 *
 * @example
 * <DsGlass>Conteúdo platinum padrão</DsGlass>
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
  // INSANYCK STEP G-09 — Mapeamento Platinum Glass (retrocompatibilidade)
  const normalizedTone =
    tone === "default" ? "ghost" :
    tone === "dense" ? "ghostDense" :
    tone;

  // INSANYCK STEP G-09 — Platinum Glass (vibrant + visible)
  const toneClasses = {
    ghost: "bg-white/[0.02] backdrop-blur-[20px] saturate-[180%]",
    ghostDense: "bg-white/[0.03] backdrop-blur-[20px] saturate-[180%]",
    ghostSoft: "bg-white/[0.015] backdrop-blur-[18px] saturate-[175%]",
  };

  const baseClasses = `
    relative ${rounded} ${toneClasses[normalizedTone as keyof typeof toneClasses]}
    border border-white/[0.12]
    shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]
    shadow-[inset_0_-12px_24px_rgba(0,0,0,0.45)]
    overflow-hidden ${padding}
  `.trim().replace(/\s+/g, " ");

  return (
    <Component
      className={`${baseClasses} ${className}`}
      style={style}
      {...dataProps}
    >
      {/* INSANYCK G-09 — Specular Gradient top (fade-out nas pontas) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.50) 50%, transparent 100%)',
        }}
      />

      {/* Linear Triad: HIGHLIGHT — Specular top (lâmina de luz) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.25] via-white/[0.08] to-transparent"
      />

      {/* Linear Triad: ILLUMINATION — Ambient glow (radial central minimal) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,255,255,0.06) 0%, transparent 60%)',
        }}
      />

      {/* Linear Triad: SHADOW/OCCLUSION — Vinheta cinematográfica (profundidade bottom) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-black/0 via-black/0 to-black/30"
      />

      {/* Noise texture (opcional, muito sutil) */}
      {noise && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{ backgroundImage: "url('/textures/noise.svg')" }}
        />
      )}

      {/* Content (z-index above overlays) */}
      <div className="relative z-10">{children}</div>
    </Component>
  );
}
