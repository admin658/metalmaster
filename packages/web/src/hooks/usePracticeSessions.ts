import useSWR from 'swr';
import { useCallback, useState } from 'react';
import type { PracticeSession, PracticeSessionStats } from '@metalmaster/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface PracticeSessionsResponse {
  items: PracticeSession[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
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
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};

export const usePracticeSessions = (page = 1, limit = 10, sessionType?: string) => {
  let endpoint = `/practice-sessions?page=${page}&limit=${limit}`;
  if (sessionType) {
    endpoint += `&session_type=${sessionType}`;
  }

  const { data, error, isLoading, mutate } = useSWR<any>(
    endpoint,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    sessions: (data?.data?.items || []) as PracticeSession[],
    total: data?.data?.total || 0,
    totalPages: data?.data?.total_pages || 0,
    isLoading,
    error,
    mutate,
  };
};

export const usePracticeSessionStats = () => {
  const { data, error, isLoading, mutate } = useSWR<any>(
    '/practice-sessions/stats/summary',
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    stats: data?.data as PracticeSessionStats | undefined,
    isLoading,
    error,
    mutate,
  };
};

export const useCreatePracticeSession = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(async (sessionData: {
    session_type: string;
    duration_seconds: number;
    xp_earned: number;
    accuracy_percentage?: number;
    related_riff_id?: string;
    related_lesson_id?: string;
    related_jam_track_id?: string;
    notes?: string;
  }): Promise<PracticeSession | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`${API_URL}/practice-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      return result.data as PracticeSession;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { create, isLoading, error };
};

export const useDeletePracticeSession = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteSession = useCallback(async (sessionId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`${API_URL}/practice-sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { deleteSession, isLoading, error };
};
