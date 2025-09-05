
// INSANYCK STEP 4 · Lote 3 — Premium button with micro-interactions and a11y
"use client";

import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { motion } from "framer-motion";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
}

// INSANYCK STEP 4 · Lote 3 — Button variants with INSANYCK glass aesthetic
const buttonVariants = {
  primary: "bg-white text-black border border-white/20 shadow-sm hover:shadow-md",
  ghost: "bg-transparent text-white border border-white/15 hover:bg-white/5",
  link: "bg-transparent text-white/80 hover:text-white border-none p-0"
};

const buttonSizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg"
};

// INSANYCK STEP 4 · Lote 3 — Loading spinner component
const LoadingSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4"
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
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = "primary", 
    size = "md", 
    loading = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    // INSANYCK STEP 4 · Lote 3 — Extract motion-specific props to avoid conflicts
    const { onDrag, onDragStart, onDragEnd, ...buttonProps } = props as any;

    return (
      <motion.button
        ref={ref}
        className={cn(
          // INSANYCK STEP 4 · Lote 3 — Base styles with INSANYCK aesthetic
          "inline-flex items-center justify-center rounded-xl font-semibold",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
          "transition-all duration-150 cubic-bezier(0.2, 0, 0, 1)",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          buttonVariants[variant],
          variant !== "link" && buttonSizes[size],
          className
        )}
        // INSANYCK STEP 4 · Lote 3 — Micro-interactions with subtle scale and shadow
        whileHover={!isDisabled ? { 
          scale: 1.015, 
          boxShadow: variant === "primary" ? "0 4px 12px rgba(255,255,255,0.1)" : undefined
        } : undefined}
        whileTap={!isDisabled ? { scale: 0.985 } : undefined}
        disabled={isDisabled}
        aria-busy={loading}
        data-state={loading ? "loading" : "idle"}
        {...buttonProps}
      >
        {loading && <LoadingSpinner />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

// INSANYCK STEP 4 · Lote 3 — Utility function for className merging
function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}