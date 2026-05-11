import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { api } from '@/lib/api';

import { ApiError, ApiResponse } from '@/types/api';
import { FinanceReportData, FinanceTransaction } from '@/types/entities/finance';

export interface PaginatedFinanceTransactions {
  data: FinanceTransaction[];
  total: number;
  page: number;
  limit: number;
}

export const useGetFinanceReport = () => {
  const {
    data: reportData,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse<FinanceReportData>, AxiosError<ApiError>>({
    queryKey: ['finance-report'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<FinanceReportData>>('/finance/report');
      return res.data;
    },
  });

  return {
    data: reportData?.data,
    isLoading,
    error: isError ? 'Failed to fetch finance report' : null,
    refetch,
  };
};

export const useGetFinanceTransactions = (page = 1, limit = 10) => {
  const {
    data: transactionsData,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse<PaginatedFinanceTransactions>, AxiosError<ApiError>>({
    queryKey: ['finance-transactions', page, limit],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedFinanceTransactions>>('/finance/transactions', {
        params: { page, limit },
      });
      return res.data;
    },
  });

  const paginationData = transactionsData?.data || { data: [], total: 0, page, limit };

  return {
    transactions: paginationData.data,
    total: paginationData.total,
    currentPage: paginationData.page,
    itemsPerPage: paginationData.limit,
    isLoading,
    error: isError ? 'Failed to fetch finance transactions' : null,
    refetch,
  };
};
