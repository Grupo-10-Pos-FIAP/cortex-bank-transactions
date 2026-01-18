import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Text,
  Button,
  Loading,
  Icon,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@grupo10-pos-fiap/design-system";
import { Transaction } from "@/types/transactions";
import { getTransaction, deleteTransaction } from "@/api/transactions.api";
import { formatCurrency } from "@/utils/formatters";
import { formatDate } from "@/utils/dateUtils";
import ErrorMessage from "./ErrorMessage";
import SuccessModal from "./SuccessModal";
import styles from "./TransactionDetails.module.css";

interface TransactionDetailsProps {
  transactionId: string;
  onBack?: () => void;
  onEdit?: (id: string) => void;
}

function TransactionDetails({
  transactionId,
  onBack,
  onEdit,
}: TransactionDetailsProps) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

  const loadTransaction = useCallback(async () => {
    if (!transactionId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getTransaction(transactionId);
      setTransaction(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Erro ao carregar transação")
      );
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    loadTransaction();
  }, [loadTransaction]);

  const handleDownload = useCallback(async (url: string, fileName: string) => {
    try {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.download = fileName || "anexo";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const response = await fetch(url);
        if (!response.ok) {
          if (response.status === 401) {
            if (typeof window !== "undefined" && window.localStorage) {
              localStorage.removeItem("token");
              window.location.href = "/auth";
            }
          }
          throw new Error("Erro ao baixar arquivo");
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fileName || "anexo";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (err) {
      try {
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (fallbackErr) {
        alert(err instanceof Error ? err.message : "Erro ao baixar arquivo");
      }
    }
  }, []);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      if (window.location) {
        window.location.href = "/statement";
      }
    }
  }, [onBack]);

  const handleEdit = useCallback(() => {
    if (!transactionId) return;

    if (onEdit) {
      onEdit(transactionId);
    } else {
      if (window.history) {
        const url = new URL(window.location.href);
        url.searchParams.delete("view");
        url.searchParams.set("id", transactionId);
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [transactionId, onEdit]);

  const handleDelete = useCallback(() => {
    if (!transactionId || !transaction) return;
    setShowDeleteDialog(true);
  }, [transactionId, transaction]);

  const handleConfirmDelete = useCallback(async () => {
    setDeleting(true);
    setError(null);
    try {
      await deleteTransaction(transactionId);
      setShowSuccessModal(true);
      setShowDeleteDialog(false);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Erro ao excluir transação")
      );
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  }, [transactionId]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  const handleSuccessModalConfirm = useCallback(() => {
    setShowSuccessModal(false);

    // Volta para /statement após excluir
    if (window.location) {
      window.location.href = "/statement";
    }
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <Card
          title="Detalhes da Transação"
          variant="elevated"
          color="white"
          className={styles.card}
        >
          <Card.Section className={styles.section}>
            <Loading text="Carregando transação..." size="medium" />
          </Card.Section>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Card
          title="Detalhes da Transação"
          variant="elevated"
          color="white"
          className={styles.card}
        >
          <Card.Section className={styles.section}>
            <ErrorMessage
              error={{
                type: "CLIENT" as const,
                message: error.message,
                retryable: true,
              }}
              title="Erro ao carregar transação"
              onRetry={loadTransaction}
            />
          </Card.Section>
        </Card>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className={styles.container}>
        <Card
          title="Detalhes da Transação"
          variant="elevated"
          color="white"
          className={styles.card}
        >
          <Card.Section className={styles.section}>
            <Text variant="body" color="gray600">
              Transação não encontrada
            </Text>
          </Card.Section>
        </Card>
      </div>
    );
  }

  const hasAttachment = !!(transaction.urlAnexo || transaction.anexo);
  const isPending = transaction.status === "Pending";
  const canEditOrDelete = isPending;

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
          <div style={{ display: "flex", gap: 12 }}>
            <Button
              variant="outlined"
              onClick={handleCancelDelete}
              disabled={deleting}
              width="120px">
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              disabled={deleting}
              width="120px"
            >
              {deleting ? "Excluindo..." : "Confirmar"}
            </Button>
          </div>
        </DialogFooter>
      </Dialog>
      <SuccessModal
        message="Transação excluída com sucesso!"
        onConfirm={handleSuccessModalConfirm}
        visible={showSuccessModal}
      />
      <div className={styles.container}>
        <Card
          title="Detalhes da Transação"
          variant="elevated"
          color="white"
          className={styles.card}
        >
          <div className={styles.backButtonWrapper}>
            <Button
              variant="outlined"
              onClick={handleBack}
              width="90px"
              disabled={deleting}
            >
              <Icon name="ArrowLeft" size="small" />
              Voltar
            </Button>
          </div>
          <Card.Section className={styles.section}>
            <div className={styles.details}>
              {/* ID, Conta */}
              <div className={styles.detailRow}>
                <div className={styles.detailItem}>
                  <Text
                    variant="caption"
                    color="gray600"
                    className={styles.label}
                  >
                    ID
                  </Text>
                  <Text variant="caption" className={styles.value}>
                    {transaction.id || "N/A"}
                  </Text>
                </div>

                {transaction.accountId && (
                  <div className={styles.detailItem}>
                    <Text
                      variant="caption"
                      color="gray600"
                      className={styles.label}
                    >
                      Conta
                    </Text>
                    <Text variant="caption" className={styles.value}>
                      {transaction.accountId}
                    </Text>
                  </div>
                )}
              </div>

              {/* Data, Status */}
              <div className={styles.detailRow}>
                {transaction.date && (
                  <div className={styles.detailItem}>
                    <Text
                      variant="caption"
                      color="gray600"
                      className={styles.label}
                    >
                      Data
                    </Text>
                    <Text
                      variant="caption"
                      className={styles.value}
                    >
                      {formatDate(transaction.date)}
                    </Text>
                  </div>
                )}

                {isPending && (
                  <div className={styles.detailItem}>
                    <Text
                      variant="caption"
                      color="gray600"
                      className={styles.label}
                    >
                      Status
                    </Text>
                    <div className={styles.statusBadge}>
                      <Text
                        variant="caption"
                        color="warning"
                      >
                        Pendente
                      </Text>
                    </div>
                  </div>
                )}
              </div>

              {/* Tipo, Valor */}
              <div className={styles.detailRow}>
                <div className={styles.detailItem}>
                  <Text
                    variant="caption"
                    color="gray600"
                    className={styles.label}
                  >
                    Tipo
                  </Text>
                    <Text
                      variant="caption"
                    >
                      {transaction.type === "Credit" ? "Crédito" : "Débito"}
                    </Text>
                </div>

                <div className={styles.detailItem}>
                  <Text
                    variant="caption"
                    color="gray600"
                    className={styles.label}
                  >
                    Valor
                  </Text>
                  <Text
                    variant="caption"
                    color={transaction.type === "Credit" ? "success" : "error"}
                    className={styles.value}
                  >
                    {formatCurrency(transaction.value)}
                  </Text>
                </div>
              </div>

              {/* De, Para */}
              {(transaction.from || transaction.to) && (
                <div className={styles.detailRow}>
                  {transaction.from && (
                    <div className={styles.detailItem}>
                      <Text
                        variant="caption"
                        color="gray600"
                        className={styles.label}
                      >
                        De
                      </Text>
                      <Text
                        variant="caption"
                        className={styles.value}
                      >
                        {transaction.from}
                      </Text>
                    </div>
                  )}

                  {transaction.to && (
                    <div className={styles.detailItem}>
                      <Text
                        variant="caption"
                        color="gray600"
                        className={styles.label}
                      >
                        Para
                      </Text>
                      <Text
                        variant="caption"
                        className={styles.value}
                      >
                        {transaction.to}
                      </Text>
                    </div>
                  )}
                </div>
              )}

              {hasAttachment && (
                <div className={styles.attachmentSection}>
                  <Text
                    variant="subtitle"
                    weight="semibold"
                    className={styles.attachmentTitle}
                  >
                    Anexo
                  </Text>
                  <div className={styles.attachmentInfo}>
                    {transaction.anexo && (
                      <Text
                        variant="caption"
                        color="gray600"
                        className={styles.attachmentName}
                      >
                        {transaction.anexo}
                      </Text>
                    )}
                    {transaction.urlAnexo && (
                      <div className={styles.actionButtonWrapper}>
                        <Button
                          variant="outlined"
                          onClick={() =>
                            handleDownload(
                              transaction.urlAnexo!,
                              transaction.anexo || "anexo"
                            )
                          }
                        >
                          <span className={styles.actionButtonContent}>
                            <Icon name="Download" size="small" />
                            Baixar Anexo
                          </span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {canEditOrDelete && (
              <div className={styles.footerActions}>
                <div className={styles.actionButtonWrapper}>
                  <Button
                    variant="primary"
                    color="error"
                    onClick={handleDelete}
                    disabled={deleting || loading}
                  >
                    <span className={styles.actionButtonContent}>
                      <Icon name="Trash" size="small" color="white" />
                      {deleting ? "Excluindo..." : "Excluir"}
                    </span>
                  </Button>
                </div>
                <div className={styles.actionButtonWrapper}>
                  <Button
                    variant="primary"
                    onClick={handleEdit}
                    disabled={deleting || loading}
                  >
                    <span className={styles.actionButtonContent}>
                      <Icon name="Pencil" size="small" color="white" />
                      Editar
                    </span>
                  </Button>
                </div>
              </div>
            )}
          </Card.Section>
        </Card>
      </div>
    </>
  );
}

export default React.memo(TransactionDetails);
