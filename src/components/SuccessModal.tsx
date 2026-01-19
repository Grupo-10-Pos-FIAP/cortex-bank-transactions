import React, { useEffect } from "react";
import { Text, Button } from "@grupo10-pos-fiap/design-system";
import styles from "./SuccessModal.module.css";

interface SuccessModalProps {
  message: string;
  onConfirm: () => void;
  visible: boolean;
}

function SuccessModal({ message, onConfirm, visible }: SuccessModalProps) {
  useEffect(() => {
    if (!visible) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onConfirm();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [visible, onConfirm]);

  if (!visible) {
    return null;
  }

  const handleOverlayClick = () => {
    onConfirm();
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Modal de sucesso">
      <button
        type="button"
        className={styles.overlayButton}
        onClick={handleOverlayClick}
        aria-label="Fechar modal"
      />
      <div className={styles.modal}>
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
            <Button variant="primary" onClick={onConfirm} width="90px">
              OK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(SuccessModal);
