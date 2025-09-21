// INSANYCK — NextAuth augmentations
import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  // eslint-disable-next-line no-unused-vars
  interface Session {
    user?: DefaultSession["user"] & { id?: string | null };
  }
}
declare module "next-auth/jwt" {
  // eslint-disable-next-line no-unused-vars
  interface JWT {
    id?: string | null;
  }
}
