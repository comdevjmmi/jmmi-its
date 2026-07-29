import prisma from '../db';
import {
  FinanceReportData,
  FinanceTransaction,
  FinanceTransactionModel,
} from '../types/finance';

export class FinanceService {
  private toTransactionDTO(item: FinanceTransactionModel): FinanceTransaction {
    return {
      transaction_id: item.id,
      type: item.type,
      description: item.description,
      amount: item.amount,
      transaction_date: item.transactionAt.toISOString(),
      timestamp: item.createdAt.toISOString(),
    };
  }

  async getReport(): Promise<FinanceReportData> {
    const records = (await prisma.financeTransaction.findMany({
      orderBy: [{ transactionAt: 'desc' }, { createdAt: 'desc' }],
    })) as unknown as FinanceTransactionModel[];

    const totals = records.reduce(
      (acc, item) => {
        if (item.type === 'income') {
          acc.totalIncome += item.amount;
        } else {
          acc.totalExpense += item.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );

    return {
      total_income: totals.totalIncome,
      total_expense: totals.totalExpense,
      current_balance: totals.totalIncome - totals.totalExpense,
      transactions: records.map((item) => this.toTransactionDTO(item)),
    };
  }

  async getAllTransactions(page = 1, limit = 10): Promise<{ data: FinanceTransaction[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      (await prisma.financeTransaction.findMany({
        skip,
        take: limit,
        orderBy: [{ transactionAt: 'desc' }, { createdAt: 'desc' }],
      })) as unknown as Promise<FinanceTransactionModel[]>,
      (await prisma.financeTransaction.count()) as unknown as Promise<number>
    ]);
    return {
      data: records.map((item) => this.toTransactionDTO(item)),
      total,
      page,
      limit
    };
  }

  async createTransaction(
    type: 'income' | 'expenses',
    description: string,
    amount: number,
    transactionAt: Date
  ): Promise<FinanceTransaction> {
    const record = (await prisma.financeTransaction.create({
      data: {
        type,
        description,
        amount,
        transactionAt,
      },
    })) as unknown as FinanceTransactionModel;

    return this.toTransactionDTO(record);
  }

  async updateTransaction(
    id: string,
    type?: 'income' | 'expenses',
    description?: string,
    amount?: number,
    transactionAt?: Date
  ): Promise<FinanceTransaction | null> {
    const data: Record<string, unknown> = {};
    if (type) data.type = type;
    if (description) data.description = description;
    if (amount) data.amount = amount;
    if (transactionAt) data.transactionAt = transactionAt;

    const record = (await prisma.financeTransaction.update({
      where: { id },
      data,
    })) as unknown as FinanceTransactionModel;

    return this.toTransactionDTO(record);
  }

  async deleteTransaction(id: string): Promise<boolean> {
    await prisma.financeTransaction.delete({
      where: { id },
    });
    return true;
  }
}
