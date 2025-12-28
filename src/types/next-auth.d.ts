// INSANYCK AUTH-01 — NextAuth Type Augmentation (Enterprise-Grade)
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// Extend User interface to include custom fields from Prisma
declare module "next-auth" {
  /**
   * Session type with INSANYCK custom fields
   * - id: User ID from database (always present after auth)
   * - role: User role (customer|admin) from Prisma
   */
  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"];
  }

  /**
   * User type with INSANYCK custom fields
   * Matches Prisma User model structure
   */
  interface User extends DefaultUser {
    id: string;
    role?: string;
  }
}

// Extend JWT to persist custom fields between requests
declare module "next-auth/jwt" {
  /**
   * JWT token with INSANYCK custom fields
   * These are persisted across session refreshes
   */
  interface JWT extends DefaultJWT {
    id?: string;
    role?: string;
    provider?: string; // OAuth provider (google, etc.)
  }
}
