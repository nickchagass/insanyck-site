// src/hooks/useCheckout.ts
import { useCart } from "@/store/useCart";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

export function useCheckout() {
  const cart = useCart((s) => s.items);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);
      // Chamada para endpoint seguro que cria PaymentIntent
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, currency: "BRL" }),
      });
      const data = await res.json();
      if (!data.clientSecret) throw new Error("Falha no pagamento");

      // Stripe Payment Flow
      await stripe?.redirectToCheckout({ sessionId: data.sessionId });

      // Fallback: modo offline/localStorage caso Stripe falhe (simples exemplo)
    } catch (err) {
      alert("Erro ao processar pagamento, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleCheckout, isLoading };
}
