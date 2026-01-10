/** @jest-environment node */

const makeRequest = () =>
  new Request('http://localhost/api/billing/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': 'sig' },
    body: '{}',
  });

describe('POST /api/billing/webhook', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    process.env.STRIPE_SECRET_KEY = 'sk_test';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('returns 400 when signature verification fails', async () => {
    const constructEvent = jest.fn(() => {
      throw new Error('bad sig');
    });

    jest.doMock('../../_lib/supabase', () => ({
      supabaseAdmin: { from: jest.fn() },
    }));
    jest.doMock('stripe', () =>
      jest.fn().mockImplementation(() => ({
        webhooks: { constructEvent },
        subscriptions: { retrieve: jest.fn() },
        customers: { retrieve: jest.fn() },
      })),
    );

    const { POST } = await import('./route');
    const res = await POST(makeRequest() as any);

    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toContain('Webhook Error: bad sig');
  });
});
