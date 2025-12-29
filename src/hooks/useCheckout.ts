// INSANYCK HOTFIX CART-03
// INSANYCK STEP G-04.2.1 — Guard console.error no frontend
// INSANYCK STEP F-MP — Feature flag para checkout híbrido
// src/hooks/useCheckout.ts
import { useCartStore } from "@/store/cart";
import { useState } from "react";
import { useRouter } from "next/router";

export function useCheckout() {
  // INSANYCK HOTFIX CART-03 — usar store oficial do Zustand
  const items = useCartStore((s) => s.items);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    // INSANYCK STEP F-MP — Se feature flag hybrid, redirecionar para /checkout
    const featureFlag = process.env.NEXT_PUBLIC_CHECKOUT_PROVIDER || 'stripe';

    if (featureFlag === 'hybrid') {
      router.push('/checkout');
      return;
    }

    // INSANYCK STEP F-MP — Comportamento original (Stripe direto) se feature flag = stripe
    setIsLoading(true);
    try {
      // INSANYCK HOTFIX CART-03 — transformar items para o formato da API
      const checkoutItems = items.map((item) => ({
        variantId: item.variantId,
        sku: item.sku,
        qty: item.qty,
      }));

      // INSANYCK HOTFIX CART-03 — chamar a API correta de checkout
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: checkoutItems,
          currency: "BRL",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        if (process.env.NODE_ENV === "development") {
          console.error("[INSANYCK][CHECKOUT] API error:", res.status, errorData);
        }
        throw new Error(errorData.error || "Checkout API error");
      }

      const data = await res.json();

      if (!data.url) {
        if (process.env.NODE_ENV === "development") {
          console.error("[INSANYCK][CHECKOUT] No session URL in response:", data);
        }
        throw new Error("No session URL");
      }

      // INSANYCK HOTFIX CART-03 — redirecionar para a sessão do Stripe
      window.location.href = data.url;
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("[INSANYCK][CHECKOUT] Error:", err);
      }
      alert("Erro ao processar pagamento, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleCheckout, isLoading };
}
