import React from "react";
import { Text, Button } from "@grupo10-pos-fiap/design-system";
import styles from "./SuccessModal.module.css";

interface SuccessModalProps {
  message: string;
  onConfirm: () => void;
  visible: boolean;
}

function SuccessModal({ message, onConfirm, visible }: SuccessModalProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onConfirm}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalContent}>
          <div className={styles.iconContainer}>
            <span className={styles.checkIcon}>✓</span>
          </div>
          <Text variant="subtitle" weight="semibold" className={styles.title}>
            Sucesso!
          </Text>
          <Text variant="body" className={styles.message}>
            {message}
          </Text>
          <div className={styles.buttonContainer}>
            <Button variant="primary" onClick={onConfirm} width="auto">
              OK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(SuccessModal);
