// INSANYCK STEP 4
import Head from "next/head";
import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
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
      <main id="conteudo" className="pt-24">
        {/* INSANYCK STEP 4 · Lote 3 — H1 sr-only para hierarquia A11y */}
        <h1 className="sr-only">{t('hero.title', 'INSANYCK — Essential luxury in motion')}</h1>
        <HeroHome />
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
