// INSANYCK STEP 9 — Navbar com favoritos + hideCart (FIX hooks)
// INSANYCK STEP G-04.2.1 — Navbar Imaculada (sem cores literais)
// INSANYCK HOTFIX G-05.1.4 — Touch comfort (44px hit areas) + Keyboard-safe UserMenu
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ShoppingBag, Heart, User } from "lucide-react";
import { useTranslation } from "next-i18next";
// INSANYCK FASE G-03.1 — Micro-animação do carrinho
import { motion } from "framer-motion";

import dynamic from "next/dynamic";
import { useCartCount, useCartStore } from "@/store/cart";

// Mantidos (SearchBox/MiniCart)
const SearchBox = dynamic(() => import("@/components/SearchBox"), { ssr: false });
const MiniCart = dynamic(() => import("@/components/MiniCart"), { ssr: false });

// Wishlist (seu store real)
import { useWishlist } from "@/store/wishlist";

// NextAuth (UserMenu usa)
import { useSession } from "next-auth/react";

export default function Navbar() {
  const router = useRouter();
  const { t, i18n } = useTranslation(["nav"]);
  const currentLocale = i18n?.language || (router as any).locale || "pt";

  // esconder sacola/favoritos em rotas sensíveis
  const { pathname } = useRouter();
  const hideCart =
    pathname.startsWith("/checkout") || pathname.startsWith("/conta/pagamento");

  // Idioma
  function switchLocale(nextLocale: "pt" | "en") {
    if (nextLocale === currentLocale) return;
    const asPath = (router as any).asPath || "/";
    (router as any).push(asPath, asPath, { locale: nextLocale });
  }

  // Carrinho
  const count = useCartCount();
  const toggleCart = useCartStore((s) => s.toggle);

  // INSANYCK FASE G-03.1 — Micro-animação no ícone do carrinho
  const [animateCart, setAnimateCart] = useState(false);
  const [prevCount, setPrevCount] = useState(count);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Detecta preferência de movimento reduzido (a11y)
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  useEffect(() => {
    // Detecta quando o carrinho aumenta (novo item adicionado)
    if (count > prevCount && !prefersReducedMotion) {
      setAnimateCart(true);
      // Reset após a animação
      const timer = setTimeout(() => setAnimateCart(false), 400);
      return () => clearTimeout(timer);
    }
    setPrevCount(count);
  }, [count, prevCount, prefersReducedMotion]);

  // ---------- FIX CRÍTICO DE HOOKS ----------
  // Chame o hook SEMPRE (nunca condicional)
  const wishlistLen = useWishlist((s) => s.items.length);
  // Hidratação: só exibimos o número depois de montar
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const wishlistCount = mounted ? wishlistLen : 0;
  // -----------------------------------------

  // INSANYCK STEP G-05.1 — Floating Island Pill Navbar
  // INSANYCK HOTFIX G-05.1.2 — Mobile 360px fit: paddings responsivos
  return (
    <header
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-3 sm:px-6"
      role="navigation"
      aria-label={t("nav:aria.mainNav", "Principal")}
    >
      <nav className="
        max-w-[1180px] w-full
        backdrop-blur-[16px]
        bg-[color:var(--ds-surface)]
        border border-[color:var(--ds-border-subtle)]
        rounded-[20px]
        shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_8px_30px_rgba(0,0,0,0.4)]
        px-3 sm:px-6 py-3
        flex items-center justify-between
      ">
        {/* Logo */}
        <Link
          href="/"
          aria-label={t("nav:aria.goHome", "Ir para a Home")}
          className="flex items-center"
        >
          <span
            className="text-[20px] font-medium text-ds-accent tracking-[0.15em] select-none"
            style={{ textTransform: "uppercase" }}
          >
            INSANYCK
          </span>
        </Link>

        {/* INSANYCK STEP G-05.1 — Links centrais com underline hairline sutil no hover */}
        <div className="hidden md:flex items-center gap-10 text-[15px] text-[color:var(--ds-accent-soft)]">
          <Link
            href="/novidades"
            prefetch={true}
            className="relative hover:text-[color:var(--ds-accent)] hover:opacity-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ds-surface)] rounded-md px-2 py-1.5
              after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-[color:var(--ds-border-subtle)] after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-150"
          >
            {t("nav:links.novidades", "Novidades")}
          </Link>
          <Link
            href="/loja"
            prefetch={true}
            className="relative hover:text-[color:var(--ds-accent)] hover:opacity-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ds-surface)] rounded-md px-2 py-1.5
              after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-[color:var(--ds-border-subtle)] after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-150"
          >
            {t("nav:links.loja", "Loja")}
          </Link>
          <Link
            href="/colecao"
            prefetch={true}
            className="relative hover:text-[color:var(--ds-accent)] hover:opacity-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ds-surface)] rounded-md px-2 py-1.5
              after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-[color:var(--ds-border-subtle)] after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-150"
          >
            {t("nav:links.colecao", "Coleção")}
          </Link>
        </div>

        {/* Ações (direita) */}
        {/* INSANYCK HOTFIX G-05.1.2 — Gap responsivo: gap-2 mobile, gap-4 sm, gap-6 md+ */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          {/* Switcher idioma */}
          <div
            className="hidden sm:flex items-center gap-2 text-ds-accentSoft text-[12px] leading-none select-none"
            aria-label={t("nav:aria.language", "Idioma")}
          >
            <button
              type="button"
              onClick={() => switchLocale("pt")}
              className={`px-2 py-1 rounded-[6px] border border-ds-borderSubtle hover:border-ds-borderStrong hover:text-ds-accent hover:bg-ds-surface transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-1 ${
                String(currentLocale).startsWith("pt") ? "text-ds-accent border-ds-borderStrong bg-ds-surface" : ""
              }`}
              aria-pressed={String(currentLocale).startsWith("pt")}
            >
              PT
            </button>
            <span className="opacity-40">/</span>
            <button
              type="button"
              onClick={() => switchLocale("en")}
              className={`px-2 py-1 rounded-[6px] border border-ds-borderSubtle hover:border-ds-borderStrong hover:text-ds-accent hover:bg-ds-surface transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-1 ${
                String(currentLocale).startsWith("en") ? "text-ds-accent border-ds-borderStrong bg-ds-surface" : ""
              }`}
              aria-pressed={String(currentLocale).startsWith("en")}
            >
              EN
            </button>
          </div>

          {/* Mantidos do seu projeto */}
          <SearchBox />
          <UserMenu />

          {/* INSANYCK HOTFIX G-05.1.2 — Removido link /buscar redundante (SearchBox já fornece busca) */}

          {/* Favoritos (com contador) — oculta em checkout/pagamento */}
          {/* INSANYCK HOTFIX G-05.1.4 — Hit area 44px (Apple comfort) */}
          {!hideCart && (
            <Link
              href="/favoritos"
              prefetch={true}
              aria-label="Favoritos"
              className="relative flex items-center justify-center h-11 w-11 text-ds-accentSoft hover:text-ds-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ds-surface)] rounded-xl"
            >
              <span className="sr-only">Favoritos</span>
              <Heart size={20} strokeWidth={1.5} aria-hidden="true" focusable="false" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-ds-accent text-[color:var(--bg-0)] text-[10px] leading-4 font-semibold ring-1 ring-[color:var(--ds-border-subtle)] text-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}

          {/* Sacola (drawer) — oculta em checkout/pagamento */}
          {!hideCart && (
            <motion.button
              type="button"
              onClick={() => toggleCart(true)}
              aria-label={t("nav:aria.cart", "Carrinho")}
              className="relative flex items-center justify-center h-11 w-11 text-ds-accentSoft hover:text-ds-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ds-surface)] rounded-xl"
              // INSANYCK FASE G-03.1 — Micro-animação ao adicionar item
              animate={animateCart ? {
                scale: [1, 1.15, 1],
                rotate: [0, -5, 5, 0],
              } : {}}
              transition={{
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1], // Easing premium/bouncy
              }}
            >
              <span className="sr-only">{t("nav:aria.cart", "Carrinho")}</span>
              <ShoppingBag size={20} strokeWidth={1.5} aria-hidden="true" focusable="false" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-ds-accent text-[color:var(--bg-0)] text-[10px] leading-4 font-semibold ring-1 ring-[color:var(--ds-border-subtle)] text-center">
                  {count}
                </span>
              )}
            </motion.button>
          )}
        </div>
      </nav>

      {/* Drawer Mini-Cart (lazy) */}
      {!hideCart && <MiniCart />}
    </header>
  );
}

