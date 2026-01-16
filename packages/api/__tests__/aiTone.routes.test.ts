import express from 'express';

// Polyfill TextEncoder for environments that lack it (supertest/formidable)
const { TextEncoder } = require('util');
if (!(global as any).TextEncoder) (global as any).TextEncoder = TextEncoder;

const request = require('supertest');

// Mock authenticate to allow requests through in tests (mock relative path)
jest.mock('../src/middleware/auth', () => ({
  authenticate: (_req: any, _res: any, next: any) => next(),
}));

import { aiToneRoutes } from '../src/routes/ai-tone.routes';

describe('aiToneRoutes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/ai/tone', aiToneRoutes);
  });

  test('POST /analyze returns analysis', async () => {
    const res = await request(app)
      .post('/api/ai/tone/analyze')
      .send({ text: "Hey team, I'm sending the report. Thanks!", targetTone: 'formal' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('example');
  });
});
