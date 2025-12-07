import useSWR from 'swr';
import { useCallback, useState } from 'react';
import type { DailyRiff, DailyRiffCompletion, UserDailyRiffStats } from '@metalmaster/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface UseApiOptions {
  skip?: boolean;
  revalidateOnFocus?: boolean;
}

const fetcher = async (url: string, options?: RequestInit) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = new Error(`API error: ${response.status}`);
    const data = await response.json();
    (error as any).data = data;
    throw error;
  }

  return response.json();
};

export const useDailyRiff = () => {
  const { data, error, isLoading, mutate } = useSWR<any>(
    '/daily-riffs/today',
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    dailyRiff: data?.data as DailyRiff | undefined,
    isLoading,
    error,
    mutate,
  };
};

export const useDailyRiffStats = () => {
  const { data, error, isLoading, mutate } = useSWR<any>(
    '/daily-riffs/stats/user',
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true }
  );

  return {
    stats: data?.data as UserDailyRiffStats | undefined,
    isLoading,
    error,
    mutate,
  };
};

export const useDailyRiffList = (page = 1, limit = 10) => {
  const { data, error, isLoading, mutate } = useSWR<any>(
    `/daily-riffs?page=${page}&limit=${limit}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    dailyRiffs: data?.data?.items || [],
    total: data?.data?.total || 0,
    totalPages: data?.data?.total_pages || 0,
    isLoading,
    error,
    mutate,
  };
};

export const useCompleteDailyRiff = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const complete = useCallback(async (dailyRiffId: string): Promise<DailyRiffCompletion | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`${API_URL}/daily-riffs/${dailyRiffId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      return result.data as DailyRiffCompletion;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { complete, isLoading, error };
};
