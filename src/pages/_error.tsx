// src/pages/_error.tsx
import Head from "next/head";
import Link from "next/link";
import { NextPageContext } from "next";

function ErrorPage({ statusCode }: { statusCode?: number }) {
  return (
    <>
      <Head><title>{`Erro ${statusCode || ""} — INSANYCK`}</title></Head>
      <main className="pt-[120px] px-6 max-w-[900px] mx-auto text-white">
        <h1 className="text-3xl font-bold mb-3">Ocorreu um erro</h1>
        <p className="text-white/70">Tente novamente ou volte para a <Link className="underline" href="/">home</Link>.</p>
      </main>
    </>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? (err as any).statusCode : 404;
  return { statusCode };
};

export default ErrorPage;