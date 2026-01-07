import React, { useState, useEffect, useCallback } from "react";
import { Text, Loading, Button, Card } from "@grupo10-pos-fiap/design-system";
import { getAccountId } from "@/utils/accountStorage";
import { getTransactionIdFromUrl } from "@/utils/urlParams";
import Transactions from "../Transactions";
import styles from "./root.component.module.css";

export interface RootProps {
  name?: string;
}

export default function Root(_props: RootProps) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loadingAccount, setLoadingAccount] = useState<boolean>(true);
  const [transactionId, setTransactionId] = useState<string | null>(null);

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
    
    // Escuta mudanças na URL
    const handleLocationChange = () => {
      const newId = getTransactionIdFromUrl();
      setTransactionId(newId);
    };
    
    window.addEventListener("popstate", handleLocationChange);
    
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, [loadAccountId]);

  const handleRefresh = useCallback(() => {
    loadAccountId();
  }, [loadAccountId]);

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

  return (
    <div className={styles.container}>
      <Transactions accountId={accountId} transactionId={transactionId} />
    </div>
  );
}

