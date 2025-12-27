import express from 'express';
import { supabase } from '../index';
import { authenticate } from '../middleware/auth';
import { CreateDailyRiffCompletionSchema } from '@metalmaster/shared-validation';

export const dailyRiffRoutes = express.Router();

// Get today's daily riff
dailyRiffRoutes.get('/today', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_riffs')
      .select('*, riffs(title, description)')
      .eq('featured_date', today)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'No daily riff featured for today',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    }

    if (error) throw error;

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

// List daily riffs with pagination
dailyRiffRoutes.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { data, count, error } = await supabase
      .from('daily_riffs')
      .select('*', { count: 'exact' })
      .order('featured_date', { ascending: false })
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

// Get user's daily riff stats
dailyRiffRoutes.get('/stats/user', authenticate, async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if completed today
    const { data: todayCompletion } = await supabase
      .from('daily_riff_completions')
      .select('id')
      .eq('user_id', req.user!.id)
      .gte('completed_at', `${today}T00:00:00`)
      .single();

    // Get user's completion history
    const { data: completions } = await supabase
      .from('daily_riff_completions')
      .select('completed_at')
      .eq('user_id', req.user!.id)
      .order('completed_at', { ascending: false });

    // Calculate streak
    let streak = 0;
    if (completions && completions.length > 0) {
      let currentDate = new Date();
      for (const completion of completions) {
        const completionDate = new Date(completion.completed_at);
        const daysDiff = Math.floor(
          (currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === streak) {
          streak++;
          currentDate = new Date(completionDate);
        } else {
          break;
        }
      }
    }

    res.json({
      success: true,
      data: {
        completed_today: !!todayCompletion,
        days_completed_streak: streak,
        total_completed: completions?.length || 0,
        next_riff_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

// Get daily riff by ID
dailyRiffRoutes.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('daily_riffs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Daily riff not found',
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

// Mark daily riff as completed
dailyRiffRoutes.post('/:id/complete', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = CreateDailyRiffCompletionSchema.parse({ daily_riff_id: id });

    // Get daily riff to determine XP bonus
    const { data: dailyRiff, error: riffError } = await supabase
      .from('daily_riffs')
      .select('xp_bonus, featured_date')
      .eq('id', parsed.daily_riff_id)
      .single();

    if (riffError || !dailyRiff) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Daily riff not found',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    }

    // Check if completed within 24 hours
    const completedDate = new Date();
    const featuredDate = new Date(dailyRiff.featured_date);
    const hoursElapsed = (completedDate.getTime() - featuredDate.getTime()) / (1000 * 60 * 60);
    const bonusEarned = hoursElapsed <= 24;

    const xpEarned = dailyRiff.xp_bonus * (bonusEarned ? 1.5 : 1);

    const { data, error } = await supabase
      .from('daily_riff_completions')
      .insert({
        user_id: req.user!.id,
        daily_riff_id: parsed.daily_riff_id,
        xp_earned: Math.round(xpEarned),
        bonus_earned: bonusEarned,
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
