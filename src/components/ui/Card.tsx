// INSANYCK STEP 4 · Lote 3 — Premium card component with glass aesthetic and hover effects
"use client";

import { HTMLAttributes, forwardRef, ReactNode } from "react";
import { motion } from "framer-motion";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  variant?: "default" | "glass" | "minimal";
}

// INSANYCK STEP 4 · Lote 3 — Card variants with INSANYCK aesthetic
const cardVariants = {
  default: "bg-black/40 border border-white/10",
  glass: "bg-black/20 border border-white/5 backdrop-blur-sm",
  minimal: "bg-transparent border border-white/5"
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className = "", 
    children, 
    hoverable = true, 
    variant = "default",
    ...props 
  }, ref) => {
    const baseClasses = "rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden";
    const variantClasses = cardVariants[variant];
    const focusClasses = "focus-within:ring-2 focus-within:ring-white/20 focus-within:ring-offset-2 focus-within:ring-offset-black";

    // INSANYCK STEP 4 · Lote 3 — Extract drag-related props to avoid conflicts
    const { onDrag: _onDrag, onDragStart: _onDragStart, onDragEnd: _onDragEnd, ...divProps } = props as any;

    return (
      <motion.div
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${focusClasses} ${className}`}
        // INSANYCK STEP 4 · Lote 3 — Subtle hover animation with elevation and content lift
        whileHover={hoverable ? { 
          y: -1,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
        } : undefined}
        transition={{
          duration: 0.15,
          ease: [0.2, 0, 0, 1]
        }}
        {...divProps}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

// INSANYCK STEP 4 · Lote 3 — Card header subcomponent
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`p-6 pb-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = "CardHeader";

// INSANYCK STEP 4 · Lote 3 — Card content subcomponent
export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

CardContent.displayName = "CardContent";

// INSANYCK STEP 4 · Lote 3 — Card footer subcomponent
export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`p-6 pt-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = "CardFooter";