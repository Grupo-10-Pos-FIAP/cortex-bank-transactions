import React, { useState, useCallback, useEffect } from "react";
import { Card, Text, Button, Loading } from "@grupo10-pos-fiap/design-system";
import { useTransaction } from "@/hooks/useTransaction";
import { Transaction } from "@/types/transactions";
import { getTransactionIdFromUrl } from "@/utils/urlParams";
import { getTransaction as fetchTransaction } from "@/api/transactions.api";
import TransactionForm from "@/components/TransactionForm";
import ErrorMessage from "@/components/ErrorMessage";
import SuccessMessage from "@/components/SuccessMessage";
import SuccessModal from "@/components/SuccessModal";
import styles from "./Transactions.module.css";

interface TransactionsProps {
  accountId: string | null;
  transactionId?: string | null;
  transaction?: Transaction | null;
}

type SuccessModalType = "update" | "delete" | null;

function Transactions({
  accountId,
  transactionId,
  transaction: initialTransaction,
}: TransactionsProps) {
  const [transaction, setTransaction] = useState<Transaction | null>(
    initialTransaction || null
  );
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successModalType, setSuccessModalType] =
    useState<SuccessModalType>(null);
  const [updatedTransactionId, setUpdatedTransactionId] = useState<
    string | null
  >(null);
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
          setLoadError(
            error instanceof Error
              ? error
              : new Error("Erro ao carregar transação")
          );
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

        // Armazena o ID da transação atualizada e mostra o modal
        setUpdatedTransactionId(updatedTransaction.id || idToUse);
        setSuccessModalType("update");
        setShowSuccessModal(true);
        setTransaction(updatedTransaction);
      } catch (error) {
        // Error is handled by the hook
      }
    },
    [transactionId, urlTransactionId, transactionHook]
  );

  const handleSuccessModalConfirm = useCallback(() => {
    setShowSuccessModal(false);

    if (successModalType === "update" && updatedTransactionId) {
      // Navega para a tela de detalhes da transação
      if (window.history) {
        const url = new URL(window.location.href);
        url.searchParams.set("view", "details");
        url.searchParams.set("id", updatedTransactionId);
        window.history.replaceState({}, "", url.toString());

        // Força atualização do componente root através de um pequeno delay
        // O useEffect do root component vai detectar a mudança na URL
        setTimeout(() => {
          window.dispatchEvent(new PopStateEvent("popstate"));
        }, 0);
      }
    } else if (successModalType === "delete") {
      // Volta para a lista de transações (remove parâmetros da URL)
      if (window.history) {
        const url = new URL(window.location.href);
        url.searchParams.delete("view");
        url.searchParams.delete("id");
        window.history.replaceState({}, "", url.toString());

        // Força atualização do componente root
        setTimeout(() => {
          window.dispatchEvent(new PopStateEvent("popstate"));
        }, 0);
      }
    }

    setSuccessModalType(null);
    setUpdatedTransactionId(null);
  }, [successModalType, updatedTransactionId]);

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

        // Mostra modal de sucesso para exclusão
        setSuccessModalType("delete");
        setShowSuccessModal(true);
      } catch (error) {
        // Error is handled by the hook
      }
    },
    [transactionHook, urlTransactionId]
  );

  const handleCancel = useCallback(() => {
    if (isEditMode && urlTransactionId) {
      // Em modo de edição, redireciona para a tela de detalhes
      if (window.history) {
        const url = new URL(window.location.href);
        url.searchParams.delete("id");
        url.searchParams.set("view", "details");
        url.searchParams.set("id", urlTransactionId);
        window.history.replaceState({}, "", url.toString());
        
        // Força atualização do componente root
        setTimeout(() => {
          window.dispatchEvent(new PopStateEvent("popstate"));
        }, 0);
      }
    } else {
      // Em modo de criação, redireciona para /statement
      if (window.location) {
        window.location.href = "/statement";
      }
    }
  }, [isEditMode, urlTransactionId]);

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
      <Card title="Transações" variant="elevated" color="white">
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
        <Card
          title="Editar Transação"
          variant="elevated"
          color="white"
          className={styles.card}
        >
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
        <Card
          title="Editar Transação"
          variant="elevated"
          color="white"
          className={styles.card}
        >
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
                      setLoadError(
                        error instanceof Error
                          ? error
                          : new Error("Erro ao carregar transação")
                      );
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

  const getSuccessModalMessage = () => {
    if (successModalType === "update") {
      return "Transação atualizada com sucesso!";
    }
    if (successModalType === "delete") {
      return "Transação excluída com sucesso!";
    }
    return "";
  };

  return (
    <>
      <SuccessModal
        message={getSuccessModalMessage()}
        onConfirm={handleSuccessModalConfirm}
        visible={showSuccessModal}
      />
      <div className={styles.transactions}>
        <Card
          title={isEditMode ? "Editar Transação" : "Nova Transação"}
          variant="elevated"
          color="white"
          className={styles.card}
        >
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
                title={
                  isEditMode
                    ? "Erro ao atualizar transação"
                    : "Erro ao criar transação"
                }
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
    </>
  );
}

export default React.memo(Transactions);
