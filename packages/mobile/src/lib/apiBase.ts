import Constants from 'expo-constants';

export const getApiBase = (): string => {
  const raw =
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiUrl ||
    (global.__DEV__ ? 'http://localhost:3000/api' : '');
  const trimmed = raw.replace(/\/$/, '');

  if (!trimmed) {
    console.warn('Missing EXPO_PUBLIC_API_URL; configure a production API base URL for mobile.');
  }

  return trimmed;
};
