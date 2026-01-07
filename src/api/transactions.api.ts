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

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Erro ao buscar transação: ${response.status} ${errorText}`);
    }

    const result: TransactionsListResponse | TransactionResponse = await response.json();
    
    // Verifica se result existe
    if (!result || !result.result) {
      throw new Error("Resposta inválida do servidor");
    }
    
    // O backend retorna um objeto DetailedAccount diretamente em result.result
    // Verifica se é um objeto Transaction válido
    if (typeof result.result === 'object' && !Array.isArray(result.result)) {
      const transaction = result.result as Transaction;
      // Valida se tem os campos mínimos
      if (transaction.id || transaction.accountId) {
        return transaction;
      }
    }
    
    // Se for um array de transações
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
    
    throw new Error("Formato de resposta inválido do servidor");
  } catch (error) {
    // Re-throw se já for um Error, senão cria um novo
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro ao buscar transação");
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
