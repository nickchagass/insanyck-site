// INSANYCK STEP H1.1 GOLDEN BRUSH — Variants Drawer (THE VAULT · GOD TIER)
// Right-side vault panel for managing product variants (Museum Edition)
// Multi-layer shadow system, VAULT_EASE physics, content stagger, progressive blur

"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminProductCardData } from "./AdminProductCard";
import AdminVitrineThumb from "./AdminVitrineThumb";
import { VAULT_EASE, STAGGER_CONFIG } from "@/lib/admin/physics";

interface VariantsDrawerProps {
  /** Drawer open state */
  open: boolean;
  /** Product to display variants for */
  product: AdminProductCardData | null;
  /** Close callback */
  onClose: () => void;
}

/**
 * INSANYCK STEP H1.1 GOLDEN BRUSH — Variants Drawer (THE VAULT)
 * Museum Edition right-side panel for variant management
 *
 * Visual Features:
 * - Multi-layer shadow system (5 layers for depth)
 * - Specular wire on top edge
 * - Progressive backdrop blur (12px)
 * - Content stagger animation
 * - Heavy vault door animation with VAULT_EASE
 *
 * A11y features:
 * - ESC key closes
 * - Click backdrop closes
 * - Focus trapped inside drawer when open
 * - Body scroll locked when open
 * - aria-modal + role="dialog"
 */
export default function VariantsDrawer({
  open,
  product,
  onClose,
}: VariantsDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // INSANYCK STEP H1.1 — ESC key handler
  // INSANYCK STEP H2 — Enhanced with focus trap (Tab key cycling)
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to close
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // INSANYCK STEP H2 — Focus trap: Tab key cycling
      if (e.key === "Tab") {
        if (!drawerRef.current) return;

        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        );

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: if on first element, cycle to last
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          // Tab: if on last element, cycle to first
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // INSANYCK STEP H1.1 — Body scroll lock + focus management
  useEffect(() => {
    if (!open) return;

    // Save current focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Focus close button after animation
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 350);

    return () => {
      // Restore body scroll
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;

      // Restore focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [open]);

  if (!product) return null;

  // INSANYCK STEP H1.1 — Calculate variant stats
  const totalStock = product.variants.reduce((sum, v) => {
    if (!v.inventory) return sum;
    return sum + (v.inventory.quantity - v.inventory.reserved);
  }, 0);

  const primaryImage = product.images[0] || null;

  // INSANYCK STEP H1.1 GOLDEN BRUSH — Animation Variants
  const backdropVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: { duration: 0.4, ease: VAULT_EASE },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const drawerVariants = {
    hidden: {
      x: "100%",
      opacity: 0.8,
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.45,
        ease: VAULT_EASE,
      },
    },
    exit: {
      x: "100%",
      opacity: 0.8,
      transition: {
        duration: 0.35,
        ease: VAULT_EASE,
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.35, ease: VAULT_EASE },
    },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop with Progressive Blur */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="
              vault-backdrop
              fixed inset-0 z-[var(--z-modal)]
            "
            aria-hidden="true"
          />

          {/* Drawer Panel with Multi-Layer Depth System */}
          <motion.div
            ref={drawerRef}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            className="
              vault-drawer
              fixed top-0 right-0 bottom-0 z-[var(--z-modal)]
              w-full sm:w-[480px] lg:w-[560px]
              overflow-y-auto
            "
          >
            {/* Specular Wire (Top Edge Catch Light) */}
            <div className="vault-drawer-specular" />

            {/* Header */}
            <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-md border-b border-white/[0.06] px-6 py-5">
              <motion.div
                className="flex items-start justify-between gap-4"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="flex-1 min-w-0">
                  <h2
                    id="drawer-title"
                    className="text-xl font-semibold text-white/95 mb-1 truncate"
                  >
                    {product.title}
                  </h2>
                  <p className="text-sm text-white/50">
                    Manage variants and inventory
                  </p>
                </div>

                {/* Close Button */}
                <motion.button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close drawer"
                  className="
                    flex-shrink-0
                    w-9 h-9
                    flex items-center justify-center
                    rounded-md
                    text-white/60
                    hover:text-white/90
                    hover:bg-white/[0.06]
                    transition-all duration-150
                    focus:outline-none
                    focus:ring-2 focus:ring-white/[0.15]
                  "
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </motion.div>
            </div>

            {/* Content with Stagger Animation */}
            <motion.div
              className="p-6 space-y-6"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Product Summary */}
              <motion.div className="glass-card-museum p-5" variants={itemVariants}>
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  {primaryImage ? (
                    <AdminVitrineThumb
                      src={primaryImage.url}
                      alt={primaryImage.alt || product.title}
                      size="md"
                      noHover
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-md bg-black/30 border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                      <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/45 uppercase tracking-wider mb-1">
                      Product
                    </div>
                    <div className="text-sm font-mono text-white/60 mb-3">
                      /{product.slug}
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-xs text-white/45">Status</div>
                        <div className="text-sm font-medium text-white/80 capitalize">
                          {product.status}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-white/45">Total Stock</div>
                        <div className="text-sm font-semibold text-white/90">
                          {totalStock}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Variants List */}
              <motion.div variants={itemVariants}>
                <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">
                  Variants ({product.variants.length})
                </h3>

                {product.variants.length > 0 ? (
                  <div className="space-y-3">
                    {product.variants.map((variant, index) => {
                      const available = variant.inventory
                        ? variant.inventory.quantity - variant.inventory.reserved
                        : 0;

                      return (
                        <motion.div
                          key={variant.id}
                          custom={index}
                          variants={itemVariants}
                          className="
                            glass-card-museum p-4
                            border border-white/[0.06]
                            hover:border-white/[0.10]
                            transition-colors duration-150
                          "
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white/90 mb-1">
                                SKU: {variant.sku}
                              </div>
                              {variant.inventory && (
                                <div className="flex items-center gap-3 text-xs text-white/50">
                                  <span>Quantity: {variant.inventory.quantity}</span>
                                  {variant.inventory.reserved > 0 && (
                                    <span>Reserved: {variant.inventory.reserved}</span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <div
                                className={`
                                  px-2.5 py-1
                                  text-xs font-semibold
                                  rounded-md
                                  ${
                                    available === 0
                                      ? "bg-rose-500/10 text-rose-400/90 border border-rose-400/20"
                                      : available <= 5
                                      ? "bg-amber-500/10 text-amber-400/90 border border-amber-400/20"
                                      : "bg-emerald-500/10 text-emerald-400/90 border border-emerald-400/20"
                                  }
                                `}
                              >
                                {available} avail
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="glass-card-museum p-8 text-center">
                    <svg
                      className="mx-auto h-10 w-10 text-white/20 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-sm text-white/50">
                      No variants found
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Actions Placeholder */}
              <motion.div className="pt-4 border-t border-white/[0.06]" variants={itemVariants}>
                <button
                  type="button"
                  disabled
                  className="
                    w-full
                    px-4 py-2.5
                    text-sm font-medium text-white/40
                    border border-white/[0.08]
                    rounded-[var(--ds-radius-md)]
                    cursor-not-allowed
                    opacity-50
                  "
                >
                  + Add Variant (Coming Soon)
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
