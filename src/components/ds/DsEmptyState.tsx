// INSANYCK FASE G-04.2 — Design System: DsEmptyState
// Componente de estado vazio genérico, reutilizável, token-based
// LEI DE OURO: Zero business logic, token-only styling, slots para flexibilidade, A11y

"use client";

import { ReactNode } from "react";

export interface DsEmptyStateProps {
  /** Ícone visual (componente React, ex: <PackageIcon />) */
  icon?: ReactNode;

  /** Título do estado vazio */
  title: string;

  /** Descrição do estado vazio (opcional) */
  description?: string;

  /** Ação primária (botão/link, ex: <DsButton>Começar</DsButton>) */
  primaryAction?: ReactNode;

  /** Ação secundária (link/botão ghost, opcional) */
  secondaryAction?: ReactNode;

  /** Classes CSS adicionais */
  className?: string;
}

/**
 * DsEmptyState - Componente de estado vazio do Design System INSANYCK
 *
 * LEIS DE OURO:
 * - 100% token-based styling (nenhum valor literal)
 * - Zero business logic (só layout e slots)
 * - Responsivo e centralizado
 * - A11y básica (semântica clara)
 *
 * USO:
 * ```tsx
 * <DsEmptyState
 *   icon={<Package className="w-12 h-12" />}
 *   title="Nenhum pedido ainda"
 *   description="Quando você fizer compras, seus pedidos aparecerão aqui."
 *   primaryAction={
 *     <DsButton variant="primary" size="lg">
 *       Começar a comprar
 *     </DsButton>
 *   }
 *   secondaryAction={
 *     <Link href="/novidades" className="text-sm text-ds-accentSoft hover:text-ds-accent">
 *       Ver novidades
 *     </Link>
 *   }
 * />
 * ```
 */
export default function DsEmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = "",
}: DsEmptyStateProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center
        min-h-[320px]
        px-6 py-12
        rounded-ds-lg
        border border-ds-borderSubtle
        bg-ds-surface
        text-center
        ${className}
      `.trim()}
    >
      {/* Ícone */}
      {icon && (
        <div
          className="
            mb-4
            text-ds-accentSoft
            opacity-60
          "
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      {/* Título */}
      <h2
        className="
          text-lg
          font-semibold
          text-ds-accent
          mb-2
        "
      >
        {title}
      </h2>

      {/* Descrição */}
      {description && (
        <p
          className="
            text-sm
            text-ds-accentSoft
            max-w-md
            mb-6
          "
        >
          {description}
        </p>
      )}

      {/* Ações */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {primaryAction && <div>{primaryAction}</div>}
          {secondaryAction && <div>{secondaryAction}</div>}
        </div>
      )}
    </div>
  );
}
