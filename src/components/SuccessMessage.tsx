import React, { useEffect, useState } from "react";
import { Text, Icon } from "@grupo10-pos-fiap/design-system";
import styles from "./SuccessMessage.module.css";

interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
  duration?: number;
}

function SuccessMessage({
  message,
  onDismiss,
  duration = 3000,
}: SuccessMessageProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [message, duration, onDismiss]);

  if (!message || !isVisible) {
    return null;
  }

  return (
    <div className={styles.successMessage} role="alert" aria-live="polite">
      <Text variant="body" color="success" className={styles.successText}>
        ✓ {message}
      </Text>
    </div>
  );
}

export default React.memo(SuccessMessage);
