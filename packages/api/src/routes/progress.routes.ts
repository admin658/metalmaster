import express, { Request, Response, NextFunction } from 'express';
import { supabase } from '../index';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';

export const progressRoutes = express.Router();

const ProgressUpdateSchema = z.object({
  user_id: z.string().uuid(),
  lesson_id: z.string().uuid().optional(),
  riff_id: z.string().uuid().optional(),
  progress: z.number().min(0).max(100),
  completed: z.boolean(),
});

progressRoutes.post('/update', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = ProgressUpdateSchema.parse(req.body);
    let result;
    if (validated.lesson_id) {
      // Update lesson progress
      const { data, error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: validated.user_id,
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
          user_id: validated.user_id,
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
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Must provide lesson_id or riff_id',
        },
      });
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
