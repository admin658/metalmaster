import { ApiClientError, apiGet, apiPost } from '../apiClient';

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
    expect(res).toEqual({ hello: 'world' });
  });

  test('returns API-level error when success=false', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: false, error: { code: 'BAD', message: 'bad' } }),
    });

    await apiGet('/test').catch((err) => {
      expect(err).toBeInstanceOf(ApiClientError);
      expect(err).toMatchObject({ code: 'BAD', message: 'bad' });
    });
  });

  test('returns HTTP error for non-OK responses', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      text: async () => 'Internal Server Error',
    });

    await apiGet('/test').catch((err) => {
      expect(err).toBeInstanceOf(ApiClientError);
      expect(err).toMatchObject({ status: 500 });
    });
  });

  test('returns network error on fetch rejection', async () => {
    (global as any).fetch = jest.fn().mockRejectedValue(new Error('Network down'));

    await apiGet('/test').catch((err) => {
      expect(err).toBeInstanceOf(ApiClientError);
      expect(err.message).toMatch(/Network down/);
    });
  });
});
