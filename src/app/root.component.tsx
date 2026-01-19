import React, { useState, useEffect, useCallback } from "react";
import { Text, Loading, Button, Card } from "@grupo10-pos-fiap/design-system";
import { getAccountId } from "@/utils/accountStorage";
import {
  getTransactionIdFromUrl,
  getViewParamFromUrl,
} from "@/utils/urlParams";
import Transactions from "../Transactions";
import TransactionDetails from "../components/TransactionDetails";
import { QueryProvider } from "../providers/QueryProvider";
import styles from "./root.component.module.css";
import "../styles/tokens.css";

export interface RootProps {
  name?: string;
}

export default function Root(_props: RootProps) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loadingAccount, setLoadingAccount] = useState<boolean>(true);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [view, setView] = useState<string | null>(null);

  const loadAccountId = useCallback(() => {
    setLoadingAccount(true);
    const storedAccountId = getAccountId();
    setAccountId(storedAccountId);
    setLoadingAccount(false);
  }, []);

  useEffect(() => {
    loadAccountId();
  }, [loadAccountId]);

  useEffect(() => {
    const handleAccountIdChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ accountId: string }>;
      const newAccountId = customEvent.detail?.accountId || getAccountId();
      if (newAccountId) {
        setAccountId((currentId) => {
          if (currentId !== newAccountId) {
            setLoadingAccount(false);
            return newAccountId;
          }
          return currentId;
        });
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "accountId") {
        const newAccountId = e.newValue || getAccountId();
        if (newAccountId) {
          setAccountId((currentId) => {
            if (currentId !== newAccountId) {
              setLoadingAccount(false);
              return newAccountId;
            }
            return currentId;
          });
        }
      }
    };

    window.addEventListener("accountIdChanged", handleAccountIdChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("accountIdChanged", handleAccountIdChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [accountId]);

  useEffect(() => {
    const updateUrlParams = () => {
      try {
        const newId = getTransactionIdFromUrl();
        const newView = getViewParamFromUrl();
        setTransactionId(newId);
        setView(newView);
      } catch (error) {
        console.error("Erro ao ler parâmetros da URL:", error);
      }
    };

    updateUrlParams();

    const timeoutId = setTimeout(updateUrlParams, 100);

    const handlePopState = () => {
      updateUrlParams();
    };

    const handleSingleSpaRouteChange = () => {
      setTimeout(updateUrlParams, 0);
    };

    const handleHashChange = () => {
      updateUrlParams();
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener(
      "single-spa:routing-event",
      handleSingleSpaRouteChange
    );

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener(
        "single-spa:routing-event",
        handleSingleSpaRouteChange
      );
    };
  }, []);

  const handleRefresh = useCallback(() => {
    loadAccountId();
  }, [loadAccountId]);

  const handleBackFromDetails = useCallback(() => {
    if (window.location) {
      window.location.href = "/statement";
    }
  }, []);

  const handleEditFromDetails = useCallback((id: string) => {
    if (window.history) {
      const url = new URL(window.location.href);
      url.searchParams.delete("view");
      url.searchParams.set("id", id);
      window.history.replaceState({}, "", url.toString());
      setView(null);
      setTransactionId(id);
    }
  }, []);

  if (loadingAccount) {
    return (
      <QueryProvider>
        <div className={styles.container}>
          <Loading text="Carregando..." size="medium" />
        </div>
      </QueryProvider>
    );
  }

  if (!accountId) {
    return (
      <QueryProvider>
        <div className={styles.container}>
          <Card title="Transações" variant="elevated" color="white">
            <Card.Section>
              <div
                style={{ textAlign: "center", padding: "var(--spacing-xl)" }}
              >
                <Text
                  variant="subtitle"
                  weight="semibold"
                  color="error"
                  style={{ marginBottom: "var(--spacing-md)" }}
                >
                  Conta não identificada
                </Text>
                <Text
                  variant="body"
                  color="gray600"
                  style={{ marginBottom: "var(--spacing-lg)" }}
                >
                  Não foi possível identificar a conta. Por favor, verifique se
                  o accountId está armazenado no localStorage.
                </Text>
                <Button variant="primary" onClick={handleRefresh} width="90px">
                  Atualizar Tela
                </Button>
              </div>
            </Card.Section>
          </Card>
        </div>
      </QueryProvider>
    );
  }

  if (view === "details" && transactionId) {
    return (
      <QueryProvider>
        <div className={styles.container}>
          <TransactionDetails
            transactionId={transactionId}
            onBack={handleBackFromDetails}
            onEdit={handleEditFromDetails}
          />
        </div>
      </QueryProvider>
    );
  }

  return (
    <QueryProvider>
      <div className={styles.container}>
        <Transactions accountId={accountId} transactionId={transactionId} />
      </div>
    </QueryProvider>
  );
}
