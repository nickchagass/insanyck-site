// INSANYCK FASE D — Dev Email Preview (desenvolvimento apenas)
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import Head from 'next/head';

export default function EmailPreviewPage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { to, subject } = router.query;

  // Em produção, redirecionar para 404
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <>
      <Head>
        <title>Email Preview — INSANYCK Dev</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="min-h-screen bg-zinc-950 text-white p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">📧 Email Preview (Dev Only)</h1>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Parâmetros Detectados:</h2>
            <div className="space-y-2 font-mono text-sm">
              <div><span className="text-blue-400">Para:</span> {to || 'não informado'}</div>
              <div><span className="text-green-400">Assunto:</span> {subject || 'não informado'}</div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">📋 Instruções:</h2>
            <ol className="list-decimal list-inside space-y-2 text-white/80">
              <li>O HTML completo do e-mail está no <strong>console do terminal</strong></li>
              <li>Procure por logs <code>[INSANYCK][DEV EMAIL]</code></li>
              <li>Em produção, e-mails são enviados via Resend/SES</li>
              <li>Esta página só funciona em desenvolvimento</li>
            </ol>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => router.back()} 
              className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'pt', ['common'])),
    },
  };
};