import { formatValue } from "./formatters";

function removeNonNumeric(value: string): string {
  return value.replace(/\D/g, "");
}

export function parseCurrency(value: string): number {
  if (!value || value.trim() === "") {
    return 0;
  }

  const trimmed = value.trim();
  let cleaned = trimmed.replace(/[R$\s]/g, "");
  cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? 0 : parsed;
}

function formatCurrencyValue(value: number | string): string {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return "";
  }

  return formatValue(numValue);
}

export function applyCurrencyMask(value: string): string {
  if (!value || value.trim() === "") {
    return "";
  }

  const numbers = removeNonNumeric(value);

  if (numbers === "") {
    return "";
  }

  const number = parseInt(numbers, 10);

  if (isNaN(number)) {
    return "";
  }

  const valueWithDecimals = number / 100;

  return formatCurrencyValue(valueWithDecimals);
}
