// INSANYCK STEP 4
import Head from "next/head";
import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import Navbar from "../components/Navbar";
import HeroHome from "../sections/HeroHome";
import { seoHome } from "../lib/seo";

export default function HomePage() {
  const { locale } = useRouter();
  const { t } = useTranslation('home');
  const seo = seoHome(locale);

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
      <Navbar />
      <main className="pt-24">
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
