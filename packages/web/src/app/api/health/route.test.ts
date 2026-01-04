/** @jest-environment node */

import { GET } from './route';

describe('GET /api/health', () => {
  it('returns ok=true', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ ok: true });
  });
});
