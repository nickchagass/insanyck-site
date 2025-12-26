// INSANYCK STEP G-05C — Manifesto com Ghost Titanium global

import Head from "next/head";
import Link from "next/link";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

// INSANYCK STEP G-05C — Ghost Titanium
import DsGlass from "@/components/ds/DsGlass";

export default function Manifesto({}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { t } = useTranslation("common");

  // INSANYCK G-05.MANIFESTO_POLISH_V2 — Agora 5 pilares
  const pillars = [0, 1, 2, 3, 4];

  return (
    <>
      <Head>
        <title>{t("manifestoPage.seoTitle", "Manifesto — INSANYCK")}</title>
        <meta
          name="description"
          content={t("manifestoPage.subtitle", "Engenharia de Identidade. Luxo Negro. Zero concessões.")}
        />
      </Head>

      {/* INSANYCK G-05C — Ghost Titanium + Breathing Room Premium */}
      <main
        id="conteudo"
        className="min-h-screen pt-32 lg:pt-36 pb-16 px-6"
        style={{ backgroundColor: "#080808" }}
      >
        <div className="max-w-5xl mx-auto">

          {/* Hero Section */}
          <header className="text-center mb-16 lg:mb-20">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white/95 tracking-tight mb-6 uppercase">
              {t("manifestoPage.title", "MANIFESTO")}
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              {t("manifestoPage.subtitle", "Engenharia de Identidade. Luxo Negro. Zero concessões.")}
            </p>
          </header>

          {/* Introduction — INSANYCK G-05C — Ghost Titanium */}
          <section className="mb-16 lg:mb-20" data-ins-reveal="intro">
            <DsGlass>
              <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-6">
                {t("manifestoPage.intro.p1", "A INSANYCK não nasce de tendência. Nasce de projeto: geometria, peso, caimento e silêncio.")}
              </p>
              <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-6">
                {t("manifestoPage.intro.p2", "Cada peça é construída como um sistema — Matéria-Prima de Alto Calibre, Arquitetura de Domínio e Acabamento Implacável.")}
              </p>
              <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                {t("manifestoPage.intro.p3", "Operamos no limite: poucas unidades, rastreabilidade obsessiva e extinção programada. Sem retorno.")}
              </p>
            </DsGlass>
          </section>

          {/* INSANYCK G-05C — Momento Manifesto (Ghost Titanium + Noise) */}
          <section className="mb-16 lg:mb-24 -mx-6 px-6 py-20 lg:py-28" data-ins-reveal="moment">
            <DsGlass tone="ghostDense" noise padding="px-6 py-16 lg:px-12 lg:py-20">
              <div className="max-w-4xl mx-auto">
                {/* Kicker */}
                <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-white/40 font-medium mb-8 text-center">
                  {t("manifestoPage.moment.kicker", "MOMENTO")}
                </p>

                {/* Quote (gigante, leading apertado) */}
                <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white/95 leading-[1.05] tracking-tight text-center mb-6">
                  {t("manifestoPage.moment.quote", "NÃO É MODA. É ARQUITETURA.")}
                </h2>

                {/* Subquote */}
                <p className="text-base sm:text-lg lg:text-xl text-white/75 leading-relaxed text-center max-w-2xl mx-auto">
                  {t("manifestoPage.moment.subquote", "Luxo não é barulho. É controle.")}
                </p>
              </div>
            </DsGlass>
          </section>

          {/* INSANYCK G-05C — Pillars (Ghost Titanium) */}
          <section className="mb-16 lg:mb-20" data-ins-reveal="pillars">
            <div className="grid gap-6 lg:gap-8 md:grid-cols-2">
              {pillars.map((index) => (
                <DsGlass
                  key={index}
                  as="article"
                  padding="p-6 lg:p-8"
                  rounded="rounded-2xl"
                  className="transition-all duration-500 hover:border-white/[0.08]"
                >
                  <h3 className="text-sm sm:text-base font-bold text-white/95 mb-3 tracking-tight uppercase">
                    {t(`manifestoPage.pillars.${index}.title`, "")}
                  </h3>
                  <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                    {t(`manifestoPage.pillars.${index}.desc`, "")}
                  </p>
                </DsGlass>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center" data-ins-reveal="cta">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white/95 mb-8 tracking-tight leading-tight">
              {t("manifestoPage.cta.title", "Você não compra roupa. Você assume posição.")}
            </h2>

            {/* CTAs using existing hero-cta classes */}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/loja"
                prefetch={true}
                className="hero-cta hero-cta-primary w-full sm:w-auto"
              >
                {t("manifestoPage.cta.ctaPrimary", "Entrar na loja")}
              </Link>
              <Link
                href="/"
                prefetch={true}
                className="hero-cta hero-cta-secondary w-full sm:w-auto"
              >
                {t("manifestoPage.cta.ctaSecondary", "Voltar para o início")}
              </Link>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "pt", ["common", "nav", "home", "seo"])),
    },
  };
};
