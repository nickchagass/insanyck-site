// src/components/CartDrawer.tsx
import React, { useRef } from "react";
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

  // Virtualization with react-window
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = cart[index];
    return (
      <div style={style} className="flex gap-3 items-center p-3 border-b border-neutral-800 bg-neutral-950">
        <img src={item.image} alt={item.nome} className="w-14 h-14 object-cover rounded-xl border" />
        <div className="flex-1">
          <div className="font-bold text-yellow-400">{item.nome}</div>
          <div className="text-xs text-neutral-400">
            Cor: {item.cor} | Tam: {item.tamanho}
          </div>
          <div className="text-sm text-white">R$ {item.preco.toFixed(2)} × {item.quantidade}</div>
        </div>
        <button
          className="text-red-500 text-lg px-2 hover:scale-110"
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
        <motion.aside
          className="fixed top-0 right-0 h-full w-[420px] max-w-full bg-black z-[150] shadow-2xl border-l border-yellow-500/30 flex flex-col"
          initial={{ x: 480, opacity: 0 }}
          animate={{ x: 0, opacity: 1, transition: spring }}
          exit={{ x: 480, opacity: 0, transition: { ...spring, damping: 23 } }}
          aria-modal="true"
          aria-label="Carrinho"
        >
          <div className="flex justify-between items-center p-5 border-b border-yellow-500/20 bg-neutral-950/80 backdrop-blur-lg">
            <h2 className="font-extrabold text-xl text-yellow-400">Seu Carrinho</h2>
            <button onClick={onClose} aria-label="Fechar" className="text-yellow-300 text-2xl"><X /></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-neutral-400 text-center py-16">
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
          <div className="p-5 border-t border-yellow-500/20 bg-neutral-950/80">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-white">Total</span>
              <span className="font-extrabold text-yellow-400 text-2xl">R$ {total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isLoading || cart.length === 0}
              className="w-full bg-yellow-400 text-black rounded-xl px-6 py-4 font-bold text-xl transition hover:scale-105 active:scale-98 flex items-center justify-center gap-2 shadow-md"
            >
              {isLoading ? (
                <span className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-yellow-400 rounded-full"></span>
              ) : (
                <>
                  Checkout 1-click <span className="ml-1">🚀</span>
                </>
              )}
            </button>
            <div className="mt-4 text-sm text-neutral-500 text-center">
              Pagamentos: <b>Apple Pay</b>, <b>Google Pay</b>, <b>Pix</b>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
