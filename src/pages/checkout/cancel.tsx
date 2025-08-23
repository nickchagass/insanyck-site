// INSANYCK ETAPA 11B — Página Cancel com visual INSANYCK
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export default function CheckoutCancelPage() {
  const { t } = useTranslation(["checkout", "common"]);

  return (
    <>
      <Head>
        <title>{t("checkout:cancel.title", "Checkout Cancelado")} — INSANYCK</title>
        <meta name="description" content={t("checkout:cancel.description", "O processo de checkout foi cancelado")} />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="min-h-screen pt-[120px] insanyck-bloom insanyck-bloom--soft">
        <div className="mx-auto max-w-[600px] px-6">
          {/* Glass card com halo sutil */}
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -top-8 h-24"
              style={{
                background: "radial-gradient(70% 100% at 50% 0%, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.08) 40%, rgba(239,68,68,0.0) 80%)",
              }}
            />
            
            <div className="rounded-3xl border border-white/12 bg-black/40 backdrop-blur-md p-8 text-center">
              {/* Ícone de cancelamento */}
              <div className="mx-auto w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-6">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>

              {/* Título */}
              <h1 className="text-white text-3xl font-semibold mb-4">
                {t("checkout:cancel.title", "Checkout Cancelado")}
              </h1>

              {/* Descrição */}
              <div className="text-white/70 mb-8 space-y-3">
                <p>
                  {t("checkout:cancel.message", "Não se preocupe, nenhuma cobrança foi realizada.")}
                </p>
                <p className="text-sm">
                  {t("checkout:cancel.itemsSaved", "Seus itens continuam salvos na sacola.")}
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/sacola"
                  className="flex-1 rounded-xl px-6 py-3 font-semibold bg-white text-black hover:brightness-95 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("checkout:cancel.backToBag", "Voltar para sacola")}
                </Link>
                <Link
                  href="/loja"
                  className="flex-1 rounded-xl px-6 py-3 font-semibold border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  {t("checkout:cancel.continueShopping", "Continuar comprando")}
                </Link>
              </div>
            </div>
          </div>

          {/* Info de suporte */}
          <div className="mt-8 text-center text-white/60 text-sm">
            <p>
              {t("checkout:cancel.needHelp", "Precisa de ajuda?")} {" "}
              <Link href="/contato" className="text-white hover:underline">
                {t("common:contact", "Entre em contato")}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  // Cache-Control leve para SEO
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "pt", [
        "common",
        "checkout",
      ])),
    },
  };
};