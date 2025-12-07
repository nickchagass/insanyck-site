// INSANYCK FASE G-04.1 — Design System: DsSkeleton
// Componente de skeleton/loading placeholder
// LEI DE OURO: Zero business logic, token-only styling, respeita prefers-reduced-motion

import { HTMLAttributes } from "react";

export interface DsSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Variante de forma do skeleton */
  variant?: "rectangular" | "circular" | "text";

  /** Largura (CSS value ou Tailwind class) */
  width?: string;

  /** Altura (CSS value ou Tailwind class) */
  height?: string;
}

/**
 * DsSkeleton - Componente de loading skeleton do Design System INSANYCK
 *
 * LEIS DE OURO:
 * - 100% token-based styling (nenhum valor literal)
 * - Zero business logic (só apresentação visual)
 * - Respeita prefers-reduced-motion (animação desligada se necessário)
 *
 * NOTA: A animação de shimmer é controlada globalmente pelo CSS em globals.css
 * via @media (prefers-reduced-motion: reduce)
 */
export default function DsSkeleton({
  variant = "rectangular",
  width,
  height,
  className = "",
  style,
  ...rest
}: DsSkeletonProps) {
  // Base styles (token-only, shimmer animation respeitando prefers-reduced-motion)
  const baseStyles = `
    bg-[color:var(--ds-surface-soft)]
    border border-[color:var(--ds-border-subtle)]
    animate-pulse
  `;

  // Variant styles
  const variantStyles = {
    rectangular: `rounded-[var(--ds-radius-md)]`,
    circular: `rounded-full`,
    text: `rounded-[var(--ds-radius-sm)] h-4`,
  }[variant];

  // Dimensões customizadas
  const inlineStyles = {
    width: width || undefined,
    height: height || undefined,
    ...style,
  };

  return (
    <div
      role="status"
      aria-label="Carregando..."
      data-variant={variant}
      className={`${baseStyles} ${variantStyles} ${className}`.trim()}
      style={inlineStyles}
      {...rest}
    >
      <span className="sr-only">Carregando...</span>
    </div>
  );
}
