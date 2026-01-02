// ══════════════════════════════════════════════════════════════
// INSANYCK STEP H1.1 GOLDEN BRUSH — PHYSICS CONSTANTS (GOD TIER)
// Museum Edition motion design for /admin/products
// ══════════════════════════════════════════════════════════════

/**
 * LIQUID_SPRING — Primary Grid Animation
 * Used for: Card layout transitions, filter changes, grid reordering
 * Feel: Heavy liquid metal, no bounce, inevitable movement
 */
export const LIQUID_SPRING = {
  type: "spring" as const,
  stiffness: 180,    // ⬇️ Lower = heavier feel
  damping: 35,       // ⬆️ Higher = no "boing", controlled
  mass: 1.2,         // ➕ Virtual mass for weight
};

/**
 * MICRO_SPRING — Hover & Micro-interactions
 * Used for: Button hovers, card lifts, badge pulses
 * Feel: Responsive but not jittery
 */
export const MICRO_SPRING = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

/**
 * VAULT_EASE — Drawer Entry/Exit
 * Used for: VariantsDrawer slide animation
 * Feel: Heavy vault door, exponential deceleration
 */
export const VAULT_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * STAGGER_CHILDREN — Cascade Entrance
 * Used for: Cards appearing in sequence
 * Feel: Cinematic reveal, like lights turning on in a gallery
 */
export const STAGGER_CONFIG = {
  staggerChildren: 0.04,
  delayChildren: 0.02,
};

/**
 * COLD_RAY — Focus & Glow Colors
 * NOT pure white. Cold blue-ice tint like high-end server LEDs.
 */
export const COLD_RAY = {
  ring: "rgba(210, 220, 235, 0.18)",
  glow: "rgba(210, 220, 235, 0.10)",
  pulse: "rgba(210, 220, 235, 0.14)",
  intense: "rgba(210, 220, 235, 0.25)",
};

/**
 * STOCK_FEEDBACK — Semantic Micro-Pulses
 * Subtle, not neon. Like status LEDs, not arcade lights.
 */
export const STOCK_FEEDBACK = {
  increment: {
    flash: "rgba(52, 211, 153, 0.18)",   // Emerald soft
    bg: "rgba(52, 211, 153, 0.08)",
    ring: "rgba(52, 211, 153, 0.12)",
  },
  decrement: {
    flash: "rgba(251, 191, 36, 0.18)",   // Amber soft
    bg: "rgba(251, 191, 36, 0.08)",
    ring: "rgba(251, 191, 36, 0.12)",
  },
  critical: {
    flash: "rgba(239, 68, 68, 0.18)",    // Rose soft
    bg: "rgba(239, 68, 68, 0.08)",
    ring: "rgba(239, 68, 68, 0.12)",
  },
};
