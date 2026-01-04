import { handler } from '../../../../netlify/functions/health';
import type { HandlerResponse } from '@netlify/functions';

describe('Netlify function health', () => {
  it('returns ok=true', async () => {
    const res = (await handler({} as any, {} as any)) as HandlerResponse;
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body || '{}');
    expect(body).toMatchObject({ ok: true });
  });
});
