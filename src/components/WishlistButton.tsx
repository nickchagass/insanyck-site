// INSANYCK STEP 8
"use client";

import { useWishlist } from "@/store/wishlist";
import { track } from "@/lib/analytics";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import { useState } from "react";

type Props = {
  slug: string;
  title: string;
  priceCents: number;
  image?: string;
  className?: string;
};

export default function WishlistButton({ slug, title, priceCents, image, className }: Props) {
  const { t } = useTranslation(["wishlist"]);
  const { data: session } = useSession();
  const { has, add, removeBySlug, syncWithServer } = useWishlist();
  const [busy, setBusy] = useState(false);

  const onToggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (has(slug)) {
        removeBySlug(slug);
        track("remove_from_wishlist", { slug });
        if (session?.user?.id) {
          // tenta apagar no server
          try {
            const res = await fetch("/api/account/wishlist");
            const data = await res.json();
            const found = (data.items ?? []).find((i: any) => i.slug === slug);
            if (found) await fetch(`/api/account/wishlist/${found.id}`, { method: "DELETE" });
          } catch {}
        }
      } else {
        add({ slug, title, priceCents, image });
        track("add_to_wishlist", { slug, title });
        if (session?.user?.id) {
          try {
            await fetch("/api/account/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ slug, title, priceCents, image }),
            });
          } catch {}
        }
      }
      if (session?.user?.id) await syncWithServer(session.user.id as any);
    } finally {
      setBusy(false);
    }
  };

  const active = has(slug);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      title={active ? t("wishlist:remove", "Remover dos favoritos") : t("wishlist:add", "Adicionar aos favoritos")}
      className={`inline-flex items-center justify-center rounded-xl border border-white/15 text-white/80 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition px-3 py-2 ${className ?? ""}`}
      disabled={busy}
    >
      <span className="sr-only">{t("wishlist:toggle", "Favoritar")}</span>
      {/* INSANYCK STEP 4 · Lote 3 — Ícone decorativo com atributos A11y */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        className="opacity-90"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
  );
}
