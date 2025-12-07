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

  // INSANYCK FASE G-04.2.1.A — Virtualization com tokens DS (sem cores literais)
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = cart[index];
    return (
      <div style={style} className="flex gap-3 items-center p-3 border-b border-ds-borderSubtle bg-ds-surface">
        <img src={item.image} alt={item.nome} className="w-14 h-14 object-cover rounded-xl border border-ds-borderSubtle" />
        <div className="flex-1">
          <div className="font-bold text-ds-accent">{item.nome}</div>
          <div className="text-xs text-ds-accentSoft">
            Cor: {item.cor} | Tam: {item.tamanho}
          </div>
          <div className="text-sm text-ds-accent">R$ {item.preco.toFixed(2)} × {item.quantidade}</div>
        </div>
        <button
          className="text-[color:var(--ds-danger)] text-lg px-2 hover:scale-110 transition-transform"
          aria-label="Remover do carrinho"
          onClick={() => remove(item.id, item.cor, item.tamanho)}
        >
          <X />
        </button>
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

          {/* INSANYCK FASE G-04.2.1.A — Drawer tokenizado */}
          <motion.aside
            ref={drawerRef}
            className="fixed top-0 right-0 h-full w-[420px] max-w-full bg-ds-elevated z-[150] shadow-ds-2 border-l border-ds-borderSubtle flex flex-col"
            initial={{ x: 480, opacity: 0 }}
            animate={{ x: 0, opacity: 1, transition: spring }}
            exit={{ x: 480, opacity: 0, transition: { ...spring, damping: 23 } }}
            aria-modal="true"
            aria-label="Carrinho"
            role="dialog"
            aria-labelledby="cart-title"
          >
            {/* INSANYCK FASE G-04.2.1.A — Header tokenizado */}
            <div className="flex justify-between items-center p-5 border-b border-ds-borderSubtle bg-ds-surface backdrop-blur-lg">
              <h2
                ref={titleRef}
                id="cart-title"
                className="font-extrabold text-xl text-ds-accent"
                tabIndex={-1}
              >
                Seu Carrinho
              </h2>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Fechar carrinho"
                className="text-ds-accent text-2xl hover:scale-110 transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ds-surface)] rounded-lg p-1"
              >
                <X />
              </button>
            </div>

            {/* INSANYCK FASE G-04.2.1.A — Lista com tokens DS */}
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-ds-accentSoft text-center py-16">
                  Seu carrinho está vazio.
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

            {/* INSANYCK FASE G-04.2.1.A — Footer tokenizado */}
            <div className="p-5 border-t border-ds-borderSubtle bg-ds-surface">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-ds-accent">Total</span>
                <span className="font-extrabold text-ds-accent text-2xl">R$ {total.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isLoading || cart.length === 0}
                className="w-full bg-[color:var(--ds-accent)] text-black rounded-xl px-6 py-4 font-bold text-xl transition hover:scale-105 active:scale-98 flex items-center justify-center gap-2 shadow-ds-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="animate-spin h-5 w-5 mr-2 border-2 border-black border-t-transparent rounded-full"></span>
                ) : (
                  <>
                    Checkout 1-click <span className="ml-1">🚀</span>
                  </>
                )}
              </button>
              <div className="mt-4 text-sm text-ds-accentSoft text-center">
                Pagamentos: <b className="text-ds-accent">Apple Pay</b>, <b className="text-ds-accent">Google Pay</b>, <b className="text-ds-accent">Pix</b>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
