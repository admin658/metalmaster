export const getApiBase = (): string => {
  const raw = process.env.NEXT_PUBLIC_API_URL || '/api';
  const trimmed = raw.replace(/\/$/, '');

  if (trimmed.startsWith('http') || trimmed.startsWith('/')) return trimmed;
  if (typeof window !== 'undefined') {
    return `${window.location.origin.replace(/\/$/, '')}/${trimmed}`.replace(/\/{2,}/g, '/');
  }
  return `/${trimmed}`.replace(/\/{2,}/g, '/');
};
