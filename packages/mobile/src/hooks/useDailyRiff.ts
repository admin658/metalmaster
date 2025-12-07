'use strict';

import { useCallback } from 'react';
import { useApi } from './useApi';

export const useDailyRiff = () => {
  const { data, isLoading, error, mutate } = useApi('/daily-riffs/today');
  return { dailyRiff: data, isLoading, error, mutate };
};

export const useDailyRiffStats = () => {
  const { data, isLoading, error, mutate } = useApi('/daily-riffs/stats/user');
  return { stats: data, isLoading, error, mutate };
};

export const useCompleteDailyRiff = () => {
  const complete = useCallback(async (id: string) => {
    const res = await fetch(`/api/daily-riffs/${id}/complete`, { method: 'POST' });
    const json = await res.json();
    return json.data;
  }, []);

  return { complete };
};
