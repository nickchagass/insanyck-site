// INSANYCK FASE G-04.2 — Mobile Navigation Dock (estilo App Nativo) com tokens DS
"use client";

import { useRouter } from "next/router";
import Link from "next/link";
import { Home, ShoppingBag, Store, User } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useEffect, useState } from "react";

/**
 * Barra de navegação fixa no bottom para mobile (estilo app nativo iOS/Android).
 * - Glassmorphism INSANYCK (luxury noir)
 * - Apenas visível em telas < lg
 * - Hit areas confortáveis (44x44px mínimo)
 * - Respeita prefers-reduced-motion
 *
 * INSANYCK FASE G-04.2:
 * - 100% token-based (bg-ds-surface, text-ds-accent, etc)
 */
export default function MobileNavDock() {
  const router = useRouter();
  const toggleCart = useCartStore((s) => s.toggle);
  const [mounted, setMounted] = useState(false);

  // SSR-safety: só mostra após hidratar
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // Detecta rota ativa
  const isActive = (path: string) => {
    if (path === "/") return router.pathname === "/";
    return router.pathname.startsWith(path);
  };

  // Classe base para itens da dock
  const itemClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-1 h-14 w-14 rounded-2xl transition-all duration-200 ${
      active
        ? "bg-ds-elevated text-ds-accent"
        : "text-ds-accentSoft hover:text-ds-accent hover:bg-ds-surface"
    }`;

  return (
    <nav
      role="navigation"
      aria-label="Navegação principal mobile"
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden pointer-events-none"
    >
      {/* Container com glassmorphism */}
      <div className="mx-4 mb-4 pointer-events-auto">
        <div
          className="
            flex items-center justify-around gap-2
            px-4 py-2
            bg-ds-surface backdrop-blur-xl
            border border-ds-borderSubtle
            rounded-3xl
            shadow-ds-2
          "
        >
          {/* Home */}
          <Link
            href="/"
            className={itemClass(isActive("/"))}
            aria-label="Home"
            aria-current={isActive("/") ? "page" : undefined}
          >
            <Home size={20} strokeWidth={1.8} aria-hidden="true" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          {/* Loja */}
          <Link
            href="/loja"
            className={itemClass(isActive("/loja"))}
            aria-label="Loja"
            aria-current={isActive("/loja") ? "page" : undefined}
          >
            <Store size={20} strokeWidth={1.8} aria-hidden="true" />
            <span className="text-[10px] font-medium">Loja</span>
          </Link>

          {/* Carrinho (abre drawer, não navega) */}
          <button
            type="button"
            onClick={() => toggleCart(true)}
            className={itemClass(false)}
            aria-label="Abrir carrinho"
          >
            <ShoppingBag size={20} strokeWidth={1.8} aria-hidden="true" />
            <span className="text-[10px] font-medium">Carrinho</span>
          </button>

          {/* Conta */}
          <Link
            href="/conta"
            className={itemClass(isActive("/conta"))}
            aria-label="Conta"
            aria-current={isActive("/conta") ? "page" : undefined}
          >
            <User size={20} strokeWidth={1.8} aria-hidden="true" />
            <span className="text-[10px] font-medium">Conta</span>
          </Link>
        </div>
      </div>

      {/* Espaçador para evitar que conteúdo fique atrás da dock */}
      <div className="h-20" aria-hidden="true" />
    </nav>
  );
}
