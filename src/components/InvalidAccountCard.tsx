import React from "react";
import styles from "./InvalidAccountCard.module.css";
import { Card, Text, Button } from "@grupo10-pos-fiap/design-system";

interface InvalidAccountCardProps {
  handleClick: React.MouseEventHandler<HTMLButtonElement>;
}

const InvalidAccountCard: React.FC<InvalidAccountCardProps> = ({ handleClick }) => {
  return (
    <div className={styles.container}>
      <Card variant="elevated" color="white" className={styles.card}>
        <Card.Section>
          <div style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
            <Text
              variant="subtitle"
              weight="semibold"
              color="error"
              style={{ marginBottom: "var(--spacing-md)" }}
            >
              Conta não identificada
            </Text>
            <Text variant="body" color="gray600" style={{ marginBottom: "var(--spacing-lg)" }}>
              Ocorreu um problema inesperado. Por favor, entre em contato com o suporte através do
              email: <a href="mailto:cortexbank.contato@gmail.com">cortexbank.contato@gmail.com</a>
            </Text>
            <Button variant="primary" onClick={handleClick} width="140px">
              Atualizar Tela
            </Button>
          </div>
        </Card.Section>
      </Card>
    </div>
  );
};

export default InvalidAccountCard;
