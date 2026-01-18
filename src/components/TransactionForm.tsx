import React, { useState, useCallback, useEffect } from "react";
import {
  Button,
  Input,
  Dropdown,
  Text,
  Icon,
} from "@grupo10-pos-fiap/design-system";
import { Transaction, TransactionFormData } from "@/types/transactions";
import { uploadFile, validateFile } from "@/utils/fileUpload";
import {
  applyCurrencyMask,
  parseCurrency,
  formatCurrency,
} from "@/utils/currencyMask";
import styles from "./TransactionForm.module.css";

interface TransactionFormProps {
  transaction?: Transaction;
  accountId: string;
  onSubmit: (data: Transaction) => Promise<void>;
  onCancel: () => void;
  onDelete?: (id: string) => Promise<void>;
  loading?: boolean;
  isEditMode?: boolean;
}

const initialFormData: TransactionFormData = {
  accountId: "",
  value: "",
  type: "Debit",
  from: "",
  to: "",
  anexo: "",
  urlAnexo: "",
};

function TransactionForm({
  transaction,
  accountId,
  onSubmit,
  onCancel,
  onDelete,
  loading = false,
  isEditMode = false,
}: TransactionFormProps) {
  const [formData, setFormData] =
    useState<TransactionFormData>(initialFormData);
  const [fileError, setFileError] = useState<string>("");
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        accountId: transaction.accountId,
        value: formatCurrency(transaction.value),
        type: transaction.type,
        from: transaction.from || "",
        to: transaction.to || "",
        anexo: transaction.anexo || "",
        urlAnexo: transaction.urlAnexo || "",
      });
    } else {
      setFormData({
        ...initialFormData,
        accountId,
      });
    }
  }, [transaction, accountId]);

  const handleInputChange = useCallback(
    (field: keyof TransactionFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const maskedValue = applyCurrencyMask(inputValue);
      handleInputChange("value", maskedValue);
    },
    [handleInputChange]
  );

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      setFileError("");
      setSelectedFile(file);

      if (!validateFile(file, 5)) {
        setFileError("Arquivo muito grande. Tamanho máximo: 5MB");
        setSelectedFile(null);
        return;
      }

      setUploadingFile(true);
      try {
        const result = await uploadFile(file);
        handleInputChange("urlAnexo", result.url);
        handleInputChange("anexo", result.fileName);
      } catch (error) {
        setFileError(
          error instanceof Error
            ? error.message
            : "Erro ao fazer upload do arquivo"
        );
        setSelectedFile(null);
      } finally {
        setUploadingFile(false);
      }
    },
    [handleInputChange]
  );

  const handleDelete = useCallback(async () => {
    if (!transaction?.id || !onDelete) {
      return;
    }

    if (!window.confirm("Tem certeza que deseja excluir esta transação?")) {
      return;
    }

    setDeleting(true);
    try {
      await onDelete(transaction.id);
    } catch (error) {
    } finally {
      setDeleting(false);
    }
  }, [transaction, onDelete]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const value = parseCurrency(formData.value);
      if (isNaN(value) || value <= 0) {
        setFileError("Valor deve ser maior que zero");
        return;
      }

      const transactionData: Transaction = {
        ...(transaction?.id && { id: transaction.id }),
        accountId: formData.accountId,
        value,
        type: formData.type,
        from: formData.from || undefined,
        to: formData.to || undefined,
        anexo: formData.anexo || undefined,
        urlAnexo: formData.urlAnexo || undefined,
      };

      try {
        await onSubmit(transactionData);
      } catch (error) {
      }
    },
    [formData, transaction, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <Text variant="body" weight="medium" className={styles.label}>
            Tipo
          </Text>
          <Dropdown
            items={[
              {
                label: "Débito",
                value: "Debit",
                onClick: () => handleInputChange("type", "Debit"),
              },
              {
                label: "Crédito",
                value: "Credit",
                onClick: () => handleInputChange("type", "Credit"),
              },
            ]}
            placeholder={formData.type === "Debit" ? "Débito" : "Crédito"}
            onValueChange={(value) =>
              handleInputChange("type", value as "Debit" | "Credit")
            }
            width="100%"
          />
        </div>

        <div className={styles.formField}>
          <Text variant="body" weight="medium" className={styles.label}>
            Valor *
          </Text>
          <Input
            type="text"
            value={formData.value}
            onChange={handleValueChange}
            placeholder="0,00"
            disabled={loading}
            required
            width="100%"
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <Text variant="body" weight="medium" className={styles.label}>
            De
          </Text>
          <Input
            type="text"
            value={formData.from}
            onChange={(e) => handleInputChange("from", e.target.value)}
            placeholder="Nome ou identificador"
            disabled={loading}
            width="100%"
          />
        </div>

        <div className={styles.formField}>
          <Text variant="body" weight="medium" className={styles.label}>
            Para
          </Text>
          <Input
            type="text"
            value={formData.to}
            onChange={(e) => handleInputChange("to", e.target.value)}
            placeholder="Nome ou identificador"
            disabled={loading}
            width="100%"
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <Text variant="body" weight="medium" className={styles.label}>
            Anexo
          </Text>
          <div
            className={styles.fileInputWrapper}
            onClick={() =>
              !loading &&
              !uploadingFile &&
              document.getElementById("file-upload")?.click()
            }
          >
            {uploadingFile ? (
              <span className={styles.fileInputText}>Enviando...</span>
            ) : selectedFile?.name || formData.anexo ? (
              <span className={styles.fileInputText}>
                {selectedFile?.name || formData.anexo}
              </span>
            ) : (
              <div className={styles.fileInputPlaceholder}>
                <Icon color='gray500' name="FileUp" />
                <span className={styles.fileInputText}>Selecionar arquivo</span>
              </div>
            )}
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              disabled={loading || uploadingFile}
              className={styles.fileInput}
              accept="image/*,.pdf,.doc,.docx"
            />
          </div>
          {fileError && (
            <Text variant="caption" color="error" className={styles.errorText}>
              {fileError}
            </Text>
          )}
          {formData.anexo && !fileError && (
            <Text variant="caption" color="gray600" className={styles.fileInfo}>
              Arquivo: {formData.anexo}
            </Text>
          )}
        </div>
      </div>

      <div className={styles.formActions}>
        {isEditMode && (
          <div className={styles.editActions}>
            <div className={styles.actionButtonWrapper}>
              <Button
                type="button"
                variant="outlined"
                onClick={onCancel}
                disabled={loading || deleting}
              >
                <span className={styles.actionButtonContent}>
                  <Icon name="ArrowLeft" size="small" />
                  Cancelar
                </span>
              </Button>
            </div>
            <div className={styles.actionButtonWrapper}>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || uploadingFile || deleting}
              >
                <span className={styles.actionButtonContent}>
                  <Icon name="Check" size="small" color="white" />
                  {loading ? "Salvando..." : "Salvar"}
                </span>
              </Button>
            </div>
          </div>
        )}
        {!isEditMode && (
          <div className={styles.editActions}>
            <div className={styles.actionButtonWrapper}>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || uploadingFile || deleting}
              >
                <span className={styles.actionButtonContent}>
                  <Icon name="Check" size="small" color="white" />
                  {loading ? "Salvando..." : "Criar"}
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

export default React.memo(TransactionForm);
