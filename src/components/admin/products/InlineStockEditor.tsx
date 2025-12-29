// INSANYCK STEP H1-04 — Inline Stock Editor
// Stepper UI ([-][input][+]) with optimistic updates and debouncing
// Museum Edition styling (ghost glass, hairlines, quiet luxury)

"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

interface InlineStockEditorProps {
  /** Variant ID (stock is stored at variant level) */
  variantId: string;
  /** Current quantity */
  quantity: number;
  /** Reserved quantity (for display only) */
  reserved?: number;
  /** Low stock threshold (amber tint) */
  lowStockThreshold?: number;
  /** Callback when stock updates successfully */
  onUpdate?: (newQuantity: number) => void;
}

/**
 * INSANYCK H1-04 — Inline Stock Editor
 * Features:
 * - Stepper UI: [-] [input] [+]
 * - Debounced save (800ms)
 * - Optimistic UI with rollback on error
 * - Visual states: in stock / low stock / out of stock
 * - Accessibility: aria-labels, inputMode numeric
 */
export default function InlineStockEditor({
  variantId,
  quantity: initialQuantity,
  reserved = 0,
  lowStockThreshold = 5,
  onUpdate,
}: InlineStockEditorProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isSaving, setIsSaving] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSavedQuantity = useRef(initialQuantity);

  // Sync with prop changes (e.g., from SWR revalidation)
  useEffect(() => {
    setQuantity(initialQuantity);
    lastSavedQuantity.current = initialQuantity;
  }, [initialQuantity]);

  // INSANYCK H1-04 — Debounced save function
  const saveStock = async (newQuantity: number) => {
    if (newQuantity === lastSavedQuantity.current) return;

    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/products/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId,
          absolute: newQuantity,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update stock');
      }

      const data = await res.json();
      lastSavedQuantity.current = data.variant.quantity;
      onUpdate?.(data.variant.quantity);

    } catch (error) {
      console.error('Stock update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update stock');
      // Rollback to last saved value
      setQuantity(lastSavedQuantity.current);
    } finally {
      setIsSaving(false);
    }
  };

  // INSANYCK H1-04 — Debounce handler
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 0) return; // Never allow negative

    setQuantity(newQuantity);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer (800ms debounce)
    debounceTimer.current = setTimeout(() => {
      saveStock(newQuantity);
    }, 800);
  };

  const increment = () => handleQuantityChange(quantity + 1);
  const decrement = () => handleQuantityChange(Math.max(0, quantity - 1));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      handleQuantityChange(val);
    }
  };

  const handleInputBlur = () => {
    // Save immediately on blur (don't wait for debounce)
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    saveStock(quantity);
  };

  // INSANYCK H1-04 — Stock state styling
  const available = quantity - reserved;
  const isOutOfStock = available <= 0;
  const isLowStock = available > 0 && available <= lowStockThreshold;

  const stateStyles = isOutOfStock
    ? "border-rose-400/30 text-rose-400/90"
    : isLowStock
    ? "border-amber-400/20 text-amber-400/80"
    : "border-white/[0.08] text-white/80";

  return (
    <div className="flex items-center gap-2">
      {/* Decrement Button */}
      <button
        type="button"
        onClick={decrement}
        disabled={isSaving || quantity <= 0}
        aria-label="Decrease stock"
        className="
          w-8 h-8
          flex items-center justify-center
          rounded-md
          border border-white/[0.08]
          bg-white/[0.03]
          text-white/70
          hover:bg-white/[0.06]
          hover:border-white/[0.12]
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all duration-150
          active:scale-95
        "
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={quantity}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          disabled={isSaving}
          className={`
            w-16 h-8
            px-2
            text-center text-sm font-semibold
            rounded-md
            border
            bg-black/30
            backdrop-blur-sm
            transition-all duration-150
            focus:outline-none
            focus:ring-2 focus:ring-white/[0.15]
            disabled:opacity-50 disabled:cursor-wait
            ${stateStyles}
          `}
        />
        {isSaving && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg
              className="animate-spin h-4 w-4 text-white/60"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Increment Button */}
      <button
        type="button"
        onClick={increment}
        disabled={isSaving}
        aria-label="Increase stock"
        className="
          w-8 h-8
          flex items-center justify-center
          rounded-md
          border border-white/[0.08]
          bg-white/[0.03]
          text-white/70
          hover:bg-white/[0.06]
          hover:border-white/[0.12]
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all duration-150
          active:scale-95
        "
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Stock State Label (optional) */}
      {isOutOfStock && (
        <span className="text-xs text-rose-400/80 font-medium ml-1">
          Out
        </span>
      )}
      {isLowStock && (
        <span className="text-xs text-amber-400/80 font-medium ml-1">
          Low
        </span>
      )}
    </div>
  );
}
