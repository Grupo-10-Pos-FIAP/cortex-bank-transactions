const ACCOUNT_ID_KEY = "accountId";

export function getAccountId(): string | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const accountId = localStorage.getItem(ACCOUNT_ID_KEY);
    return accountId || null;
  } catch (error) {
    console.error("Erro ao ler accountId do localStorage:", error);
    return null;
  }
}

export function setAccountId(accountId: string): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    localStorage.setItem(ACCOUNT_ID_KEY, accountId);
    window.dispatchEvent(new CustomEvent("accountIdChanged", { detail: { accountId } }));
  } catch (error) {
    console.error("Erro ao salvar accountId no localStorage:", error);
  }
}

export function removeAccountId(): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    localStorage.removeItem(ACCOUNT_ID_KEY);
  } catch (error) {
    console.error("Erro ao remover accountId do localStorage:", error);
  }
}
