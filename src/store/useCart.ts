// src/store/useCart.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { set as idbSet, get as idbGet, del as idbDel } from "idb-keyval";

// -- Cart Item Tipo
export type CartItem = {
  id: string;
  nome: string;
  preco: number;
  cor: string;
  tamanho: string;
  quantidade: number;
  image?: string;
  currency?: "BRL" | "USD" | "EUR";
  variantId?: string;
};

type CartStore = {
  items: CartItem[];
  version: number;
  currency: "BRL" | "USD" | "EUR";
  isLoading: boolean;
  add: (_item: CartItem) => void;
  remove: (_id: string, _cor: string, _tamanho: string) => void;
  update: (_id: string, _cor: string, _tamanho: string, _data: Partial<CartItem>) => void;
  clear: () => void;
  sync: (_userId?: string) => Promise<void>;
  restore: (_userId?: string) => Promise<void>;
  setCurrency: (_currency: "BRL" | "USD" | "EUR") => void;
  checkout: () => Promise<void>;
};

const CART_VERSION = 2;

// Função para gerar chave única (composta)
function cartKey(item: Pick<CartItem, "id" | "cor" | "tamanho">) {
  return `${item.id}-${item.cor}-${item.tamanho}`;
}

// Função para persistir após qualquer alteração
async function autoSync(items: CartItem[], userId?: string) {
  await idbSet(`cart-${userId || "anon"}-v${CART_VERSION}`, items);
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      version: CART_VERSION,
      currency: "BRL",
      isLoading: false,

      add: (item) => set((state) => {
        // Atualiza item se já existir, soma quantidade
        const idx = state.items.findIndex(
          i => cartKey(i) === cartKey(item)
        );
        let items;
        if (idx > -1) {
          items = [...state.items];
          items[idx].quantidade += item.quantidade;
        } else {
          items = [...state.items, item];
        }
        autoSync(items);
        return { items };
      }),

      remove: (id, cor, tamanho) => set((state) => {
        const items = state.items.filter(
          i => !(i.id === id && i.cor === cor && i.tamanho === tamanho)
        );
        autoSync(items);
        return { items };
      }),

      update: (id, cor, tamanho, data) => set((state) => {
        const items = state.items.map(i =>
          i.id === id && i.cor === cor && i.tamanho === tamanho
            ? { ...i, ...data }
            : i
        );
        autoSync(items);
        return { items };
      }),

      clear: () => {
        autoSync([]);
        set({ items: [] });
      },

      setCurrency: (currency) => set({ currency }),

      sync: async (userId) => {
        await idbSet(`cart-${userId || "anon"}-v${CART_VERSION}`, get().items);
      },

      restore: async (userId) => {
        const saved = await idbGet<CartItem[]>(`cart-${userId || "anon"}-v${CART_VERSION}`);
        if (saved) set({ items: saved });
      },

      checkout: async () => {
        set({ isLoading: true });
        try {
          // Checkout implementation placeholder
          await new Promise(resolve => setTimeout(resolve, 1000));
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "insanyck-cart-v2",
      storage: {
        getItem: async (name: string) => {
          try { return (await idbGet(name)) || null; }
          catch { return null; }
        },
        setItem: async (name: string, value: any) => { await idbSet(name, value); },
        removeItem: async (name: string) => { await idbDel(name); }
      }
    }
  )
);
