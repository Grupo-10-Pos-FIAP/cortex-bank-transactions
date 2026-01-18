import React from "react";
import { Text, Button, Icon } from "@grupo10-pos-fiap/design-system";
import { AppError } from "@/utils/errorHandler";
import styles from "./ErrorMessage.module.css";

interface ErrorMessageProps {
  error: AppError;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

function ErrorMessage({
  error,
  onRetry,
  title = "Erro ao carregar dados",
  className,
}: ErrorMessageProps) {
  return (
    <div className={`${styles.errorMessage} ${className || ""}`}>
      <div className={styles.errorIcon}>
        <Icon name="ArrowDown" size="large" color="error" />
      </div>
      <Text variant="subtitle" weight="semibold" className={styles.errorTitle}>
        {title}
      </Text>
      <Text variant="body" color="gray600" className={styles.errorText}>
        {error.message}
      </Text>
      {onRetry && error.retryable && (
        <div className={styles.errorActions}>
          <Button variant="primary" onClick={onRetry} width="90px">
            Tentar Novamente
          </Button>
        </div>
      )}
    </div>
  );
}

export default React.memo(ErrorMessage);
