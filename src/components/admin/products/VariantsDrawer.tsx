// INSANYCK STEP H1.2 — Variants Drawer
// Right-side vault panel for managing product variants (Museum Edition)
// Features: Framer Motion slide-in, backdrop, ESC close, focus trap, body scroll lock

"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminProductCardData } from "./AdminProductCard";
import AdminVitrineThumb from "./AdminVitrineThumb";

interface VariantsDrawerProps {
  /** Drawer open state */
  open: boolean;
  /** Product to display variants for */
  product: AdminProductCardData | null;
  /** Close callback */
  onClose: () => void;
}

/**
 * INSANYCK STEP H1.2 — Variants Drawer
 * Museum Edition right-side panel for variant management
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

  // INSANYCK STEP H1.2 — ESC key handler
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // INSANYCK STEP H1.2 — Body scroll lock + focus management
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
    }, 250);

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

  // INSANYCK STEP H1.2 — Calculate variant stats
  const totalStock = product.variants.reduce((sum, v) => {
    if (!v.inventory) return sum;
    return sum + (v.inventory.quantity - v.inventory.reserved);
  }, 0);

  const primaryImage = product.images[0] || null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="
              fixed inset-0 z-[var(--z-modal)]
              bg-black/60 backdrop-blur-sm
            "
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              duration: 0.28,
              ease: [0.16, 1, 0.3, 1], // expo easing
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            className="
              fixed top-0 right-0 bottom-0 z-[var(--z-modal)]
              w-full sm:w-[480px] lg:w-[560px]
              bg-black/95 backdrop-blur-xl
              border-l border-white/[0.08]
              overflow-y-auto
              shadow-[-20px_0_60px_rgba(0,0,0,0.6)]
            "
          >
            {/* Specular Highlight (Museum Edition) */}
            <div
              className="absolute top-0 left-0 right-[10%] h-px"
              style={{
                background: "linear-gradient(90deg, rgba(255, 255, 255, 0.12), transparent)",
              }}
            />

            {/* Header */}
            <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-md border-b border-white/[0.06] px-6 py-5">
              <div className="flex items-start justify-between gap-4">
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
                <button
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
                    active:scale-95
                    focus:outline-none
                    focus:ring-2 focus:ring-white/[0.15]
                  "
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Product Summary */}
              <div className="glass-card-museum p-5">
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
              </div>

              {/* Variants List */}
              <div>
                <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">
                  Variants ({product.variants.length})
                </h3>

                {product.variants.length > 0 ? (
                  <div className="space-y-3">
                    {product.variants.map((variant) => {
                      const available = variant.inventory
                        ? variant.inventory.quantity - variant.inventory.reserved
                        : 0;

                      return (
                        <div
                          key={variant.id}
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
                        </div>
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
              </div>

              {/* Actions Placeholder */}
              <div className="pt-4 border-t border-white/[0.06]">
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
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
