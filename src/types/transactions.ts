export interface Transaction {
  id?: string;
  accountId: string;
  value: number;
  type: "Debit" | "Credit";
  from?: string;
  to?: string;
  anexo?: string;
  urlAnexo?: string;
  date?: string;
}

export interface TransactionFormData {
  accountId: string;
  value: string;
  type: "Debit" | "Credit";
  from: string;
  to: string;
  anexo: string;
  urlAnexo: string;
}

export interface CreateTransactionRequest {
  accountId: string;
  value: number;
  type: "Debit" | "Credit";
  from?: string;
  to?: string;
  anexo?: string;
  urlAnexo?: string;
}

export interface UpdateTransactionRequest extends CreateTransactionRequest {}

export interface TransactionResponse {
  message: string;
  result: Transaction;
}

export interface TransactionsListResponse {
  message: string;
  result: Transaction[] | {
    transactions: Transaction[];
  };
}

