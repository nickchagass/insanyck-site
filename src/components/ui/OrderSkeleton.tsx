// INSANYCK STEP G-FIX-I18N-LUXURY — Premium Order Skeleton
// Skeleton screens premium para página de pedidos
// Tons preto/cinza profundo que combinam com a marca

import { motion } from 'framer-motion';

interface OrderSkeletonProps {
  count?: number;
}

/**
 * OrderSkeleton - Skeleton premium para lista de pedidos
 * Estética: Preto/cinza profundo (Luxury Noir)
 * Animação: Pulse suave com stagger entre itens
 */
export function OrderSkeleton({ count = 3 }: OrderSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
        >
          {/* Header: Order ID + Status */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Order number */}
              <div
                className="h-5 w-24 rounded-md bg-white/[0.06] animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
              {/* Status badge */}
              <div
                className="h-6 w-20 rounded-full bg-white/[0.04] animate-pulse"
                style={{ animationDelay: `${i * 100 + 50}ms` }}
              />
            </div>
            {/* Date */}
            <div
              className="h-4 w-28 rounded-md bg-white/[0.04] animate-pulse"
              style={{ animationDelay: `${i * 100 + 100}ms` }}
            />
          </div>

          {/* Items info */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 space-y-2">
              <div
                className="h-4 w-24 rounded-md bg-white/[0.05] animate-pulse"
                style={{ animationDelay: `${i * 100 + 150}ms` }}
              />
            </div>
          </div>

          {/* Footer: Total + Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
            <div
              className="h-5 w-32 rounded-md bg-white/[0.06] animate-pulse"
              style={{ animationDelay: `${i * 100 + 200}ms` }}
            />
            <div
              className="h-9 w-24 rounded-xl bg-white/[0.04] animate-pulse"
              style={{ animationDelay: `${i * 100 + 250}ms` }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * OrderSkeletonTable - Skeleton para versão desktop (DsTable)
 * Estética consistente com OrderSkeleton
 */
export function OrderSkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Table header */}
      <div className="bg-white/[0.02] border-b border-white/[0.06] p-4">
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-4 rounded bg-white/[0.05] animate-pulse"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <motion.div
          key={rowIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: rowIndex * 0.05, duration: 0.2 }}
          className="border-b border-white/[0.04] p-4 last:border-b-0"
        >
          <div className="flex gap-4">
            {/* Order ID column */}
            <div className="flex-1 space-y-2">
              <div
                className="h-4 w-20 rounded bg-white/[0.06] animate-pulse"
                style={{ animationDelay: `${rowIndex * 100}ms` }}
              />
              <div
                className="h-3 w-16 rounded bg-white/[0.04] animate-pulse"
                style={{ animationDelay: `${rowIndex * 100 + 50}ms` }}
              />
            </div>

            {/* Date column */}
            <div className="flex-1">
              <div
                className="h-4 w-24 rounded bg-white/[0.05] animate-pulse"
                style={{ animationDelay: `${rowIndex * 100 + 100}ms` }}
              />
            </div>

            {/* Status column */}
            <div className="flex-1">
              <div
                className="h-6 w-24 rounded-full bg-white/[0.04] animate-pulse"
                style={{ animationDelay: `${rowIndex * 100 + 150}ms` }}
              />
            </div>

            {/* Total column */}
            <div className="flex-1">
              <div
                className="h-4 w-20 rounded bg-white/[0.06] animate-pulse"
                style={{ animationDelay: `${rowIndex * 100 + 200}ms` }}
              />
            </div>

            {/* Actions column */}
            <div className="flex-1 flex justify-end">
              <div
                className="h-8 w-24 rounded-lg bg-white/[0.04] animate-pulse"
                style={{ animationDelay: `${rowIndex * 100 + 250}ms` }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * OrderStatsRow - Skeleton para linha de estatísticas no topo (opcional)
 * Para uso futuro se precisar mostrar stats durante loading
 */
export function OrderStatsRow() {
  return (
    <div className="flex gap-6 mb-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
          className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
        >
          <div
            className="h-3 w-16 rounded bg-white/[0.04] animate-pulse mb-3"
            style={{ animationDelay: `${i * 100}ms` }}
          />
          <div
            className="h-7 w-12 rounded bg-white/[0.08] animate-pulse"
            style={{ animationDelay: `${i * 100 + 100}ms` }}
          />
        </motion.div>
      ))}
    </div>
  );
}
