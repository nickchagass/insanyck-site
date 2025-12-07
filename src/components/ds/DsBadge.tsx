// INSANYCK FASE G-04.1 — Design System: DsBadge
// Componente de badge/chip para status e labels
// LEI DE OURO: Zero business logic, token-only styling

import { HTMLAttributes, ReactNode } from "react";

export interface DsBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Variante visual do badge */
  variant?: "default" | "soldout" | "new";

  /** Conteúdo do badge */
  children: ReactNode;
}

/**
 * DsBadge - Componente de badge/chip do Design System INSANYCK
 *
 * LEIS DE OURO:
 * - 100% token-based styling (nenhum valor literal)
 * - Zero business logic (só apresentação visual)
 * - Variantes de status (default | soldout | new)
 */
export default function DsBadge({
  variant = "default",
  className = "",
  children,
  ...rest
}: DsBadgeProps) {
  // Base styles (token-only)
  const baseStyles = `
    inline-flex items-center justify-center
    px-2 py-0.5
    rounded-[var(--ds-radius-sm)]
    text-xs font-medium
    border
    backdrop-blur-sm
  `;

  // Variant styles (100% token-based)
  const variantStyles = {
    default: `
      bg-[color:var(--ds-surface)]
      text-[color:var(--ds-accent-soft)]
      border-[color:var(--ds-border-subtle)]
    `,
    soldout: `
      bg-[color:var(--ds-danger-soft)]
      text-[color:var(--ds-danger)]
      border-[color:var(--ds-danger)]
      border-opacity-30
    `,
    new: `
      bg-[color:var(--ds-elevated)]
      text-[color:var(--ds-accent)]
      border-[color:var(--ds-border-strong)]
    `,
  }[variant];

  return (
    <span
      data-variant={variant}
      className={`${baseStyles} ${variantStyles} ${className}`.trim()}
      {...rest}
    >
      {children}
    </span>
  );
}
