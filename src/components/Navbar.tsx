// INSANYCK STEP 9 — Navbar com favoritos + hideCart (FIX hooks)
// INSANYCK STEP G-04.2.1 — Navbar Imaculada (sem cores literais)
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Search, ShoppingBag, Heart } from "lucide-react";
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

  return (
    <header
      className="
        fixed inset-x-0 top-0 z-50
        backdrop-blur-[10px]
        bg-ds-surface
        border-b border-ds-borderSubtle
      "
      role="navigation"
      aria-label={t("nav:aria.mainNav", "Principal")}
    >
      <div className="mx-auto max-w-[1280px] px-6 py-4 flex items-center justify-between">
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

        {/* Links centrais */}
        <nav className="hidden md:flex items-center gap-12 text-[16px] text-ds-accentSoft">
          <Link
            href="/novidades"
            prefetch={true}
            className="hover:text-ds-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ds-surface)] rounded-lg px-2 py-1"
          >
            {t("nav:links.novidades", "Novidades")}
          </Link>
          <Link
            href="/loja"
            prefetch={true}
            className="hover:text-ds-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ds-surface)] rounded-lg px-2 py-1"
          >
            {t("nav:links.loja", "Loja")}
          </Link>
          <Link
            href="/colecao"
            prefetch={true}
            className="hover:text-ds-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ds-surface)] rounded-lg px-2 py-1"
          >
            {t("nav:links.colecao", "Coleção")}
          </Link>
        </nav>

        {/* Ações (direita) */}
        <div className="flex items-center gap-6">
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

          {/* Link para buscar (mantido) — INSANYCK FASE G-03.2: hit area confortável */}
          <Link
            href="/buscar"
            prefetch={true}
            aria-label={t("nav:aria.search", "Pesquisar")}
            className="flex items-center justify-center h-11 w-11 text-ds-accentSoft hover:text-ds-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ds-surface)] rounded-xl"
          >
            {/* INSANYCK STEP 4 · Lote 3 — Sr-only text para ícone */}
            <span className="sr-only">{t("nav:aria.search", "Pesquisar")}</span>
            <Search size={22} strokeWidth={1.5} aria-hidden="true" focusable="false" />
          </Link>

          {/* Favoritos (com contador) — oculta em checkout/pagamento — INSANYCK FASE G-03.2: hit area confortável */}
          {!hideCart && (
            <Link
              href="/favoritos"
              prefetch={true}
              aria-label="Favoritos"
              className="relative flex items-center justify-center h-11 w-11 text-ds-accentSoft hover:text-ds-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ds-surface)] rounded-xl"
            >
              {/* INSANYCK STEP 4 · Lote 3 — Sr-only text para ícone */}
              <span className="sr-only">Favoritos</span>
              <Heart size={22} strokeWidth={1.5} aria-hidden="true" focusable="false" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-ds-accent text-[color:var(--bg-0)] text-[10px] leading-4 font-semibold ring-1 ring-[color:var(--ds-border-subtle)] text-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}

          {/* Sacola (drawer) — oculta em checkout/pagamento — INSANYCK FASE G-03.2: hit area confortável */}
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
              {/* INSANYCK STEP 4 · Lote 3 — Sr-only text para ícone */}
              <span className="sr-only">{t("nav:aria.cart", "Carrinho")}</span>
              <ShoppingBag size={22} strokeWidth={1.5} aria-hidden="true" focusable="false" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-ds-accent text-[color:var(--bg-0)] text-[10px] leading-4 font-semibold ring-1 ring-[color:var(--ds-border-subtle)] text-center">
                  {count}
                </span>
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Drawer Mini-Cart (lazy) */}
      {!hideCart && <MiniCart />}
    </header>
  );
}

/* ======================= INSANYCK FASE G-04.2 — UserMenu com tokens DS ======================= */
function UserMenu() {
  const { data: session, status } = useSession();

  if (status !== "authenticated") {
    return (
      <Link
        href="/conta/login"
        prefetch={true}
        className="text-ds-accentSoft hover:text-ds-accent transition-all duration-150 px-2 py-1 rounded-lg border border-ds-borderSubtle hover:border-ds-borderStrong hover:bg-ds-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ds-surface)]"
      >
        Entrar
      </Link>
    );
  }

  const name = session?.user?.name ?? session?.user?.email ?? "Conta";

  return (
    <div className="relative group">
      <button className="text-ds-accentSoft hover:text-ds-accent transition-all duration-150 px-2 py-1 rounded-lg border border-ds-borderSubtle hover:border-ds-borderStrong hover:bg-ds-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ds-surface)]">
        {String(name).split(" ")[0]}
      </button>
      <div className="absolute right-0 mt-2 hidden group-hover:block rounded-2xl border border-ds-borderSubtle bg-ds-elevated backdrop-blur-md shadow-ds-2 p-2 w-[220px] z-[60]">
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
