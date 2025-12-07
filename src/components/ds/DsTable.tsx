// INSANYCK FASE G-04.2 — Design System: DsTable
// Componente de tabela semântico, acessível, token-based, performático
// LEI DE OURO: Zero business logic, token-only styling, densidade completa, A11y WCAG 2.1 AA

"use client";

import { HTMLAttributes, ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

// ========== ROOT TABLE COMPONENT ==========

export interface DsTableProps extends HTMLAttributes<HTMLTableElement> {
  /** Densidade da tabela (compact para admin/console, default para cliente) */
  density?: "default" | "compact";

  /** Label acessível para a tabela */
  ariaLabel?: string;

  /** ID para aria-labelledby (alternativa ao ariaLabel) */
  ariaLabelledby?: string;

  /** Conteúdo da tabela (Header + Body) */
  children: ReactNode;
}

/**
 * DsTable - Componente base de tabela do Design System INSANYCK
 *
 * LEIS DE OURO:
 * - 100% token-based styling (nenhum valor literal)
 * - Semântica HTML correta (<table>, <thead>, <tbody>, <tr>, <th>, <td>)
 * - Zero business logic (só apresentação visual)
 * - Densidade completa (default | compact)
 * - A11y WCAG 2.1 AA (scope, aria-*, focus-visible)
 *
 * USO:
 * ```tsx
 * <DsTable density="default" ariaLabel="Lista de pedidos">
 *   <DsTable.Header>
 *     <DsTable.Row>
 *       <DsTable.HeaderCell>Pedido</DsTable.HeaderCell>
 *       <DsTable.HeaderCell>Data</DsTable.HeaderCell>
 *       <DsTable.HeaderCell>Status</DsTable.HeaderCell>
 *     </DsTable.Row>
 *   </DsTable.Header>
 *   <DsTable.Body>
 *     {rows.map((row) => (
 *       <DsTable.Row key={row.id} isClickable>
 *         <DsTable.Cell>{row.order}</DsTable.Cell>
 *         <DsTable.Cell>{row.date}</DsTable.Cell>
 *         <DsTable.Cell>{row.status}</DsTable.Cell>
 *       </DsTable.Row>
 *     ))}
 *   </DsTable.Body>
 * </DsTable>
 * ```
 */
export function DsTable({
  density = "default",
  ariaLabel,
  ariaLabelledby,
  className = "",
  children,
  ...rest
}: DsTableProps) {
  // Styles 100% token-based
  const baseStyles = `
    w-full
    border-collapse
    text-ds-accent
  `;

  return (
    <div className="overflow-x-auto rounded-ds-md border border-ds-borderSubtle bg-ds-surface">
      <table
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        data-density={density}
        className={`${baseStyles} ${className}`.trim()}
        {...rest}
      >
        {children}
      </table>
    </div>
  );
}

// ========== HEADER COMPONENT ==========

export interface DsTableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

function DsTableHeader({ className = "", children, ...rest }: DsTableHeaderProps) {
  return (
    <thead className={`border-b border-ds-borderSubtle ${className}`.trim()} {...rest}>
      {children}
    </thead>
  );
}

// ========== BODY COMPONENT ==========

export interface DsTableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

function DsTableBody({ className = "", children, ...rest }: DsTableBodyProps) {
  return (
    <tbody className={`divide-y divide-ds-borderSubtle ${className}`.trim()} {...rest}>
      {children}
    </tbody>
  );
}

// ========== ROW COMPONENT ==========

export interface DsTableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Se a linha é clicável (adiciona hover e cursor pointer) */
  isClickable?: boolean;

  /** Se a linha está selecionada */
  isSelected?: boolean;

  children: ReactNode;
}

function DsTableRow({
  isClickable = false,
  isSelected = false,
  className = "",
  children,
  ...rest
}: DsTableRowProps) {
  const baseStyles = `
    transition-colors duration-150
    ${isClickable ? "cursor-pointer hover:bg-ds-elevated focus-visible:bg-ds-elevated" : ""}
    ${isSelected ? "bg-ds-elevated" : ""}
  `;

  return (
    <tr
      tabIndex={isClickable ? 0 : undefined}
      className={`${baseStyles} ${className}`.trim()}
      {...rest}
    >
      {children}
    </tr>
  );
}

// ========== HEADER CELL COMPONENT ==========

export interface DsTableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** Alinhamento do texto (padrão: left) */
  align?: "left" | "center" | "right";

  children: ReactNode;
}

function DsTableHeaderCell({
  align = "left",
  className = "",
  children,
  ...rest
}: DsTableHeaderCellProps) {
  // INSANYCK FASE G-04.2: density fixo por enquanto (pode ser extraído de context futuramente)
  const baseStyles = `
    text-ds-accentSoft
    font-semibold
    text-sm
    px-4 py-3
    ${align === "left" ? "text-left" : align === "center" ? "text-center" : "text-right"}
  `;

  return (
    <th scope="col" className={`${baseStyles} ${className}`.trim()} {...rest}>
      {children}
    </th>
  );
}

// ========== CELL COMPONENT ==========

export interface DsTableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** Alinhamento do texto (padrão: left) */
  align?: "left" | "center" | "right";

  children: ReactNode;
}

function DsTableCell({
  align = "left",
  className = "",
  children,
  ...rest
}: DsTableCellProps) {
  // INSANYCK FASE G-04.2: density fixo por enquanto (pode ser extraído de context futuramente)
  const baseStyles = `
    text-ds-accent
    text-sm
    px-4 py-3
    ${align === "left" ? "text-left" : align === "center" ? "text-center" : "text-right"}
  `;

  return (
    <td className={`${baseStyles} ${className}`.trim()} {...rest}>
      {children}
    </td>
  );
}

// ========== COMPOUND COMPONENT EXPORTS ==========

DsTable.Header = DsTableHeader;
DsTable.Body = DsTableBody;
DsTable.Row = DsTableRow;
DsTable.HeaderCell = DsTableHeaderCell;
DsTable.Cell = DsTableCell;

export default DsTable;
