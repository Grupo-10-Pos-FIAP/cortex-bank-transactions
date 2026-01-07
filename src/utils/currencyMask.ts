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

  // Remove pontos (separadores de milhar) e substitui vírgula por ponto
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

  // Formata com separador de milhar (.) e decimal (,)
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
  // Se o valor estiver vazio, retorna vazio
  if (!value || value.trim() === "") {
    return "";
  }

  // Remove tudo que não é número
  const numbers = removeNonNumeric(value);

  if (numbers === "") {
    return "";
  }

  // Converte para número inteiro (representa centavos)
  const number = parseInt(numbers, 10);

  if (isNaN(number)) {
    return "";
  }

  // Divide por 100 para ter os decimais
  const valueWithDecimals = number / 100;

  // Formata com máscara brasileira
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

  // Remove pontos (separadores de milhar) e substitui vírgula por ponto
  const cleaned = value.replace(/\./g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) {
    return "0.00";
  }

  // Garante 2 casas decimais
  return parsed.toFixed(2);
}

