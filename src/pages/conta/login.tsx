// INSANYCK STEP 8
import { GetServerSideProps } from "next";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getServerSession } from "next-auth/next";
import { createAuthOptions } from "../api/auth/[...nextauth]";
import { signIn } from "next-auth/react";
import { useTranslation } from "next-i18next";

export default function LoginPage() {
  const { t } = useTranslation(["account"]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Exemplo: credentials fake (ajuste conforme seu [...nextauth])
    await signIn("credentials", { redirect: true, callbackUrl: "/conta" });
  };

  return (
    <>
      <Head>
        <title>{t("account:login.title", "Entrar")} — INSANYCK</title>
      </Head>
      <section className="pt-[120px] pb-16">
        <div className="mx-auto max-w-[480px] px-6">
          <div className="rounded-2xl border border-white/10 bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-6">
            <h1 className="text-2xl font-semibold text-white/90">{t("account:login.title", "Entrar")}</h1>
            <p className="mt-2 text-white/70">{t("account:login.subtitle", "Acesse sua conta INSANYCK")}</p>

            <form className="mt-6 space-y-4" onSubmit={onLogin}>
              <label className="block">
                <span className="text-white/70 text-sm">{t("account:login.email", "E-mail")}</span>
                <input className="mt-1 w-full bg-transparent border border-white/15 rounded-lg px-3 py-2 outline-none text-white placeholder:text-white/40 focus:border-white/30" type="email" required />
              </label>
              <label className="block">
                <span className="text-white/70 text-sm">{t("account:login.password", "Senha")}</span>
                <input className="mt-1 w-full bg-transparent border border-white/15 rounded-lg px-3 py-2 outline-none text-white placeholder:text-white/40 focus:border-white/30" type="password" required />
              </label>
              <button className="w-full px-3 py-2 rounded-lg border border-white/15 text-white/90 hover:text-black hover:bg-white transition">
                {t("account:login.submit", "Entrar")}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const authOptions = await createAuthOptions();
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (session?.user?.id) {
    return { redirect: { destination: "/conta", permanent: false }, props: {} as any };
  }
  return {
    props: await serverSideTranslations(ctx.locale ?? "pt", ["common", "nav", "account"]),
  };
};
