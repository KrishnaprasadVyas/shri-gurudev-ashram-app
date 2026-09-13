export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function normalizePhoneNumber(value: string): string {
  if (!value) return '';
  let cleaned = value.replace(/[^\d]/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }
  return cleaned.slice(0, 10);
}

export function isValidPhoneNumber(value: string) {
  const normalized = normalizePhoneNumber(value);
  return /^[6-9]\d{9}$/.test(normalized);
}

export function isValidAadhaarNumber(value: string) {
  return /^\d{12}$/.test(value.trim());
}

export function normalizeDigits(value: string, maxLength: number) {
  const cleaned = value.replace(/[^\d]/g, "");
  if (maxLength === 10) {
    return normalizePhoneNumber(cleaned);
  }
  return cleaned.slice(0, maxLength);
}

export function isNonEmptyString(value: string) {
  return value.trim().length > 0;
}

export function isValidPanNumber(value: string) {
  return /^[A-Z]{5}\d{4}[A-Z]$/.test(value.trim().toUpperCase());
}
