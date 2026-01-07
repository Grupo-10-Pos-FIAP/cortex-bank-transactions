import React, { useState, useCallback, useEffect } from "react";
import { Card, Text, Button, Loading } from "@grupo10-pos-fiap/design-system";
import { useTransaction } from "@/hooks/useTransaction";
import { Transaction } from "@/types/transactions";
import { getTransactionIdFromUrl } from "@/utils/urlParams";
import { getTransaction as fetchTransaction } from "@/api/transactions.api";
import TransactionForm from "@/components/TransactionForm";
import ErrorMessage from "@/components/ErrorMessage";
import SuccessMessage from "@/components/SuccessMessage";
import styles from "./Transactions.module.css";

interface TransactionsProps {
  accountId: string | null;
  transactionId?: string | null;
  transaction?: Transaction | null;
}

function Transactions({ accountId, transactionId, transaction: initialTransaction }: TransactionsProps) {
  const [transaction, setTransaction] = useState<Transaction | null>(initialTransaction || null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [formKey, setFormKey] = useState<number>(0);
  const [loadingTransaction, setLoadingTransaction] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const transactionHook = useTransaction();
  const urlTransactionId = getTransactionIdFromUrl();
  const isEditMode = !!(transactionId || urlTransactionId || transaction);
  
  // Busca a transação quando há ID na URL
  useEffect(() => {
    const idToFetch = urlTransactionId || transactionId;
    
    if (idToFetch && !transaction && !initialTransaction) {
      setLoadingTransaction(true);
      setLoadError(null);
      
      fetchTransaction(idToFetch)
        .then((fetchedTransaction) => {
          setTransaction(fetchedTransaction);
        })
        .catch((error) => {
          setLoadError(error instanceof Error ? error : new Error("Erro ao carregar transação"));
        })
        .finally(() => {
          setLoadingTransaction(false);
        });
    } else if (initialTransaction) {
      setTransaction(initialTransaction);
    }
  }, [urlTransactionId, transactionId, transaction, initialTransaction]);

  const handleCreate = useCallback(
    async (data: Transaction) => {
      if (!accountId) return;

      try {
        const newTransaction = await transactionHook.create({
          accountId: data.accountId,
          value: data.value,
          type: data.type,
          from: data.from,
          to: data.to,
          anexo: data.anexo,
          urlAnexo: data.urlAnexo,
        });
        
        // Limpa o formulário imediatamente
        setTransaction(null);
        setFormKey((prev) => prev + 1); // Força reset do formulário
        
        // Mostra mensagem de sucesso
        setSuccessMessage("Transação criada com sucesso!");
        
        // Limpa mensagem após delay
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } catch (error) {
        // Error is handled by the hook
      }
    },
    [accountId, transactionHook]
  );

  const handleUpdate = useCallback(
    async (data: Transaction) => {
      if (!data.id) return;

      const idToUse = data.id || transactionId || urlTransactionId;
      if (!idToUse) return;

      try {
        const updatedTransaction = await transactionHook.update(idToUse, {
          accountId: data.accountId,
          value: data.value,
          type: data.type,
          from: data.from,
          to: data.to,
          anexo: data.anexo,
          urlAnexo: data.urlAnexo,
        });
        
        // Mostra mensagem de sucesso
        setSuccessMessage("Transação atualizada com sucesso!");
        setTransaction(updatedTransaction);
        
        // Limpa mensagem após delay
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } catch (error) {
        // Error is handled by the hook
      }
    },
    [transactionId, urlTransactionId, transactionHook]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await transactionHook.remove(id);
        
        // Limpa a transação imediatamente
        setTransaction(null);
        setFormKey((prev) => prev + 1); // Força reset do formulário
        
        // Remove o ID da URL imediatamente
        if (urlTransactionId && window.history) {
          const url = new URL(window.location.href);
          url.searchParams.delete("id");
          window.history.replaceState({}, "", url.toString());
        }
        
        // Mostra mensagem de sucesso
        setSuccessMessage("Transação excluída com sucesso!");
        
        // Limpa mensagem após delay
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } catch (error) {
        // Error is handled by the hook
      }
    },
    [transactionHook, urlTransactionId]
  );

  const handleCancel = useCallback(() => {
    setTransaction(null);
    // Remove o ID da URL se estiver em modo de edição
    if (urlTransactionId && window.history) {
      const url = new URL(window.location.href);
      url.searchParams.delete("id");
      window.history.replaceState({}, "", url.toString());
    }
  }, [urlTransactionId]);

  const handleSubmit = useCallback(
    async (data: Transaction) => {
      if (isEditMode) {
        await handleUpdate(data);
      } else {
        await handleCreate(data);
      }
    },
    [isEditMode, handleCreate, handleUpdate]
  );

  if (!accountId) {
    return (
      <Card title="Transações" variant="elevated" color="base">
        <Card.Section>
          <Text variant="body" color="gray600">
            Conta não encontrada
          </Text>
        </Card.Section>
      </Card>
    );
  }

  // Mostra loading enquanto busca a transação
  if (loadingTransaction) {
    return (
      <div className={styles.transactions}>
        <Card title="Editar Transação" variant="elevated" color="base" className={styles.card}>
          <Card.Section className={styles.formSection}>
            <Loading text="Carregando transação..." size="medium" />
          </Card.Section>
        </Card>
      </div>
    );
  }

  // Mostra erro se não conseguir carregar a transação
  if (loadError && isEditMode) {
    return (
      <div className={styles.transactions}>
        <Card title="Editar Transação" variant="elevated" color="base" className={styles.card}>
          <Card.Section className={styles.formSection}>
            <ErrorMessage
              error={{
                type: "CLIENT" as const,
                message: loadError.message,
                retryable: true,
              }}
              title="Erro ao carregar transação"
              onRetry={() => {
                const idToFetch = urlTransactionId || transactionId;
                if (idToFetch) {
                  setLoadError(null);
                  setLoadingTransaction(true);
                  fetchTransaction(idToFetch)
                    .then((fetchedTransaction) => {
                      setTransaction(fetchedTransaction);
                    })
                    .catch((error) => {
                      setLoadError(error instanceof Error ? error : new Error("Erro ao carregar transação"));
                    })
                    .finally(() => {
                      setLoadingTransaction(false);
                    });
                }
              }}
            />
          </Card.Section>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.transactions}>
      <Card title={isEditMode ? "Editar Transação" : "Nova Transação"} variant="elevated" color="base" className={styles.card}>
        <Card.Section className={styles.formSection}>
          {successMessage && (
            <SuccessMessage
              message={successMessage}
              onDismiss={() => setSuccessMessage("")}
            />
          )}
          {transactionHook.error && (
            <ErrorMessage
              error={transactionHook.error}
              title={isEditMode ? "Erro ao atualizar transação" : "Erro ao criar transação"}
              className={styles.errorMessage}
            />
          )}
          <TransactionForm
            key={formKey}
            transaction={transaction || undefined}
            accountId={accountId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onDelete={isEditMode ? handleDelete : undefined}
            loading={transactionHook.loading}
            isEditMode={isEditMode}
          />
        </Card.Section>
      </Card>
    </div>
  );
}

export default React.memo(Transactions);
