import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { api } from '@/lib/api';
import { DANGER_TOAST, showToast, SUCCESS_TOAST } from '@/components/Toast';
import { ApiError, ApiResponse } from '@/types/api';
import {
  ShortLink,
} from '@/types/entities/links';

export interface PaginatedShortLinks {
  data: ShortLink[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateShortLinkRequest {
  short_code?: string;
  url: string;
}

export interface UpdateShortLinkRequest {
  short_code?: string;
  url?: string;
}

export const useGetShortLinks = (page = 1, limit = 10, search = '') => {
  const {
    data: shortLinksData,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse<PaginatedShortLinks>, AxiosError<ApiError>>({
    queryKey: ['shortlinks', page, limit, search],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedShortLinks>>('/shortlinks', {
        params: { page, limit, search },
      });
      return res.data;
    },
  });

  const paginationData = shortLinksData?.data || { data: [], total: 0, page, limit };

  return {
    shortLinks: paginationData.data,
    total: paginationData.total,
    currentPage: paginationData.page,
    itemsPerPage: paginationData.limit,
    isLoading,
    error: isError ? 'Failed to fetch short links' : null,
    refetch,
  };
};

export const useCreateShortLink = () => {
  const queryClient = useQueryClient();

  const {
    mutateAsync: createShortLinkAsync,
    isPending: isLoading,
  } = useMutation<ApiResponse<ShortLink>, AxiosError<ApiError>, CreateShortLinkRequest>({
    mutationFn: async (data) => {
      const res = await api.post<ApiResponse<ShortLink>>('/shortlinks', data);
      return res.data;
    },
    onSuccess: () => {
      showToast('Short link berhasil dibuat', SUCCESS_TOAST);
      queryClient.invalidateQueries({ queryKey: ['shortlinks'] });
    },
    onError: (error) => {
      const message = error.response?.data.message || 'Gagal membuat short link';
      showToast(typeof message === 'string' ? message : 'Gagal membuat short link', DANGER_TOAST);
    },
  });

  return {
    mutateAsync: createShortLinkAsync,
    isLoading,
  };
};

export const useUpdateShortLink = () => {
  const queryClient = useQueryClient();

  const {
    mutateAsync: updateShortLinkAsync,
    isPending: isLoading,
  } = useMutation<
    ApiResponse<ShortLink>,
    AxiosError<ApiError>,
    { id: string; data: UpdateShortLinkRequest }
  >({
    mutationFn: async ({ id, data }) => {
      const res = await api.put<ApiResponse<ShortLink>>(`/shortlinks/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      showToast('Short link berhasil diupdate', SUCCESS_TOAST);
      queryClient.invalidateQueries({ queryKey: ['shortlinks'] });
    },
    onError: (error) => {
      const message = error.response?.data.message || 'Gagal mengupdate short link';
      showToast(typeof message === 'string' ? message : 'Gagal mengupdate short link', DANGER_TOAST);
    },
  });

  return {
    mutateAsync: updateShortLinkAsync,
    isLoading,
  };
};

export const useDeleteShortLink = () => {
  const queryClient = useQueryClient();

  const {
    mutateAsync: deleteShortLinkAsync,
    isPending: isLoading,
  } = useMutation<ApiResponse<null>, AxiosError<ApiError>, string>({
    mutationFn: async (id) => {
      const res = await api.delete<ApiResponse<null>>(`/shortlinks/${id}`);
      return res.data;
    },
    onSuccess: () => {
      showToast('Short link berhasil dihapus', SUCCESS_TOAST);
      queryClient.invalidateQueries({ queryKey: ['shortlinks'] });
    },
    onError: (error) => {
      const message = error.response?.data.message || 'Gagal menghapus short link';
      showToast(typeof message === 'string' ? message : 'Gagal menghapus short link', DANGER_TOAST);
    },
  });

  return {
    mutateAsync: deleteShortLinkAsync,
    isLoading,
  };
};
