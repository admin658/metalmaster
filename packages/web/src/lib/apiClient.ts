const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

export class ApiClientError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(message: string, options: { status?: number; code?: string; details?: unknown } = {}) {
    super(message);
    this.name = 'ApiClientError';
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
  }
}

export type ApiClientOptions = {
  token?: string | null;
  headers?: Record<string, string>;
  body?: unknown;
};

const resolveUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
};

export const functionUrl = (name: string) => `${API_BASE}/.netlify/functions/${name}`;

function buildHeaders(options?: ApiClientOptions): Record<string, string> {
  const headers: Record<string, string> = {
    ...(options?.headers ?? {}),
  };

  if (options?.body !== undefined && !(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  return headers;
}

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const parsed = await parseJsonSafe(res);

  if (!res.ok) {
    const message =
      (parsed as any)?.message ||
      (parsed as any)?.error?.message ||
      res.statusText ||
      'Request failed';
    throw new ApiClientError(message, {
      status: res.status,
      code: (parsed as any)?.error?.code,
      details: parsed,
    });
  }

  if (parsed && typeof parsed === 'object' && 'success' in (parsed as Record<string, unknown>)) {
    const data = parsed as { success: boolean; data?: T; error?: { code?: string; message?: string } };
    if (!data.success) {
      throw new ApiClientError(data.error?.message || 'API returned an error', {
        code: data.error?.code,
        details: parsed,
      });
    }
    return data.data as T;
  }

  return parsed as T;
}

export async function apiFetch<T = unknown>(
  path: string,
  init: ApiClientOptions & RequestInit = {}
): Promise<T> {
  const url = resolveUrl(path);

  try {
    const response = await fetch(url, {
      ...init,
      method: init.method ?? 'GET',
      headers: buildHeaders(init as ApiClientOptions),
      body:
        init.body !== undefined && !(init.body instanceof FormData)
          ? JSON.stringify(init.body)
          : (init.body as BodyInit | null | undefined),
    });

    return await handleResponse<T>(response);
  } catch (err) {
    if (err instanceof ApiClientError) throw err;
    throw new ApiClientError(err instanceof Error ? err.message : 'Network error', { details: err });
  }
}

export const apiGet = <T = unknown>(path: string, options?: ApiClientOptions) =>
  apiFetch<T>(path, { ...options, method: 'GET' });
export const apiPost = <T = unknown>(path: string, body?: unknown, options?: ApiClientOptions) =>
  apiFetch<T>(path, { ...options, method: 'POST', body });
export const apiPatch = <T = unknown>(path: string, body?: unknown, options?: ApiClientOptions) =>
  apiFetch<T>(path, { ...options, method: 'PATCH', body });
export const apiDelete = <T = unknown>(path: string, body?: unknown, options?: ApiClientOptions) =>
  apiFetch<T>(path, { ...options, method: 'DELETE', body });
