import {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionResponse,
  TransactionsListResponse,
} from "@/types/transactions";
import { fetchApi } from "@/utils/apiClient";

/**
 * Busca uma transação por ID
 */
export async function getTransaction(id: string): Promise<Transaction> {
  try {
    const response = await fetchApi(`/account/transaction/${id}`, {
      method: "GET",
    });

    const result: TransactionsListResponse | TransactionResponse = await response.json();
    
    // O backend retorna um array de transações
    if (Array.isArray(result.result)) {
      if (result.result.length === 0) {
        throw new Error("Transação não encontrada");
      }
      // Retorna o primeiro item do array
      return result.result[0];
    }
    
    // Se for um objeto com transactions (formato alternativo)
    if (result.result && typeof result.result === 'object' && 'transactions' in result.result) {
      const transactions = (result.result as { transactions: Transaction[] }).transactions;
      if (transactions.length === 0) {
        throw new Error("Transação não encontrada");
      }
      return transactions[0];
    }
    
    // Se não for array, tenta retornar diretamente
    return result.result as Transaction;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Erro ao buscar transação"
    );
  }
}

/**
 * Cria uma nova transação
 */
export async function createTransaction(
  data: CreateTransactionRequest
): Promise<Transaction> {
  try {
    const response = await fetchApi("/account/transaction", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const result: TransactionResponse = await response.json();
    return result.result;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Erro ao criar transação"
    );
  }
}

/**
 * Atualiza uma transação existente
 */
export async function updateTransaction(
  id: string,
  data: UpdateTransactionRequest
): Promise<Transaction> {
  try {
    const response = await fetchApi(`/account/transaction/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    const result: TransactionResponse = await response.json();
    return result.result;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Erro ao atualizar transação"
    );
  }
}

/**
 * Exclui uma transação
 */
export async function deleteTransaction(id: string): Promise<void> {
  try {
    await fetchApi(`/account/transaction/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Erro ao excluir transação"
    );
  }
}
