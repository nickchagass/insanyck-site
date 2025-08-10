// src/core/Cart/logic.ts
import { useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  nome: string;
  preco: number;
  image: string;
  cor: string;
  tamanho: string;
}

interface CartState {
  cart: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  checkout: () => void;
  isLoading: boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      total: 0,
      isLoading: false,
      addItem: (item) =>
        set((state) => ({
          cart: [...state.cart, item],
          total: state.total + item.preco
        })),
      removeItem: (id) =>
        set((state) => {
          const cart = state.cart.filter((i) => i.id !== id);
          const total = cart.reduce((acc, i) => acc + i.preco, 0);
          return { cart, total };
        }),
      clear: () => set({ cart: [], total: 0 }),
      checkout: async () => {
        set({ isLoading: true });
        // TODO: Chamar lógica de checkout (Stripe/Pix/Apple Pay)
        // await api.post('/checkout', { cart: get().cart })
        setTimeout(() => set({ isLoading: false, cart: [], total: 0 }), 1200);
      }
    }),
    {
      name: "cart-storage", // IndexedDB/localStorage automático
      version: 1
    }
  )
);

// Custom hook para lógica de checkout (pode ser expandido)
export function useCheckout() {
  const { cart, total, addItem, removeItem, clear, checkout, isLoading } = useCartStore();
  return { cart, total, addItem, removeItem, clear, checkout, isLoading };
}

export function formatCurrency(amount: number) {
  return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
