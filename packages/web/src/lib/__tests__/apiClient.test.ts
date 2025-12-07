import { apiGet, apiPost } from '../apiClient';

describe('apiClient', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('handles standardized success ApiResponse', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true, data: { hello: 'world' } }),
    });

    const res = await apiGet<{ hello: string }>('/test');
    expect(res.error).toBeUndefined();
    expect(res.data).toEqual({ hello: 'world' });
  });

  test('returns API-level error when success=false', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: false, error: { code: 'BAD', message: 'bad' } }),
    });

    const res = await apiGet('/test');
    expect(res.data).toBeUndefined();
    expect(res.error).toBeDefined();
    expect(res.error?.code).toBe('BAD');
    expect(res.error?.message).toBe('bad');
  });

  test('returns HTTP error for non-OK responses', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      text: async () => 'Internal Server Error',
    });

    const res = await apiGet('/test');
    expect(res.error).toBeDefined();
    expect(res.error?.status).toBe(500);
    expect(res.error?.message).toBeDefined();
  });

  test('returns network error on fetch rejection', async () => {
    (global as any).fetch = jest.fn().mockRejectedValue(new Error('Network down'));

    const res = await apiGet('/test');
    expect(res.error).toBeDefined();
    expect(res.error?.message).toMatch(/Network/);
  });
});
