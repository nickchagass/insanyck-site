// src/lib/backendGuard.ts
export const backendDisabled = process.env.INSANYCK_DISABLE_BACKEND === "1";

export function missingEnv(...keys: string[]) {
  const absent = keys.filter(k => !process.env[k] || process.env[k] === "");
  return { ok: absent.length === 0, absent };
}