/* ======================= INSANYCK FASE G-04.2 — UserMenu com tokens DS ======================= */
/* INSANYCK HOTFIX G-05.1.2 — UserMenu responsivo: ícone mobile, ícone+texto sm+ */
/* INSANYCK HOTFIX G-05.1.4 — Keyboard-safe dropdown (focus-within) */
function UserMenu() {
  const { data: session, status } = useSession();

  if (status !== "authenticated") {
    return (
      <Link
        href="/conta/login"
        prefetch={true}
        className="flex items-center gap-1.5 text-ds-accentSoft hover:text-ds-accent transition-all duration-150 px-2 py-1 rounded-lg border border-ds-borderSubtle hover:border-ds-borderStrong hover:bg-ds-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ds-surface)]"
        aria-label="Entrar"
      >
        <User size={18} strokeWidth={1.5} aria-hidden="true" />
        <span className="hidden sm:inline">Entrar</span>
      </Link>
    );
  }

  const name = session?.user?.name ?? session?.user?.email ?? "Conta";

  return (
    <div className="relative group">
      <button className="flex items-center gap-1.5 text-ds-accentSoft hover:text-ds-accent transition-all duration-150 px-2 py-1 rounded-lg border border-ds-borderSubtle hover:border-ds-borderStrong hover:bg-ds-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ds-surface)]">
        <User size={18} strokeWidth={1.5} aria-hidden="true" />
        <span className="hidden sm:inline">{String(name).split(" ")[0]}</span>
      </button>
      <div className="absolute right-0 mt-2 hidden group-hover:block group-focus-within:block rounded-2xl border border-ds-borderSubtle bg-ds-elevated backdrop-blur-md shadow-ds-2 p-2 w-[220px] z-[60]">
        <Link className="block px-3 py-2 text-ds-accentSoft hover:text-ds-accent hover:bg-ds-surface rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-1" href="/conta" prefetch={true}>
          Minha conta
        </Link>
        <Link className="block px-3 py-2 text-ds-accentSoft hover:text-ds-accent hover:bg-ds-surface rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-1" href="/conta/pedidos" prefetch={true}>
          Pedidos
        </Link>
        <Link className="block px-3 py-2 text-ds-accentSoft hover:text-ds-accent hover:bg-ds-surface rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-1" href="/favoritos" prefetch={true}>
          Favoritos
        </Link>
        <form method="post" action="/api/auth/signout" className="mt-1">
          <button className="w-full text-left px-3 py-2 text-ds-accentSoft hover:text-ds-accent hover:bg-ds-surface rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-1">
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}
