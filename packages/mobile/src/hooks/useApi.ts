import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getApiBase } from '../lib/apiBase';

const API_URL = getApiBase();

interface UseApiOptions {
  skip?: boolean;
}

export const useApi = <T,>(endpoint: string, options: UseApiOptions = {}) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(!options.skip);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (options.skip) return;

    setIsLoading(true);
    setError(null);

    try {
      if (!API_URL) {
        throw new Error('API base URL is not set; configure EXPO_PUBLIC_API_URL.');
      }
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, options.skip]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const mutate = useCallback(async () => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, mutate };
};

export const useApiMutation = () => {
  const mutate = useCallback(async <T,>(
    endpoint: string,
    method: 'POST' | 'PATCH' | 'DELETE' = 'POST',
    body?: Record<string, any>
  ): Promise<T> => {
    if (!API_URL) {
      throw new Error('API base URL is not set; configure EXPO_PUBLIC_API_URL.');
    }
    const token = await getAuthToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }, []);

  return { mutate };
};

async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('auth_token');
  } catch {
    return null;
  }
}
