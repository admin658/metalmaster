import useSWR from 'swr';
import { useCallback } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../lib/apiClient';

interface UseApiOptions {
  skip?: boolean;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
}

// SWR fetcher that uses the typed api client. It returns the `data` or
// throws an Error so SWR treats it as a failure.
const fetcher = async <T,>(url: string) => {
  return apiGet<T>(url);
};

export const useApi = <T,>(
  endpoint: string,
  options: UseApiOptions = {}
) => {
  const { skip = false, revalidateOnFocus = true, revalidateOnReconnect = true } = options;

  const { data, error, isLoading, mutate } = useSWR<T>(
    skip ? null : endpoint,
    fetcher,
    {
      revalidateOnFocus,
      revalidateOnReconnect,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

export const useApiMutation = () => {
  const mutate = useCallback(async <T,>(
    endpoint: string,
    method: 'POST' | 'PATCH' | 'DELETE' = 'POST',
    body?: Record<string, any>
  ): Promise<T> => {
    if (method === 'POST') return apiPost<T>(endpoint, body);
    if (method === 'PATCH') return apiPatch<T>(endpoint, body);
    return apiDelete<T>(endpoint, body);
  }, []);

  return { mutate };
};
