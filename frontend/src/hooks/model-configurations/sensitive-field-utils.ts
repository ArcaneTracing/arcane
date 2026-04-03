
export const SENSITIVE_PLACEHOLDER = "********";


export function isMaskedSensitiveValue(value: string): boolean {
  if (!value?.trim()) return false;
  if (["****", SENSITIVE_PLACEHOLDER, "••••••••"].includes(value)) return true;
  return /^.{4,8}\.\.\.\w{3,5}$/.test(value);
}