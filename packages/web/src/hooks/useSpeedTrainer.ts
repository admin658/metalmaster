import useSWR from 'swr';
import { useCallback, useState } from 'react';
import type { SpeedTrainerSession, SpeedTrainerProgress } from '@metalmaster/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface SpeedTrainerSessionsResponse {
  items: SpeedTrainerSession[];
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

export const useSpeedTrainerSessions = (page = 1, limit = 10, exerciseType?: string) => {
  let endpoint = `/speed-trainer?page=${page}&limit=${limit}`;
  if (exerciseType) {
    endpoint += `&exercise_type=${exerciseType}`;
  }

  const { data, error, isLoading, mutate } = useSWR<any>(
    endpoint,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    sessions: (data?.data?.items || []) as SpeedTrainerSession[],
    total: data?.data?.total || 0,
    totalPages: data?.data?.total_pages || 0,
    isLoading,
    error,
    mutate,
  };
};

export const useSpeedTrainerProgress = (exerciseType?: string) => {
  let endpoint = '/speed-trainer/progress/stats';
  if (exerciseType) {
    endpoint += `?exercise_type=${exerciseType}`;
  }

  const { data, error, isLoading, mutate } = useSWR<any>(
    endpoint,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    progress: (data?.data || []) as SpeedTrainerProgress[],
    isLoading,
    error,
    mutate,
  };
};

export const useCreateSpeedTrainerSession = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(async (sessionData: {
    exercise_type: string;
    starting_bpm: number;
    target_bpm: number;
    auto_increment_enabled: boolean;
    riff_id?: string;
    notes?: string;
  }): Promise<SpeedTrainerSession | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`${API_URL}/speed-trainer`, {
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
      return result.data as SpeedTrainerSession;
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

export const useUpdateSpeedTrainerSession = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(async (sessionId: string, updates: {
    current_bpm?: number;
    ending_bpm?: number;
    accuracy_percentage?: number;
    duration_seconds?: number;
    notes?: string;
  }): Promise<SpeedTrainerSession | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`${API_URL}/speed-trainer/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      return result.data as SpeedTrainerSession;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { update, isLoading, error };
};

export const useDeleteSpeedTrainerSession = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteSession = useCallback(async (sessionId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`${API_URL}/speed-trainer/${sessionId}`, {
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
// Note: the SWR-based `useSpeedTrainerProgress` is defined earlier in this file.
