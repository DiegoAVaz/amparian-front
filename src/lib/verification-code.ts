// Código de verificação do certificado, do jeito que a API grava e confere.
//
// Espelha `normalizeVerificationCode` da API (`api_amparian/src/services/certificates/
// verification-code.ts`): a tela recusa na hora o que não pode ser um código, sem gastar uma das
// consultas que a verificação pública limita por IP. Quem decide no fim continua sendo a API.

// 12 símbolos de A–Z e 2–9, sem I, O, 0 e 1 — que se confundem lidos de um papel.
const VERIFICATION_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{12}$/;

/**
 * O que a pessoa digitou ("r4wt-8hzn-2qkc", com espaços, sem hífens) no formato gravado
 * ("R4WT8HZN2QKC"), ou `null` se não pode ser um código.
 */
export function normalizeVerificationCode(input: string): string | null {
  const normalized = input.replace(/[\s-]/g, "").toUpperCase();
  return VERIFICATION_CODE_PATTERN.test(normalized) ? normalized : null;
}

/** "R4WT8HZN2QKC" → "R4WT-8HZN-2QKC", como está impresso no certificado. */
export function formatVerificationCode(normalized: string): string {
  return normalized.match(/.{1,4}/g)?.join("-") ?? normalized;
}
