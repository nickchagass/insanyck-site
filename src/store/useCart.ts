// INSANYCK HOTFIX CART-01 — Unificar carrinho
// src/store/useCart.ts
// Adaptador fino para manter compatibilidade com componentes legados,
// redirecionando tudo para a store oficial em "@/store/cart".

import { useCartStore, type CartItem as NewCartItem } from "@/store/cart";

// INSANYCK HOTFIX CART-01 — Tipo legado para compatibilidade
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

// INSANYCK HOTFIX CART-01 — Transforma item novo → item legado
function toLegacyItem(item: NewCartItem): CartItem {
  return {
    id: item.id,
    nome: item.title,
    preco: item.priceCents / 100,
    cor: item.options?.color || item.options?.cor || "padrão",
    tamanho: item.options?.size || item.options?.tamanho || "único",
    quantidade: item.qty,
    image: item.image,
    currency: item.currency as "BRL" | "USD" | "EUR",
    variantId: item.variantId,
  };
}

// INSANYCK HOTFIX CART-01 — Tipo de store legado para modo seletor
type LegacyCartStore = {
  items: CartItem[];
  remove: (_id: string, _cor?: string, _tamanho?: string) => Promise<void>;
  update: (_id: string, _cor: string, _tamanho: string, _data: Partial<CartItem>) => Promise<void>;
  checkout: () => Promise<void>;
  isLoading: boolean;
};

/**
 * useCart — compat layer
 * 1) Modo seletor: useCart(s => s.items)
 * 2) Modo objeto:  const { items, remove, update, checkout, isLoading } = useCart()
 */
export function useCart(): {
  items: CartItem[];
  remove: (_id: string, _cor?: string, _tamanho?: string) => Promise<void>;
  update: (_id: string, _cor: string, _tamanho: string, _data: Partial<CartItem>) => Promise<void>;
  checkout: () => Promise<void>;
  isLoading: false;
};
export function useCart<T>(_selector: (_s: LegacyCartStore) => T): T;
export function useCart<T = any>(
  _selector?: (_s: LegacyCartStore) => T
): any {
  // INSANYCK HOTFIX CART-01 — SEMPRE chama hooks incondicionalmente (regra de hooks)
  const legacyItems = useCartStore((s) => s.items.map(toLegacyItem));
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);

  // INSANYCK HOTFIX CART-01 — monta store legado para seletor
  const legacyStore: LegacyCartStore = {
    items: legacyItems,
    remove: async (_id: string, _cor?: string, _tamanho?: string) => { removeItem(_id); },
    update: async (_id: string, _cor: string, _tamanho: string, _data: Partial<CartItem>) => {
      if (_data.quantidade !== undefined) {
        updateQty(_id, _data.quantidade);
      }
    },
    checkout: async () => {
      if (typeof window !== "undefined") {
        window.location.href = "/checkout";
      }
    },
    isLoading: false,
  };

  // INSANYCK HOTFIX CART-01 — modo seletor: aplica transformação
  if (typeof _selector === "function") {
    return _selector(legacyStore);
  }

  // INSANYCK HOTFIX CART-01 — modo objeto: retorna objeto compatível
  return {
    items: legacyItems,
    remove: legacyStore.remove,
    update: legacyStore.update,
    checkout: legacyStore.checkout,
    isLoading: false as const,
  };
}

// (Opcional para migrações futuras): reexport da store oficial
export { useCartStore };
