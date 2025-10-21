// INSANYCK FASE D — Página de Verificação de E-mail (PT/EN)
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

export default function VerifyPage() {
  const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>{t('auth.verify.title')} — INSANYCK</title>
        <meta name="description" content={t('auth.verify.description')} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="min-h-screen grid place-items-center p-6 bg-zinc-950">
        <div className="w-full max-w-md text-center">
          {/* Glass container */}
          <div className="glass rounded-2xl p-8 border border-white/10 backdrop-blur-md bg-white/[0.02]">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h1 className="text-2xl font-semibold text-white text-center mb-4">
              {t('auth.verify.title')}
            </h1>

            <p className="text-white/80 text-center mb-6 leading-relaxed">
              {t('auth.verify.message')}
            </p>

            <p className="text-white/60 text-sm text-center mb-8">
              {t('auth.verify.instructions')}
            </p>

            {/* Back to login */}
            <Link 
              href="/conta/login"
              className="inline-block w-full bg-white/[0.05] border border-white/10 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-center"
            >
              {t('auth.verify.backToLogin')}
            </Link>

            <p className="text-center text-white/40 text-xs mt-6">
              {t('auth.verify.footer')}
            </p>
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