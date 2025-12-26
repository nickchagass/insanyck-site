// INSANYCK STEP G-05A — DsGlass: Titanium Glass V3 (Sistema Global de Superfície)
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
   * Tone: densidade do vidro
   * - "default": bg-[#1E1E30]/85 (fumê grafite azulado padrão)
   * - "dense": bg-[#202036]/88 (mais denso para destaque)
   */
  tone?: "default" | "dense";
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
 * DsGlass — Titanium Glass V3
 *
 * Sistema de superfície premium para INSANYCK:
 * - Contraste perceptível matemático (13-22% delta RGB)
 * - Specular highlight (lâmina de luz h-24 from-white/[0.22])
 * - Profundidade interna (inset shadow + vignette)
 * - Hairline dupla (border + ring)
 * - Noise cinematográfico opcional (fractal texture)
 *
 * @example
 * <DsGlass>Conteúdo premium</DsGlass>
 * <DsGlass tone="dense" noise>Destaque com textura</DsGlass>
 */
export default function DsGlass({
  children,
  className = "",
  noise = false,
  tone = "default",
  padding = "p-8 lg:p-12",
  rounded = "rounded-3xl",
  as: Component = "div",
  style,
  ...dataProps
}: DsGlassProps) {
  // Base colors por tone
  const toneClasses = {
    default: "bg-[#1E1E30]/85",
    dense: "bg-[#202036]/88",
  };

  const baseClasses = `
    relative ${rounded} ${toneClasses[tone]}
    border border-white/[0.16] ring-1 ring-white/[0.06]
    shadow-[0_18px_60px_rgba(0,0,0,0.55)]
    shadow-[inset_0_2px_8px_rgba(0,0,0,0.60)]
    overflow-hidden ${padding}
  `.trim().replace(/\s+/g, " ");

  return (
    <Component
      className={`${baseClasses} ${className}`}
      style={style}
      {...dataProps}
    >
      {/* Specular highlight (lâmina de luz premium) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.22] via-white/[0.10] to-transparent"
      />

      {/* Vinheta cinematográfica (profundidade bottom) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-black/0 via-black/0 to-black/30"
      />

      {/* Noise texture (opcional) */}
      {noise && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
          style={{ backgroundImage: "url('/textures/noise.svg')" }}
        />
      )}

      {/* Content (z-index above overlays) */}
      <div className="relative z-10">{children}</div>
    </Component>
  );
}
