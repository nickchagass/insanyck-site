// INSANYCK STEP G-05.MANIFESTO_SOUL — Copy visceral + Textura cinematográfica + Hooks micro-motion

import Head from "next/head";
import Link from "next/link";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

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

      {/* INSANYCK G-05.MANIFESTO_GLASS_V3 — Presença Física Real (breathing + contraste perceptível) */}
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

          {/* Introduction — INSANYCK G-05.MANIFESTO_GLASS_V3 — Presença Física Real */}
          <section className="mb-16 lg:mb-20" data-ins-reveal="intro">
            <div className="relative rounded-3xl bg-[#1E1E30]/85 border border-white/[0.16] ring-1 ring-white/[0.06] shadow-[0_18px_60px_rgba(0,0,0,0.55)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.60)] overflow-hidden p-8 lg:p-12">
              {/* Specular highlight (lâmina de luz premium) */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.22] via-white/[0.10] to-transparent" />

              {/* Vinheta cinematográfica (profundidade bottom) */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-black/0 via-black/0 to-black/30" />

              {/* Content */}
              <div className="relative z-10">
                <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-6">
                  {t("manifestoPage.intro.p1", "A INSANYCK não nasce de tendência. Nasce de projeto: geometria, peso, caimento e silêncio.")}
                </p>
                <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-6">
                  {t("manifestoPage.intro.p2", "Cada peça é construída como um sistema — Matéria-Prima de Alto Calibre, Arquitetura de Domínio e Acabamento Implacável.")}
                </p>
                <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                  {t("manifestoPage.intro.p3", "Operamos no limite: poucas unidades, rastreabilidade obsessiva e extinção programada. Sem retorno.")}
                </p>
              </div>
            </div>
          </section>

          {/* INSANYCK G-05.MANIFESTO_GLASS_V3 — Momento Manifesto (Presença Real + Noise Cinematográfico) */}
          <section className="mb-16 lg:mb-24 -mx-6 px-6 py-20 lg:py-28" data-ins-reveal="moment">
            <div className="relative rounded-3xl bg-[#1E1E30]/85 border border-white/[0.16] ring-1 ring-white/[0.06] shadow-[0_18px_60px_rgba(0,0,0,0.55)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.60)] overflow-hidden px-6 py-16 lg:px-12 lg:py-20">
              {/* Specular highlight (lâmina de luz premium) */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.22] via-white/[0.10] to-transparent" />

              {/* Vinheta cinematográfica (profundidade bottom) */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-black/0 via-black/0 to-black/30" />

              {/* Noise texture (ONLY here — cinematográfico perceptível) */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay" style={{ backgroundImage: "url('/textures/noise.svg')" }} />

              {/* Content */}
              <div className="relative z-10 max-w-4xl mx-auto">
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
            </div>
          </section>

          {/* INSANYCK G-05.MANIFESTO_GLASS_V3 — Pillars (Presença Física Real) */}
          <section className="mb-16 lg:mb-20" data-ins-reveal="pillars">
            <div className="grid gap-6 lg:gap-8 md:grid-cols-2">
              {pillars.map((index) => (
                <article
                  key={index}
                  className="relative rounded-2xl bg-[#1E1E30]/85 border border-white/[0.16] ring-1 ring-white/[0.06] shadow-[0_18px_60px_rgba(0,0,0,0.55)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.60)] overflow-hidden p-6 lg:p-8 transition-all duration-500 hover:border-white/[0.20] hover:ring-white/[0.08]"
                >
                  {/* Specular highlight (lâmina de luz premium) */}
                  <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.22] via-white/[0.10] to-transparent" />

                  {/* Vinheta cinematográfica (profundidade bottom) */}
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-black/0 via-black/0 to-black/30" />

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-sm sm:text-base font-bold text-white/95 mb-3 tracking-tight uppercase">
                      {t(`manifestoPage.pillars.${index}.title`, "")}
                    </h3>
                    <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                      {t(`manifestoPage.pillars.${index}.desc`, "")}
                    </p>
                  </div>
                </article>
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
