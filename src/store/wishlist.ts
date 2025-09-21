// INSANYCK STEP 8
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishlistItem = {
  id: string;       // uid local
  slug: string;
  title: string;
  priceCents: number;
  image?: string;
};

type WishlistState = {
  hydrated: boolean;
  items: WishlistItem[];
  has: (_slug: string) => boolean;
  add: (_item: Omit<WishlistItem, "id">) => void;
  removeBySlug: (_slug: string) => void;
  clear: () => void;
  syncWithServer: (_sessionUserId?: string) => Promise<void>;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      items: [],
      has: (slug) => get().items.some((i) => i.slug === slug),
      add: (item) => {
        set((s) => {
          if (s.items.some((x) => x.slug === item.slug)) return s;
          const id = crypto?.randomUUID?.() ?? String(Date.now());
          return { items: [{ id, ...item }, ...s.items] };
        });
      },
      removeBySlug: (slug) => set((s) => ({ items: s.items.filter((i) => i.slug !== slug) })),
      clear: () => set({ items: [] }),
      syncWithServer: async (sessionUserId) => {
        if (!sessionUserId || typeof window === "undefined") return;
        try {
          // Puxa do servidor e faz união simples (server vence)
          const res = await fetch("/api/account/wishlist", { method: "GET" });
          if (!res.ok) return;
          const data = await res.json();
          const serverSlugs = new Set<string>((data.items ?? []).map((i: any) => i.slug));
          // Envia ao server os que só existem localmente
          for (const it of get().items) {
            if (!serverSlugs.has(it.slug)) {
              await fetch("/api/account/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  slug: it.slug,
                  title: it.title,
                  priceCents: it.priceCents,
                  image: it.image,
                }),
              });
            }
          }
          // Atualiza store com o servidor
          const merged = (data.items ?? []).map((x: any) => ({
            id: x.id,
            slug: x.slug,
            title: x.title,
            priceCents: x.priceCents,
            image: x.image ?? undefined,
          }));
          set({ items: merged });
        } catch {
          // silencioso
        }
      },
    }),
    {
      name: "insanyck:wishlist:v1",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
      partialize: (s) => ({ items: s.items }),
    }
  )
);
