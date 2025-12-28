// INSANYCK STEP 4
import Head from "next/head";
import Link from "next/link";
import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { ShieldCheck } from "lucide-react";
import HeroHome from "@/sections/HeroHome";
import { seoHome } from "@/lib/seo";

export default function HomePage() {
  const { locale } = useRouter();
  const { t } = useTranslation('home');
  const seo = seoHome(locale);

  // [DEV] Fix: Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.warn('[dev] home render');
  }

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        {seo.meta.map((tag, index) => (
          <meta key={index} {...tag} />
        ))}
        {seo.link.map((link, index) => (
          <link key={index} {...link} />
        ))}
        {seo.jsonLd.map((schema, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </Head>
      {/* INSANYCK STEP 4 · Lote 3 — Skip link para navegação A11y + neutralização de layout */}
      {/* INSANYCK STEP G-05.1 — Corrigido hardcode bg-black/60 */}
      {/* INSANYCK HOTFIX G-05.1.2 — z-index z-[60] para ficar acima da navbar (z-50) */}
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 absolute left-2 top-2 z-[60] px-3 py-2 rounded-2xl bg-[color:var(--ds-elevated)] backdrop-blur text-[color:var(--ds-accent)]"
      >
        Pular para conteúdo
      </a>
      {/* INSANYCK STEP G-05.HERO_PUREBLACK — pt-0 na Home (Hero pixel 0, sem aba preta) */}
      <main id="conteudo" className="pt-0">
        {/* INSANYCK STEP 4 · Lote 3 — H1 sr-only para hierarquia A11y */}
        <h1 className="sr-only">{t('hero.title', 'INSANYCK — Essential luxury in motion')}</h1>
        <HeroHome />

        {/* INSANYCK LEGAL-COMPLIANCE — Premium transparency strip */}
        <section className="relative bg-[color:var(--ins-bg-base)] border-t border-white/[0.06]">
          {/* Specular hairline top */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
            }}
          />

          <div className="max-w-7xl mx-auto px-6 py-8 sm:py-10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center">
              {/* Icon */}
              <div className="flex items-center gap-2 text-white/50">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} aria-hidden="true" />
                <span className="text-[0.6875rem] sm:text-xs font-medium tracking-wider uppercase">
                  {locale === 'en' ? 'Transparency' : 'Transparência'}
                </span>
              </div>

              {/* Separator */}
              <span className="hidden sm:block text-white/20" aria-hidden="true">•</span>

              {/* Links */}
              <p className="text-[0.75rem] sm:text-[0.8125rem] text-white/40 leading-relaxed">
                {locale === 'en' ? 'Read our' : 'Conheça nossos'}{' '}
                <Link
                  href="/termos"
                  className="text-white/60 hover:text-white/90 underline underline-offset-2 decoration-white/30 hover:decoration-white/60 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded-sm"
                >
                  {locale === 'en' ? 'Terms of Service' : 'Termos de Uso'}
                </Link>
                {' '}{locale === 'en' ? 'and' : 'e'}{' '}
                <Link
                  href="/privacidade"
                  className="text-white/60 hover:text-white/90 underline underline-offset-2 decoration-white/30 hover:decoration-white/60 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded-sm"
                >
                  {locale === 'en' ? 'Privacy Policy' : 'Política de Privacidade'}
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = locale || 'pt';
  return {
    props: {
      ...(await serverSideTranslations(lng, ['common', 'nav', 'home', 'product'])),
    },
    revalidate: 60,
  };
};
