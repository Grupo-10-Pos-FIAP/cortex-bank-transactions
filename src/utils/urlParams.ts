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

/**
 * Atualiza os parâmetros da URL e dispara evento de navegação
 */
export function updateUrlParams(
  params: Record<string, string | null>,
  dispatchEvent = true
): void {
  if (typeof window === "undefined" || !window.history) {
    return;
  }

  const url = new URL(window.location.href);
  Object.entries(params).forEach(([key, value]) => {
    if (value === null) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });

  window.history.replaceState({}, "", url.toString());

  if (dispatchEvent) {
    setTimeout(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    }, 0);
  }
}

