/** @jest-environment node */

describe('GET /api/daily-riffs/today', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns 404 when no daily riff is featured', async () => {
    const query: any = {};
    query.select = jest.fn(() => query);
    query.eq = jest.fn(() => query);
    query.single = jest.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116' },
    });
    const supabase = { from: jest.fn(() => query) };

    jest.doMock('../../_lib/supabase', () => ({
      createUserSupabaseClient: jest.fn(() => supabase),
    }));

    const { GET } = await import('./route');
    const res = await GET(new Request('http://localhost/api/daily-riffs/today') as any);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
