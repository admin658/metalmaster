/** @jest-environment node */

import { POST } from './route';
import { createUserSupabaseClient } from '../../_lib/supabase';

jest.mock('../../_lib/supabase', () => ({
  createUserSupabaseClient: jest.fn(),
}));

const makeRequest = (body: unknown) =>
  new Request('http://localhost/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });

describe('POST /api/auth/login', () => {
  it('returns tokens for valid credentials', async () => {
    const signInWithPassword = jest.fn().mockResolvedValue({
      data: {
        user: { id: 'user-1', email: 'test@example.com', user_metadata: { username: 'tester' } },
        session: { access_token: 'access', refresh_token: 'refresh', expires_in: 3600 },
      },
      error: null,
    });
    (createUserSupabaseClient as jest.Mock).mockReturnValue({
      auth: { signInWithPassword },
    });

    const res = await POST(makeRequest({ email: 'test@example.com', password: 'password123' }) as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.tokens).toMatchObject({
      access_token: 'access',
      refresh_token: 'refresh',
      expires_in: 3600,
    });
  });

  it('returns 401 when Supabase rejects credentials', async () => {
    const signInWithPassword = jest.fn().mockResolvedValue({
      data: {},
      error: { message: 'Invalid login' },
    });
    (createUserSupabaseClient as jest.Mock).mockReturnValue({
      auth: { signInWithPassword },
    });

    const res = await POST(makeRequest({ email: 'test@example.com', password: 'password123' }) as any);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('AUTH_ERROR');
  });
});
