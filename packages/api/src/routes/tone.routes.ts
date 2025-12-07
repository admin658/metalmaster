import express from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { getToneSettings } from '../utils/getToneSettings';
import { ToneSettingsSchema } from '@metalmaster/shared-validation';

const RequestSchema = z.object({
  artist: z.string().min(2),
  gear: z.string().min(2),
});

export const toneRoutes = express.Router();

toneRoutes.post('/', authenticate, async (req, res, next) => {
  try {
    const { artist, gear } = RequestSchema.parse(req.body);

    const tone = await getToneSettings(artist, gear);
    // Validate AI response before returning
    const parsed = ToneSettingsSchema.parse(tone);

    res.json({
      success: true,
      data: parsed,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});
