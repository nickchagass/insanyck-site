// INSANYCK FASE G-04.2 — Progress Indicator do Checkout (com animações premium)
// Componente de indicador de progresso com 3 etapas (Dados, Entrega, Pagamento)
// 100% token-based, glassmorphism, premium UX

"use client";

import { useEffect, useState } from "react";

interface CheckoutStepsProps {
  /** Etapa atual (1, 2 ou 3) */
  current: 1 | 2 | 3;
}

/**
 * CheckoutSteps - Indicador de progresso do checkout
 *
 * LEIS DE OURO:
 * - 100% token-based styling
 * - Zero business logic (só apresentação visual)
 * - A11y completa (aria-current, semântica clara)
 *
 * INSANYCK FASE G-04.2:
 * - Transição suave na barra de progresso (300ms)
 * - Scale e shadow no step ativo
 * - Respeita prefers-reduced-motion
 */
export default function CheckoutSteps({ current }: CheckoutStepsProps) {
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
  const steps = [
    { id: 1, label: "Dados" },
    { id: 2, label: "Entrega" },
    { id: 3, label: "Pagamento" },
  ] as const;

  return (
    <nav aria-label="Progresso do checkout" className="w-full max-w-2xl mx-auto px-4 py-6">
      <ol className="flex items-center justify-between relative">
        {/* Linha de progresso (background) */}
        <div
          aria-hidden="true"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] w-full bg-[color:var(--ds-border-subtle)]"
        />

        {/* Linha de progresso ativa — INSANYCK FASE G-04.2: transição suave */}
        <div
          aria-hidden="true"
          className={`absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[color:var(--ds-accent)] ${
            !prefersReducedMotion ? "transition-all duration-300 ease-out" : ""
          }`}
          style={{
            width: current === 1 ? "0%" : current === 2 ? "50%" : "100%",
          }}
        />

        {steps.map((step) => {
          const isCompleted = step.id < current;
          const isCurrent = step.id === current;

          return (
            <li key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              {/* Círculo do step — INSANYCK FASE G-04.2: animação premium */}
              <div
                aria-current={isCurrent ? "step" : undefined}
                className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center
                  font-semibold text-sm
                  ${!prefersReducedMotion ? "transition-all duration-300 ease-out" : ""}
                  ${
                    isCompleted || isCurrent
                      ? "bg-[color:var(--ds-accent)] text-black border-[color:var(--ds-accent)]"
                      : "bg-[color:var(--ds-surface)] text-[color:var(--ds-accent-soft)] border-[color:var(--ds-border-subtle)]"
                  }
                  ${isCurrent && !prefersReducedMotion ? "scale-110 shadow-[var(--ds-shadow-2)]" : ""}
                `}
              >
                {isCompleted ? (
                  // Checkmark para etapas completas
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  // Número da etapa
                  step.id
                )}
              </div>

              {/* Label do step */}
              <span
                className={`
                  text-xs font-medium whitespace-nowrap transition-colors duration-300
                  ${
                    isCurrent
                      ? "text-[color:var(--ds-accent)]"
                      : isCompleted
                      ? "text-[color:var(--ds-accent-soft)]"
                      : "text-[color:var(--ds-accent-soft)] opacity-60"
                  }
                `}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
