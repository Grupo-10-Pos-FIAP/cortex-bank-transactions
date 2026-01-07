import React from "react";
import { Text, Icon, Button } from "@grupo10-pos-fiap/design-system";
import { Transaction } from "@/types/transactions";
import { formatValue } from "@/utils/formatters";
import { formatDate } from "@/utils/dateUtils";
import styles from "./TransactionList.module.css";

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

function TransactionItem({
  transaction,
  onEdit,
  onDelete,
  loading = false,
}: TransactionItemProps) {
  const isCredit = transaction.type === "Credit";
  const transactionType = isCredit ? "Transferência recebida" : "Transferência efetuada";
  const personName = isCredit ? transaction.from : transaction.to;
  const displayValue = formatValue(Math.abs(transaction.value));
  const formattedDate = transaction.date ? formatDate(transaction.date) : "";

  const handleEdit = () => {
    if (onEdit && transaction.id) {
      onEdit(transaction);
    }
  };

  const handleDelete = () => {
    if (onDelete && transaction.id) {
      if (window.confirm("Tem certeza que deseja excluir esta transação?")) {
        onDelete(transaction.id);
      }
    }
  };

  return (
    <div className={styles.transactionItem}>
      <div className={styles.transactionIcon}>
        <Icon
          name={isCredit ? "ArrowDown" : "ArrowUp"}
          size="medium"
          color={isCredit ? "success" : "warning"}
        />
      </div>
      <div className={styles.transactionDetails}>
        <Text variant="body" weight="medium" className={styles.transactionType}>
          {transactionType}
        </Text>
        {personName && (
          <div className={styles.personName}>
            <Icon name="User" size="small" color="gray600" />
            <Text variant="caption" color="gray600">
              {isCredit ? "de" : "para"} {personName}
            </Text>
          </div>
        )}
        {transaction.anexo && (
          <div className={styles.anexo}>
            <Text variant="caption" color="gray600">
              📎 {transaction.anexo}
            </Text>
          </div>
        )}
      </div>
      <div className={styles.transactionRight}>
        <Text
          variant="body"
          weight="semibold"
          color={isCredit ? "success" : "error"}
          className={styles.transactionValue}
        >
          {isCredit ? "+" : "-"}R$ {displayValue}
        </Text>
        {formattedDate && (
          <div className={styles.transactionDate}>
            <Icon name="Calendar" size="small" color="gray600" />
            <Text variant="caption" color="gray600">
              {formattedDate}
            </Text>
          </div>
        )}
        {(onEdit || onDelete) && (
          <div className={styles.transactionActions}>
            {onEdit && (
              <Button
                variant="outlined"
                onClick={handleEdit}
                disabled={loading}
                width="auto"
              >
                Editar
              </Button>
            )}
            {onDelete && (
              <Button
                variant="negative"
                onClick={handleDelete}
                disabled={loading}
                width="auto"
              >
                Excluir
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(TransactionItem);

