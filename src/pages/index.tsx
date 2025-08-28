// INSANYCK STEP 4
import Head from "next/head";
import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import HeroHome from "../sections/HeroHome";
import { seoHome } from "../lib/seo";

export default function HomePage() {
  const { locale } = useRouter();
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
