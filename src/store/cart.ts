// INSANYCK STEP 6
// src/store/cart.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  id: string;            // uid interno
  slug: string;          // ex.: "oversized-classic"
  title: string;
  priceCents: number;    // preço em centavos (documentado)
  qty: number;
  image?: string;
  variant?: string;      // cor/tamanho (opcional)
};

type CartState = {
  items: CartItem[];
  hydrated: boolean;                                     // evita mismatch SSR
  isOpen: boolean;                                       // drawer mini-cart (não persisto)
  addItem: (it: Omit<CartItem, "id">) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  toggle: (open?: boolean) => void;
  count: () => number;
  subtotalCents: () => number;
};

const uid = () => Math.random().toString(36).slice(2);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      isOpen: false,

      // Regra de de-dupe: mesmo slug+variant acumula qty
      addItem: (it) => {
        set((state) => {
          const idx = state.items.findIndex(
            (x) => x.slug === it.slug && x.variant === it.variant
          );
          if (idx >= 0) {
            const next = [...state.items];
            next[idx] = { ...next[idx], qty: next[idx].qty + it.qty };
            return { items: next };
          }
          return { items: [...state.items, { ...it, id: uid() }] };
        });
        // abre o drawer quando adiciona (UX padrão e-commerce)
        get().toggle(true);
      },

      inc: (id) =>
        set((state) => ({
          items: state.items.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)),
        })),
      dec: (id) =>
        set((state) => ({
          items: state.items
            .map((x) => (x.id === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x)),
        })),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((x) => x.id !== id) })),
      clear: () => set({ items: [] }),

      toggle: (open) =>
        set((state) => ({ isOpen: typeof open === "boolean" ? open : !state.isOpen })),

      count: () => get().items.reduce((acc, x) => acc + x.qty, 0),

      subtotalCents: () =>
        get().items.reduce((acc, x) => acc + x.priceCents * x.qty, 0),
    }),
    {
      name: "insanyck:cart:v1",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : undefined as any
      ),
      // Não persistir propriedades voláteis:
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        // marca como hidratado para evitar “content mismatch” SSR
        state?.hydrated === false && (state.hydrated = true);
      },
    }
  )
);

// Selectors helpers (opcional)
export const useCartHydrated = () => useCartStore((s) => s.hydrated);
export const useCartCount = () =>
  useCartStore((s) => (s.hydrated ? s.items.reduce((a, x) => a + x.qty, 0) : 0));
