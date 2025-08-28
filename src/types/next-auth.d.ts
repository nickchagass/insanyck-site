// INSANYCK — NextAuth augmentations
import NextAuth, { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & { id?: string | null };
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id?: string | null;
  }
}
