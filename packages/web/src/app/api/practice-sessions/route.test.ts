/** @jest-environment node */

const makeGetRequest = () =>
  new Request('http://localhost/api/practice-sessions?page=1&limit=10', {
    method: 'GET',
  });

const makePostRequest = (body: unknown) =>
  new Request('http://localhost/api/practice-sessions', {
    method: 'POST',
    body: JSON.stringify(body),
  });

describe('GET/POST /api/practice-sessions', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns paginated practice sessions', async () => {
    const range = jest.fn().mockResolvedValue({
      data: [{ id: 'session-1' }],
      count: 1,
      error: null,
    });
    const query: any = {};
    query.select = jest.fn(() => query);
    query.eq = jest.fn(() => query);
    query.order = jest.fn(() => query);
    query.range = range;
    const supabase = { from: jest.fn(() => query) };

    jest.doMock('../_lib/auth', () => ({
      requireUser: jest.fn().mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        supabase,
      }),
    }));

    const { GET } = await import('./route');
    const res = await GET(makeGetRequest() as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.items).toHaveLength(1);
    expect(body.data.total).toBe(1);
  });

  it('creates a new practice session', async () => {
    const single = jest.fn().mockResolvedValue({
      data: { id: 'session-1' },
      error: null,
    });
    const insertQuery: any = {};
    insertQuery.select = jest.fn(() => ({ single }));
    const supabase = {
      from: jest.fn(() => ({
        insert: jest.fn(() => insertQuery),
      })),
    };

    jest.doMock('../_lib/auth', () => ({
      requireUser: jest.fn().mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        supabase,
      }),
    }));

    const { POST } = await import('./route');
    const res = await POST(
      makePostRequest({
        session_type: 'lesson',
        duration_seconds: 120,
        xp_earned: 10,
      }) as any,
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.id).toBe('session-1');
  });
});
