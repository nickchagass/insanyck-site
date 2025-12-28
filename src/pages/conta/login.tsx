// src/pages/conta/login.tsx
// INSANYCK LOGIN-MUSEUM — Private Club Login Experience
"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import Head from 'next/head';
import { motion } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
} as const;

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
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 20,
    },
  },
} as const;

export default function LoginPage() {
  const { t } = useTranslation('common');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'email' | 'google' | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;

    setIsLoading(true);
    setLoadingProvider('email');

    try {
      await signIn('email', {
        email: email.trim().toLowerCase(),
        callbackUrl: '/'
      });
    } catch (error) {
      console.error('[Login] Email error:', error);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setLoadingProvider('google');

    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('[Login] Google error:', error);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <>
      <Head>
        <title>{t('auth.login.title', 'Entrar')} — INSANYCK</title>
        <meta name="description" content={t('auth.login.description', 'Entre na sua conta INSANYCK')} />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      {/* === ATMOSPHERIC BACKGROUND === */}
      <main className="login-atmosphere min-h-screen flex items-center justify-center p-6">

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[420px]"
        >
          {/* === LOGO ABOVE CARD === */}
          <motion.div
            variants={itemVariants}
            className="text-center mb-8"
          >
            <h2 className="logo-museum text-2xl font-medium tracking-[0.2em] text-white/90">
              INSANYCK
            </h2>
            <p className="mt-2 text-sm text-white/40 tracking-wide">
              {t('auth.login.tagline', 'Bem-vindo ao clube')}
            </p>
          </motion.div>

          {/* === FLOATING CARD === */}
          <motion.div
            variants={cardVariants}
            className="login-card-museum p-8 sm:p-10"
          >
            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="text-2xl font-semibold text-white text-center mb-8"
            >
              {t('auth.login.title', 'Entrar')}
            </motion.h1>

            {/* Email form */}
            <motion.form
              variants={itemVariants}
              onSubmit={handleEmailLogin}
              className="space-y-4"
            >
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.login.emailPlaceholder', 'Seu e-mail')}
                  className="input-museum"
                  required
                  disabled={isLoading}
                  aria-label={t('auth.login.emailPlaceholder', 'Seu e-mail')}
                />
              </div>

              {/* Primary Jewel Button */}
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="btn-jewel-primary w-full"
                aria-busy={loadingProvider === 'email'}
              >
                {loadingProvider === 'email' ? (
                  <LoadingSpinner />
                ) : (
                  t('auth.login.ctaEmail', 'Entrar por e-mail')
                )}
              </button>
            </motion.form>

            {/* Divider */}
            <motion.div
              variants={itemVariants}
              className="login-divider my-6"
            >
              <span>{t('auth.login.or', 'ou')}</span>
            </motion.div>

            {/* Secondary Jewel Button — Google */}
            <motion.button
              variants={itemVariants}
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="btn-jewel-secondary w-full"
              aria-busy={loadingProvider === 'google'}
            >
              {loadingProvider === 'google' ? (
                <LoadingSpinner light />
              ) : (
                <>
                  <GoogleIcon />
                  {t('auth.login.ctaGoogle', 'Entrar com Google')}
                </>
              )}
            </motion.button>

            {/* Privacy notice */}
            <motion.p
              variants={itemVariants}
              className="text-center text-white/40 text-xs mt-8 leading-relaxed"
            >
              {t('auth.login.privacy', 'Seus dados estão seguros conosco')}
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

// === COMPONENTS ===

function LoadingSpinner({ light = false }: { light?: boolean }) {
  return (
    <svg
      className={`animate-spin h-5 w-5 ${light ? 'text-white/80' : 'text-black/60'}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// === SSR ===
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'pt', ['common'])),
    },
  };
};
