import prisma from '../db';
import {
  FinanceReportData,
  FinanceTransaction,
  FinanceTransactionModel,
  FundType,
} from '../types/finance';

export class FinanceService {
  private toTransactionDTO(item: FinanceTransactionModel): FinanceTransaction {
    return {
      transaction_id: item.id,
      type: item.type,
      fund_type: item.fundType ?? null,
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

    const kasSummary = { total_income: 0, total_expense: 0, balance: 0 };
    const takmirSummary = { total_income: 0, total_expense: 0, balance: 0 };
    const unassignedSummary = { total_income: 0, total_expense: 0, balance: 0 };

    let totalIncome = 0;
    let totalExpense = 0;

    records.forEach((item) => {
      const isIncome = item.type === 'income';
      if (isIncome) {
        totalIncome += item.amount;
      } else {
        totalExpense += item.amount;
      }

      if (item.fundType === 'DANA_KAS') {
        if (isIncome) kasSummary.total_income += item.amount;
        else kasSummary.total_expense += item.amount;
      } else if (item.fundType === 'DANA_TAKMIR') {
        if (isIncome) takmirSummary.total_income += item.amount;
        else takmirSummary.total_expense += item.amount;
      } else {
        if (isIncome) unassignedSummary.total_income += item.amount;
        else unassignedSummary.total_expense += item.amount;
      }
    });

    kasSummary.balance = kasSummary.total_income - kasSummary.total_expense;
    takmirSummary.balance = takmirSummary.total_income - takmirSummary.total_expense;
    unassignedSummary.balance = unassignedSummary.total_income - unassignedSummary.total_expense;

    return {
      total_income: totalIncome,
      total_expense: totalExpense,
      current_balance: totalIncome - totalExpense,
      kas_summary: kasSummary,
      takmir_summary: takmirSummary,
      unassigned_summary: unassignedSummary,
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
    transactionAt: Date,
    fundType?: FundType
  ): Promise<FinanceTransaction> {
    const record = (await prisma.financeTransaction.create({
      data: {
        type,
        fundType: fundType || null,
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
    transactionAt?: Date,
    fundType?: FundType
  ): Promise<FinanceTransaction | null> {
    const data: Record<string, unknown> = {};
    if (type !== undefined) data.type = type;
    if (fundType !== undefined) data.fundType = fundType;
    if (description !== undefined) data.description = description;
    if (amount !== undefined) data.amount = amount;
    if (transactionAt !== undefined) data.transactionAt = transactionAt;

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
