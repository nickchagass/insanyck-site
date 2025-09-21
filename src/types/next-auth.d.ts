// INSANYCK — NextAuth augmentations
import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface _Session {
    user?: DefaultSession["user"] & { id?: string | null };
  }
}
declare module "next-auth/jwt" {
  interface _JWT {
    id?: string | null;
  }
}
