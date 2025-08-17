// INSANYCK STEP 4 + STEP 6 + STEP 7.1 PATCH
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/router"; // INSANYCK STEP 4
import { Search, ShoppingBag } from "lucide-react";
import { useTranslation } from "next-i18next"; // INSANYCK STEP 4

// INSANYCK STEP 6 (imports novos)
import dynamic from "next/dynamic";
import { useCartCount, useCartStore } from "@/store/cart";

// ======================= INSANYCK STEP 8 (imports novos) =======================
import { useSession } from "next-auth/react"; // INSANYCK STEP 8
const SearchBox = dynamic(() => import("@/components/SearchBox"), { ssr: false }); // INSANYCK STEP 8

export default function Navbar() {
  const router = useRouter(); // INSANYCK STEP 4
  const { t, i18n } = useTranslation(["nav"]); // INSANYCK STEP 4
  const currentLocale = i18n?.language || (router as any).locale || "pt"; // INSANYCK STEP 4

  // INSANYCK STEP 6 — lazy-load do MiniCart; não afeta SSR nem LCP
  const MiniCart = dynamic(() => import("@/components/MiniCart"), { ssr: false });

  // INSANYCK STEP 4 — Switcher de idioma discreto (preserva rota atual)
  function switchLocale(nextLocale: "pt" | "en") {
    if (nextLocale === currentLocale) return;
    const asPath = (router as any).asPath || "/";
    (router as any).push(asPath, asPath, { locale: nextLocale });
  }

  // INSANYCK STEP 6 — estado do carrinho (badge + abrir drawer)
  const count = useCartCount();
  const toggleCart = useCartStore((s) => s.toggle);

  return (
    <header
      className="
        fixed inset-x-0 top-0 z-50
        backdrop-blur-[10px]
        bg-[rgba(10,10,10,.42)]
        border-b border-[rgba(255,255,255,.08)]
      "
      role="navigation"
      aria-label={t("nav:aria.mainNav", "Principal") /* INSANYCK STEP 4 */}
    >
      <div className="mx-auto max-w-[1280px] px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          aria-label={t("nav:aria.goHome", "Ir para a Home") /* INSANYCK STEP 4 */}
          className="flex items-center"
        >
          <span
            className="text-[20px] font-medium text-white/90 tracking-[0.15em] select-none"
            style={{ textTransform: "uppercase" }}
          >
            INSANYCK
          </span>
        </Link>

        {/* Links centrais */}
        <nav className="hidden md:flex items-center gap-12 text-[16px] text-white/82">
          <Link href="/novidades" className="hover:text-white transition-colors">
            {t("nav:links.novidades", "Novidades")}
          </Link>
          <Link href="/loja" className="hover:text-white transition-colors">
            {t("nav:links.loja", "Loja")}
          </Link>
          <Link href="/colecao" className="hover:text-white transition-colors">
            {t("nav:links.colecao", "Coleção")}
          </Link>
        </nav>

        {/* Ações (direita) */}
        <div className="flex items-center gap-6">
          {/* Switcher idioma */}
          <div
            className="hidden sm:flex items-center gap-2 text-white/70 text-[12px] leading-none select-none"
            aria-label={t("nav:aria.language", "Idioma")}
          >
            <button
              type="button"
              onClick={() => switchLocale("pt")}
              className={`px-2 py-1 rounded-[6px] border border-white/10 hover:border-white/20 hover:text-white transition-colors ${
                String(currentLocale).startsWith("pt") ? "text-white" : ""
              }`}
              aria-pressed={String(currentLocale).startsWith("pt")}
            >
              PT
            </button>
            <span className="opacity-40">/</span>
            <button
              type="button"
              onClick={() => switchLocale("en")}
              className={`px-2 py-1 rounded-[6px] border border-white/10 hover:border-white/20 hover:text-white transition-colors ${
                String(currentLocale).startsWith("en") ? "text-white" : ""
              }`}
              aria-pressed={String(currentLocale).startsWith("en")}
            >
              EN
            </button>
          </div>

          {/* =================== INSANYCK STEP 8 — adicionados =================== */}
          <SearchBox />      {/* INSANYCK STEP 8 */}
          <UserMenu />       {/* INSANYCK STEP 8 */}
          {/* ================================================================ */}

          <Link
            href="/buscar"
            aria-label={t("nav:aria.search", "Pesquisar") /* INSANYCK STEP 4 */}
            className="text-white/80 hover:text-white transition-colors"
          >
            <Search size={22} strokeWidth={1.5} />
          </Link>

          {/* Sacola */}
          <button
            type="button"
            onClick={() => toggleCart(true)}
            aria-label={t("nav:aria.cart", "Carrinho")}
            className="relative text-white/80 hover:text-white transition-colors"
          >
            <ShoppingBag size={22} strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-white text-black text-[10px] leading-4 font-semibold ring-1 ring-black/10 text-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mini-Cart (lazy) */}
      <MiniCart />
    </header>
  );
}

/* ======================= INSANYCK STEP 8 — UserMenu ======================= */
function UserMenu() {
  const { data: session, status } = useSession();

  if (status !== "authenticated") {
    return (
      <a
        href="/conta/login"
        className="text-white/80 hover:text-white transition-colors px-2 py-1 rounded-lg border border-white/10 hover:border-white/20"
      >
        Entrar
      </a>
    );
  }

  const name = session?.user?.name ?? session?.user?.email ?? "Conta";

  return (
    <div className="relative group">
      <button className="text-white/80 hover:text-white transition-colors px-2 py-1 rounded-lg border border-white/10 hover:border-white/20">
        {String(name).split(" ")[0]}
      </button>
      <div className="absolute right-0 mt-2 hidden group-hover:block rounded-2xl border border-white/10 bg-black/70 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-2 w-[220px] z-[60]">
        <a className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded-lg" href="/conta">
          Minha conta
        </a>
        <a className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded-lg" href="/conta/pedidos">
          Pedidos
        </a>
        <a className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded-lg" href="/favoritos">
          Favoritos
        </a>
        <form method="post" action="/api/auth/signout" className="mt-1">
          <button className="w-full text-left px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg">
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}
