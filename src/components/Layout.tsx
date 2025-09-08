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
      {/* INSANYCK STEP 4 · Lote 3 — Skip link para navegação A11y + neutralização de layout */}
      <a 
        href="#conteudo" 
        className="sr-only focus:not-sr-only focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 absolute left-2 top-2 z-50 px-3 py-2 rounded-2xl bg-black/60 backdrop-blur text-white"
      >
        Pular para conteúdo
      </a>
      <Navbar />
      <main
        id="conteudo"
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
