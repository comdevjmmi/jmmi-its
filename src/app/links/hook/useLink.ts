import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { api } from '@/lib/api';

import { DANGER_TOAST, showToast, SUCCESS_TOAST } from '@/components/Toast';

import { ApiError, ApiResponse } from '@/types/api';
import {
  CreateLinkRequest,
  Link,
  LinksHomepageData,
  UpdateLinkRequest,
} from '@/types/entities/links';

export const useGetLinksHomepage = () => {
  const {
    data: homepageData,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse<LinksHomepageData>, AxiosError<ApiError>>({
    queryKey: ['links-homepage'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<LinksHomepageData>>(
        '/links/homepage'
      );
      return res.data;
    },
  });

  return {
    data: homepageData?.data,
    isLoading,
    error: isError ? 'Failed to fetch homepage data' : null,
    fetchLinksHomepage: refetch,
  };
};

export const useGetLinks = () => {
  const {
    data: linksData,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse<Link[]>, AxiosError<ApiError>>({
    queryKey: ['links'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Link[]>>('/links/items');
      return res.data;
    },
  });

  return {
    data: linksData?.data || [],
    isLoading,
    error: isError ? 'Failed to fetch links' : null,
    fetchLinks: refetch,
  };
};

export const useGetLinkById = () => {
  const [data, setData] = useState<Link | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLink = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<Link>>(`/links/items/${id}`);
      setData(res.data.data);
      return res.data.data;
    } catch (err: unknown) {
      let errorMessage = 'Failed to fetch link';
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage =
          typeof err.response.data.message === 'string'
            ? err.response.data.message
            : (Object.values(err.response.data.message)[0] as string[])[0];
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchLink };
};

export const useCreateLink = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    mutate: createLink,
    mutateAsync: createLinkAsync,
    isPending: isLoading,
    isError,
  } = useMutation<ApiResponse<Link>, AxiosError<ApiError>, CreateLinkRequest>({
    mutationFn: async (data) => {
      const res = await api.post<ApiResponse<Link>>('/links/items', data);
      return res.data;
    },
    onSuccess: () => {
      showToast('Link berhasil dibuat', SUCCESS_TOAST);
      queryClient.invalidateQueries({ queryKey: ['links'] });
      router.push('/admin/links');
    },
    onError: (error) => {
      const message =
        error.response?.data.error ||
        (typeof error.response?.data.message === 'string'
          ? error.response?.data.message
          : 'Gagal membuat link');
      showToast(message, DANGER_TOAST);
    },
  });

  return {
    mutate: createLink,
    mutateAsync: createLinkAsync,
    isLoading,
    error: isError ? 'Error' : null,
  };
};

export const useUpdateLink = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    mutateAsync: updateLinkAsync,
    isPending: isLoading,
    isError,
  } = useMutation<
    ApiResponse<Link>,
    AxiosError<ApiError>,
    { id: string; data: UpdateLinkRequest }
  >({
    mutationFn: async ({ id, data }) => {
      const res = await api.put<ApiResponse<Link>>(`/links/items/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      showToast('Link berhasil diupdate', SUCCESS_TOAST);
      queryClient.invalidateQueries({ queryKey: ['links'] });
      router.push('/admin/links');
    },
    onError: (error) => {
      const message =
        error.response?.data.error ||
        (typeof error.response?.data.message === 'string'
          ? error.response?.data.message
          : 'Gagal mengupdate link');
      showToast(message, DANGER_TOAST);
    },
  });

  const mutateWrapper = async (id: string, data: UpdateLinkRequest) => {
    return await updateLinkAsync({ id, data });
  };

  return {
    mutate: mutateWrapper,
    mutateAsync: mutateWrapper,
    isLoading,
    error: isError ? 'Error' : null,
  };
};

export const useDeleteLink = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    mutate: deleteLink,
    mutateAsync: deleteLinkAsync,
    isPending: isLoading,
    isError,
  } = useMutation<ApiResponse<null>, AxiosError<ApiError>, string>({
    mutationFn: async (id) => {
      const res = await api.delete<ApiResponse<null>>(`/links/items/${id}`);
      return res.data;
    },
    onSuccess: () => {
      showToast('Link berhasil dihapus', SUCCESS_TOAST);
      queryClient.invalidateQueries({ queryKey: ['links'] });
      router.push('/admin/links');
    },
    onError: (error) => {
      const message =
        error.response?.data.error ||
        (typeof error.response?.data.message === 'string'
          ? error.response?.data.message
          : 'Gagal menghapus link');
      showToast(message, DANGER_TOAST);
    },
  });

  return {
    mutate: deleteLink,
    mutateAsync: deleteLinkAsync,
    isLoading,
    error: isError ? 'Error' : null,
  };
};
