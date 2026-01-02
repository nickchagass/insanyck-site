// INSANYCK STEP H1.1 GOLDEN BRUSH — Admin Vitrine Thumb (GOD TIER)
// "Mini Vitrine" thumbnail component for Admin catalog (Museum Edition)
// Premium frame + specular highlight + floor reflection + MICRO_SPRING physics

"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MICRO_SPRING } from "@/lib/admin/physics";

interface AdminVitrineThumbProps {
  /** Image URL */
  src: string;
  /** Alt text (required for A11y) */
  alt: string;
  /** Size class (default: full width in grid) */
  size?: "sm" | "md" | "lg" | "full";
  /** Disable hover effects (default: false) */
  noHover?: boolean;
}

/**
 * INSANYCK STEP H1.1 GOLDEN BRUSH — Admin Vitrine Thumb
 * Visual anatomy:
 * - LAYER A: Frame (hairline border + subtle shadow)
 * - LAYER B: Specular (diagonal gradient highlight)
 * - LAYER C: Floor reflection (fake glow beneath)
 * - LAYER D: Hover (micro lift with MICRO_SPRING, desktop only)
 *
 * Performance:
 * - NO backdrop-blur per item (only blur on parent GlassCard)
 * - will-change only on hover
 * - Reduced motion safe
 */
export default function AdminVitrineThumb({
  src,
  alt,
  size = "full",
  noHover = false,
}: AdminVitrineThumbProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24 sm:w-32 sm:h-32",
    lg: "w-32 h-32 sm:w-40 sm:h-40",
    full: "w-full",
  };

  return (
    <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
      {/* LAYER A: Frame + Image */}
      <motion.div
        className="
          relative
          aspect-square
          rounded-[var(--ds-radius-md)]
          overflow-hidden
          bg-black/30
          border border-white/[0.08]
          shadow-[0_2px_8px_rgba(0,0,0,0.25)]
        "
        whileHover={
          noHover
            ? undefined
            : {
                y: -2,
                transition: MICRO_SPRING,
              }
        }
        transition={MICRO_SPRING}
      >
        {/* Image */}
        <Image
          src={src}
          alt={alt}
          fill
          sizes={
            size === "full"
              ? "(max-width: 768px) 100vw, 400px"
              : size === "lg"
              ? "160px"
              : size === "md"
              ? "128px"
              : "64px"
          }
          className="object-cover"
        />

        {/* LAYER B: Specular Highlight (diagonal gradient, intensifies on hover) */}
        <div
          className="
            absolute inset-0
            pointer-events-none
          "
          style={{
            background: `linear-gradient(135deg,
              rgba(255, 255, 255, 0.08) 0%,
              rgba(255, 255, 255, 0.03) 40%,
              transparent 70%
            )`,
          }}
        />

        {/* Specular highlight line (top edge) */}
        <div
          className="absolute top-0 left-[15%] right-[15%] h-px pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.10), transparent)",
          }}
        />
      </motion.div>

      {/* LAYER C: Floor Reflection (fake glow beneath) */}
      <div
        className="
          absolute -bottom-2 left-0 right-0 h-4
          opacity-30 blur-sm
          pointer-events-none
        "
        style={{
          background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.04), transparent)",
        }}
      />
    </div>
  );
}
