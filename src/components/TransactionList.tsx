import React from "react";
import { Text, Loading } from "@grupo10-pos-fiap/design-system";
import { Transaction } from "@/types/transactions";
import { AppError } from "@/utils/errorHandler";
import TransactionItem from "./TransactionItem";
import ErrorMessage from "./ErrorMessage";
import styles from "./TransactionList.module.css";

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
  error?: AppError | null;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  onRetry?: () => void;
  emptyMessage?: string;
}

function TransactionList({
  transactions,
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onRetry,
  emptyMessage = "Nenhuma transação encontrada",
}: TransactionListProps) {
  if (loading && transactions.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Loading text="Carregando transações..." size="medium" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage
          error={error}
          onRetry={onRetry}
          title="Erro ao carregar transações"
        />
      </div>
    );
  }

  if (transactions.length === 0 && !loading) {
    return (
      <div className={styles.emptyContainer}>
        <Text variant="body" color="gray600">
          {emptyMessage}
        </Text>
      </div>
    );
  }

  return (
    <div className={styles.transactionList}>
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id || Math.random()}
          transaction={transaction}
          onEdit={onEdit}
          onDelete={onDelete}
          loading={loading}
        />
      ))}
    </div>
  );
}

export default React.memo(TransactionList);

