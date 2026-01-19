/**
 * Utilitários para máscara de moeda
 * Formato brasileiro: vírgula para decimais (ex: 1.234,56)
 * Backend espera: ponto para decimais (ex: 1234.56)
 */

import { formatValue } from "./formatters";

/**
 * Remove todos os caracteres não numéricos
 */
function removeNonNumeric(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Converte string com vírgula para número (formato brasileiro para número)
 * Ex: "1.234,56" -> 1234.56
 */
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

/**
 * Formata número para string com máscara brasileira (sem símbolo de moeda)
 * Ex: 1234.56 -> "1.234,56"
 * Usa formatValue de formatters.ts para manter consistência
 */
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

/**
 * Aplica máscara de moeda brasileira enquanto o usuário digita
 * Ex: "1234" -> "12,34" -> "1.234,56"
 * Permite que o usuário digite números e formata automaticamente
 */
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
