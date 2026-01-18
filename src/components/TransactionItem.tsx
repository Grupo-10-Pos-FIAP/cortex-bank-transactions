import React, { useState, useCallback } from "react";
import { Text, Icon, Button, Dialog, DialogHeader, DialogBody, DialogFooter } from "@grupo10-pos-fiap/design-system";
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isCredit = transaction.type === "Credit";
  const transactionType = isCredit ? "Transferência recebida" : "Transferência efetuada";
  const personName = isCredit ? transaction.from : transaction.to;
  const displayValue = formatValue(Math.abs(transaction.value));
  const formattedDate = transaction.date ? formatDate(transaction.date) : "";
  const isPending = transaction.status === "Pending";
  const canEditOrDelete = isPending;

  const handleEdit = useCallback(() => {
    if (onEdit && transaction.id) {
      onEdit(transaction);
    }
  }, [onEdit, transaction]);

  const handleDelete = useCallback(() => {
    if (onDelete && transaction.id) {
      setShowDeleteDialog(true);
    }
  }, [onDelete, transaction]);

  const handleConfirmDelete = useCallback(() => {
    if (onDelete && transaction.id) {
      onDelete(transaction.id);
    }
    setShowDeleteDialog(false);
  }, [onDelete, transaction]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  return (
    <>
      <Dialog
        isOpen={showDeleteDialog}
        onClose={handleCancelDelete}
        position="center"
        size="medium"
        contentAlign="center"
        overlay={true}
        overlayOpacity={0.25}
        closeOnOverlayClick={true}
      >
        <DialogHeader>
          <h3 style={{ margin: 0, marginBottom: 4 }}>Excluir transação</h3>
        </DialogHeader>
        <DialogBody>
          <p style={{ margin: 0, marginBottom: 4 }}>
            Ao optar por excluir sua transação, ela vai ser cancelada e deletada
            do seu histórico de transferências.
          </p>
        </DialogBody>
        <DialogFooter align="end">
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outlined" onClick={handleCancelDelete}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmDelete} color="error">
              Confirmar
            </Button>
          </div>
        </DialogFooter>
      </Dialog>

      <div className={styles.transactionItem}>
        <div className={styles.transactionIcon}>
          <Icon
            name={isCredit ? "ArrowDown" : "ArrowUp"}
            size="medium"
            color={isCredit ? "success" : "warning"}
          />
        </div>
        <div className={styles.transactionDetails}>
          <Text
            variant="body"
            weight="medium"
            className={styles.transactionType}
          >
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
          {(onEdit || onDelete) && canEditOrDelete && (
            <div className={styles.transactionActions}>
              {onEdit && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleEdit}
                  disabled={loading}
                  width="90px"
                >
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="negative"
                  onClick={handleDelete}
                  disabled={loading}
                  width="90px"
                >
                  Excluir
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default React.memo(TransactionItem);

