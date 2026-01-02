// INSANYCK STEP H0 — Admin Console Foundation
// The Black Box — CEO-only constants and metadata

/**
 * INSANYCK Console Metadata
 * Codename: "The Black Box"
 * Museum Edition admin interface
 */
export const ADMIN_CONSOLE_META = {
  name: "INSANYCK Console",
  codename: "The Black Box",
  version: "H0-Foundation",
  description: "Museum Edition administrative interface",
} as const;

/**
 * CEO ALLOWLIST (Hard-coded for H0)
 * Only these emails can access /admin/*
 *
 * SECURITY: This is the SINGLE SOURCE OF TRUTH for admin access
 * Both middleware.ts and getServerSideProps must check this list
 */
export const CEO_ALLOWLIST = new Set([
  "nicolas102001@hotmail.com",
]);

/**
 * Check if an email is in the CEO allowlist
 * @param email - Email to check (case-insensitive)
 * @returns true if email is authorized for admin access
 */
export function isCEO(email: string | null | undefined): boolean {
  if (!email) return false;
  return CEO_ALLOWLIST.has(email.toLowerCase().trim());
}

/**
 * INSANYCK STEP H1.2 — Admin Inventory Thresholds
 * Low stock warning threshold for God View catalog
 */
export const LOW_STOCK_THRESHOLD = 10;
