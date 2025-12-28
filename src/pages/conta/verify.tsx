// src/pages/conta/verify.tsx
// INSANYCK ACCOUNT-MUSEUM-REVOLUTION — Email Verification Page
// Com aviso elegante sobre pasta de spam

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, AlertCircle, ArrowLeft } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function VerifyPage() {
  const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>{t('auth.verify.title', 'Verifique seu e-mail')} — INSANYCK</title>
        <meta name="description" content={t('auth.verify.description', 'Enviamos um link de acesso para seu e-mail')} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {/* === ATMOSPHERIC BACKGROUND (mesmo do login) === */}
      <main className="login-atmosphere min-h-screen flex items-center justify-center p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[420px]"
        >
          {/* === LOGO === */}
          <motion.div
            variants={itemVariants}
            className="text-center mb-8"
          >
            <h2 className="logo-museum text-2xl font-medium tracking-[0.2em] text-white/90">
              INSANYCK
            </h2>
          </motion.div>

          {/* === FLOATING CARD === */}
          <motion.div
            variants={itemVariants}
            className="login-card-museum p-8 sm:p-10"
          >
            {/* Icon */}
            <motion.div
              variants={itemVariants}
              className="mx-auto w-20 h-20 mb-6 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center"
            >
              <Mail className="w-10 h-10 text-white/70" strokeWidth={1.5} />
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="text-2xl font-semibold text-white text-center mb-4"
            >
              {t('auth.verify.title', 'Verifique seu e-mail')}
            </motion.h1>

            {/* Message */}
            <motion.p
              variants={itemVariants}
              className="text-white/70 text-center mb-4 leading-relaxed"
            >
              {t('auth.verify.message', 'Enviamos um link de login seguro para seu e-mail.')}
            </motion.p>

            {/* Instructions */}
            <motion.p
              variants={itemVariants}
              className="text-white/50 text-sm text-center mb-6"
            >
              {t('auth.verify.instructions', 'Clique no link que enviamos para acessar sua conta. O link expira em 10 minutos.')}
            </motion.p>

            {/* === SPAM WARNING (ELEGANTE) === */}
            <motion.div
              variants={itemVariants}
              className="bg-amber-500/[0.08] border border-amber-500/20 rounded-xl p-4 mb-6"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400/80 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-amber-200/90 text-sm font-medium mb-1">
                    {t('auth.verify.spamTitle', 'Não encontrou o e-mail?')}
                  </p>
                  <p className="text-amber-200/60 text-xs leading-relaxed">
                    {t('auth.verify.spamMessage', 'Verifique sua caixa de Spam ou Lixo Eletrônico. E-mails de novos remetentes podem ser filtrados automaticamente.')}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Back to login */}
            <motion.div variants={itemVariants}>
              <Link
                href="/conta/login"
                className="btn-jewel-secondary w-full flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('auth.verify.backToLogin', 'Voltar ao login')}
              </Link>
            </motion.div>

            {/* Footer */}
            <motion.p
              variants={itemVariants}
              className="text-center text-white/30 text-xs mt-8"
            >
              {t('auth.verify.footer', 'Não recebeu o e-mail? Verifique sua caixa de spam')}
            </motion.p>
          </motion.div>

          {/* === BOTTOM BRANDING === */}
          <motion.p
            variants={itemVariants}
            className="text-center text-white/20 text-xs mt-8 tracking-widest"
          >
            LUXURY FASHION
          </motion.p>
        </motion.div>
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
