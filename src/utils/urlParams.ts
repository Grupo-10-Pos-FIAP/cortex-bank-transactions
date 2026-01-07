/**
 * Utilitários para trabalhar com parâmetros da URL
 */

/**
 * Obtém um parâmetro da query string da URL
 */
export function getQueryParam(name: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * Obtém o ID da transação da URL (query param 'id')
 */
export function getTransactionIdFromUrl(): string | null {
  return getQueryParam("id");
}

/**
 * Obtém o parâmetro 'view' da URL para determinar qual tela exibir
 */
export function getViewParamFromUrl(): string | null {
  return getQueryParam("view");
}

