// INSANYCK FASE G-04.1 — Design System: DsCard
// Componente de card/superfície com glassmorphism e hairline
// LEI DE OURO: Zero business logic, token-only styling

import { HTMLAttributes, ReactNode } from "react";

export interface DsCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Conteúdo do card */
  children: ReactNode;

  /** Padding interno (opcional) */
  padding?: "none" | "sm" | "md" | "lg";
}

/**
 * DsCard - Componente de card/superfície do Design System INSANYCK
 *
 * LEIS DE OURO:
 * - 100% token-based styling (nenhum valor literal)
 * - Zero business logic (só apresentação visual)
 * - Glassmorphism + hairline border + sombra discreta
 */
export default function DsCard({
  padding = "md",
  className = "",
  children,
  ...rest
}: DsCardProps) {
  // Base styles (token-only, glassmorphism + hairline)
  const baseStyles = `
    rounded-[var(--ds-radius-lg)]
    bg-[color:var(--ds-surface)]
    border border-[color:var(--ds-border-subtle)]
    shadow-[var(--ds-shadow-1)]
    backdrop-blur-sm
  `;

  // Padding variants
  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-8",
  }[padding];

  return (
    <div
      data-padding={padding}
      className={`${baseStyles} ${paddingStyles} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
