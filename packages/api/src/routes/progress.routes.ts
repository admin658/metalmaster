import express, { Request, Response, NextFunction } from 'express';
import { supabase } from '../index';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';
import { buildApiError } from '../middleware/error-handler';

export const progressRoutes = express.Router();

const ProgressUpdateSchema = z.object({
  lesson_id: z.string().uuid().optional(),
  riff_id: z.string().uuid().optional(),
  progress: z.number().min(0).max(100),
  completed: z.boolean(),
});

progressRoutes.post('/update', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = ProgressUpdateSchema.parse(req.body);
    const userId = req.user!.id;
    let result;
    if (validated.lesson_id) {
      // Update lesson progress
      const { data, error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: validated.lesson_id,
          progress: validated.progress,
          completed: validated.completed,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,lesson_id' })
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else if (validated.riff_id) {
      // Update riff progress
      const { data, error } = await supabase
        .from('riff_progress')
        .upsert({
          user_id: userId,
          riff_id: validated.riff_id,
          progress: validated.progress,
          completed: validated.completed,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,riff_id' })
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      throw buildApiError(400, 'INVALID_REQUEST', 'Must provide lesson_id or riff_id');
    }
    res.json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});
