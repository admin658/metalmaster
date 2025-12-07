import express from 'express';
import { supabase } from '../index';
import { authenticate } from '../middleware/auth';

export const achievementRoutes = express.Router();

// Get all achievements in library
achievementRoutes.get('/library', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('achievements_library')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get user's achievements
achievementRoutes.get('/', authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievements_library(*)')
      .eq('user_id', req.user!.id)
      .order('earned_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get user's achievement progress
achievementRoutes.get('/progress', authenticate, async (req, res, next) => {
  try {
    // Get all achievements in library
    const { data: library, error: libError } = await supabase
      .from('achievements_library')
      .select('*');

    if (libError) throw libError;

    // Get user's earned achievements
    const { data: earned, error: earnedError } = await supabase
      .from('user_achievements')
      .select('achievement_id, earned_at, progress_percentage')
      .eq('user_id', req.user!.id);

    if (earnedError) throw earnedError;

    const earnedMap = new Map(earned?.map(e => [e.achievement_id, e]) || []);

    const progress = (library || []).map(achievement => ({
      achievement_id: achievement.id,
      badge_id: achievement.badge_id,
      name: achievement.name,
      progress_percentage: earnedMap.get(achievement.id)?.progress_percentage || 0,
      earned: earnedMap.has(achievement.id),
      earned_date: earnedMap.get(achievement.id)?.earned_at,
    }));

    res.json({
      success: true,
      data: progress,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single achievement by ID
achievementRoutes.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('achievements_library')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Achievement not found',
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

// Award achievement to user (admin/system only - called internally)
achievementRoutes.post('/:achievementId/award', authenticate, async (req, res, next) => {
  try {
    const { achievementId } = req.params;

    // Check if achievement already earned
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', req.user!.id)
      .eq('achievement_id', achievementId)
      .single();

    if (existing) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_EARNED',
          message: 'Achievement already earned by this user',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: req.user!.id,
        achievement_id: achievementId,
        earned_at: new Date().toISOString(),
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

// Get achievement stats for user
achievementRoutes.get('/stats/summary', authenticate, async (req, res, next) => {
  try {
    const { data: achievements, error } = await supabase
      .from('user_achievements')
      .select('achievements_library(xp_multiplier)')
      .eq('user_id', req.user!.id);

    if (error) throw error;

    const totalAchievements = (achievements || []).length;
    const xpMultiplier = achievements?.reduce((sum, a: any) => sum + (a.achievements_library?.xp_multiplier || 1), 0) || 0;

    res.json({
      success: true,
      data: {
        total_achievements: totalAchievements,
        cumulative_xp_multiplier: Math.round((xpMultiplier / Math.max(totalAchievements, 1)) * 100) / 100,
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
