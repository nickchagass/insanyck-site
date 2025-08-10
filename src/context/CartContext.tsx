import {
    createContext,
    useContext,
    useState,
    useMemo,
    useCallback,
    PropsWithChildren,
  } from "react";
  
  /**
   * Contexto global para visibilidade do Drawer do Carrinho.
   * @example
   * <CartProvider>
   *   <App />
   * </CartProvider>
   * const { isCartOpen, openCart } = useCartDrawer();
   * @throws {Error} Se usado fora de CartProvider.
   */
  type CartContextType = {
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
  };
  
  const CartContext = createContext<CartContextType | undefined>(undefined);
  
  // Garantir contexto só client-side para SSR/Next.js
  const isClient = typeof window !== "undefined";
  
  export const CartProvider = ({ children }: PropsWithChildren) => {
    const [isCartOpen, setIsCartOpen] = useState(false);
  
    // useCallback para estabilidade de referência (evita renders em filhos)
    const openCart = useCallback(() => setIsCartOpen(true), []);
    const closeCart = useCallback(() => setIsCartOpen(false), []);
  
    const value = useMemo(
      () => ({
        isCartOpen,
        openCart,
        closeCart,
      }),
      [isCartOpen, openCart, closeCart]
    );
  
    // Durante SSR, apenas renderize filhos (não inicie contexto)
    if (!isClient) {
      // SSR fallback: previne hydrate mismatch
      return <>{children}</>;
    }
  
    return (
      <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
  };
  
  /**
   * Hook global para acesso ao estado do Drawer do Carrinho.
   * @throws {Error} Se usado fora de CartProvider.
   */
  export const useCartDrawer = () => {
    const context = useContext(CartContext);
    if (!context)
      throw new Error("useCartDrawer must be used within CartProvider");
    return context;
  };
  