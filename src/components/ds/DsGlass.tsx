// INSANYCK STEP G-08 — DsGlass: PLATINUM GLASS (stealth + Linear Triad)
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
   * - "ghost" (default): platinum stealth padrão (base 0.02 + blur 20px + saturate 165%)
   * - "ghostDense": mais presença visual (base 0.03 + blur 20px + saturate 165%)
   * - "ghostSoft": quase invisível (base 0.015 + blur 18px + saturate 160%)
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
 * DsGlass — PLATINUM GLASS (INSANYCK STEP G-08)
 *
 * Sistema de superfície premium STEALTH para INSANYCK:
 * - Platinum Glass: stealth tint (quase zero), vida pelo blur+saturate
 * - Linear Triad: Highlight/Shadow/Illumination (física de luz, não bloco)
 * - Hairline borders (luz, não traço)
 * - Noise cinematográfico opcional (opacity 0.06)
 * - SEM aspecto "milky" ou "bloco cinza"
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
  // INSANYCK STEP G-08 — Mapeamento Platinum Glass (retrocompatibilidade)
  const normalizedTone =
    tone === "default" ? "ghost" :
    tone === "dense" ? "ghostDense" :
    tone;

  // INSANYCK STEP G-08 — Platinum Glass (stealth tint + blur+saturate real)
  const toneClasses = {
    ghost: "bg-white/[0.02] backdrop-blur-[20px] saturate-[165%]",
    ghostDense: "bg-white/[0.03] backdrop-blur-[20px] saturate-[165%]",
    ghostSoft: "bg-white/[0.015] backdrop-blur-[18px] saturate-[160%]",
  };

  const baseClasses = `
    relative ${rounded} ${toneClasses[normalizedTone as keyof typeof toneClasses]}
    border border-white/[0.06]
    shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
    shadow-[inset_0_-12px_24px_rgba(0,0,0,0.45)]
    overflow-hidden ${padding}
  `.trim().replace(/\s+/g, " ");

  return (
    <Component
      className={`${baseClasses} ${className}`}
      style={style}
      {...dataProps}
    >
      {/* INSANYCK G-08 — Hairline top interno (definição hairline) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.10]"
      />

      {/* Linear Triad: HIGHLIGHT — Specular top (lâmina de luz) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.15] via-white/[0.06] to-transparent"
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
