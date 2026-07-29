export type FinanceTransactionType = 'income' | 'expenses';

export interface FinanceTransaction {
  transaction_id: string;
  type: FinanceTransactionType;
  description: string;
  amount: number;
  transaction_date: string;
  timestamp: string;
}

export interface PaginatedFinanceTransactions {
  data: FinanceTransaction[];
  total: number;
  page: number;
  limit: number;
}

export interface FinanceReportData {
  total_income: number;
  total_expense: number;
  current_balance: number;
  transactions: FinanceTransaction[];
}

export interface FinanceTransactionModel {
  id: string;
  type: FinanceTransactionType;
  description: string;
  amount: number;
  transactionAt: Date;
  createdAt: Date;
}
