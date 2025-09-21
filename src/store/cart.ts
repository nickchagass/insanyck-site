// INSANYCK STEP 10 — STORE UNIFICADO, ENTERPRISE-SAFE
// src/store/cart.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Currency = "BRL"; // expande p/ "USD" no STEP 12 (checkout internacional)

export interface CartItem {
  id: string;           // uid local do item no carrinho (não é productId)
  slug: string;
  title: string;
  image?: string;
  // Variantes (preferir variantId/sku)
  variantId?: string;
  sku?: string;
  // Opções legadas (ex.: { size: "M", color: "preto" })
  options?: Record<string, string>;
  priceCents: number;
  currency: Currency;
  qty: number;
}

// === Helpers ===

// Chave estável para “dedupe”: se houver variantId, usa; senão slug + options ordenadas.
function getItemKey(it: Pick<CartItem, "variantId" | "slug" | "options">): string {
  if (it.variantId) return `v:${it.variantId}`;
  const opt = it.options
    ? Object.entries(it.options)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join("&")
    : "";
  return `s:${it.slug}|${opt}`;
}

type CartState = {
  items: CartItem[];
  hydrated: boolean;     // evita mismatch SSR
  isOpen: boolean;       // drawer mini-cart (não persisto)
  addItem: (_item: Omit<CartItem, "id">) => void;
  // Aceita id (antigo) OU key composta (nova). Mantém compatibilidade.
  removeItem: (_idOrKey: string) => void;
  updateQty: (_idOrKey: string, _qty: number) => void;
  clear: () => void;
  toggle: (_open?: boolean) => void;
  count: () => number;
  totalCents: () => number;

  // Retrocompat (APIs antigas que usam id direto)
  inc: (_id: string) => void;
  dec: (_id: string) => void;
  subtotalCents: () => number;
};

const uid = () => Math.random().toString(36).slice(2);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      isOpen: false,

      // INSANYCK STEP 10 — De-dupe por variantId OU slug+options (ordenadas)
      addItem: (item) => {
        set((state) => {
          // default de currency, caso alguém esqueça de enviar
          const normalized: Omit<CartItem, "id"> = {
            ...item,
            currency: item.currency || "BRL",
          };

          const keyNew = getItemKey(normalized);
          const idx = state.items.findIndex((x) => getItemKey(x) === keyNew);

          if (idx >= 0) {
            const next = [...state.items];
            next[idx] = { ...next[idx], qty: next[idx].qty + normalized.qty };
            return { items: next };
          }

          return { items: [...state.items, { ...normalized, id: uid() }] };
        });

        get().toggle(true);
      },

      removeItem: (idOrKey) =>
        set((state) => {
          return {
            items: state.items.filter(
              (x) => x.id !== idOrKey && getItemKey(x) !== idOrKey
            ),
          };
        }),

      updateQty: (idOrKey, qty) =>
        set((state) => {
          const q = Math.max(1, qty);
          return {
            items: state.items.map((x) =>
              x.id === idOrKey || getItemKey(x) === idOrKey ? { ...x, qty: q } : x
            ),
          };
        }),

      // Retrocompat: alguns componentes antigos ainda chamam inc/dec por id
      inc: (id) =>
        set((state) => ({
          items: state.items.map((x) =>
            x.id === id ? { ...x, qty: x.qty + 1 } : x
          ),
        })),
      dec: (id) =>
        set((state) => ({
          items: state.items.map((x) =>
            x.id === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x
          ),
        })),
      clear: () => set({ items: [] }),

      toggle: (open) =>
        set((state) => ({
          isOpen: typeof open === "boolean" ? open : !state.isOpen,
        })),

      count: () => get().items.reduce((acc, x) => acc + x.qty, 0),

      totalCents: () =>
        get().items.reduce((acc, x) => acc + x.priceCents * x.qty, 0),

      // Alias retrocompat
      subtotalCents: () => get().totalCents(),
    }),
    {
      // Bump de versão porque a dedupe key mudou (evita colisões com carrinhos antigos)
      name: "insanyck:cart:v2",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : (undefined as any)
      ),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        // Migração leve: converte itens legados {variant?: string} -> options.variant
        if (state) {
          state.hydrated = true;
          if (Array.isArray(state.items)) {
            state.items = state.items.map((it: any) => {
              if (it && typeof it === "object") {
                // garantir currency
                if (!it.currency) it.currency = "BRL";
                // se vier de um shape antigo com `variant` (string), movemos para options
                if (it.variant && !it.options) {
                  it.options = { variant: it.variant };
                  delete it.variant;
                }
              }
              return it as CartItem;
            });
          }
        }
      },
    }
  )
);

// INSANYCK STEP 10 — Helpers de formatação e seletores
export const formatCurrency = (cents: number, currency = 'BRL') => {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency,
  });
};

// Selectors auxiliares (SSR-safe)
export const useCartHydrated = () => useCartStore((s) => s.hydrated);
export const useCartCount = () =>
  useCartStore((s) => (s.hydrated ? s.items.reduce((a, x) => a + x.qty, 0) : 0));
export const useCartSubtotal = () =>
  useCartStore((s) =>
    s.hydrated ? s.items.reduce((a, x) => a + x.priceCents * x.qty, 0) : 0
  );
export const useCartTotal = () => useCartSubtotal(); // Alias
