// INSANYCK FASE G-05 — Premium custom 404 page (100% token-based)
// Design System tokens, i18n, glassmorphism, premium UX

import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { Home, Search, Package } from "lucide-react";

import Layout from "@/components/Layout";
import DsButton from "@/components/ds/DsButton";

export default function NotFound() {
  const { t } = useTranslation(["common", "nav"]);

  return (
    <>
      <Head>
        <title>404 — {t("common:error.notFound", "Página não encontrada")} | INSANYCK</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center bg-[color:var(--ins-bg-base)] px-6">
          {/* INSANYCK FASE G-05 — Premium card with glassmorphism */}
          <div className="max-w-2xl w-full text-center">
            {/* Glassmorphism container */}
            <div className="relative bg-ds-surface border border-ds-borderSubtle rounded-[var(--ds-radius-lg)] p-12 backdrop-blur-lg shadow-[var(--ds-shadow-2)]">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-ds-elevated/20 to-transparent rounded-[var(--ds-radius-lg)] -z-10" />

              {/* 404 Number - Large and prominent */}
              <div className="mb-6">
                <h1 className="text-9xl font-bold text-ds-accent tracking-tight">
                  404
                </h1>
              </div>

              {/* Error title */}
              <h2 className="text-2xl md:text-3xl font-bold text-ds-accent mb-4">
                {t("common:error.notFoundTitle", "Página não encontrada")}
              </h2>

              {/* Error description */}
              <p className="text-ds-accentSoft text-lg mb-8 max-w-md mx-auto">
                {t(
                  "common:error.notFoundDescription",
                  "A página que você procura não existe ou foi movida. Tente voltar ao início ou explorar a loja."
                )}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/">
                  <DsButton variant="primary" size="lg">
                    <Home className="w-5 h-5" />
                    {t("common:backHome", "Voltar ao início")}
                  </DsButton>
                </Link>

                <Link href="/loja">
                  <DsButton variant="secondary" size="lg">
                    <Package className="w-5 h-5" />
                    {t("nav:shop", "Loja")}
                  </DsButton>
                </Link>

                <Link href="/buscar">
                  <DsButton variant="ghost" size="lg">
                    <Search className="w-5 h-5" />
                    {t("common:search", "Buscar")}
                  </DsButton>
                </Link>
              </div>

              {/* Subtle hint */}
              <p className="text-ds-accentSoft text-sm mt-8 opacity-60">
                {t(
                  "common:error.hint",
                  "Se você acredita que isso é um erro, entre em contato conosco."
                )}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "pt", ["common", "nav"])),
  },
  revalidate: 60,
});
