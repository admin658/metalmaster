import express from 'express';
import { supabase } from '../index';
import { authenticate } from '../middleware/auth';
import { CreatePracticeSessionSchema } from '@metalmaster/shared-validation';
import type { PracticeSession } from '@metalmaster/shared-validation';

export const practiceSessionRoutes = express.Router();

// Get user's practice sessions with pagination
practiceSessionRoutes.get('/', authenticate, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sessionType = req.query.session_type as string;

    let query = supabase
      .from('practice_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user!.id);

    if (sessionType) {
      query = query.eq('session_type', sessionType);
    }

    const { data, count, error } = await query
      .order('started_at', { ascending: false })
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

// Get practice session stats (summary)
practiceSessionRoutes.get('/stats/summary', authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('practice_sessions')
      .select('session_type, duration_seconds, xp_earned, started_at')
      .eq('user_id', req.user!.id);

    if (error) throw error;

    const sessions = (data || []) as PracticeSession[];
    const totalSessions = sessions.length;
    const totalDurationSeconds = sessions.reduce((sum, s) => sum + s.duration_seconds, 0);
    const totalXp = sessions.reduce((sum, s) => sum + s.xp_earned, 0);

    // Calculate most common session type
    const typeCount = sessions.reduce<Record<string, number>>((acc, s) => {
      acc[s.session_type] = (acc[s.session_type] || 0) + 1;
      return acc;
    }, {});
    const mostCommonType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'lesson';

    // Get this week's stats
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const weekSessions = sessions.filter((s) => new Date(s.started_at) > new Date(weekAgo));
    const weekXp = weekSessions.reduce((sum, s) => sum + s.xp_earned, 0);

    // Get today's stats
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter((s) => s.started_at.split('T')[0] === today);
    const todayXp = todaySessions.reduce((sum, s) => sum + s.xp_earned, 0);

    res.json({
      success: true,
      data: {
        total_sessions: totalSessions,
        total_practice_minutes: Math.round(totalDurationSeconds / 60),
        average_session_duration_minutes: totalSessions > 0 ? Math.round(totalDurationSeconds / 60 / totalSessions) : 0,
        most_common_session_type: mostCommonType,
        xp_earned_this_week: weekXp,
        xp_earned_today: todayXp,
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

// Get single practice session
practiceSessionRoutes.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Practice session not found',
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

// Create practice session
practiceSessionRoutes.post('/', authenticate, async (req, res, next) => {
  try {
    const parsed = CreatePracticeSessionSchema.parse(req.body);

    const { data, error } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: req.user!.id,
        session_type: parsed.session_type,
        related_riff_id: parsed.related_riff_id || null,
        related_lesson_id: parsed.related_lesson_id || null,
        related_jam_track_id: parsed.related_jam_track_id || null,
        duration_seconds: parsed.duration_seconds,
        xp_earned: parsed.xp_earned,
        accuracy_percentage: parsed.accuracy_percentage || null,
        notes: parsed.notes || null,
        started_at: new Date(Date.now() - parsed.duration_seconds * 1000).toISOString(),
        completed_at: new Date().toISOString(),
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

// Delete practice session
practiceSessionRoutes.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('practice_sessions')
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

