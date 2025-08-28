// pages/api/auth/[...nextauth].ts
// INSANYCK — NextAuth lazy + guards (Pages Router)
import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { backendDisabled, missingEnv } from "@/lib/backendGuard";

// 1) Lazy options (não toca env/prisma no import-time)
export async function createAuthOptions(): Promise<NextAuthOptions> {
  if (backendDisabled) throw new Error("Backend disabled for preview/dev");

  const need = missingEnv("NEXTAUTH_SECRET", "DATABASE_URL");
  if (!need.ok) throw new Error(`Missing env: ${need.absent.join(", ")}`);

  const { PrismaAdapter } = await import("@next-auth/prisma-adapter");
  const { prisma } = await import("@/lib/prisma");
  const { env } = await import("@/lib/env.server");

  return {
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    secret: env.NEXTAUTH_SECRET,
    pages: { signIn: "/conta/login", error: "/conta/login" },
    providers: [
      Credentials({
        name: "Email",
        credentials: { email: { label: "Email", type: "email" } },
        async authorize(creds) {
          const email = creds?.email?.toLowerCase().trim();
          if (!email) return null;
          const { prisma } = await import("@/lib/prisma");
          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({ data: { email, name: email.split("@")[0] } });
          }
          return { id: user.id, name: user.name, email: user.email, image: user.image ?? null };
        },
      }),
    ],
    callbacks: {
      jwt({ token, user }) {
        if (user) (token as any).id = (user as any).id;
        return token;
      },
      session({ session, token }) {
        if (session.user && (token as any).id) (session.user as any).id = (token as any).id;
        return session;
      },
    },
  };
}

// 2) Handler dinâmico (Pages Router)
export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "HEAD") return res.status(200).end();
    const options = await createAuthOptions();
    // NextAuth aceita (req, res, options) no Pages Router
    // @ts-ignore – assinatura aceita em runtime
    return NextAuth(req, res, options);
  } catch (e: any) {
    return res.status(503).json({ error: "Auth unavailable", detail: e?.message });
  }
}
