// INSANYCK STEP 4
import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Navbar from "../components/Navbar";
import HeroHome from "../sections/HeroHome";

export default function HomePage() {
  return (
    <>
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
