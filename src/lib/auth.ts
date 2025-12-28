// INSANYCK AUTH-01 — NextAuth Enterprise Configuration (Surgical Refactor)
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { sendSignInEmail } from "@/lib/email";
import { env, isGoogleConfigured } from "@/lib/env.server";

/**
 * Build providers array dynamically based on environment configuration
 * Email provider is always enabled; Google OAuth only if credentials are configured
 */
const providers: NextAuthOptions["providers"] = [
  // Email Magic Link Provider (always enabled)
  EmailProvider({
    async sendVerificationRequest({ identifier, url }) {
      // INSANYCK AUTH-01: Locale detection
      // TODO: In future, detect from Accept-Language header or user preferences
      // For now, default to Portuguese (primary market)
      const locale = "pt" as const;

      try {
        await sendSignInEmail({ to: identifier, url, locale });
      } catch (error) {
        // INSANYCK AUTH-01: Log detailed error for debugging (server-side only)
        console.error("[INSANYCK AUTH] Failed to send verification email:", {
          to: identifier,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        });

        // Re-throw with user-friendly message (NextAuth will show to user)
        throw new Error(
          "Unable to send verification email. Please try again."
        );
      }
    },
    maxAge: 10 * 60, // 10 minutes (security best practice)
  }),
];

// INSANYCK AUTH-01: Add Google OAuth provider only if credentials are configured (avoid crash in dev)
if (isGoogleConfigured()) {
  providers.push(
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
      // Improve UX: always show account picker (prevent auto-login to wrong account)
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    })
  );
}

/**
 * NextAuth configuration with enterprise-grade security and type safety
 */
export const authOptions: NextAuthOptions = {
  // INSANYCK AUTH-01: Prisma adapter with proper type assertion
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],

  providers,

  // JWT session strategy (more performant than database sessions)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Refresh token every 24 hours
  },

  // Custom pages
  pages: {
    signIn: "/conta/login",
    verifyRequest: "/conta/verify",
    error: "/conta/login", // Redirect errors to login with ?error param
  },

  // INSANYCK AUTH-01: Type-safe callbacks (no more `any` casts!)
  // Types come from src/types/next-auth.d.ts
  callbacks: {
    /**
     * JWT callback: populate token with user data on first sign-in
     * Runs on sign-in and token refresh
     */
    async jwt({ token, user, account }) {
      // First sign-in: populate token with user data
      if (user) {
        token.id = user.id;
        token.role = user.role || "customer"; // Default role from Prisma schema
      }

      // OAuth sign-in: save provider for analytics
      if (account) {
        token.provider = account.provider;
      }

      return token;
    },

    /**
     * Session callback: expose token data to client
     * Type-safe thanks to type augmentation in src/types/next-auth.d.ts
     */
    async session({ session, token }) {
      // INSANYCK AUTH-01: Populate session.user with data from JWT token (TYPE-SAFE!)
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string | undefined;
      }

      return session;
    },

    /**
     * Sign-in callback: validate user before allowing authentication
     * Return false to deny access
     */
    async signIn({ user, account }) {
      // INSANYCK AUTH-01: Hook for future validations
      // Examples: whitelist of domains, corporate email verification, etc.

      if (env.NODE_ENV === "development") {
        console.log("[INSANYCK AUTH] Sign in:", {
          email: user.email,
          provider: account?.provider,
        });
      }

      return true;
    },
  },

  // INSANYCK AUTH-01: Production-grade cookie configuration
  cookies:
    env.NODE_ENV === "production"
      ? {
          // Session token cookie (main authentication cookie)
          sessionToken: {
            name: "__Secure-next-auth.session-token",
            options: {
              httpOnly: true,
              sameSite: "lax",
              path: "/",
              secure: true, // HTTPS only
            },
          },
          // Callback URL cookie (for redirect after sign-in)
          callbackUrl: {
            name: "__Secure-next-auth.callback-url",
            options: {
              sameSite: "lax",
              path: "/",
              secure: true,
            },
          },
          // CSRF token cookie (security)
          csrfToken: {
            name: "__Host-next-auth.csrf-token",
            options: {
              httpOnly: true,
              sameSite: "lax",
              path: "/",
              secure: true,
            },
          },
        }
      : undefined, // Development: use NextAuth defaults

  // INSANYCK AUTH-01: Event handlers for logging and analytics
  events: {
    async signIn({ user, account }) {
      if (env.NODE_ENV === "development") {
        console.log(
          "[INSANYCK AUTH] ✓ User signed in:",
          user.email,
          "via",
          account?.provider || "email"
        );
      }
      // TODO: Future enhancements:
      // - Save lastLoginAt timestamp in database
      // - Send analytics event
      // - Send welcome email for new users
    },

    async signOut({ token }) {
      if (env.NODE_ENV === "development") {
        console.log("[INSANYCK AUTH] ✗ User signed out:", token?.email);
      }
    },

    async createUser({ user }) {
      if (env.NODE_ENV === "development") {
        console.log("[INSANYCK AUTH] + New user created:", user.email);
      }
    },
  },

  // Enable debug logs in development only
  debug: env.NODE_ENV === "development",
};
