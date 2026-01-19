export function getQueryParam(name: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

export function getTransactionIdFromUrl(): string | null {
  return getQueryParam("id");
}

export function getViewParamFromUrl(): string | null {
  return getQueryParam("view");
}

export function updateUrlParams(params: Record<string, string | null>, dispatchEvent = true): void {
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
