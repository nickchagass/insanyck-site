// src/pages/privacidade.tsx
// INSANYCK LEGAL-COMPLIANCE-MUSEUM — Privacy Policy Page
// Museum Edition: Atmospheric background + Glass cards + Premium typography

import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Mail, Lock, Eye, Database, UserCheck, Globe } from 'lucide-react';

// Animation variants (Museum Edition standard)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 18,
    },
  },
};

// Section component for consistent styling
function Section({
  icon: Icon,
  title,
  children
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section variants={itemVariants} className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
          <Icon className="w-5 h-5 text-white/60" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-medium text-white/90">{title}</h2>
      </div>
      <div className="text-white/65 text-[0.9375rem] leading-relaxed space-y-4 pl-[52px]">
        {children}
      </div>
    </motion.section>
  );
}

export default function PrivacyPolicyPage() {
  const { t } = useTranslation('legal');
  const router = useRouter();
  const locale = router.locale || 'pt';

  // Data formatada para "última atualização"
  const lastUpdated = new Date().toLocaleDateString(locale === 'en' ? 'en-US' : 'pt-BR', {
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const,
  });

  return (
    <>
      <Head>
        <title>{t('privacy.meta.title', 'Política de Privacidade')} — INSANYCK</title>
        <meta name="description" content={t('privacy.meta.description', 'Saiba como a INSANYCK coleta, usa e protege seus dados pessoais. Transparência e segurança são nossos pilares.')} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://insanyck.com${locale === 'en' ? '/en' : ''}/privacidade`} />

        {/* Open Graph */}
        <meta property="og:title" content={`${t('privacy.meta.title', 'Política de Privacidade')} — INSANYCK`} />
        <meta property="og:description" content={t('privacy.meta.description', 'Saiba como a INSANYCK coleta, usa e protege seus dados pessoais.')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://insanyck.com${locale === 'en' ? '/en' : ''}/privacidade`} />
        <meta property="og:locale" content={locale === 'en' ? 'en_US' : 'pt_BR'} />
      </Head>

      {/* === MUSEUM ATMOSPHERE === */}
      <main className="museum-atmosphere min-h-screen">
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-24 sm:py-32">

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Back Navigation */}
            <motion.div variants={itemVariants} className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('common.backToHome', 'Voltar ao início')}
              </Link>
            </motion.div>

            {/* === HEADER CARD === */}
            <motion.div
              variants={itemVariants}
              className="glass-card-museum p-8 sm:p-10 mb-8"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white/70" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-3">
                {t('privacy.title', 'Política de Privacidade')}
              </h1>

              {/* Subtitle */}
              <p className="text-white/60 text-lg mb-4">
                {t('privacy.subtitle', 'Seu direito à privacidade é sagrado para nós.')}
              </p>

              {/* Last updated */}
              <p className="text-white/40 text-sm">
                {t('privacy.lastUpdated', 'Última atualização')}: {lastUpdated}
              </p>
            </motion.div>

            {/* === CONTENT CARD === */}
            <motion.div
              variants={itemVariants}
              className="glass-card-museum p-8 sm:p-10"
            >
              {/* Introduction */}
              <motion.div variants={itemVariants} className="mb-10 pb-8 border-b border-white/[0.06]">
                <p className="text-white/70 text-[0.9375rem] leading-relaxed">
                  {t('privacy.intro', 'A INSANYCK valoriza e respeita sua privacidade. Esta política descreve como coletamos, usamos e protegemos suas informações pessoais quando você utiliza nosso site e serviços. Ao acessar nossa plataforma, você concorda com as práticas descritas neste documento.')}
                </p>
              </motion.div>

              {/* Section 1: Data Collection */}
              <Section icon={Database} title={t('privacy.sections.collection.title', 'Dados que Coletamos')}>
                <p>{t('privacy.sections.collection.intro', 'Coletamos informações necessárias para fornecer nossos serviços:')}</p>
                <ul className="list-disc list-inside space-y-2 text-white/60">
                  <li>{t('privacy.sections.collection.item1', 'Informações de identificação (nome, e-mail) fornecidas no cadastro')}</li>
                  <li>{t('privacy.sections.collection.item2', 'Endereço de entrega para processamento de pedidos')}</li>
                  <li>{t('privacy.sections.collection.item3', 'Dados de navegação e preferências para melhorar sua experiência')}</li>
                  <li>{t('privacy.sections.collection.item4', 'Informações de pagamento processadas por parceiros seguros (Stripe, MercadoPago)')}</li>
                </ul>
              </Section>

              {/* Section 2: Data Usage */}
              <Section icon={Eye} title={t('privacy.sections.usage.title', 'Como Usamos seus Dados')}>
                <p>{t('privacy.sections.usage.intro', 'Suas informações são utilizadas exclusivamente para:')}</p>
                <ul className="list-disc list-inside space-y-2 text-white/60">
                  <li>{t('privacy.sections.usage.item1', 'Processar e entregar seus pedidos')}</li>
                  <li>{t('privacy.sections.usage.item2', 'Enviar atualizações sobre status de compras')}</li>
                  <li>{t('privacy.sections.usage.item3', 'Personalizar sua experiência de compra')}</li>
                  <li>{t('privacy.sections.usage.item4', 'Comunicar novidades e ofertas (com seu consentimento)')}</li>
                  <li>{t('privacy.sections.usage.item5', 'Cumprir obrigações legais e regulatórias')}</li>
                </ul>
              </Section>

              {/* Section 3: Data Protection */}
              <Section icon={Lock} title={t('privacy.sections.protection.title', 'Proteção dos Dados')}>
                <p>{t('privacy.sections.protection.p1', 'Implementamos medidas técnicas e organizacionais para proteger suas informações:')}</p>
                <ul className="list-disc list-inside space-y-2 text-white/60">
                  <li>{t('privacy.sections.protection.item1', 'Criptografia SSL/TLS em todas as transmissões')}</li>
                  <li>{t('privacy.sections.protection.item2', 'Autenticação segura via Magic Link (sem senhas armazenadas)')}</li>
                  <li>{t('privacy.sections.protection.item3', 'Pagamentos processados por gateways certificados PCI-DSS')}</li>
                  <li>{t('privacy.sections.protection.item4', 'Acesso restrito a dados apenas para operações essenciais')}</li>
                </ul>
              </Section>

              {/* Section 4: Your Rights */}
              <Section icon={UserCheck} title={t('privacy.sections.rights.title', 'Seus Direitos')}>
                <p>{t('privacy.sections.rights.intro', 'Em conformidade com a LGPD e GDPR, você tem direito a:')}</p>
                <ul className="list-disc list-inside space-y-2 text-white/60">
                  <li>{t('privacy.sections.rights.item1', 'Acessar seus dados pessoais armazenados')}</li>
                  <li>{t('privacy.sections.rights.item2', 'Solicitar correção de informações incorretas')}</li>
                  <li>{t('privacy.sections.rights.item3', 'Solicitar exclusão de seus dados')}</li>
                  <li>{t('privacy.sections.rights.item4', 'Revogar consentimento para comunicações')}</li>
                  <li>{t('privacy.sections.rights.item5', 'Portabilidade de dados')}</li>
                </ul>
                <p className="mt-4">{t('privacy.sections.rights.contact', 'Para exercer esses direitos, entre em contato através do e-mail abaixo.')}</p>
              </Section>

              {/* Section 5: Third Parties */}
              <Section icon={Globe} title={t('privacy.sections.thirdParties.title', 'Terceiros e Parceiros')}>
                <p>{t('privacy.sections.thirdParties.p1', 'Trabalhamos com parceiros de confiança para processar pagamentos e entregar produtos:')}</p>
                <ul className="list-disc list-inside space-y-2 text-white/60">
                  <li><strong>Stripe</strong> — {t('privacy.sections.thirdParties.stripe', 'Processamento de pagamentos internacionais')}</li>
                  <li><strong>MercadoPago</strong> — {t('privacy.sections.thirdParties.mp', 'Processamento de pagamentos no Brasil')}</li>
                  <li><strong>Correios/Transportadoras</strong> — {t('privacy.sections.thirdParties.shipping', 'Entrega de produtos')}</li>
                </ul>
                <p className="mt-4">{t('privacy.sections.thirdParties.p2', 'Esses parceiros têm suas próprias políticas de privacidade e são certificados para garantir a segurança dos seus dados.')}</p>
              </Section>

              {/* Contact */}
              <Section icon={Mail} title={t('privacy.sections.contact.title', 'Contato')}>
                <p>{t('privacy.sections.contact.intro', 'Para dúvidas sobre privacidade ou para exercer seus direitos:')}</p>
                <a
                  href="mailto:privacidade@insanyck.com"
                  className="inline-flex items-center gap-2 mt-2 text-white/80 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  privacidade@insanyck.com
                </a>
              </Section>

            </motion.div>

            {/* Footer Navigation */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm"
            >
              <Link
                href="/termos"
                className="text-white/50 hover:text-white/80 transition-colors"
              >
                {t('common.viewTerms', 'Ver Termos de Uso')} →
              </Link>
              <p className="text-white/30">
                © {new Date().getFullYear()} INSANYCK. {t('common.allRights', 'Todos os direitos reservados.')}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'pt', ['common', 'legal', 'nav'])),
    },
  };
};
