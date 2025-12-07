import express from 'express';
import { supabase } from '../index';
import { authenticate } from '../middleware/auth';
import { CreateSpeedTrainerSessionSchema, UpdateSpeedTrainerSessionSchema } from '@metalmaster/shared-validation';
import type { SpeedTrainerSession } from '@metalmaster/shared-validation';

export const speedTrainerRoutes = express.Router();

// Get user's speed trainer sessions with pagination
speedTrainerRoutes.get('/', authenticate, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const exerciseType = req.query.exercise_type as string;

    let query = supabase
      .from('speed_trainer_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user!.id);

    if (exerciseType) {
      query = query.eq('exercise_type', exerciseType);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      data: {
        items: data || [],
        total: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single speed trainer session
speedTrainerRoutes.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('speed_trainer_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Speed trainer session not found',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    }

    res.json({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create speed trainer session
speedTrainerRoutes.post('/', authenticate, async (req, res, next) => {
  try {
    const parsed = CreateSpeedTrainerSessionSchema.parse(req.body);

    const { data, error } = await supabase
      .from('speed_trainer_sessions')
      .insert({
        user_id: req.user!.id,
        exercise_type: parsed.exercise_type,
        starting_bpm: parsed.starting_bpm,
        ending_bpm: parsed.starting_bpm,
        current_bpm: parsed.starting_bpm,
        target_bpm: parsed.target_bpm,
        duration_seconds: 0,
        accuracy_percentage: 0,
        riff_id: parsed.riff_id || null,
        auto_increment_enabled: parsed.auto_increment_enabled,
        notes: parsed.notes || null,
      })
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update speed trainer session
speedTrainerRoutes.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = UpdateSpeedTrainerSessionSchema.parse(req.body);

    const { data, error } = await supabase
      .from('speed_trainer_sessions')
      .update(parsed)
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .select('*')
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Speed trainer session not found',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    }

    res.json({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete speed trainer session
speedTrainerRoutes.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('speed_trainer_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user!.id);

    if (error) throw error;

    res.json({
      success: true,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get speed trainer progress for user
speedTrainerRoutes.get('/progress/stats', authenticate, async (req, res, next) => {
  try {
    const exerciseType = req.query.exercise_type as string;

    let query = supabase
      .from('speed_trainer_sessions')
      .select('exercise_type, current_bpm, accuracy_percentage, created_at')
      .eq('user_id', req.user!.id);

    if (exerciseType) {
      query = query.eq('exercise_type', exerciseType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate progress stats
    const grouped = (data || []).reduce<Record<string, SpeedTrainerSession[]>>((acc, session) => {
      const key = session.exercise_type;
      acc[key] = acc[key] || [];
      acc[key].push(session as SpeedTrainerSession);
      return acc;
    }, {});

    const stats = Object.entries(grouped).map(([type, sessions]) => {
      const bpms = sessions.map((s) => s.current_bpm);
      const personalBest = Math.max(...bpms);
      const average = Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length);

      return {
        exercise_type: type,
        personal_best_bpm: personalBest,
        average_bpm: average,
        total_sessions: sessions.length,
        last_session_date: sessions[0].created_at,
        improvement_trend: 0, // TODO: Calculate 7-day improvement
      };
    });

    res.json({
      success: true,
      data: stats,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});
