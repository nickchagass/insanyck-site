// INSANYCK STEP H1-04 — Mobile Swipe Actions
// Framer Motion swipe gesture for quick stock adjustments
// Native-feel swipe threshold and spring physics

"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { ReactNode, useState } from "react";

interface MobileSwipeActionsProps {
  children: ReactNode;
  /** Callback when +1 action is triggered */
  onIncrement?: () => void;
  /** Callback when -1 action is triggered */
  onDecrement?: () => void;
  /** Callback when "View Details" is triggered */
  onViewDetails?: () => void;
}

const SWIPE_THRESHOLD = 80; // px to trigger action
const MAX_SWIPE = 150; // px maximum drag distance

/**
 * INSANYCK H1-04 — Mobile Swipe Actions
 * Features:
 * - Swipe right: +1 stock (green action)
 * - Swipe left: -1 stock (amber action) OR view details
 * - Spring physics for native feel
 * - Haptic-style feedback (visual)
 */
export default function MobileSwipeActions({
  children,
  onIncrement,
  onDecrement,
  onViewDetails,
}: MobileSwipeActionsProps) {
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  // Background color based on swipe direction
  const backgroundColor = useTransform(
    x,
    [-MAX_SWIPE, 0, MAX_SWIPE],
    [
      "rgba(251, 191, 36, 0.15)", // amber (left swipe = decrement)
      "rgba(255, 255, 255, 0.00)", // transparent (center)
      "rgba(52, 211, 153, 0.15)",  // emerald (right swipe = increment)
    ]
  );

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);

    const offset = info.offset.x;

    // Right swipe (increment)
    if (offset > SWIPE_THRESHOLD && onIncrement) {
      onIncrement();
    }
    // Left swipe (decrement or details)
    else if (offset < -SWIPE_THRESHOLD) {
      if (onDecrement) {
        onDecrement();
      } else if (onViewDetails) {
        onViewDetails();
      }
    }

    // Spring back to center
    x.set(0);
  };

  return (
    <div className="relative overflow-hidden rounded-[var(--ds-radius-md)]">
      {/* Background Actions (revealed during drag) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-between px-6"
        style={{ backgroundColor }}
      >
        {/* Left Action (Decrement) */}
        <div className="flex items-center gap-2 text-amber-400/80">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
          <span className="text-sm font-medium">-1</span>
        </div>

        {/* Right Action (Increment) */}
        <div className="flex items-center gap-2 text-emerald-400/80">
          <span className="text-sm font-medium">+1</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </motion.div>

      {/* Draggable Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -MAX_SWIPE, right: MAX_SWIPE }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={`
          relative z-10
          bg-black/50
          ${isDragging ? "cursor-grabbing" : "cursor-grab"}
        `}
      >
        {children}
      </motion.div>
    </div>
  );
}
