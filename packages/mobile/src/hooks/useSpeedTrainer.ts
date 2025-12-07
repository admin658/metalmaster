import { useApi } from './useApi';

export const useSpeedTrainer = (page = 1, limit = 10, exerciseType) => {
  const endpoint = `/speed-trainer?page=${page}&limit=${limit}${exerciseType ? `&exercise_type=${exerciseType}` : ''}`;
  const { data, isLoading, error, mutate } = useApi(endpoint);
  return { sessions: data?.items || data, total: data?.total || 0, totalPages: data?.total_pages || 0, isLoading, error, mutate };
};

export const useSpeedTrainerProgress = (exerciseType) => {
  const endpoint = `/speed-trainer/progress/stats${exerciseType ? `?exercise_type=${exerciseType}` : ''}`;
  const { data, isLoading, error, mutate } = useApi(endpoint);
  return { progress: data, isLoading, error, mutate };
};

export const useCreateSpeedTrainerSession = () => {
  const create = async (payload) => {
    const res = await fetch('/api/speed-trainer', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
    const json = await res.json();
    return json.data;
  };

  return { create };
};
