"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/router"; // INSANYCK STEP 4
import { Search, ShoppingBag } from "lucide-react";
import { useTranslation } from "next-i18next"; // INSANYCK STEP 4

export default function Navbar() {
  const router = useRouter(); // INSANYCK STEP 4
  const { t, i18n } = useTranslation(["nav"]); // INSANYCK STEP 4
  const currentLocale = i18n?.language || router.locale || "pt"; // INSANYCK STEP 4

  // INSANYCK STEP 4 — Switcher de idioma discreto (preserva rota atual)
  function switchLocale(nextLocale: "pt" | "en") {
    if (nextLocale === currentLocale) return;
    const asPath = router.asPath || "/";
    router.push(asPath, asPath, { locale: nextLocale });
  }

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
        {/* Logo - Agora menor e branco igual o central */}
        <Link
          href="/"
          aria-label={t("nav:aria.goHome", "Ir para a Home") /* INSANYCK STEP 4 */}
          className="flex items-center"
        >
          <span
            className="text-[20px] font-medium text-white/90 tracking-[0.15em] select-none"
            style={{ textTransform: "uppercase" }}
          >
            {/* NÃO alterar visual do wordmark */}
            INSANYCK
          </span>
        </Link>

        {/* Links centrais (textos extraídos para i18n) */}
        <nav className="hidden md:flex items-center gap-12 text-[16px] text-white/82">
          <Link href="/novidades" className="hover:text-white transition-colors">
            {t("nav:links.novidades", "Novidades") /* INSANYCK STEP 4 */}
          </Link>
          <Link href="/loja" className="hover:text-white transition-colors">
            {t("nav:links.loja", "Loja") /* INSANYCK STEP 4 */}
          </Link>
          <Link href="/colecao" className="hover:text-white transition-colors">
            {t("nav:links.colecao", "Coleção") /* INSANYCK STEP 4 */}
          </Link>
        </nav>

        {/* Ações (direita) */}
        <div className="flex items-center gap-6">
          {/* INSANYCK STEP 4 — Switcher mínimo, sem reflow perceptível */}
          <div
            className="hidden sm:flex items-center gap-2 text-white/70 text-[12px] leading-none select-none"
            aria-label={t("nav:aria.language", "Idioma")}
          >
            <button
              type="button"
              onClick={() => switchLocale("pt")}
              className={`px-2 py-1 rounded-[6px] border border-white/10 hover:border-white/20 hover:text-white transition-colors ${
                currentLocale.startsWith("pt") ? "text-white" : ""
              }`}
              aria-pressed={currentLocale.startsWith("pt")}
            >
              PT
            </button>
            <span className="opacity-40">/</span>
            <button
              type="button"
              onClick={() => switchLocale("en")}
              className={`px-2 py-1 rounded-[6px] border border-white/10 hover:border-white/20 hover:text-white transition-colors ${
                currentLocale.startsWith("en") ? "text-white" : ""
              }`}
              aria-pressed={currentLocale.startsWith("en")}
            >
              EN
            </button>
          </div>

          <Link
            href="/buscar"
            aria-label={t("nav:aria.search", "Pesquisar") /* INSANYCK STEP 4 */}
            className="text-white/80 hover:text-white transition-colors"
          >
            <Search size={22} strokeWidth={1.5} />
          </Link>

          {/* Sacola exatamente como na referência: ícone leve, traço fino, sem fill */}
          <Link
            href="/carrinho"
            aria-label={t("nav:aria.cart", "Carrinho") /* INSANYCK STEP 4 */}
            className="text-white/80 hover:text-white transition-colors"
          >
            <ShoppingBag size={22} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </header>
  );
}
