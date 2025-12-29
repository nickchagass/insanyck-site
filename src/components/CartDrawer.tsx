// INSANYCK FASE G-04.2.1.A — CartDrawer 100% token-based (white-label ready)
// src/components/CartDrawer.tsx
import React, { useRef, useEffect } from "react";
import { useCart } from "@/store/useCart";
import { motion, AnimatePresence } from "framer-motion";
import { useCheckout } from "@/hooks/useCheckout";
import { FixedSizeList as List } from "react-window";
import { X } from "lucide-react";

const spring = {
  type: "spring" as const,
  stiffness: 360,
  damping: 35
};

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
  const cart = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const total = cart.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
  const listRef = useRef<any>(null);
  const { handleCheckout, isLoading } = useCheckout();
  // INSANYCK STEP 4 · Lote 3 — Focus management refs
  const titleRef = useRef<HTMLHeadingElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  // INSANYCK STEP 4 · Lote 3 — Focus trap and initial focus
  useEffect(() => {
    if (open) {
      // Store previously focused element to restore later
      const previouslyFocused = document.activeElement as HTMLElement;

      // Focus the close button when drawer opens (better UX for quick closing)
      const focusTimer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 150);

      return () => {
        clearTimeout(focusTimer);
        // Restore focus when drawer closes
        if (previouslyFocused && document.contains(previouslyFocused)) {
          previouslyFocused?.focus?.();
        }
      };
    }
  }, [open]);

  // INSANYCK STEP 4 · Lote 3 — Keyboard event handler for escape and focus trap
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Simple focus trap - keep focus within drawer
      if (e.key === 'Tab') {
        const focusableElements = drawerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements && focusableElements.length > 0) {
          const firstFocusable = focusableElements[0] as HTMLElement;
          const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
              e.preventDefault();
              lastFocusable.focus();
            }
          } else {
            if (document.activeElement === lastFocusable) {
              e.preventDefault();
              firstFocusable.focus();
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // INSANYCK CHECKOUT-RESURRECTION — Museum Edition item cards
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = cart[index];
    return (
      <div style={style} className="p-3">
        <div className="flex gap-3 items-center p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.10)] transition-all group">
          <img
            src={item.image}
            alt={item.nome}
            className="w-16 h-16 object-cover rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white/90 truncate">{item.nome}</div>
            <div className="text-xs text-white/50 mt-0.5">
              Cor: {item.cor} | Tam: {item.tamanho}
            </div>
            <div className="text-sm text-white/80 font-medium mt-1 tabular-nums">
              R$ {item.preco.toFixed(2)} × {item.quantidade}
            </div>
          </div>
          <button
            className="text-red-400/70 hover:text-red-400 text-lg px-2 py-2 rounded-lg hover:bg-red-400/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
            aria-label="Remover do carrinho"
            onClick={() => remove(item.id, item.cor, item.tamanho)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* INSANYCK FASE G-04.2.1.A — Overlay tokenizado */}
          <motion.div
            className="fixed inset-0 bg-[color:var(--ds-surface-soft)] backdrop-blur-[2px] z-[149]"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* INSANYCK CHECKOUT-RESURRECTION — Museum Edition drawer */}
          <motion.aside
            ref={drawerRef}
            className="fixed top-0 right-0 h-full w-[420px] max-w-full bg-[rgba(10,10,11,0.95)] backdrop-blur-xl z-[150] shadow-2xl border-l border-[rgba(255,255,255,0.08)] flex flex-col"
            initial={{ x: 480, opacity: 0 }}
            animate={{ x: 0, opacity: 1, transition: spring }}
            exit={{ x: 480, opacity: 0, transition: { ...spring, damping: 23 } }}
            aria-modal="true"
            aria-label="Carrinho"
            role="dialog"
            aria-labelledby="cart-title"
          >
            {/* INSANYCK CHECKOUT-RESURRECTION — Museum Edition header */}
            <div className="flex justify-between items-center p-6 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.015)]">
              <div>
                <h2
                  ref={titleRef}
                  id="cart-title"
                  className="font-bold text-xl text-white/95 tracking-tight"
                  tabIndex={-1}
                >
                  Sua Sacola
                </h2>
                <p className="text-xs text-white/50 mt-0.5">
                  {cart.length} {cart.length === 1 ? 'item' : 'itens'}
                </p>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Fechar carrinho"
                className="text-white/60 hover:text-white/90 p-2 rounded-lg hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cold-ray-ring)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* INSANYCK CHECKOUT-RESURRECTION — Museum Edition list */}
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-white/50 text-sm">
                    Sua sacola está vazia.
                  </p>
                </div>
              ) : (
                <List
                  height={450}
                  itemCount={cart.length}
                  itemSize={95}
                  width={"100%"}
                  ref={listRef}
                  overscanCount={8}
                >
                  {Row}
                </List>
              )}
            </div>

            {/* INSANYCK CHECKOUT-RESURRECTION — Museum Edition footer */}
            <div className="p-6 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.015)]">
              {/* Subtotal with hairline */}
              <div className="flex justify-between items-baseline mb-6 pb-4 border-b border-[rgba(255,255,255,0.04)]">
                <span className="text-sm font-medium text-white/60 uppercase tracking-wider">Subtotal</span>
                <span className="text-2xl font-bold text-white/95 tabular-nums">
                  R$ {total.toFixed(2)}
                </span>
              </div>

              {/* Jewel button */}
              <button
                onClick={handleCheckout}
                disabled={isLoading || cart.length === 0}
                className="w-full bg-white/10 hover:bg-white/[0.13] border border-white/15 hover:border-white/25 text-white rounded-xl px-6 py-4 font-semibold transition-all duration-200 ease-out flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cold-ray-ring)] group"
              >
                {isLoading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span>
                ) : (
                  <>
                    <span>Finalizar Pedido</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

              {/* Payment methods */}
              <div className="mt-4 text-xs text-white/40 text-center">
                Pagamento seguro via <span className="text-white/60 font-medium">PIX, Cartão ou Internacional</span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
