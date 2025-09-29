// src/pages/_error.tsx
import Head from "next/head";
import Link from "next/link";
import { NextPageContext } from "next";

function ErrorPage({ statusCode, err }: { statusCode?: number; err?: Error }) {
  // [DEV] Show detailed error info in development
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    console.error('[dev] Error page rendered:', { statusCode, err });
  }

  return (
    <>
      <Head><title>{`Erro ${statusCode || ""} — INSANYCK`}</title></Head>
      <main className="pt-[120px] px-6 max-w-[900px] mx-auto text-white">
        <h1 className="text-3xl font-bold mb-3">Ocorreu um erro</h1>
        <p className="text-white/70">Tente novamente ou volte para a <Link className="underline" href="/">home</Link>.</p>
        {isDev && err && (
          <details className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded">
            <summary className="cursor-pointer text-red-300">Detalhes do erro (DEV)</summary>
            <pre className="mt-2 text-xs text-red-200 overflow-auto">{err.stack || err.message}</pre>
          </details>
        )}
      </main>
    </>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? (err as any).statusCode : 404;
  return { statusCode, err };
};

export default ErrorPage;