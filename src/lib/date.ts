// INSANYCK STEP E-04 — Utilitários de data
// src/lib/date.ts

export type DateLocale = "pt-BR" | "en-US";

/**
 * Formata uma data ISO para formato local (DD/MM/YYYY ou MM/DD/YYYY)
 */
export function formatDate(dateIso: string, locale: DateLocale = "pt-BR"): string {
  return new Date(dateIso).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formata uma data ISO com horário (DD/MM/YYYY HH:MM ou MM/DD/YYYY HH:MM)
 */
export function formatDateTime(dateIso: string, locale: DateLocale = "pt-BR"): string {
  return new Date(dateIso).toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
