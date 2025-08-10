// src/components/Layout.tsx
import { useCartDrawer } from "@/context/CartContext";
import Navbar from "./Navbar";
import { CartDrawerCore } from "@/core/Cart/CartDrawerCore";
import { PropsWithChildren } from "react";

/**
 * Layout principal da aplicação, incluindo Navbar e CartDrawer.
 * Padrão FAANG com máxima acessibilidade e visual premium.
 */
export default function Layout({ children }: PropsWithChildren) {
  const { isCartOpen, closeCart } = useCartDrawer();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-yellow-50 text-white">
      <Navbar />
      <main
        id="main-content"
        role="main"
        tabIndex={-1} // Ajuda na acessibilidade, o usuário pode pular direto para o conteúdo
        className="pt-20 pb-10 max-w-7xl mx-auto px-4"
      >
        {children}
      </main>
      <CartDrawerCore open={isCartOpen} onClose={closeCart} />
    </div>
  );
}
