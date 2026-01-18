/**
 * Utilitários para máscara de moeda
 * Formato brasileiro: vírgula para decimais (ex: 1.234,56)
 * Backend espera: ponto para decimais (ex: 1234.56)
 */

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

  const cleaned = value.replace(/\./g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formata número para string com máscara brasileira
 * Ex: 1234.56 -> "1.234,56"
 */
export function formatCurrency(value: number | string): string {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return "";
  }

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
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

  return formatCurrency(valueWithDecimals);
}

/**
 * Converte valor formatado (com vírgula) para o formato do backend (com ponto)
 * Ex: "1.234,56" -> "1234.56"
 */
export function convertToBackendFormat(value: string): string {
  if (!value || value.trim() === "") {
    return "0.00";
  }

  const cleaned = value.replace(/\./g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) {
    return "0.00";
  }

  return parsed.toFixed(2);
}

