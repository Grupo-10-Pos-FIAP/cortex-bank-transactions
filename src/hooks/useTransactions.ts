import { useState, useCallback } from "react";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/api/transactions.api";
import { Transaction, CreateTransactionRequest, UpdateTransactionRequest } from "@/types/transactions";
import { AppError, classifyError } from "@/utils/errorHandler";

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: AppError | null;
  create: (data: CreateTransactionRequest) => Promise<Transaction>;
  update: (id: string, data: UpdateTransactionRequest) => Promise<Transaction>;
  remove: (id: string) => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  updateTransactionInList: (id: string, transaction: Transaction) => void;
  clearError: () => void;
}

export function useTransactions(initialTransactions: Transaction[] = []): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);

  const create = useCallback(async (data: CreateTransactionRequest): Promise<Transaction> => {
    setLoading(true);
    setError(null);
    try {
      const newTransaction = await createTransaction(data);
      setTransactions((prev) => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      const appError = classifyError(err);
      setError(appError);
      throw appError;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (id: string, data: UpdateTransactionRequest): Promise<Transaction> => {
      setLoading(true);
      setError(null);
      try {
        const updatedTransaction = await updateTransaction(id, data);
        setTransactions((prev) =>
          prev.map((tx) => (tx.id === id ? updatedTransaction : tx))
        );
        return updatedTransaction;
      } catch (err) {
        const appError = classifyError(err);
        setError(appError);
        throw appError;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const remove = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    } catch (err) {
      const appError = classifyError(err);
      setError(appError);
      throw appError;
    } finally {
      setLoading(false);
    }
  }, []);

  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }, []);

  const updateTransactionInList = useCallback((id: string, transaction: Transaction) => {
    setTransactions((prev) => prev.map((tx) => (tx.id === id ? transaction : tx)));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    transactions,
    loading,
    error,
    create,
    update,
    remove,
    addTransaction,
    removeTransaction,
    updateTransactionInList,
    clearError,
  };
}

