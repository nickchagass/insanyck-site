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
  // INSANYCK AUTH-03-RESEND-LUXURY — Luxury magic link email
  EmailProvider({
    async sendVerificationRequest({ identifier, url }) {
      // INSANYCK AUTH-03: Locale inference from URL (automatic)
      // Path /en or query ?lng=en → 'en', otherwise → 'pt'
      // Locale is inferred inside sendSignInEmail

      try {
        await sendSignInEmail({
          to: identifier,
          url,
          // locale is auto-inferred from URL in email.ts
        });
      } catch (error) {
        // INSANYCK AUTH-03: Fail-open pattern — log but don't crash
        // Structured logging (NO sensitive data)
        console.error(JSON.stringify({
          event: 'auth:verification_email_error',
          error: error instanceof Error ? error.message : 'Unknown',
          timestamp: new Date().toISOString(),
        }));

        // Don't re-throw — fail gracefully
        // User will see generic "check your email" message
        // This prevents auth flow from breaking if email service is down
      }
    },
    maxAge: 10 * 60, // 10 minutes (must match email copy)
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
