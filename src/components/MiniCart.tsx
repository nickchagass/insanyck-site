// INSANYCK FASE G-04.2 — Mini-Cart premium com tokens DS (white-label ready)
// src/components/MiniCart.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "next-i18next";
import { useCartStore, useCartHydrated } from "@/store/cart";
import { formatPrice } from "@/lib/price";
import Portal from "@/components/Portal";

export default function MiniCart() {
  const router = useRouter();
  const isOpen = useCartStore((s) => s.isOpen);
  const toggle = useCartStore((s) => s.toggle);
  const items = useCartStore((s) => s.items);
  const inc = useCartStore((s) => s.inc);
  const dec = useCartStore((s) => s.dec);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotalCents = useCartStore((s) => s.subtotalCents());
  const hydrated = useCartHydrated();
  const { i18n, t } = useTranslation(["bag", "cart"]); // padroniza "bag" como primário

  const locale = i18n.language?.startsWith("en") ? "en" : "pt";
  const refPanel = useRef<HTMLDivElement>(null);

  // A11y: foco inicial + ESC fecha
  useEffect(() => {
    if (!isOpen) return;
    const first = refPanel.current?.querySelector<HTMLElement>("[data-autofocus]");
    first?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && toggle(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, toggle]);

  // Trap de foco simples
  useEffect(() => {
    if (!isOpen) return;
    const root = refPanel.current!;
    const selectors = 'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])';
    const focusables = () =>
      Array.from(root.querySelectorAll<HTMLElement>(selectors)).filter(
        (el) => !el.hasAttribute("disabled")
      );
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const f = focusables();
      const first = f[0];
      const last = f[f.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    root.addEventListener("keydown", onKeyDown as any);
    return () => root.removeEventListener("keydown", onKeyDown as any);
  }, [isOpen]);

  // INSANYCK STEP P0-CART — Scroll lock: impede scroll do body quando drawer está aberto
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calcular largura da scrollbar para evitar layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  // INSANYCK STEP P0-CART — Fechar drawer quando navegar para outra página
  useEffect(() => {
    const handleRouteChange = () => {
      if (isOpen) toggle(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [isOpen, toggle, router.events]);

  // Não renderizar até hidratado (evita mismatch SSR)
  if (!hydrated) {
    return null;
  }

  // INSANYCK STEP G-05.4-B — Sacola "Cofre" (premium glassmorphism drawer)
  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* INSANYCK STEP G-EXEC-P2-D — Overlay backdrop (z-overlay = 400) */}
            {/* Overlay — STEP G-05.4-B: dark backdrop + high blur */}
            <motion.div
              key="overlay"
              className="minicart-overlay-cofre fixed inset-0 z-[var(--z-overlay)]"
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => toggle(false)}
            />

            {/* INSANYCK STEP G-EXEC-P2-D — Drawer panel (z-drawer = 200) */}
            {/* Drawer — STEP G-05.4-B: premium dark glass + titanium hairline */}
            <motion.div
              key="panel"
              ref={refPanel}
              role="dialog"
              aria-modal="true"
              aria-labelledby="minicart-title"
              className="minicart-panel-cofre fixed top-0 right-0 h-full w-[380px] max-w-[calc(100vw-48px)] z-[var(--z-drawer)]"
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: "tween", duration: 0.25 }}
            >
            {/* Cabeçalho — STEP G-05.4-B: cold spotlight + hairline separator */}
            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -top-6 h-16"
                style={{
                  background:
                    "radial-gradient(60% 100% at 50% 0%, rgba(210,220,235,0.12) 0%, rgba(210,220,235,0.04) 30%, rgba(210,220,235,0.0) 70%)",
                }}
              />
              <div className="flex items-center justify-between px-5 py-4 border-b minicart-hairline">
                <h2
                  id="minicart-title"
                  className="text-lg font-semibold"
                  style={{ color: "rgba(235, 242, 250, 0.92)" }}
                  tabIndex={-1}
                  data-autofocus
                >
                  {t("bag:title", "Sua sacola")}
                </h2>
                <button
                  onClick={() => toggle(false)}
                  aria-label={t("cart:close", "Fechar")}
                  className="rounded-md px-2 py-1 transition-colors hover:bg-white/5"
                  style={{ color: "rgba(255, 255, 255, 0.75)" }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Lista — STEP G-05.4-B: items with premium contrast */}
            <div className="h-[calc(100%-188px)] overflow-auto px-5 py-3 space-y-3">
              {items.length === 0 ? (
                // INSANYCK STEP P0-CART — Empty state com CTA para explorar loja
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <p className="mb-6" style={{ color: "rgba(255, 255, 255, 0.65)" }}>
                    {t("bag:empty", "Sua sacola está vazia.")}
                  </p>
                  <Link
                    href="/loja"
                    className="btn-jewel"
                    onClick={() => toggle(false)}
                  >
                    {t("bag:goShop", "Ir para a loja")}
                  </Link>
                </div>
              ) : (
                items.map((it) => (
                  <div
                    key={it.id}
                    className="flex gap-3 items-center rounded-xl p-3"
                    style={{
                      border: "1px solid rgba(255, 255, 255, 0.10)",
                      background: "rgba(255, 255, 255, 0.04)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.image || "/products/placeholder/front.webp"}
                      alt={it.title}
                      className="w-16 h-16 rounded-lg object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate" style={{ color: "rgba(255, 255, 255, 0.92)" }}>
                        {it.title}
                      </div>
                      {it.options?.variant ? (
                        <div className="text-xs mt-0.5" style={{ color: "rgba(255, 255, 255, 0.65)" }}>
                          {it.options.variant}
                        </div>
                      ) : null}
                      <div className="text-sm mt-1" style={{ color: "rgba(255, 255, 255, 0.75)" }}>
                        {formatPrice(it.priceCents, locale as any)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        aria-label={t("cart:qty", "Qtd") + " -"}
                        onClick={() => dec(it.id)}
                        className="w-7 h-7 rounded-md transition-colors"
                        style={{
                          border: "1px solid rgba(255, 255, 255, 0.10)",
                          color: "rgba(255, 255, 255, 0.75)",
                        }}
                      >
                        −
                      </button>
                      <span className="w-6 text-center" style={{ color: "rgba(255, 255, 255, 0.92)" }}>
                        {it.qty}
                      </span>
                      <button
                        aria-label={t("cart:qty", "Qtd") + " +"}
                        onClick={() => inc(it.id)}
                        className="w-7 h-7 rounded-md transition-colors"
                        style={{
                          border: "1px solid rgba(255, 255, 255, 0.10)",
                          color: "rgba(255, 255, 255, 0.75)",
                        }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      aria-label={t("cart:remove", "Remover")}
                      onClick={() => removeItem(it.id)}
                      className="ml-2 transition-colors"
                      style={{ color: "rgba(255, 255, 255, 0.65)" }}
                      title={t("cart:remove", "Remover")}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer — STEP G-05.4-B: hairline + jewel CTA */}
            <div
              className="absolute bottom-0 left-0 right-0 border-t minicart-hairline p-5"
              style={{
                background: "linear-gradient(180deg, rgba(20, 22, 26, 0.95) 0%, rgba(12, 14, 18, 0.98) 100%)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span style={{ color: "rgba(255, 255, 255, 0.65)" }}>{t("bag:subtotal", "Subtotal")}</span>
                <strong style={{ color: "rgba(235, 242, 250, 0.92)" }}>
                  {formatPrice(subtotalCents, locale as any)}
                </strong>
              </div>
              <div className="flex gap-3">
                {/* STEP G-05.4-B: Jewel button (checkout CTA) */}
                <Link
                  href="/checkout"
                  className="btn-jewel flex-1 text-center"
                  onClick={() => toggle(false)}
                >
                  {t("bag:checkoutCta", "Ir para checkout")}
                </Link>
                {/* STEP G-05.4-B: Ghost button (view bag) */}
                <Link
                  href="/sacola"
                  className="rounded-xl px-4 py-3 font-semibold transition-all"
                  style={{
                    border: "1px solid rgba(255, 255, 255, 0.10)",
                    background: "rgba(255, 255, 255, 0.04)",
                    color: "rgba(235, 242, 250, 0.82)",
                  }}
                  onClick={() => toggle(false)}
                >
                  {t("bag:viewBag", "Ver sacola")}
                </Link>
              </div>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  );
}
