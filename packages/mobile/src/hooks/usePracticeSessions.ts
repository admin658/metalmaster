import { useApi } from './useApi';

export const usePracticeSessions = (page = 1, limit = 10, sessionType) => {
  const endpoint = `/practice-sessions?page=${page}&limit=${limit}${sessionType ? `&session_type=${sessionType}` : ''}`;
  const { data, isLoading, error, mutate } = useApi(endpoint);
  return { sessions: data?.items || data, total: data?.total || 0, totalPages: data?.total_pages || 0, isLoading, error, mutate };
};

export const usePracticeSessionStats = () => {
  const { data, isLoading, error, mutate } = useApi('/practice-sessions/stats/summary');
  return { stats: data, isLoading, error, mutate };
};

export const useCreatePracticeSession = () => {
  const create = async (payload) => {
    const res = await fetch('/api/practice-sessions', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
    const json = await res.json();
    return json.data;
  };

  return { create };
};
