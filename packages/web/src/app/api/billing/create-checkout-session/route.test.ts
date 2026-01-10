/** @jest-environment node */

const makeRequest = () =>
  new Request('http://localhost/api/billing/create-checkout-session', {
    method: 'POST',
  });

describe('POST /api/billing/create-checkout-session', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.STRIPE_SECRET_KEY = 'sk_test';
    process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_test';
    process.env.APP_URL = 'http://localhost:3000';
  });

  it('creates a checkout session for the authenticated user', async () => {
    const createSession = jest.fn().mockResolvedValue({ url: 'http://checkout.test' });

    jest.doMock('../../_lib/auth', () => ({
      requireUser: jest.fn().mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
      }),
    }));
    jest.doMock('stripe', () =>
      jest.fn().mockImplementation(() => ({
        checkout: { sessions: { create: createSession } },
      })),
    );

    const { POST } = await import('./route');
    const res = await POST(makeRequest() as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.url).toBe('http://checkout.test');
    expect(createSession).toHaveBeenCalled();
  });
});
