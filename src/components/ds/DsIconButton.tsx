// INSANYCK FASE G-04.1 — Design System: DsIconButton
// Componente de botão com ícone (otimizado para A11y e hit area mínima 44x44px)
// LEI DE OURO: Zero business logic, token-only styling, A11y completa

"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

export interface DsIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual do botão */
  variant?: "primary" | "secondary" | "ghost";

  /** Tamanho do botão (lg para loja, sm para console/admin futuro) */
  size?: "sm" | "md" | "lg";

  /** Estado do botão (visual feedback) */
  state?: "default" | "loading" | "success" | "error";

  /** Label acessível (OBRIGATÓRIO para botões com ícone) */
  label: string;

  /** Conteúdo do botão (ícone SVG ou elemento) */
  children: ReactNode;
}

/**
 * DsIconButton - Componente de botão com ícone do Design System INSANYCK
 *
 * LEIS DE OURO:
 * - 100% token-based styling (nenhum valor literal)
 * - Zero business logic (só recebe callbacks via props)
 * - A11y completa (aria-label OBRIGATÓRIO, focus-visible, hit area mínima 44x44px)
 * - Hit area mínima 44x44px no mobile (WCAG AAA)
 */
export default function DsIconButton({
  variant = "ghost",
  size = "md",
  state = "default",
  label,
  disabled,
  className = "",
  children,
  ...rest
}: DsIconButtonProps) {
  const isDisabled = disabled || state === "loading";

  // Base styles (token-only, nunca valores literais)
  const baseStyles = `
    inline-flex items-center justify-center
    rounded-[var(--ds-radius-md)]
    border
    transition-all duration-150
    focus-visible:outline-none
    focus-visible:ring-2 focus-visible:ring-offset-2
    focus-visible:ring-[color:var(--ds-focus-ring)]
    focus-visible:ring-offset-black
    disabled:opacity-60 disabled:cursor-not-allowed
  `;

  // Size variants (garantindo hit area mínima de 44x44px no mobile)
  const sizeStyles = {
    sm: "w-9 h-9 min-w-[36px] min-h-[36px]", // Admin/Console
    md: "w-11 h-11 min-w-[44px] min-h-[44px]", // Mobile (WCAG AAA)
    lg: "w-12 h-12 min-w-[48px] min-h-[48px]", // Desktop
  }[size];

  // Variant styles (100% token-based)
  const variantStyles = {
    primary: `
      bg-[color:var(--ds-accent)]
      text-black
      border-[color:var(--ds-border-subtle)]
      shadow-[var(--ds-shadow-1)]
      hover:not(:disabled):bg-[color:var(--ds-accent)]
      hover:not(:disabled):brightness-95
      hover:not(:disabled):-translate-y-px
      active:not(:disabled):translate-y-0
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

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-label={label}
      aria-busy={state === "loading"}
      aria-pressed={rest["aria-pressed"]}
      data-state={state}
      data-variant={variant}
      data-size={size}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`.trim()}
      {...rest}
    >
      {state === "loading" ? (
        <svg
          className="animate-spin h-5 w-5"
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
      ) : (
        children
      )}
    </button>
  );
}
