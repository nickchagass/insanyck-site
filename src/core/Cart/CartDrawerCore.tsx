import { useCart } from "@/store/useCart";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useMemo, useCallback } from "react";
import { CartDrawerSignature } from "@/signature/Cart/visuals";
import { Virtuoso } from "react-virtuoso";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CartDrawerCore({ open, onClose }: Props) {
  const { items, remove, update, checkout, isLoading } = useCart();
  const closeBtn = useRef<HTMLButtonElement>(null);

  // Scroll lock
  useLockBodyScroll(open);

  // Focus management
  useEffect(() => {
    if (open && closeBtn.current) closeBtn.current.focus();
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  // Cart subtotal
  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.preco * i.quantidade, 0),
    [items]
  );

  // Handlers
  const handleRemove = useCallback(async (id: string, cor: string, tamanho: string) => {
    try {
      await remove(id, cor, tamanho);
      toast.success("Item removido!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao remover item.");
    }
  }, [remove]);

  const handleUpdate = useCallback(
    async (id: string, cor: string, tamanho: string, quantidade: number) => {
      if (quantidade < 1) return;
      try {
        await update(id, cor, tamanho, quantidade);
      } catch (e: any) {
        toast.error(e.message || "Erro ao atualizar quantidade.");
      }
    },
    [update]
  );

  const handleCheckout = useCallback(async () => {
    try {
      await checkout();
      toast.success("Compra finalizada!");
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Erro ao finalizar compra.");
    }
  }, [checkout, onClose]);

  // Drawer Height for ultra responsiveness
  const drawerHeight = useMemo(() => (items.length === 0 ? "50vh" : "85vh"), [items.length]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[998] bg-black/70 backdrop-blur-lg"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              stiffness: 170,
              damping: 22,
              mass: 0.6,
            }}
            className="fixed top-0 right-0 h-full max-h-[98vh] w-full max-w-md z-[999] bg-neutral-950 border-l border-yellow-400/20 shadow-2xl flex flex-col rounded-l-3xl overflow-hidden"
            style={{ height: drawerHeight }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-yellow-400/20 bg-gradient-to-r from-black/90 to-yellow-900/10">
              <h2 id="cart-title" className="text-2xl font-bold text-yellow-400">
                Seu Carrinho
              </h2>
              <button
                ref={closeBtn}
                className="text-yellow-400 bg-black/30 p-2 rounded-full hover:bg-yellow-400/10 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                onClick={onClose}
                aria-label="Fechar carrinho"
              >
                ✕
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-neutral-400 py-14">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-lg">Seu carrinho está vazio</p>
                  <p className="text-sm mt-2">Adicione produtos para começar sua experiência de luxo!</p>
                </div>
              ) : (
                <Virtuoso
                  style={{ height: "100%" }}
                  data={items}
                  overscan={4}
                  itemContent={(idx, item) => (
                    <div
                      key={`${item.id}-${item.cor}-${item.tamanho}-${idx}`}
                      className="flex gap-4 items-center bg-gradient-to-r from-black/70 to-neutral-900/60 rounded-xl p-4 mb-3 border border-yellow-400/10 shadow"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.nome}
                          className="w-16 h-16 rounded-lg object-cover border border-yellow-400/10"
                          loading="lazy"
                          width={64}
                          height={64}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate">{item.nome}</div>
                        <div className="text-neutral-400 text-xs">
                          Cor: <span className="text-yellow-300">{item.cor}</span> | Tamanho: <span className="text-yellow-300">{item.tamanho}</span>
                        </div>
                        <div className="text-yellow-300 font-bold mt-1">
                          R$ {item.preco.toFixed(2)}
                          <span className="ml-2 text-xs text-white/60">x{item.quantidade}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-1 bg-black/70 rounded-lg p-1">
                          <button
                            className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-yellow-400 rounded"
                            onClick={() => handleUpdate(item.id, item.cor, item.tamanho, item.quantidade - 1)}
                            aria-label={`Diminuir ${item.nome}`}
                            disabled={item.quantidade <= 1}
                          >-</button>
                          <span className="w-8 h-8 flex items-center justify-center">{item.quantidade}</span>
                          <button
                            className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-yellow-400 rounded"
                            onClick={() => handleUpdate(item.id, item.cor, item.tamanho, item.quantidade + 1)}
                            aria-label={`Aumentar ${item.nome}`}
                          >+</button>
                        </div>
                        <button
                          className="text-white/60 hover:text-red-400 p-1"
                          onClick={() => handleRemove(item.id, item.cor, item.tamanho)}
                          aria-label={`Remover ${item.nome}`}
                        >Remover</button>
                      </div>
                    </div>
                  )}
                />
              )}
            </div>
            {/* Footer */}
            <div className="px-6 py-5 border-t border-yellow-400/20 bg-gradient-to-r from-black/80 to-yellow-900/10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg text-neutral-300">Subtotal:</span>
                <span className="text-xl text-white">R$ {total.toFixed(2)}</span>
              </div>
              <button
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black rounded-xl py-4 font-extrabold text-lg shadow-lg hover:brightness-105 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleCheckout}
                disabled={isLoading || items.length === 0}
                aria-label="Finalizar compra"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> Processando...
                  </span>
                ) : (
                  `Finalizar compra • R$ ${total.toFixed(2)}`
                )}
              </button>
            </div>
            <CartDrawerSignature />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
