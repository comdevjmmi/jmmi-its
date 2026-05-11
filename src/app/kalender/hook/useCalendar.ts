import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { api } from '@/lib/api';

import { ApiError, ApiResponse } from '@/types/api';
import { CalendarEvent } from '@/types/entities/calendar';

export interface PaginatedCalendarEvents {
  data: CalendarEvent[];
  total: number;
  page: number;
  limit: number;
}

export const useGetCalendarEvents = (page = 1, limit = 10) => {
  const {
    data: calendarData,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse<PaginatedCalendarEvents>, AxiosError<ApiError>>({
    queryKey: ['calendar-events', page, limit],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedCalendarEvents>>('/calendar/events', {
        params: { page, limit },
      });
      return res.data;
    },
  });

  const paginationData = calendarData?.data || { data: [], total: 0, page, limit };

  return {
    events: paginationData.data,
    total: paginationData.total,
    currentPage: paginationData.page,
    itemsPerPage: paginationData.limit,
    isLoading,
    error: isError ? 'Failed to fetch calendar events' : null,
    refetch,
  };
};
