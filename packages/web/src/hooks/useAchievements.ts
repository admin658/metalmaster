import useSWR from 'swr';
import { useCallback, useState } from 'react';
import type { Achievement, UserAchievement, AchievementProgress } from '@metalmaster/shared-types';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '');

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
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};

export const useAchievementsLibrary = () => {
  const { data, error, isLoading, mutate } = useSWR<any>(
    '/achievements/library',
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    achievements: (data?.data || []) as Achievement[],
    isLoading,
    error,
    mutate,
  };
};

export const useUserAchievements = () => {
  const { data, error, isLoading, mutate } = useSWR<any>(
    '/achievements',
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    achievements: (data?.data || []) as UserAchievement[],
    isLoading,
    error,
    mutate,
  };
};

export const useAchievementsProgress = () => {
  const { data, error, isLoading, mutate } = useSWR<any>(
    '/achievements/progress',
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    progress: (data?.data || []) as AchievementProgress[],
    isLoading,
    error,
    mutate,
  };
};

export const useAchievementsStats = () => {
  const { data, error, isLoading, mutate } = useSWR<any>(
    '/achievements/stats/summary',
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    stats: data?.data,
    isLoading,
    error,
    mutate,
  };
};

export const useAwardAchievement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const award = useCallback(async (achievementId: string): Promise<UserAchievement | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`${API_URL}/achievements/${achievementId}/award`, {
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
      return result.data as UserAchievement;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { award, isLoading, error };
};
