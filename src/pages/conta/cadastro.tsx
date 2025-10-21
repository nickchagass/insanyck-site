// INSANYCK STEP 8
import { GetServerSideProps } from "next";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { seoAccountSignup } from "@/lib/seo";

export default function SignupPage() {
  const { t } = useTranslation(["account"]);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mock: em produção, chamaria API de cadastro ou NextAuth Email
    alert(t("account:signup.mock", "Cadastro mock — configure no NextAuth"));
  };

  const seo = seoAccountSignup(router.locale);

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        {seo.meta.map((tag, i) => (
          <meta key={i} {...tag} />
        ))}
        {seo.link.map((l, i) => (
          <link key={i} {...l} />
        ))}
      </Head>
      <section className="pt-[120px] pb-16">
        <div className="mx-auto max-w-[480px] px-6">
          <div className="rounded-2xl border border-white/10 bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-6">
            <h1 className="text-2xl font-semibold text-white/90">{t("account:signup.title", "Criar conta")}</h1>
            <p className="mt-2 text-white/70">{t("account:signup.subtitle", "Junte-se à INSANYCK")}</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <label className="block">
                <span className="text-white/70 text-sm">{t("account:signup.name", "Nome completo")}</span>
                <input className="mt-1 w-full bg-transparent border border-white/15 rounded-lg px-3 py-2 outline-none text-white placeholder:text-white/40 focus:border-white/30" required />
              </label>
              <label className="block">
                <span className="text-white/70 text-sm">{t("account:signup.email", "E-mail")}</span>
                <input type="email" className="mt-1 w-full bg-transparent border border-white/15 rounded-lg px-3 py-2 outline-none text-white placeholder:text-white/40 focus:border-white/30" required />
              </label>
              <label className="block">
                <span className="text-white/70 text-sm">{t("account:signup.password", "Senha")}</span>
                <input type="password" className="mt-1 w-full bg-transparent border border-white/15 rounded-lg px-3 py-2 outline-none text-white placeholder:text-white/40 focus:border-white/30" required />
              </label>
              <button className="w-full px-3 py-2 rounded-lg border border-white/15 text-white/90 hover:text-black hover:bg-white transition">
                {t("account:signup.submit", "Criar conta")}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (session?.user?.id) {
    return { redirect: { destination: "/conta", permanent: false }, props: {} as any };
  }
  return {
    props: await serverSideTranslations(ctx.locale ?? "pt", ["common", "nav", "account"]),
  };
};
