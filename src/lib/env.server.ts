// INSANYCK STEP 11 — ENV Server-Only Validation with Zod
import { z } from 'zod';

// Server-only environment schema
const serverEnvSchema = z.object({
  // Stripe (required for checkout/webhook)
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),
  STRIPE_API_VERSION: z.string().default('2025-07-30.basil'),

  // INSANYCK FASE F-01 — Mercado Pago (payment provider alternativo)
  MP_ACCESS_TOKEN: z.string().default(''),
  MP_PUBLIC_KEY: z.string().default(''),
  MP_NOTIFICATION_URL: z.string().default(''),
  // INSANYCK FASE F-04 — Segurança do webhook MP
  MP_WEBHOOK_SECRET: z.string().default(''),

  // Auth (required for NextAuth)
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),

  // INSANYCK AUTH-01 — Google OAuth (optional in dev, required in prod)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Database (required for Prisma)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // INSANYCK STEP C-fix — backend toggle
  BACKEND_DISABLED: z.enum(["0","1"]).default("0"),

  // INSANYCK HOTFIX VAULT-PROD-01 — Canonical env contract
  // NEXT_PUBLIC_SITE_URL is canonical (required in prod, used by checkout/webhooks)
  // NEXT_PUBLIC_URL is legacy fallback for backward compatibility
  NEXT_PUBLIC_SITE_URL: z.string().optional(),
  NEXT_PUBLIC_URL: z.string().optional(),

  // Optional
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Parse and validate environment variables once
let _env: z.infer<typeof serverEnvSchema> | null = null;

// INSANYCK HOTFIX VAULT-PROD-01 — Resolve canonical base URL
export const getCanonicalBaseUrl = (): string => {
  // Canonical: NEXT_PUBLIC_SITE_URL (used by checkout/webhooks)
  // Fallback: NEXT_PUBLIC_URL (legacy)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const legacyUrl = process.env.NEXT_PUBLIC_URL?.trim();
  const resolved = siteUrl || legacyUrl;

  // INSANYCK HOTFIX VAULT-PROD-01.1 — Distinguish build-time vs runtime
  // During build, allow localhost (user may be building locally)
  // At runtime in production (Vercel/deployed), reject localhost
  const isDeployedProd = process.env.NODE_ENV === 'production' &&
    (process.env.VERCEL === '1' || process.env.RAILWAY_ENVIRONMENT || process.env.RENDER);

  // Strict validation only in deployed production
  if (isDeployedProd && resolved) {
    if (!resolved.startsWith('https://')) {
      throw new Error(
        `[INSANYCK][ENV] Production URL must use https://. Got: ${resolved}`
      );
    }
    if (resolved.includes('localhost')) {
      throw new Error(
        `[INSANYCK][ENV] Production URL cannot be localhost. Got: ${resolved}`
      );
    }
  }

  // Fallback handling
  const fallback = process.env.NODE_ENV === 'production'
    ? 'https://insanyck.com'
    : 'http://localhost:3000';

  return (resolved || fallback).replace(/\/$/, '');
};

export const env = (() => {
  if (_env) return _env;

  try {
    _env = serverEnvSchema.parse(process.env);

    // INSANYCK HOTFIX VAULT-PROD-01 — Validate canonical base URL
    const baseUrl = getCanonicalBaseUrl();

    // Validate coherence between NEXTAUTH_URL and public base URL
    if (_env.NODE_ENV === 'production') {
      const nextAuthUrl = new URL(_env.NEXTAUTH_URL);
      const publicUrl = new URL(baseUrl);

      if (nextAuthUrl.origin !== publicUrl.origin) {
        throw new Error(
          `[INSANYCK][ENV] NEXTAUTH_URL and base URL must have same origin in production.\n` +
          `  NEXTAUTH_URL: ${nextAuthUrl.origin}\n` +
          `  Base URL:     ${publicUrl.origin}`
        );
      }
    }

    // Environment validation successful (log removed for ESLint)

    return _env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[INSANYCK][ENV] Environment validation failed:');
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error('[INSANYCK][ENV] Environment error:', error);
    }
    
    throw new Error('Invalid environment configuration');
  }
})();

// INSANYCK STEP C-fix — backend toggle helper
export const isBackendDisabled = () => env.BACKEND_DISABLED === "1";

// Helper to check if server env is ready
export const isServerEnvReady = () => {
  try {
    return !!env;
  } catch {
    return false;
  }
};

// INSANYCK AUTH-01 — Helper to verify if Google OAuth is configured
export function isGoogleConfigured(): boolean {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}