// INSANYCK FASE G-04.2 — Mini-Cart premium com tokens DS (white-label ready)
// src/components/MiniCart.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "next-i18next";
import { useCartStore, useCartHydrated } from "@/store/cart";
import { formatPrice } from "@/lib/price";
import Portal from "@/components/Portal";

export default function MiniCart() {
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

  // Não renderizar até hidratado (evita mismatch SSR)
  if (!hydrated) {
    return null;
  }

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              className="fixed inset-0 bg-[color:var(--ds-surface-soft)] backdrop-blur-[2px] z-50"
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => toggle(false)}
            />

            {/* Drawer */}
            <motion.div
              key="panel"
              ref={refPanel}
              role="dialog"
              aria-modal="true"
              aria-labelledby="minicart-title"
              className="fixed top-0 right-0 h-full w-[380px] max-w-[calc(100vw-48px)] bg-ds-elevated border-l border-ds-borderSubtle shadow-ds-2 backdrop-blur-md z-50 text-ds-accent"
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: "tween", duration: 0.25 }}
            >
            {/* Cabeçalho + halo sutil */}
            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -top-6 h-16"
                style={{
                  background:
                    "radial-gradient(60% 100% at 50% 0%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.0) 70%)",
                }}
              />
              <div className="flex items-center justify-between px-5 py-4 border-b border-ds-borderSubtle">
                <h2
                  id="minicart-title"
                  className="text-ds-accent text-lg font-semibold"
                  tabIndex={-1}
                  data-autofocus
                >
                  {t("bag:title", "Sua sacola")}
                </h2>
                <button
                  onClick={() => toggle(false)}
                  aria-label={t("cart:close", "Fechar")}
                  className="rounded-md px-2 py-1 hover:bg-ds-surface"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Lista */}
            <div className="h-[calc(100%-188px)] overflow-auto px-5 py-3 space-y-3">
              {items.length === 0 ? (
                <p className="text-ds-accentSoft py-10">{t("bag:empty", "Sua sacola está vazia.")}</p>
              ) : (
                items.map((it) => (
                  <div
                    key={it.id}
                    className="flex gap-3 items-center border border-ds-borderSubtle rounded-xl p-3 bg-ds-surface"
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
                      <div className="text-ds-accent font-medium truncate">{it.title}</div>
                      {it.options?.variant ? (
                        <div className="text-ds-accentSoft text-xs mt-0.5">{it.options.variant}</div>
                      ) : null}
                      <div className="text-ds-accentSoft text-sm mt-1">
                        {formatPrice(it.priceCents, locale as any)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        aria-label={t("cart:qty", "Qtd") + " -"}
                        onClick={() => dec(it.id)}
                        className="w-7 h-7 rounded-md border border-ds-borderSubtle hover:bg-ds-surface"
                      >
                        −
                      </button>
                      <span className="w-6 text-center">{it.qty}</span>
                      <button
                        aria-label={t("cart:qty", "Qtd") + " +"}
                        onClick={() => inc(it.id)}
                        className="w-7 h-7 rounded-md border border-ds-borderSubtle hover:bg-ds-surface"
                      >
                        +
                      </button>
                    </div>
                    <button
                      aria-label={t("cart:remove", "Remover")}
                      onClick={() => removeItem(it.id)}
                      className="ml-2 text-ds-accentSoft hover:text-ds-accent"
                      title={t("cart:remove", "Remover")}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-ds-borderSubtle p-5 bg-ds-surface">
              <div className="flex items-center justify-between text-ds-accentSoft">
                <span>{t("bag:subtotal", "Subtotal")}</span>
                <strong className="text-ds-accent">{formatPrice(subtotalCents, locale as any)}</strong>
              </div>
              <div className="mt-4 flex gap-3">
                {/* CTA — fecha o drawer usando o MESMO store */}
                <Link
                  href="/checkout"
                  className="flex-1 text-center rounded-xl px-4 py-3 font-semibold border border-ds-borderSubtle text-ds-accent hover:bg-ds-elevated"
                  onClick={() => toggle(false)}
                >
                  {t("bag:checkoutCta", "Ir para checkout")}
                </Link>
                <Link
                  href="/sacola"
                  className="rounded-xl px-4 py-3 font-semibold bg-ds-accent text-black hover:brightness-95"
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
