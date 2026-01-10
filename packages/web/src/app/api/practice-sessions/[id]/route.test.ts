/** @jest-environment node */

describe('GET /api/practice-sessions/[id]', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns 404 when session is missing', async () => {
    const single = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'not found' },
    });
    const query: any = {};
    query.select = jest.fn(() => query);
    query.eq = jest.fn(() => query);
    query.single = single;
    const supabase = { from: jest.fn(() => query) };

    jest.doMock('../../_lib/auth', () => ({
      requireUser: jest.fn().mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        supabase,
      }),
    }));

    const { GET } = await import('./route');
    const req = new Request('http://localhost/api/practice-sessions/abc', { method: 'GET' });
    const res = await GET(req as any, { params: Promise.resolve({ id: 'abc' }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
