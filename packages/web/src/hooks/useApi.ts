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
  const { data, error } = await apiGet<T>(url);
  if (error) {
    const message = error.message || `API error: ${error.status || 'unknown'}`;
    const err = new Error(message) as Error & { code?: string; status?: number; details?: any };
    err.code = error.code;
    err.status = error.status;
    err.details = error.details;
    throw err;
  }
  return data as T;
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
    let res;
    if (method === 'POST') res = await apiPost<T>(endpoint, body);
    else if (method === 'PATCH') res = await apiPatch<T>(endpoint, body);
    else res = await apiDelete<T>(endpoint, body);

    if (res.error) {
      throw new Error(res.error.message || 'API mutation failed');
    }

    return res.data as T;
  }, []);

  return { mutate };
};
