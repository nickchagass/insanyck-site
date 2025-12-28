// INSANYCK FASE G-04.2 — Layout consolidado com tokens DS (white-label ready)
// src/components/Layout.tsx
import { useCartStore } from "@/store/cart";
import Navbar from "./Navbar";
import { CartDrawerCore } from "@/core/Cart/CartDrawerCore";
import { PropsWithChildren } from "react";
// INSANYCK FASE G-03.2 — Mobile Navigation Dock (app nativo)
import MobileNavDock from "./MobileNavDock";
// INSANYCK STEP G-EXEC-P1-B — Footer Premium (Museum Glass)
import Footer from "./Footer";

/**
 * Layout principal da aplicação, incluindo Navbar e CartDrawer.
 * Padrão FAANG com máxima acessibilidade e visual premium.
 *
 * INSANYCK FASE G-04.2:
 * - Background usa --ins-bg-base e --ins-bg-gradients (definidos em globals.css)
 * - Componentes internos usam tokens ds-* para surfaces/borders/text
 */
export default function Layout({ children }: PropsWithChildren) {
  // INSANYCK FASE G-01 — usar store canônica em vez de CartContext
  const isCartOpen = useCartStore((s) => s.isOpen);
  const toggle = useCartStore((s) => s.toggle);

  return (
    <div className="min-h-screen bg-[color:var(--ins-bg-base)] text-[color:var(--text-primary)]">
      {/* INSANYCK STEP 4 · Lote 3 — Skip link para navegação A11y + neutralização de layout */}
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 absolute left-2 top-2 z-50 px-3 py-2 rounded-ds-md bg-ds-elevated backdrop-blur text-ds-accent"
      >
        Pular para conteúdo
      </a>
      <Navbar />
      <main
        id="conteudo"
        role="main"
        tabIndex={-1} // Ajuda na acessibilidade, o usuário pode pular direto para o conteúdo
        className="pt-20 max-w-7xl mx-auto px-4"
      >
        {children}
      </main>
      <CartDrawerCore open={isCartOpen} onClose={() => toggle(false)} />
      {/* INSANYCK FASE G-03.2 — Mobile nav estilo app */}
      <MobileNavDock />
      {/* INSANYCK STEP G-EXEC-P1-B — Footer Premium (Museum Glass) */}
      <Footer />
    </div>
  );
}
