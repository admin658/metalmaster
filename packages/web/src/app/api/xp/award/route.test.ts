/** @jest-environment node */

describe('POST /api/xp/award', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('delegates to handleXpAward in final mode', async () => {
    const handleXpAward = jest.fn().mockResolvedValue(new Response('ok', { status: 200 }));
    jest.doMock('../_lib/award', () => ({ handleXpAward }));

    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/xp/award', { method: 'POST', body: '{}' });
    const res = await POST(req as any);

    expect(handleXpAward).toHaveBeenCalledWith(req, 'final');
    expect(res.status).toBe(200);
  });
});
