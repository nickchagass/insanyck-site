// src/pages/404.tsx
import Head from "next/head";
import Link from "next/link";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function NotFound() {
  return (
    <>
      <Head><title>{`404 — Página não encontrada | INSANYCK`}</title></Head>
      <main className="pt-[120px] px-6 max-w-[900px] mx-auto text-white">
        <h1 className="text-3xl font-bold mb-3">Página não encontrada</h1>
        <p className="text-white/70">Volte para a <Link className="underline" href="/">home</Link>.</p>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? "pt", ["common","nav"])) },
  revalidate: 60
});