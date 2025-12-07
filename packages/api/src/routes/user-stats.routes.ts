import express from 'express';
import { supabase } from '../index';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';
import {
  UserPracticeHeatmapSchema,
  SkillCategoryStatsSchema,
  UserStatsSchema,
} from '@metalmaster/shared-validation';
import crypto from 'crypto';

export const userStatsRoutes = express.Router();

const HeatmapQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// Get user's stats
userStatsRoutes.get('/', authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', req.user!.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Create default stats for new user
      const { data: newStats, error: createError } = await supabase
        .from('user_stats')
        .insert({
          user_id: req.user!.id,
          total_xp: 0,
          level: 1,
          level_tier: 'Novice',
          total_practice_minutes: 0,
          total_lessons_completed: 0,
          current_streak_days: 0,
          longest_streak_days: 0,
          accuracy_score: 0,
          speed_score: 0,
          rhythm_score: 0,
          tone_knowledge_score: 0,
        })
        .select('*')
        .single();

      if (createError) throw createError;

      return res.json({
        success: true,
        data: newStats,
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

// Get user's practice heatmap for calendar visualization
userStatsRoutes.get('/heatmap', authenticate, async (req, res, next) => {
  try {
    const { start_date: startDate, end_date: endDate } = HeatmapQuerySchema.parse(req.query);

    const { data, error } = await supabase
      .from('user_practice_heatmap')
      .select('*')
      .eq('user_id', req.user!.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;

    const parsed = z.array(UserPracticeHeatmapSchema).parse(data || []);

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

// Get user's skill category scores
userStatsRoutes.get('/skills', authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('accuracy_score, speed_score, rhythm_score, tone_knowledge_score, updated_at')
      .eq('user_id', req.user!.id)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User stats not found',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    }

    if (error) throw error;

    const skillsData = [
      { category: 'accuracy', current_score: data.accuracy_score, last_updated: data.updated_at, progress_last_7_days: 0 },
      { category: 'speed', current_score: data.speed_score, last_updated: data.updated_at, progress_last_7_days: 0 },
      { category: 'rhythm_consistency', current_score: data.rhythm_score, last_updated: data.updated_at, progress_last_7_days: 0 },
      { category: 'tone_knowledge', current_score: data.tone_knowledge_score, last_updated: data.updated_at, progress_last_7_days: 0 },
    ];

    const parsed = z.array(SkillCategoryStatsSchema).parse(skillsData);

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

// Get practice summary (today/week/all-time)
userStatsRoutes.get('/summary', authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', req.user!.id)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User stats not found',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    }

    if (error) throw error;

    const stats = UserStatsSchema.parse(data);

    // Get today's practice
    const today = new Date().toISOString().split('T')[0];
    const { data: todayHeatmap } = await supabase
      .from('user_practice_heatmap')
      .select('practice_minutes, xp_earned')
      .eq('user_id', req.user!.id)
      .eq('date', today)
      .single();

    // Get this week's practice
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data: weekHeatmap } = await supabase
      .from('user_practice_heatmap')
      .select('practice_minutes, xp_earned')
      .eq('user_id', req.user!.id)
      .gte('date', weekAgo);

    const weekPracticeMins = (weekHeatmap || []).reduce((sum, h: any) => sum + h.practice_minutes, 0);
    const weekXp = (weekHeatmap || []).reduce((sum, h: any) => sum + h.xp_earned, 0);

    res.json({
      success: true,
      data: {
        total_xp: data.total_xp,
        level: data.level,
        level_tier: data.level_tier,
        total_practice_minutes: data.total_practice_minutes,
        current_streak_days: data.current_streak_days,
        longest_streak_days: data.longest_streak_days,
        today: {
          practice_minutes: todayHeatmap?.practice_minutes || 0,
          xp_earned: todayHeatmap?.xp_earned || 0,
        },
        this_week: {
          practice_minutes: weekPracticeMins,
          xp_earned: weekXp,
        },
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

// Update user stats (called internally after activities)
userStatsRoutes.patch('/update', authenticate, async (req, res, next) => {
  try {
    const { xp_earned, practice_minutes, lesson_completed } = req.body;

    // Get current stats
    const { data: currentStats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', req.user!.id)
      .single();

    if (!currentStats) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User stats not found',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    }

    const now = new Date();
    const today = new Date(now.toISOString().split('T')[0]);
    const lastActive = currentStats.last_active_at ? new Date(currentStats.last_active_at) : null;
    const daysSinceLast =
      lastActive ? Math.floor((today.getTime() - new Date(lastActive.toISOString().split('T')[0]).getTime()) / (1000 * 60 * 60 * 24)) : null;

    let newStreak = currentStats.current_streak_days || 0;
    if (daysSinceLast === null) {
      newStreak = 1;
    } else if (daysSinceLast === 0) {
      newStreak = Math.max(newStreak, 1);
    } else if (daysSinceLast === 1) {
      newStreak = newStreak + 1;
    } else {
      newStreak = 1;
    }

    const newLongestStreak = Math.max(currentStats.longest_streak_days || 0, newStreak);

    const newTotalXp = currentStats.total_xp + (xp_earned || 0);
    const newLevel = Math.floor(newTotalXp / 1000) + 1;

    // Determine level tier based on level
    const tiers = [
      'Novice',
      'Acolyte',
      'Hammerhand',
      'Thrash Apprentice',
      'Riff Adept',
      'Blackened Knight',
      'Djent Architect',
      'Shred Overlord',
    ];
    const newTier = tiers[Math.min(newLevel - 1, tiers.length - 1)];

    const { data: updatedStats, error } = await supabase
      .from('user_stats')
      .update({
        total_xp: newTotalXp,
        level: newLevel,
        level_tier: newTier,
        total_practice_minutes: currentStats.total_practice_minutes + (practice_minutes || 0),
        total_lessons_completed: currentStats.total_lessons_completed + (lesson_completed ? 1 : 0),
        current_streak_days: newStreak,
        longest_streak_days: newLongestStreak,
        last_active_at: now.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', req.user!.id)
      .select('*')
      .single();

    if (error) throw error;

    // Award streak-based achievements where applicable
    const streakAchievements = [
      { days: 7, name: 'Master of Streaks', description: 'Maintain a 7-day Daily Riff streak.', icon: '🔥', tier: 'silver', category: 'daily', xp_reward: 250 },
      { days: 30, name: 'The Unbroken', description: 'Maintain a 30-day Daily Riff streak.', icon: '🔥🔥🔥', tier: 'legendary', category: 'daily', xp_reward: 600 },
      { days: 100, name: 'The Eternal Flame', description: 'Maintain a 100-day streak.', icon: '🔥🩸', tier: 'mythic', category: 'daily', xp_reward: 1500 },
    ];

    for (const ach of streakAchievements) {
      if (newStreak >= ach.days) {
        const { data: existing } = await supabase
          .from('achievements')
          .select('id')
          .eq('user_id', req.user!.id)
          .eq('name', ach.name)
          .maybeSingle();

        if (!existing) {
          await supabase.from('achievements').insert({
            id: crypto.randomUUID(),
            user_id: req.user!.id,
            name: ach.name,
            description: ach.description,
            icon: ach.icon,
            tier: ach.tier,
            category: ach.category,
            xp_reward: ach.xp_reward,
            achieved_at: new Date().toISOString(),
          });
        }
      }
    }

    res.json({
      success: true,
      data: updatedStats,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});
