import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getFingerprint, analyzeBehavior } from "@/lib/fraud";
// import Product3DView from "@/components/Product3DView";
import { Loader } from "@/components/Loader";
// import { validateEmail } from "@/lib/validate";
import { useRouter } from "next/router";


// ENV
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

const steps = ["review", "payment", "confirmation"] as const;
type Step = typeof steps[number];

interface CheckoutSPAProps {
  cart: any[];
  total: number;
  customerEmail: string;
  onComplete: () => void;
}

export default function CheckoutSPA({ cart, total, customerEmail, onComplete }: CheckoutSPAProps) {
  const ns = ["checkout", "common"] as const;
  const { t } = useTranslation(ns);
  const [step, setStep] = useState<Step>("review");
  const [loading, setLoading] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [_confirmed, setConfirmed] = useState(false);
  const [fraudScore, setFraudScore] = useState<number>(0);

  const router = useRouter();

  // Fraud detection: device fingerprinting + behavioral analysis
  useEffect(() => {
    async function detectFraud() {
      const _device = await getFingerprint();
      const behavior = await analyzeBehavior();
      setFraudScore(behavior.risk); // Agora só o risk (ou some como quiser!)
    }
    detectFraud();
  }, []);
  
  

  // Create PaymentIntent on mount
  useEffect(() => {
    if (!paymentIntent && cart.length) {
      setLoading(true);
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, email: customerEmail, fraudScore }),
      })
        .then(res => res.json())
        .then(data => setPaymentIntent(data.clientSecret))
        .finally(() => setLoading(false));
    }
  }, [cart, customerEmail, paymentIntent, fraudScore]);

  // Step transition animations
  const pageVariants = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 }
  };

  // Accessibility - focus management
  useEffect(() => {
    document.getElementById(`step-${step}`)?.focus();
  }, [step]);

  // Stripe Elements options (Apple Pay/Google Pay enabled)
  const options: StripeElementsOptions = {
    clientSecret: paymentIntent ?? "",
    appearance: {
      theme: "night",
      variables: { colorPrimary: "#FFD700" }
    }
  };
  
  

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[120]" role="dialog" aria-modal="true">
      <AnimatePresence mode="wait">
        <motion.section
          key={step}
          tabIndex={-1}
          id={`step-${step}`}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="bg-neutral-950 p-8 rounded-3xl w-full max-w-2xl shadow-2xl outline-none"
          aria-labelledby="checkout-heading"
        >
          {loading && <Loader />}
          {/* Step 1: Review */}
          {step === "review" && (
            <>
              <h2 className="text-2xl font-extrabold mb-4 text-yellow-400" id="checkout-heading">
                {t("checkout:review")}
              </h2>
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {cart.map((item, i) => (
                  <div key={i} className="bg-black/40 p-4 rounded-xl flex gap-3">
                    <div className="w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center text-white/60 text-xs">3D</div>
                    <div>
                      <div className="font-bold text-lg text-yellow-300">{item.nome}</div>
                      <div className="text-neutral-400">{t("common:color")}: {item.cor} &nbsp;|&nbsp; {t("common:size")}: {item.tamanho}</div>
                      <div className="text-white mt-2 font-bold">R$ {item.preco.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mb-4">
                <span className="font-bold text-white">{t("common:total")}</span>
                <span className="font-bold text-2xl text-yellow-400">R$ {total.toFixed(2)}</span>
              </div>
              <motion.button
                onClick={() => setStep("payment")}
                className="bg-yellow-400 text-black rounded-xl px-8 py-3 font-extrabold text-xl mt-2 w-full hover:scale-105 transition"
                whileTap={{ scale: 0.98 }}
                aria-label={t("checkout:placeOrder")}
              >
                {t("checkout:placeOrder")}
              </motion.button>
            </>
          )}

          {/* Step 2: Pagamento */}
          {step === "payment" && paymentIntent && (
            <Elements stripe={stripePromise} options={options}>
              <PaymentForm
                email={customerEmail}
                setConfirmed={setConfirmed}
                setError={setError}
                setStep={setStep}
              />
            </Elements>
          )}

          {/* Step 3: Confirmação */}
          {step === "confirmation" && (
            <>
              <h2 className="text-2xl font-extrabold mb-4 text-yellow-400">
                {t("checkout:success.title")}
              </h2>
              <div className="text-lg text-white mb-6">
                {t("checkout:success.message")}  
              </div>
              <motion.button
                onClick={() => { setStep("review"); onComplete(); router.push("/cliente"); }}
                className="bg-yellow-400 text-black rounded-xl px-6 py-3 font-bold"
                whileTap={{ scale: 0.97 }}
                aria-label={t("checkout:cancel.backToBag")}
              >
                {t("checkout:cancel.backToBag")}
              </motion.button>
            </>
          )}

          {error && <div className="text-red-500 mt-6">{error}</div>}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}

// Subcomponente: Stripe Payment Form + 3DSecure2
function PaymentForm({ email, setConfirmed, setError, setStep }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const ns = ["checkout", "common"] as const;
  const { t } = useTranslation(ns);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { receipt_email: email },
      redirect: "if_required",
    });
    setProcessing(false);

    if (error) setError(error.message || "Erro");
    else if (paymentIntent?.status === "succeeded") {
      setConfirmed(true);
      setStep("confirmation");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-label={t("checkout:payment.fake")}>
      <PaymentElement options={{
        layout: "tabs",
        business: { name: "INSANYCK" },
        wallets: { applePay: "auto", googlePay: "auto" }
      }} />
      <motion.button
        type="submit"
        className="bg-yellow-400 text-black rounded-xl px-8 py-3 font-extrabold text-xl mt-2 hover:scale-105 transition"
        whileTap={{ scale: 0.97 }}
        disabled={processing}
        aria-label={t("checkout:placeOrder")}
      >
        {processing ? t("checkout:processing") : t("checkout:placeOrder")}
      </motion.button>
    </form>
  );
}
