// INSANYCK STEP C-fix — backendGuard unificado
import { isBackendDisabled } from "./env.server";

export const backendDisabled = isBackendDisabled();

export function missingEnv(...keys: string[]) {
  const absent = keys.filter(k => !process.env[k] || process.env[k] === "");
  return { ok: absent.length === 0, absent };
}