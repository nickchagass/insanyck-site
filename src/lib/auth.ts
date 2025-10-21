// INSANYCK FASE D — NextAuth options centralizados
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { sendSignInEmail } from "@/lib/email";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      async sendVerificationRequest({ identifier, url }) {
        const locale = 'pt' as const;
        await sendSignInEmail({ to: identifier, url, locale });
      },
      maxAge: 10 * 60, // 10min
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: { 
    strategy: 'jwt', 
    maxAge: 30 * 24 * 60 * 60, // 30d
    updateAge: 24 * 60 * 60 // 24h
  },
  pages: { 
    signIn: '/conta/login', 
    verifyRequest: '/conta/verify' 
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        (session as any).user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    async signIn() {
      return true; // TODO: whitelist futura
    }
  },
  cookies: process.env.NODE_ENV === 'production' ? {
    callbackUrl: { 
      name: 'next-auth.callback-url', 
      options: { sameSite: 'lax', secure: true }
    },
    sessionToken: {
      name: 'next-auth.session-token',
      options: { sameSite: 'lax', secure: true }
    }
  } : undefined,
};