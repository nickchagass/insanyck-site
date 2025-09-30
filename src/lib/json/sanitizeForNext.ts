// Remove undefined e funções; converte Date para ISO; mantém null quando necessário.
// Garante compatibilidade com devalue/Next.
export function sanitizeForNext<T>(input: T): T {
  return JSON.parse(JSON.stringify(input, (_k, v) => {
    if (typeof v === 'undefined') return undefined; // JSON.stringify já remove
    if (v instanceof Date) return v.toISOString();
    if (typeof v === 'function') return undefined;
    return v;
  }));
}