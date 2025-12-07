import { useApi } from './useApi';

export const useAchievements = () => {
  const { data, isLoading, error, mutate } = useApi('/achievements');
  return { achievements: data, isLoading, error, mutate };
};

export const useAchievementsLibrary = () => {
  const { data, isLoading, error, mutate } = useApi('/achievements/library');
  return { library: data, isLoading, error, mutate };
};

export const useAchievementsProgress = () => {
  const { data, isLoading, error, mutate } = useApi('/achievements/progress');
  return { progress: data, isLoading, error, mutate };
};
