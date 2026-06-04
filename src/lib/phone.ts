export function getBrazilianPhoneDigits(value: string): string {
  let digits = value.replace(/\D/g, "");

  if (digits.length > 11 && digits.startsWith("55")) {
    digits = digits.slice(2);
  }

  return digits;
}

export function formatBrazilianPhone(value: string): string {
  const digits = getBrazilianPhoneDigits(value);
  if (!digits) return value;

  const ddd = digits.slice(0, 2);
  const local = digits.slice(2);

  if (digits.length === 10) {
    return `(${ddd}) ${local.slice(0, 4)}-${local.slice(4)}`;
  }

  if (digits.length === 11) {
    return `(${ddd}) ${local.slice(0, 5)}-${local.slice(5)}`;
  }

  return value;
}

export function isValidBrazilianPhone(value: string): boolean {
  const length = getBrazilianPhoneDigits(value).length;
  return length === 10 || length === 11;
}
