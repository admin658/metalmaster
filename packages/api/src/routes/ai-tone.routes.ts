import express from 'express';
import { z } from 'zod';
import analyzeTone from '../../../ai-tone-assistant/src/toneAnalyzer';
import { authenticate } from '../middleware/auth';

export const aiToneRoutes = express.Router();

const ToneEnum = z.enum([
  'formal',
  'casual',
  'friendly',
  'professional',
  'sarcastic',
  'empathetic',
  'neutral',
]);

const RequestSchema = z.object({
  text: z.string().min(1),
  targetTone: ToneEnum.optional(),
});

aiToneRoutes.post('/analyze', authenticate, async (req, res, next) => {
  try {
    const { text, targetTone } = RequestSchema.parse(req.body);

    const result = analyzeTone(text, targetTone as any);

    res.json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString(), version: '0.1.0' },
    });
  } catch (err) {
    next(err);
  }
});
