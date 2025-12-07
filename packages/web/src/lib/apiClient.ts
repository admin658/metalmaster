import type { ApiResponse } from '@metalmaster/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export type ApiError = {
  code?: string;
  message: string;
  status?: number;
  details?: unknown;
};

export type ApiClientOptions = {
  token?: string | null;
  headers?: Record<string, string>;
  timeoutMs?: number; // not implemented (placeholder)
};

function getTokenFromStorage(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  } catch (e) {
    return null;
  }
}

function buildHeaders(options?: ApiClientOptions) {
  const token = options?.token ?? getTokenFromStorage();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    return text;
  }
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: unknown,
  options?: ApiClientOptions
): Promise<{ data?: T; error?: ApiError }> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

  const init: RequestInit = {
    method,
    headers: buildHeaders(options),
    body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
  };

  try {
    const res = await fetch(url, init);

    const parsed = await parseJsonSafe(res);

    if (!res.ok) {
      // HTTP error
      const err: ApiError = {
        message: parsed?.error?.message || parsed?.message || res.statusText || 'HTTP error',
        status: res.status,
        code: parsed?.error?.code || undefined,
        details: parsed,
      };
      return { error: err };
    }

    // If API returns standardized ApiResponse<T>
    if (parsed && typeof parsed === 'object' && 'success' in parsed) {
      const apiResp = parsed as ApiResponse<T>;
      if (!apiResp.success) {
        return {
          error: {
            message: apiResp.error?.message || 'API returned error',
            code: apiResp.error?.code,
            details: apiResp.error,
          },
        };
      }

      return { data: apiResp.data as T };
    }

    // Fallback: return parsed body as the data
    return { data: parsed as T };
  } catch (err: unknown) {
    // Network or parse error
    return {
      error: {
        message: err instanceof Error ? err.message : 'Network error',
        details: err,
      },
    };
  }
}

export const apiGet = <T = unknown>(endpoint: string, options?: ApiClientOptions) =>
  apiRequest<T>(endpoint, 'GET', undefined, options);
export const apiPost = <T = unknown>(endpoint: string, body?: unknown, options?: ApiClientOptions) =>
  apiRequest<T>(endpoint, 'POST', body, options);
export const apiPatch = <T = unknown>(endpoint: string, body?: unknown, options?: ApiClientOptions) =>
  apiRequest<T>(endpoint, 'PATCH', body, options);
export const apiDelete = <T = unknown>(endpoint: string, body?: unknown, options?: ApiClientOptions) =>
  apiRequest<T>(endpoint, 'DELETE', body, options);

// Usage example (in comments):
// const { data, error } = await apiGet<UserStats>('/user-stats');
// if (error) { console.error('API Error:', error); return }
// console.log('stats', data);

export default {
  request: apiRequest,
  get: apiGet,
  post: apiPost,
  patch: apiPatch,
  delete: apiDelete,
};
