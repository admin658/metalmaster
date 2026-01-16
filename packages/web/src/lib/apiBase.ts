export const getApiBase = (): string => {
  const raw = process.env.NEXT_PUBLIC_API_URL || '/api';
  const trimmed = raw.replace(/\/$/, '');

  // If the env provides a full origin (http...), ensure it points to the API
  // root. Many hooks call paths like `/user-stats` (without `/api`). If the
  // configured base is just the origin (e.g. `http://localhost:3001`) we
  // append `/api` so callers become `http://host:port/api/user-stats`.
  if (trimmed.startsWith('http')) {
    try {
      const u = new URL(trimmed);
      // If the origin path is empty or just `/`, append `/api`
      if (!u.pathname || u.pathname === '/') return `${trimmed}/api`;
    } catch {
      // If URL parsing fails, fall back to returning trimmed
    }
    return trimmed;
  }

  if (trimmed.startsWith('/')) return trimmed;
  if (typeof window !== 'undefined') {
    return `${window.location.origin.replace(/\/$/, '')}/${trimmed}`.replace(/\/{2,}/g, '/');
  }
  return `/${trimmed}`.replace(/\/{2,}/g, '/');
};
