// INSANYCK STEP H0 — Admin Pulse HUD
// "The Pulse" — Real-time metrics display (mock data in H0)
// Museum Edition glass cards with privacy blur support
// INSANYCK STEP H0-POLISH — Refined glow, typography, spacing (quiet luxury)

"use client";

import { motion } from "framer-motion";

// INSANYCK H0 — Mock data (will be replaced with real API in future steps)
const MOCK_METRICS = {
  salesToday: 12847.50,
  pendingOrders: 7,
  criticalStock: 3,
};

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  isMonetary?: boolean;
}

function MetricCard({ label, value, icon, trend, isMonetary }: MetricCardProps) {
  const trendColors = {
    up: "text-emerald-400/90",
    down: "text-rose-400/80",
    neutral: "text-white/50",
  };

  const trendColor = trend ? trendColors[trend] : trendColors.neutral;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="
        relative
        glass-card-museum
        p-5
        flex flex-col gap-3
        min-h-[110px]
        group
        hover:-translate-y-0.5
        transition-transform duration-200
      "
    >
      {/* Icon — INSANYCK STEP H0-POLISH: refined color */}
      <div className="flex items-start justify-between">
        <div className={`${trendColor}`}>
          {icon}
        </div>
      </div>

      {/* Value — INSANYCK STEP H0-POLISH: lighter weight, more breathable */}
      <div
        className={`
          text-2xl font-semibold
          text-white/95
          tracking-tight
          ${isMonetary ? "ins-money" : ""}
        `}
      >
        {value}
      </div>

      {/* Label — INSANYCK STEP H0-POLISH: more subtle */}
      <div className="text-[0.6875rem] text-white/45 uppercase tracking-widest font-medium">
        {label}
      </div>

      {/* Specular highlight (Museum Edition) — INSANYCK STEP H0-POLISH: more subtle */}
      <div
        className="absolute top-0 left-[10%] right-[10%] h-px rounded-t-[20px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.06), transparent)",
        }}
      />
    </motion.div>
  );
}

export default function AdminPulseHUD() {
  return (
    <div className="w-full">
      {/* Section Title — INSANYCK STEP H0-POLISH: refined pulse indicator */}
      <div className="mb-5 flex items-center gap-2.5">
        <div
          className="
            h-1.5 w-1.5 rounded-full
            bg-emerald-400/80
            shadow-[0_0_6px_rgba(52,211,153,0.4)]
            animate-pulse
          "
        />
        <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest">
          The Pulse
        </h2>
      </div>

      {/* Metrics Grid — INSANYCK STEP H0-POLISH: increased gap for breathing room */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard
          label="Vendas Hoje"
          value={`R$ ${MOCK_METRICS.salesToday.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          isMonetary
          trend="up"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />

        <MetricCard
          label="Pedidos Pendentes"
          value={MOCK_METRICS.pendingOrders}
          trend="neutral"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          }
        />

        <MetricCard
          label="Estoque Crítico"
          value={MOCK_METRICS.criticalStock}
          trend="down"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          }
        />
      </div>
    </div>
  );
}
