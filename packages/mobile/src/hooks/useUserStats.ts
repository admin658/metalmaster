import { useApi } from './useApi';

export const useUserStats = () => {
  const { data, isLoading, error, mutate } = useApi('/user-stats');
  return { stats: data, isLoading, error, mutate };
};

export const useUserHeatmap = (start: string, end: string) => {
  const { data, isLoading, error, mutate } = useApi(`/user-stats/heatmap?start_date=${start}&end_date=${end}`);
  return { heatmap: data, isLoading, error, mutate };
};

export const useUserSkills = () => {
  const { data, isLoading, error, mutate } = useApi('/user-stats/skills');
  return { skills: data, isLoading, error, mutate };
};
