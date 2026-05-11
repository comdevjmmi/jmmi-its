import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

import {
  CalendarEvent,
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest,
} from '@/types/entities/calendar';

export interface PaginatedCalendarEvents {
  data: CalendarEvent[];
  total: number;
  page: number;
  limit: number;
}

export function useGetAllCalendarEvents(page = 1, limit = 8, search = '') {
  return useQuery({
    queryKey: ['calendar-events-admin', page, limit, search],
    queryFn: async () => {
      const response = await api.get<{
        status: boolean;
        message: string;
        data: PaginatedCalendarEvents;
      }>('/calendar/admin/events', {
        params: { page, limit, search },
      });
      return response.data.data;
    },
  });
}

export function useCreateCalendarEvent() {
  return useMutation({
    mutationFn: async (data: CreateCalendarEventRequest) => {
      const response = await api.post<{
        status: boolean;
        message: string;
        data: CalendarEvent;
      }>('/calendar/admin/events', data);
      return response.data.data;
    },
  });
}

export function useUpdateCalendarEvent() {
  return useMutation({
    mutationFn: async (data: { id: string } & UpdateCalendarEventRequest) => {
      const { id, ...updateData } = data;
      const response = await api.put<{
        status: boolean;
        message: string;
        data: CalendarEvent;
      }>(`/calendar/admin/events/${id}`, updateData);
      return response.data.data;
    },
  });
}

export function useDeleteCalendarEvent() {
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/calendar/admin/events/${id}`);
      return true;
    },
  });
}
