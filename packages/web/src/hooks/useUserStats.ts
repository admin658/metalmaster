import useSWR from 'swr';
import type { UserStats, UserPracticeHeatmap, SkillCategoryStats } from '@metalmaster/shared-types';

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

export const useUserStats = () => {
  const { data, error, isLoading, mutate } = useSWR<any>(
    '/user-stats',
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    stats: data?.data as UserStats | undefined,
    isLoading,
    error,
    mutate,
  };
};

export const useUserStatsSummary = () => {
  const { data, error, isLoading, mutate } = useSWR<any>(
    '/user-stats/summary',
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    summary: data?.data,
    isLoading,
    error,
    mutate,
  };
};

export const useUserHeatmap = (startDate: string, endDate: string) => {
  const { data, error, isLoading, mutate } = useSWR<any>(
    `/user-stats/heatmap?start_date=${startDate}&end_date=${endDate}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    heatmap: (data?.data || []) as UserPracticeHeatmap[],
    isLoading,
    error,
    mutate,
  };
};

export const useUserSkills = () => {
  const { data, error, isLoading, mutate } = useSWR<any>(
    '/user-stats/skills',
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    skills: (data?.data || []) as SkillCategoryStats[],
    isLoading,
    error,
    mutate,
  };
};
