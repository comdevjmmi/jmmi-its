export type FinanceTransactionType = 'income' | 'expenses';

export type FundType = 'DANA_KAS' | 'DANA_TAKMIR' | null;

export interface FinanceTransaction {
  transaction_id: string;
  type: FinanceTransactionType;
  fund_type: FundType;
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

export interface FundBreakdown {
  total_income: number;
  total_expense: number;
  balance: number;
}

export interface FinanceReportData {
  total_income: number;
  total_expense: number;
  current_balance: number;
  kas_summary: FundBreakdown;
  takmir_summary: FundBreakdown;
  unassigned_summary: FundBreakdown;
  transactions: FinanceTransaction[];
}

export interface FinanceTransactionModel {
  id: string;
  type: FinanceTransactionType;
  fundType: 'DANA_KAS' | 'DANA_TAKMIR' | null;
  description: string;
  amount: number;
  transactionAt: Date;
  createdAt: Date;
}
