import React, { useState, useEffect, useCallback } from "react";
import { Card, Text, Button, Loading, Icon } from "@grupo10-pos-fiap/design-system";
import { Transaction } from "@/types/transactions";
import { getTransaction } from "@/api/transactions.api";
import { formatCurrency } from "@/utils/formatters";
import { formatDate } from "@/utils/dateUtils";
import ErrorMessage from "./ErrorMessage";
import styles from "./TransactionDetails.module.css";

interface TransactionDetailsProps {
  transactionId: string;
  onBack?: () => void;
}

function TransactionDetails({ transactionId, onBack }: TransactionDetailsProps) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTransaction = useCallback(async () => {
    if (!transactionId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getTransaction(transactionId);
      setTransaction(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao carregar transação"));
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    loadTransaction();
  }, [loadTransaction]);

  const handleDownload = useCallback(async (url: string, fileName: string) => {
    try {
      // Se a URL for de um serviço externo (como Cloudinary), pode precisar de CORS
      // Tenta abrir em nova aba primeiro, se falhar, tenta fazer download direto
      if (url.startsWith("http://") || url.startsWith("https://")) {
        // Para URLs externas, tenta abrir em nova aba
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.download = fileName || "anexo";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Para URLs relativas ou outros formatos, faz fetch
        const response = await fetch(url);
        if (!response.ok) {
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
      // Se falhar, tenta abrir em nova aba como fallback
      try {
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (fallbackErr) {
        alert(err instanceof Error ? err.message : "Erro ao baixar arquivo");
      }
    }
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <Card title="Detalhes da Transação" variant="elevated" color="base" className={styles.card}>
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
        <Card title="Detalhes da Transação" variant="elevated" color="base" className={styles.card}>
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
        <Card title="Detalhes da Transação" variant="elevated" color="base" className={styles.card}>
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

  return (
    <div className={styles.container}>
      <Card title="Detalhes da Transação" variant="elevated" color="base" className={styles.card}>
        <Card.Section className={styles.section}>
          {onBack && (
            <div className={styles.backButton}>
              <Button variant="secondary" onClick={onBack} width="auto">
                <Icon name="ArrowLeft" size="small" />
                Voltar
              </Button>
            </div>
          )}

          <div className={styles.details}>
            <div className={styles.detailRow}>
              <div className={styles.detailItem}>
                <Text variant="caption" color="gray600" className={styles.label}>
                  ID
                </Text>
                <Text variant="body" weight="medium" className={styles.value}>
                  {transaction.id || "N/A"}
                </Text>
              </div>

              <div className={styles.detailItem}>
                <Text variant="caption" color="gray600" className={styles.label}>
                  Tipo
                </Text>
                <div className={styles.typeBadge}>
                  <Text
                    variant="body"
                    weight="semibold"
                    color={transaction.type === "Credit" ? "success" : "error"}
                  >
                    {transaction.type === "Credit" ? "Crédito" : "Débito"}
                  </Text>
                </div>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailItem}>
                <Text variant="caption" color="gray600" className={styles.label}>
                  Valor
                </Text>
                <Text
                  variant="title"
                  weight="bold"
                  color={transaction.type === "Credit" ? "success" : "error"}
                  className={styles.value}
                >
                  {formatCurrency(transaction.value)}
                </Text>
              </div>

              {transaction.date && (
                <div className={styles.detailItem}>
                  <Text variant="caption" color="gray600" className={styles.label}>
                    Data
                  </Text>
                  <Text variant="body" weight="medium" className={styles.value}>
                    {formatDate(transaction.date)}
                  </Text>
                </div>
              )}
            </div>

            {(transaction.from || transaction.to) && (
              <div className={styles.detailRow}>
                {transaction.from && (
                  <div className={styles.detailItem}>
                    <Text variant="caption" color="gray600" className={styles.label}>
                      De
                    </Text>
                    <Text variant="body" weight="medium" className={styles.value}>
                      {transaction.from}
                    </Text>
                  </div>
                )}

                {transaction.to && (
                  <div className={styles.detailItem}>
                    <Text variant="caption" color="gray600" className={styles.label}>
                      Para
                    </Text>
                    <Text variant="body" weight="medium" className={styles.value}>
                      {transaction.to}
                    </Text>
                  </div>
                )}
              </div>
            )}

            {transaction.accountId && (
              <div className={styles.detailItem}>
                <Text variant="caption" color="gray600" className={styles.label}>
                  Conta
                </Text>
                <Text variant="body" weight="medium" className={styles.value}>
                  {transaction.accountId}
                </Text>
              </div>
            )}

            {hasAttachment && (
              <div className={styles.attachmentSection}>
                <Text variant="subtitle" weight="semibold" className={styles.attachmentTitle}>
                  Anexo
                </Text>
                <div className={styles.attachmentInfo}>
                  {transaction.anexo && (
                    <Text variant="body" color="gray600" className={styles.attachmentName}>
                      {transaction.anexo}
                    </Text>
                  )}
                  {transaction.urlAnexo && (
                    <Button
                      variant="primary"
                      onClick={() => handleDownload(transaction.urlAnexo!, transaction.anexo || "anexo")}
                      width="auto"
                      className={styles.downloadButton}
                    >
                      <Icon name="Download" size="small" />
                      Baixar Anexo
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card.Section>
      </Card>
    </div>
  );
}

export default React.memo(TransactionDetails);

