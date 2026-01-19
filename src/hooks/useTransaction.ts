import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createTransaction, updateTransaction, deleteTransaction } from "@/api/transactions.api";
import {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from "@/types/transactions";
import { AppError, classifyError } from "@/utils/errorHandler";

interface UseTransactionReturn {
  loading: boolean;
  error: AppError | null;
  create: (data: CreateTransactionRequest) => Promise<Transaction>;
  update: (id: string, data: UpdateTransactionRequest) => Promise<Transaction>;
  remove: (id: string) => Promise<void>;
  clearError: () => void;
}

export function useTransaction(): UseTransactionReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);
  const queryClient = useQueryClient();

  const create = useCallback(
    async (data: CreateTransactionRequest): Promise<Transaction> => {
      setLoading(true);
      setError(null);
      try {
        const newTransaction = await createTransaction(data);
        await queryClient.invalidateQueries({ queryKey: ["transactions"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        await queryClient.invalidateQueries({ queryKey: ["balance"] });
        return newTransaction;
      } catch (err) {
        const appError = classifyError(err);
        setError(appError);
        throw appError;
      } finally {
        setLoading(false);
      }
    },
    [queryClient]
  );

  const update = useCallback(
    async (id: string, data: UpdateTransactionRequest): Promise<Transaction> => {
      setLoading(true);
      setError(null);
      try {
        const updatedTransaction = await updateTransaction(id, data);
        await queryClient.invalidateQueries({ queryKey: ["transactions"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        await queryClient.invalidateQueries({ queryKey: ["balance"] });
        return updatedTransaction;
      } catch (err) {
        const appError = classifyError(err);
        setError(appError);
        throw appError;
      } finally {
        setLoading(false);
      }
    },
    [queryClient]
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await deleteTransaction(id);
        await queryClient.invalidateQueries({ queryKey: ["transactions"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        await queryClient.invalidateQueries({ queryKey: ["balance"] });
      } catch (err) {
        const appError = classifyError(err);
        setError(appError);
        throw appError;
      } finally {
        setLoading(false);
      }
    },
    [queryClient]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    create,
    update,
    remove,
    clearError,
  };
}
