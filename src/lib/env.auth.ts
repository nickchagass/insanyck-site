// INSANYCK AUTH-01 — Environment Variable Validation (Runtime + Fail-Fast)

/**
 * Utility to safely get environment variables with clear error messages
 * @param name - Environment variable name
 * @param required - Whether the variable is required (default: true)
 * @returns The environment variable value, or empty string if optional and not set
 * @throws Error with clear message if required variable is missing
 */
function getEnvVar(name: string, required: boolean = true): string {
  const value = process.env[name];

  if (required && !value) {
    throw new Error(
      `[INSANYCK AUTH] Missing required environment variable: ${name}.\n` +
      `Please check your .env.local file and ensure ${name} is set.\n` +
      `For production deployment, verify all environment variables are configured.`
    );
  }

  return value || "";
}

/**
 * Validated auth environment variables
 * Fails fast at import time if required variables are missing
 */
export const authEnv = {
  // Google OAuth (optional in development, required in production)
  googleClientId: getEnvVar(
    "GOOGLE_CLIENT_ID",
    process.env.NODE_ENV === "production"
  ),
  googleClientSecret: getEnvVar(
    "GOOGLE_CLIENT_SECRET",
    process.env.NODE_ENV === "production"
  ),

  // NextAuth (always required)
  nextAuthSecret: getEnvVar("NEXTAUTH_SECRET", true),
  nextAuthUrl: getEnvVar(
    "NEXTAUTH_URL",
    process.env.NODE_ENV === "production"
  ),

  // Environment metadata
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
} as const;

/**
 * Type guard to check if Google OAuth is properly configured
 * Use this before adding GoogleProvider to avoid runtime errors
 */
export function isGoogleConfigured(): boolean {
  return Boolean(authEnv.googleClientId && authEnv.googleClientSecret);
}

/**
 * Validate that NEXTAUTH_SECRET meets minimum security requirements
 * Should be at least 32 characters for production
 */
export function validateAuthSecret(): void {
  if (authEnv.isProduction && authEnv.nextAuthSecret.length < 32) {
    console.warn(
      "[INSANYCK AUTH] WARNING: NEXTAUTH_SECRET should be at least 32 characters in production.\n" +
      "Generate a secure secret with: openssl rand -base64 32"
    );
  }
}

// Run validation on import (fail-fast in production)
if (authEnv.isProduction) {
  validateAuthSecret();
}
