/** @jest-environment node */

import { POST } from './route';
import { createUserSupabaseClient } from '../../_lib/supabase';

jest.mock('../../_lib/supabase', () => ({
  createUserSupabaseClient: jest.fn(),
}));

const makeRequest = (body: unknown) =>
  new Request('http://localhost/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify(body),
  });

describe('POST /api/auth/refresh', () => {
  it('returns refreshed tokens', async () => {
    const refreshSession = jest.fn().mockResolvedValue({
      data: {
        session: { access_token: 'access', refresh_token: 'refresh', expires_in: 3600 },
      },
      error: null,
    });
    (createUserSupabaseClient as jest.Mock).mockReturnValue({
      auth: { refreshSession },
    });

    const res = await POST(makeRequest({ refresh_token: 'refresh' }) as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.tokens).toMatchObject({
      access_token: 'access',
      refresh_token: 'refresh',
      expires_in: 3600,
    });
  });

  it('returns 401 on refresh error', async () => {
    const refreshSession = jest.fn().mockResolvedValue({
      data: {},
      error: { message: 'Expired refresh' },
    });
    (createUserSupabaseClient as jest.Mock).mockReturnValue({
      auth: { refreshSession },
    });

    const res = await POST(makeRequest({ refresh_token: 'expired' }) as any);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('REFRESH_ERROR');
  });
});
