// src/pages/termos.tsx
// INSANYCK LEGAL-COMPLIANCE-MUSEUM — Terms of Service Page
// Museum Edition: Atmospheric background + Glass cards + Premium typography

import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import {
  FileText,
  ArrowLeft,
  Mail,
  ShoppingBag,
  CreditCard,
  Truck,
  RotateCcw,
  Scale,
  AlertCircle
} from 'lucide-react';

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

export default function TermsOfServicePage() {
  const { t } = useTranslation('legal');
  const router = useRouter();
  const locale = router.locale || 'pt';

  const lastUpdated = new Date().toLocaleDateString(locale === 'en' ? 'en-US' : 'pt-BR', {
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const,
  });

  return (
    <>
      <Head>
        <title>{t('terms.meta.title', 'Termos de Uso')} — INSANYCK</title>
        <meta name="description" content={t('terms.meta.description', 'Leia os termos e condições de uso da INSANYCK. Transparência nas regras de compra, entrega e devolução.')} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://insanyck.com${locale === 'en' ? '/en' : ''}/termos`} />

        {/* Open Graph */}
        <meta property="og:title" content={`${t('terms.meta.title', 'Termos de Uso')} — INSANYCK`} />
        <meta property="og:description" content={t('terms.meta.description', 'Leia os termos e condições de uso da INSANYCK.')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://insanyck.com${locale === 'en' ? '/en' : ''}/termos`} />
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
                <FileText className="w-8 h-8 text-white/70" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-3">
                {t('terms.title', 'Termos de Uso')}
              </h1>

              {/* Subtitle */}
              <p className="text-white/60 text-lg mb-4">
                {t('terms.subtitle', 'Regras claras para uma experiência de compra excepcional.')}
              </p>

              {/* Last updated */}
              <p className="text-white/40 text-sm">
                {t('terms.lastUpdated', 'Última atualização')}: {lastUpdated}
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
                  {t('terms.intro', 'Bem-vindo à INSANYCK. Ao acessar e utilizar nosso site, você concorda com estes termos e condições. Por favor, leia-os atentamente antes de realizar qualquer compra. Se não concordar com algum termo, recomendamos não utilizar nossos serviços.')}
                </p>
              </motion.div>

              {/* Section 1: About */}
              <Section icon={ShoppingBag} title={t('terms.sections.about.title', 'Sobre a INSANYCK')}>
                <p>{t('terms.sections.about.p1', 'A INSANYCK é uma marca de moda de luxo focada em peças exclusivas e design contemporâneo. Operamos como plataforma de e-commerce, conectando criadores a consumidores que buscam excelência em vestuário.')}</p>
                <p>{t('terms.sections.about.p2', 'Nosso compromisso é oferecer produtos de alta qualidade, atendimento premium e uma experiência de compra diferenciada.')}</p>
              </Section>

              {/* Section 2: Products & Prices */}
              <Section icon={ShoppingBag} title={t('terms.sections.products.title', 'Produtos e Preços')}>
                <ul className="list-disc list-inside space-y-2 text-white/60">
                  <li>{t('terms.sections.products.item1', 'Todos os preços são exibidos em Reais (BRL) e incluem impostos aplicáveis')}</li>
                  <li>{t('terms.sections.products.item2', 'As imagens são ilustrativas; pequenas variações de cor podem ocorrer')}</li>
                  <li>{t('terms.sections.products.item3', 'Disponibilidade de tamanhos está sujeita ao estoque')}</li>
                  <li>{t('terms.sections.products.item4', 'Reservamo-nos o direito de corrigir erros de preço antes da confirmação do pedido')}</li>
                </ul>
              </Section>

              {/* Section 3: Payments */}
              <Section icon={CreditCard} title={t('terms.sections.payments.title', 'Pagamentos')}>
                <p>{t('terms.sections.payments.intro', 'Aceitamos os seguintes métodos de pagamento:')}</p>
                <ul className="list-disc list-inside space-y-2 text-white/60">
                  <li>{t('terms.sections.payments.item1', 'Cartões de crédito (Visa, Mastercard, Amex, Elo)')}</li>
                  <li>{t('terms.sections.payments.item2', 'PIX (pagamento instantâneo)')}</li>
                  <li>{t('terms.sections.payments.item3', 'Boleto bancário (prazo de compensação de até 3 dias úteis)')}</li>
                </ul>
                <p className="mt-4">{t('terms.sections.payments.security', 'Todos os pagamentos são processados por gateways certificados (Stripe e MercadoPago), garantindo segurança PCI-DSS.')}</p>
              </Section>

              {/* Section 4: Shipping */}
              <Section icon={Truck} title={t('terms.sections.shipping.title', 'Entrega')}>
                <ul className="list-disc list-inside space-y-2 text-white/60">
                  <li>{t('terms.sections.shipping.item1', 'Entregas para todo o Brasil via Correios e transportadoras parceiras')}</li>
                  <li>{t('terms.sections.shipping.item2', 'Prazos calculados no checkout conforme seu CEP')}</li>
                  <li>{t('terms.sections.shipping.item3', 'Código de rastreamento enviado por e-mail após despacho')}</li>
                  <li>{t('terms.sections.shipping.item4', 'Não nos responsabilizamos por atrasos causados por greves ou força maior')}</li>
                </ul>
              </Section>

              {/* Section 5: Returns */}
              <Section icon={RotateCcw} title={t('terms.sections.returns.title', 'Trocas e Devoluções')}>
                <p>{t('terms.sections.returns.intro', 'Em conformidade com o Código de Defesa do Consumidor:')}</p>
                <ul className="list-disc list-inside space-y-2 text-white/60">
                  <li>{t('terms.sections.returns.item1', 'Prazo de 7 dias corridos para arrependimento (a partir do recebimento)')}</li>
                  <li>{t('terms.sections.returns.item2', 'Produto deve estar em condições originais, com etiquetas')}</li>
                  <li>{t('terms.sections.returns.item3', 'Primeira troca gratuita; demais sujeitas a frete')}</li>
                  <li>{t('terms.sections.returns.item4', 'Reembolso processado em até 10 dias úteis após recebimento do produto')}</li>
                </ul>
                <p className="mt-4">{t('terms.sections.returns.contact', 'Para solicitar troca ou devolução, entre em contato pelo e-mail abaixo.')}</p>
              </Section>

              {/* Section 6: Intellectual Property */}
              <Section icon={Scale} title={t('terms.sections.ip.title', 'Propriedade Intelectual')}>
                <p>{t('terms.sections.ip.p1', 'Todo o conteúdo do site — incluindo textos, imagens, logotipos, designs e código — é propriedade da INSANYCK e protegido por leis de direitos autorais.')}</p>
                <p>{t('terms.sections.ip.p2', 'É proibida a reprodução, distribuição ou uso comercial sem autorização expressa por escrito.')}</p>
              </Section>

              {/* Section 7: Liability */}
              <Section icon={AlertCircle} title={t('terms.sections.liability.title', 'Limitação de Responsabilidade')}>
                <p>{t('terms.sections.liability.p1', 'A INSANYCK não se responsabiliza por:')}</p>
                <ul className="list-disc list-inside space-y-2 text-white/60">
                  <li>{t('terms.sections.liability.item1', 'Danos indiretos decorrentes do uso do site')}</li>
                  <li>{t('terms.sections.liability.item2', 'Interrupções temporárias por manutenção')}</li>
                  <li>{t('terms.sections.liability.item3', 'Ações de terceiros ou força maior')}</li>
                </ul>
              </Section>

              {/* Section 8: Changes */}
              <Section icon={FileText} title={t('terms.sections.changes.title', 'Alterações nos Termos')}>
                <p>{t('terms.sections.changes.p1', 'Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão comunicadas por e-mail ou aviso no site. O uso continuado após alterações implica aceitação.')}</p>
              </Section>

              {/* Contact */}
              <Section icon={Mail} title={t('terms.sections.contact.title', 'Contato')}>
                <p>{t('terms.sections.contact.intro', 'Para dúvidas sobre estes termos ou qualquer assunto relacionado:')}</p>
                <a
                  href="mailto:contato@insanyck.com"
                  className="inline-flex items-center gap-2 mt-2 text-white/80 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  contato@insanyck.com
                </a>
              </Section>

            </motion.div>

            {/* Footer Navigation */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm"
            >
              <Link
                href="/privacidade"
                className="text-white/50 hover:text-white/80 transition-colors"
              >
                {t('common.viewPrivacy', 'Ver Política de Privacidade')} →
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
