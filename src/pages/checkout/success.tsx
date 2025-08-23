// INSANYCK ETAPA 11B — Página Success com visual INSANYCK
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

interface SuccessPageProps {
  sessionId?: string;
}

export default function CheckoutSuccessPage({ sessionId }: SuccessPageProps) {
  const { t } = useTranslation(["checkout", "common"]);

  return (
    <>
      <Head>
        <title>{t("checkout:success.title", "Pedido Confirmado")} — INSANYCK</title>
        <meta name="description" content={t("checkout:success.description", "Seu pedido foi processado com sucesso")} />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="min-h-screen pt-[120px] insanyck-bloom insanyck-bloom--soft">
        <div className="mx-auto max-w-[600px] px-6">
          {/* Glass card com halo premium */}
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -top-8 h-24"
              style={{
                background: "radial-gradient(70% 100% at 50% 0%, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.08) 40%, rgba(34,197,94,0.0) 80%)",
              }}
            />
            
            <div className="rounded-3xl border border-white/12 bg-black/40 backdrop-blur-md p-8 text-center">
              {/* Ícone de sucesso */}
              <div className="mx-auto w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>

              {/* Título */}
              <h1 className="text-white text-3xl font-semibold mb-4">
                {t("checkout:success.title", "Pedido Confirmado!")}
              </h1>

              {/* Descrição */}
              <div className="text-white/70 mb-8 space-y-3">
                <p>
                  {t("checkout:success.message", "Seu pedido foi processado com sucesso.")}
                </p>
                {sessionId && (
                  <p className="text-sm">
                    {t("checkout:success.sessionId", "ID da sessão:")} 
                    <span className="text-white/90 font-mono ml-2">{sessionId}</span>
                  </p>
                )}
                <p className="text-sm">
                  {t("checkout:success.emailSent", "Em breve você receberá um email com os detalhes do pedido.")}
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/loja"
                  className="flex-1 rounded-xl px-6 py-3 font-semibold border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  {t("checkout:success.continueShopping", "Continuar comprando")}
                </Link>
                <Link
                  href="/account/orders"
                  className="flex-1 rounded-xl px-6 py-3 font-semibold bg-white text-black hover:brightness-95 transition-transform hover:scale-[1.02]"
                >
                  {t("checkout:success.viewOrders", "Meus pedidos")}
                </Link>
              </div>
            </div>
          </div>

          {/* Info adicional */}
          <div className="mt-8 text-center text-white/60 text-sm">
            <p>
              {t("checkout:success.support", "Dúvidas? Entre em contato conosco através do")} {" "}
              <Link href="/contato" className="text-white hover:underline">
                {t("common:support", "suporte")}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query, locale }) => {
  // Cache-Control leve para SEO
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "pt", [
        "common",
        "checkout",
      ])),
      sessionId: query.session_id || null,
    },
  };
};