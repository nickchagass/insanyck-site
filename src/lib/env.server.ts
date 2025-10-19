// INSANYCK STEP 11 — ENV Server-Only Validation with Zod
import { z } from 'zod';

// Server-only environment schema
const serverEnvSchema = z.object({
  // Stripe (required for checkout/webhook)
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),
  STRIPE_API_VERSION: z.string().default('2025-07-30.basil'),
  
  // Auth (required for NextAuth)
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  
  // Database (required for Prisma)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // INSANYCK STEP C-fix — backend toggle
  BACKEND_DISABLED: z.enum(["0","1"]).default("0"),
  
  // URLs (must be coherent)
  NEXT_PUBLIC_URL: z.string().url('NEXT_PUBLIC_URL must be a valid URL'),
  
  // Optional
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Parse and validate environment variables once
let _env: z.infer<typeof serverEnvSchema> | null = null;

export const env = (() => {
  if (_env) return _env;
  
  try {
    _env = serverEnvSchema.parse(process.env);
    
    // Validate coherence between URLs
    if (_env.NODE_ENV === 'production') {
      const nextAuthUrl = new URL(_env.NEXTAUTH_URL);
      const publicUrl = new URL(_env.NEXT_PUBLIC_URL);
      
      if (nextAuthUrl.origin !== publicUrl.origin) {
        throw new Error('NEXTAUTH_URL and NEXT_PUBLIC_URL must have the same origin in production');
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