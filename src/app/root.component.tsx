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

  // Carrega accountId na inicialização
  useEffect(() => {
    loadAccountId();
  }, [loadAccountId]);

  // Lê e monitora parâmetros da URL
  useEffect(() => {
    // Função para atualizar os parâmetros da URL
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
    
    // Verifica imediatamente na inicialização
    updateUrlParams();
    
    // Também verifica após um pequeno delay para garantir que a URL está disponível
    // Isso é útil após reloads de página
    const timeoutId = setTimeout(updateUrlParams, 100);
    
    // Escuta mudanças na URL via popstate (navegação do browser)
    const handlePopState = () => {
      updateUrlParams();
    };
    
    // Escuta eventos do Single-SPA quando a rota muda
    const handleSingleSpaRouteChange = () => {
      // Pequeno delay para garantir que a URL foi atualizada
      setTimeout(updateUrlParams, 0);
    };
    
    // Escuta mudanças de hash (caso seja usado)
    const handleHashChange = () => {
      updateUrlParams();
    };
    
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("single-spa:routing-event", handleSingleSpaRouteChange);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("single-spa:routing-event", handleSingleSpaRouteChange);
    };
  }, []);

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

  const handleEditFromDetails = useCallback((id: string) => {
    // Remove o parâmetro 'view' e mantém o 'id' para entrar em modo de edição
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
        <TransactionDetails 
          transactionId={transactionId} 
          onBack={handleBackFromDetails}
          onEdit={handleEditFromDetails}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Transactions accountId={accountId} transactionId={transactionId} />
    </div>
  );
}

