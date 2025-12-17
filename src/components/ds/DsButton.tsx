// INSANYCK FASE G-04.2 — Design System: DsButton (com animações premium)
// Componente base de botão premium com 100% token-based styling
// LEI DE OURO: Zero business logic, token-only styling, estados completos, density-ready, A11y

"use client";

import { ButtonHTMLAttributes, ReactNode, useEffect, useState } from "react";

export interface DsButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual do botão */
  variant?: "primary" | "secondary" | "ghost";

  /** Tamanho do botão (lg para loja, sm para console/admin futuro) */
  size?: "sm" | "md" | "lg";

  /** Estado do botão (visual feedback) */
  state?: "default" | "loading" | "success" | "error";

  /** Label acessível (fallback para children quando é ícone) */
  label?: string;

  /** Conteúdo do botão */
  children: ReactNode;
}

/**
 * DsButton - Componente base de botão do Design System INSANYCK
 *
 * LEIS DE OURO:
 * - 100% token-based styling (nenhum valor literal)
 * - Zero business logic (só recebe callbacks via props)
 * - Estados completos (default | loading | success | error)
 * - Density-ready (sm | md | lg)
 * - A11y completa (focus-visible, aria-*, disabled)
 *
 * INSANYCK FASE G-04.2:
 * - Micro-animações de clique (scale)
 * - Animação de sucesso (check + fade)
 * - Respeita prefers-reduced-motion
 */
export default function DsButton({
  variant = "primary",
  size = "lg",
  state = "default",
  label,
  disabled,
  className = "",
  children,
  ...rest
}: DsButtonProps) {
  const isDisabled = disabled || state === "loading";

  // INSANYCK FASE G-04.2 — Detecta prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // INSANYCK FASE G-04.2 — Base styles com animações premium
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-semibold
    rounded-[var(--ds-radius-lg)]
    border
    transition-all duration-150
    focus-visible:outline-none
    focus-visible:ring-2 focus-visible:ring-offset-2
    focus-visible:ring-[color:var(--ds-focus-ring)]
    focus-visible:ring-offset-black
    disabled:opacity-60 disabled:cursor-not-allowed
    ${!prefersReducedMotion ? "active:not(:disabled):scale-[0.97]" : ""}
    ${state === "success" && !prefersReducedMotion ? "animate-[pulse_0.3s_ease-out]" : ""}
  `;

  // Size variants (density-ready para Console/Admin futuro)
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm min-h-[36px]",
    md: "px-4 py-2 text-base min-h-[40px]",
    lg: "px-6 py-3 text-base min-h-[48px]",
  }[size];

  // Variant styles (100% token-based)
  // INSANYCK HOTFIX G-05.3.4 — Primary com "Titanium Plate" (joia premium)
  const variantStyles = {
    primary: `
      ds-btn--titanium
    `,
    secondary: `
      bg-[color:var(--ds-elevated)]
      text-[color:var(--ds-accent)]
      border-[color:var(--ds-border-subtle)]
      backdrop-blur-sm
      hover:not(:disabled):bg-[color:var(--ds-surface)]
      hover:not(:disabled):border-[color:var(--ds-border-strong)]
      hover:not(:disabled):-translate-y-px
      active:not(:disabled):translate-y-0
    `,
    ghost: `
      bg-[color:var(--ds-surface)]
      text-[color:var(--ds-accent-soft)]
      border-[color:var(--ds-border-subtle)]
      backdrop-blur-sm
      hover:not(:disabled):bg-[color:var(--ds-elevated)]
      hover:not(:disabled):border-[color:var(--ds-border-strong)]
      hover:not(:disabled):text-[color:var(--ds-accent)]
      active:not(:disabled):translate-y-0
    `,
  }[variant];

  // State visual feedback
  const stateIcon = {
    loading: (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    ),
    success: (
      <svg
        className="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
    error: (
      <svg
        className="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    default: null,
  }[state];

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-label={label}
      aria-busy={state === "loading"}
      data-state={state}
      data-variant={variant}
      data-size={size}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`.trim()}
      {...rest}
    >
      {stateIcon}
      {children}
    </button>
  );
}
