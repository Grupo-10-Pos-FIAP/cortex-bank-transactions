import React, { useState, useEffect, useCallback } from "react";
import { Text, Loading, Button, Card } from "@grupo10-pos-fiap/design-system";
import { getAccountId } from "@/utils/accountStorage";
import { getTransactionIdFromUrl, getViewParamFromUrl } from "@/utils/urlParams";
import Transactions from "../Transactions";
import TransactionDetails from "../components/TransactionDetails";
import styles from "./root.component.module.css";

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
    
    // Verifica se há ID de transação na URL
    const id = getTransactionIdFromUrl();
    setTransactionId(id);
    
    // Verifica o parâmetro view na URL
    const viewParam = getViewParamFromUrl();
    setView(viewParam);
    
    // Escuta mudanças na URL
    const handleLocationChange = () => {
      const newId = getTransactionIdFromUrl();
      setTransactionId(newId);
      const newView = getViewParamFromUrl();
      setView(newView);
    };
    
    window.addEventListener("popstate", handleLocationChange);
    
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, [loadAccountId]);

  const handleRefresh = useCallback(() => {
    loadAccountId();
  }, [loadAccountId]);

  const handleBackFromDetails = useCallback(() => {
    // Remove os parâmetros da URL
    if (window.history) {
      const url = new URL(window.location.href);
      url.searchParams.delete("view");
      url.searchParams.delete("id");
      window.history.replaceState({}, "", url.toString());
      setView(null);
      setTransactionId(null);
    }
  }, []);

  if (loadingAccount) {
    return (
      <div className={styles.container}>
        <Loading text="Carregando..." size="medium" />
      </div>
    );
  }

  if (!accountId) {
    return (
      <div className={styles.container}>
        <Card title="Transações" variant="elevated" color="base">
          <Card.Section>
            <div style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
              <Text
                variant="subtitle"
                weight="semibold"
                color="error"
                style={{ marginBottom: "var(--spacing-md)" }}
              >
                Conta não identificada
              </Text>
              <Text variant="body" color="gray600" style={{ marginBottom: "var(--spacing-lg)" }}>
                Não foi possível identificar a conta. Por favor, verifique se o accountId está
                armazenado no localStorage.
              </Text>
              <Button variant="primary" onClick={handleRefresh} width="auto">
                Atualizar Tela
              </Button>
            </div>
          </Card.Section>
        </Card>
      </div>
    );
  }

  // Se view=details e há transactionId, exibe a tela de detalhes
  if (view === "details" && transactionId) {
    return (
      <div className={styles.container}>
        <TransactionDetails transactionId={transactionId} onBack={handleBackFromDetails} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Transactions accountId={accountId} transactionId={transactionId} />
    </div>
  );
}

