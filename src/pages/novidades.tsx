// src/pages/novidades.tsx
// INSANYCK NEWS-MUSEUM — Editorial Updates & Collections
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Tag,
} from 'lucide-react';
import { seoNews } from '@/lib/seo';

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

// News card component
function NewsCard({
  title,
  description,
  date,
  tag,
  href,
}: {
  title: string;
  description: string;
  date: string;
  tag: string;
  href: string;
}) {
  return (
    <motion.article variants={itemVariants}>
      <Link
        href={href}
        className="block glass-card-museum p-6 hover:border-white/[0.12] transition-all duration-300 group"
      >
        {/* Tag & Date */}
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/60 text-[0.7rem] font-medium tracking-wide uppercase">
            <Tag className="w-3 h-3" strokeWidth={2} />
            {tag}
          </span>
          <span className="text-white/40 text-xs flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {date}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white/90 mb-3 group-hover:text-white transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-white/60 text-sm leading-relaxed mb-4">
          {description}
        </p>

        {/* CTA */}
        <div className="flex items-center gap-2 text-white/50 group-hover:text-white/80 transition-colors text-sm font-medium">
          <span>Ler mais</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
        </div>
      </Link>
    </motion.article>
  );
}

export default function NewsPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const locale = router.locale || 'pt';

  // Mock news items (real content, ready for CMS)
  const newsItems = locale === 'en' ? [
    {
      title: 'New Luxury Noir Collection Launch',
      description: 'Discover our latest pieces combining architectural design with premium materials. Limited units available.',
      date: 'Dec 2025',
      tag: 'Collection',
      href: '/colecao',
    },
    {
      title: 'Behind the Craftsmanship',
      description: 'Explore the meticulous process behind each INSANYCK piece. From material selection to final finishing.',
      date: 'Dec 2025',
      tag: 'Editorial',
      href: '/manifesto',
    },
    {
      title: 'Premium Drop System',
      description: 'Learn how our controlled release model ensures exclusivity and traceability for every customer.',
      date: 'Nov 2025',
      tag: 'Culture',
      href: '/loja',
    },
    {
      title: 'Engineering Identity',
      description: 'INSANYCK is not fashion—it\'s architecture. Read our manifesto on luxury as precision.',
      date: 'Nov 2025',
      tag: 'Manifesto',
      href: '/manifesto',
    },
  ] : [
    {
      title: 'Lançamento Nova Coleção Luxury Noir',
      description: 'Descubra nossas últimas peças combinando design arquitetônico e materiais premium. Unidades limitadas.',
      date: 'Dez 2025',
      tag: 'Coleção',
      href: '/colecao',
    },
    {
      title: 'Por Trás do Acabamento',
      description: 'Explore o processo meticuloso por trás de cada peça INSANYCK. Da seleção de material ao acabamento final.',
      date: 'Dez 2025',
      tag: 'Editorial',
      href: '/manifesto',
    },
    {
      title: 'Sistema de Drops Premium',
      description: 'Entenda como nosso modelo de lançamento controlado garante exclusividade e rastreabilidade para cada cliente.',
      date: 'Nov 2025',
      tag: 'Cultura',
      href: '/loja',
    },
    {
      title: 'Engenharia de Identidade',
      description: 'INSANYCK não é moda—é arquitetura. Leia nosso manifesto sobre luxo como precisão.',
      date: 'Nov 2025',
      tag: 'Manifesto',
      href: '/manifesto',
    },
  ];

  const seo = seoNews(locale);

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        {seo.meta.map((meta, i) => (
          <meta key={i} {...meta} />
        ))}
        {seo.link.map((link, i) => (
          <link key={i} {...link} />
        ))}
        {seo.jsonLd && seo.jsonLd.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </Head>

      {/* === MUSEUM ATMOSPHERE === */}
      <main className="museum-atmosphere min-h-screen">
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 sm:py-32">

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
                {locale === 'en' ? 'Back to Home' : 'Voltar ao início'}
              </Link>
            </motion.div>

            {/* === HEADER CARD === */}
            <motion.div
              variants={itemVariants}
              className="glass-card-museum p-8 sm:p-10 mb-12"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-white/70" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-3">
                {locale === 'en' ? 'News & Updates' : 'Novidades'}
              </h1>

              {/* Subtitle */}
              <p className="text-white/60 text-lg">
                {locale === 'en'
                  ? 'Editorial content, collections, and cultural insights from INSANYCK.'
                  : 'Conteúdo editorial, coleções e insights culturais da INSANYCK.'}
              </p>
            </motion.div>

            {/* === NEWS GRID === */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
            >
              {newsItems.map((item, index) => (
                <NewsCard key={index} {...item} />
              ))}
            </motion.div>

            {/* === EXPLORE MORE === */}
            <motion.div
              variants={itemVariants}
              className="glass-card-museum p-8 text-center"
            >
              <h2 className="text-xl font-semibold text-white mb-4">
                {locale === 'en' ? 'Explore INSANYCK' : 'Explore a INSANYCK'}
              </h2>
              <p className="text-white/60 mb-6 max-w-2xl mx-auto">
                {locale === 'en'
                  ? 'Dive deeper into our world. Discover the collection, read our manifesto, or browse the full catalog.'
                  : 'Mergulhe mais fundo no nosso universo. Descubra a coleção, leia nosso manifesto ou navegue pelo catálogo completo.'}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/colecao"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.12] text-white font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)]"
                >
                  {locale === 'en' ? 'View Collection' : 'Ver Coleção'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/loja"
                  className="text-white/70 hover:text-white transition-colors text-sm font-medium"
                >
                  {locale === 'en' ? 'Browse Store' : 'Explorar Loja'} →
                </Link>
              </div>
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
      ...(await serverSideTranslations(locale ?? 'pt', ['common'])),
    },
  };
};
